import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Player, User } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { playerStatusSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * Switch a player's account on or off. Off means: cannot sign in, and is not
 * shown on new practice rosters. History is kept.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, playerStatusSchema);
    if (!parsed.success) return parsed.response;

    await connectDB();
    const player = await Player.findByIdAndUpdate(id, { isActive: parsed.data.isActive }, { new: true });
    if (!player) return fail("No such player.", 404);

    // The linked login account follows the player's on/off state.
    await User.updateMany({ playerId: id }, { isActive: parsed.data.isActive });

    return ok({ id: player.id, isActive: parsed.data.isActive });
  } catch (e) {
    return serverError(e);
  }
}
