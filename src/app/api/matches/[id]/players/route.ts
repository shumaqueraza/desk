import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Match, Performance } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { matchPlayerSchema } from "@/lib/validators";
import { isEligibleForMatch } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

/**
 * Put a player on the match sheet with a score.
 * Refused unless the player was marked Present at practice that day.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, matchPlayerSchema);
    if (!parsed.success) return parsed.response;
    const { playerId, score } = parsed.data;

    await connectDB();
    const match = await Match.findById(id);
    if (!match) return fail("No such match.", 404);

    const onSheet = await Performance.findOne({ matchId: match.id, playerId });
    if (onSheet) return fail("That player is already on this sheet.", 409);

    const eligibility = await isEligibleForMatch(
      { date: match.date, sport: match.sport },
      playerId,
    );
    if (!eligibility.eligible) {
      return fail(eligibility.reason ?? "That player cannot join this sheet.", 422);
    }

    await Performance.create({ matchId: match.id, playerId, score });
    return ok({ playerId, score }, 201);
  } catch (e) {
    return serverError(e);
  }
}

/** Update one player's score on the sheet. */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, matchPlayerSchema);
    if (!parsed.success) return parsed.response;
    const { playerId, score } = parsed.data;

    await connectDB();
    const match = await Match.findById(id);
    if (!match) return fail("No such match.", 404);

    const line = await Performance.findOne({ matchId: match.id, playerId });
    if (!line) return fail("That player is not on this sheet yet.", 404);

    await Performance.findByIdAndUpdate(line.id, { score });
    return ok({ playerId, score });
  } catch (e) {
    return serverError(e);
  }
}

/** Take a player off the sheet, for example when they were added by mistake. */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;
    const playerId = request.nextUrl.searchParams.get("playerId");

    if (!playerId) return fail("Which player should be removed?", 422);

    await connectDB();
    const match = await Match.findById(id);
    if (!match) return fail("No such match.", 404);

    await Performance.deleteMany({ matchId: match.id, playerId });
    return ok({ removed: playerId });
  } catch (e) {
    return serverError(e);
  }
}
