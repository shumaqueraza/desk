import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Player } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { playerUpdateSchema } from "@/lib/validators";
import { getPlayerDetail } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

/** Player sheet. Coach sees anyone, player sees only their own, scout sees only ready players. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser();
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const detail = await getPlayerDetail(id);
    if (!detail) return fail("No such player.", 404);

    if (auth.role === "player" && auth.playerId !== id) {
      return fail("Players can only open their own record.", 403);
    }
    if (auth.role === "scout" && !detail.stats.isReady) {
      return fail("This player does not meet the ready rule.", 404);
    }
    return ok(detail);
  } catch (e) {
    return serverError(e);
  }
}

/** Edit player details. Coach only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, playerUpdateSchema);
    if (!parsed.success) return parsed.response;
    const { name, age, sport } = parsed.data;

    await connectDB();
    const player = await Player.findByIdAndUpdate(id, { name, age, sport }, { new: true });
    if (!player) return fail("No such player.", 404);

    return ok({ id: player.id });
  } catch (e) {
    return serverError(e);
  }
}
