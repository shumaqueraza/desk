import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, Player, Session } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/api";
import { appConfig } from "@/config/app.config";

type Params = { params: Promise<{ id: string }> };

/**
 * Close a session and lock its attendance forever. Any active player of the
 * session's sport without a mark is recorded with the default mark (absent).
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    await connectDB();
    const session = await Session.findById(id);
    if (!session) return fail("No such practice session.", 404);
    if (session.status === "locked") {
      return fail("This session is already closed and locked.", 409);
    }

    const roster = await Player.find({ sport: session.sport, isActive: true }, "_id");
    const rosterIds = new Set(roster.map((p) => p.id));

    const marks = await Attendance.find({ sessionId: session.id }, "playerId");
    const markedIds = new Set(marks.map((m) => m.playerId));

    const missing = [...rosterIds].filter((pid) => !markedIds.has(pid));
    if (missing.length > 0) {
      const now = new Date();
      await Attendance.insertMany(
        missing.map((pid) => ({
          sessionId: session.id,
          playerId: pid,
          status: appConfig.attendance.defaultMarkOnClose,
          markedAt: now,
        })),
      );
    }

    await Session.findByIdAndUpdate(session.id, { status: "locked", lockedAt: new Date() });

    const total = rosterIds.size;
    const presentCount = await Attendance.countDocuments({
      sessionId: session.id,
      status: "present",
    });

    return ok({ locked: true, present: presentCount, total });
  } catch (e) {
    return serverError(e);
  }
}
