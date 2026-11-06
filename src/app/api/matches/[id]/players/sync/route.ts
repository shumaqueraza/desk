import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Match, Performance, Session, Attendance, Player } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { matchSheetSyncSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * Save the whole score sheet in ONE request.
 *
 * The match page keeps adds / edits / removes in local state so every click
 * is instant, and posts the full set of changes here when the coach presses
 * Save. All adds are validated (eligibility: present at that day's practice,
 * same sport) BEFORE anything is written, so a save either applies cleanly
 * or changes nothing.
 *
 * Order matters: removes are applied first, so a player who was removed and
 * re-added in the same save ends up as a fresh line with the new score.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, matchSheetSyncSchema);
    if (!parsed.success) return parsed.response;
    const { adds, updates, removes } = parsed.data;

    await connectDB();
    const match = await Match.findById(id);
    if (!match) return fail("No such match.", 404);

    const removeIds = [...new Set(removes)];
    const addIds = [...new Set(adds.map((a) => a.playerId))];
    const updateIds = [...new Set(updates.map((u) => u.playerId))];

    const clash = addIds.find((pid) => updateIds.includes(pid));
    if (clash) {
      return fail("One player appears as both an add and a score edit. Reload the page and try again.", 422);
    }

    const existing = await Performance.find({ matchId: match.id }, "playerId");
    const onSheet = new Set(existing.map((p) => p.playerId));

    // --- Validate everything BEFORE writing anything ---------------------
    for (const pid of addIds) {
      if (onSheet.has(pid) && !removeIds.includes(pid)) {
        return fail("That player is already on this sheet.", 409);
      }
    }

    if (addIds.length > 0) {
      const sessions = await Session.find(
        { date: match.date, sport: match.sport },
        "_id",
      );
      if (sessions.length === 0) {
        return fail(
          `No ${match.sport.toLowerCase()} practice was held on that date, so no one can join the sheet.`,
          422,
        );
      }
      const present = await Attendance.find(
        {
          sessionId: { $in: sessions.map((s) => s.id) },
          playerId: { $in: addIds },
          status: "present",
        },
        "playerId",
      );
      const presentSet = new Set(present.map((p) => p.playerId));
      const missing = addIds.filter((pid) => !presentSet.has(pid));
      if (missing.length > 0) {
        const docs = await Player.find({ _id: { $in: missing } }, "name");
        const names = docs.map((d) => d.name).join(", ");
        return fail(
          docs.length === 1
            ? `${names} was not marked present at practice that day, so they cannot join the sheet.`
            : `${names} were not marked present at practice that day, so they cannot join the sheet.`,
          422,
        );
      }
    }

    // --- Apply: removes, then adds (upsert), then score updates ----------
    if (removeIds.length > 0) {
      await Performance.deleteMany({ matchId: match.id, playerId: { $in: removeIds } });
    }
    for (const a of adds) {
      await Performance.updateOne(
        { matchId: match.id, playerId: a.playerId },
        { matchId: match.id, playerId: a.playerId, score: a.score },
        { upsert: true },
      );
    }
    for (const u of updates) {
      await Performance.updateOne(
        { matchId: match.id, playerId: u.playerId },
        { score: u.score },
      );
    }

    return ok({ added: adds.length, updated: updates.length, removed: removeIds.length });
  } catch (e) {
    return serverError(e);
  }
}
