import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Player, User } from "@/lib/models";
import { hashPassword } from "@/lib/password";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { passwordResetSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

/** Coach resets a player's password. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const parsed = await parseBody(request, passwordResetSchema);
    if (!parsed.success) return parsed.response;

    await connectDB();
    const player = await Player.findById(id);
    if (!player) return fail("No such player.", 404);

    const account = await User.findOne({ playerId: id });
    if (!account) return fail("This player has no login account.", 409);

    await User.findByIdAndUpdate(account.id, {
      passwordHash: await hashPassword(parsed.data.password),
    });

    return ok({ id: player.id });
  } catch (e) {
    return serverError(e);
  }
}
