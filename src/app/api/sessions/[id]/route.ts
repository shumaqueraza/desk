import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, Player, Session } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { attendanceSaveSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * Save attendance marks for a session. Open sessions only. The marks provided
 * become the full register for the session's active roster.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, attendanceSaveSchema);
    if (!parsed.success) return parsed.response;
    const marks = parsed.data.marks;

    await connectDB();
    const session = await Session.findById(id);
    if (!session) return fail("No such practice session.", 404);
    if (session.status === "locked") {
      return fail("This session is closed and locked. Attendance can no longer be changed.", 409);
    }

    // Every mark must belong to an active player of this session's sport.
    const playerIds = [...new Set(marks.map((m) => m.playerId))];
    const players = playerIds.length
      ? await Player.find({ _id: { $in: playerIds } })
      : [];
    const validIds = new Set(
      players.filter((p) => p.isActive && p.sport === session.sport).map((p) => p.id),
    );
    for (const m of marks) {
      if (!validIds.has(m.playerId)) {
        return fail("One of the players does not belong on this practice roster.", 422);
      }
    }

    // Replace-all semantics: the saved marks are the register.
    await Attendance.deleteMany({
      sessionId: id,
      playerId: { $nin: [...validIds] },
    });
    const now = new Date();
    for (const m of marks) {
      await Attendance.updateOne(
        { sessionId: id, playerId: m.playerId },
        { $set: { status: m.status, markedAt: now } },
        { upsert: true },
      );
    }

    const present = marks.filter((m) => m.status === "present").length;
    return ok({ saved: marks.length, present, absent: marks.length - present });
  } catch (e) {
    return serverError(e);
  }
}

/** Delete a register and its attendance marks — locked or not. Coach only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    await connectDB();
    const session = await Session.findById(id);
    if (!session) return fail("No such practice session.", 404);

    await Attendance.deleteMany({ sessionId: id });
    await Session.findByIdAndDelete(id);

    return ok({ id });
  } catch (e) {
    return serverError(e);
  }
}
