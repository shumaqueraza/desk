import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Player, User } from "@/lib/models";
import { hashPassword } from "@/lib/password";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError, isDuplicateKey } from "@/lib/api";
import { playerCreateSchema } from "@/lib/validators";
import { nextJerseyNumber, getFullRoster, getReadyRoster } from "@/lib/queries";
import { appConfig } from "@/config/app.config";

/**
 * The roster, role-filtered: coach sees the whole squad, scout sees ready
 * players only, players use their own record endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser();
    if (isResponse(auth)) return auth;
    if (auth.role === "player") {
      return fail("Players see their own record on their dashboard.", 403);
    }

    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const sport = request.nextUrl.searchParams.get("sport")?.trim() ?? "";
    const limit = Math.min(
      Number(request.nextUrl.searchParams.get("limit")) || appConfig.pagination.defaultPageSize,
      appConfig.pagination.maxPageSize,
    );

    const base = auth.role === "scout" ? await getReadyRoster() : await getFullRoster();
    const filtered = base.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search)) return false;
      if (sport && p.sport !== sport) return false;
      return true;
    });

    return ok({ count: filtered.length, players: filtered.slice(0, limit) });
  } catch (e) {
    return serverError(e);
  }
}

/** Add a player and their login account. Coach only. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;

    const parsed = await parseBody(request, playerCreateSchema);
    if (!parsed.success) return parsed.response;
    const { name, age, sport, username, password } = parsed.data;

    await connectDB();
    const taken = await User.findOne({ username });
    if (taken) return fail("That username is taken. Pick another one.", 409);

    const jerseyNumber = await nextJerseyNumber();

    // Create the player, then the linked account. If the account fails,
    // remove the player again so no orphan records are left behind.
    const player = await Player.create({ name, age, sport, jerseyNumber, isActive: true });
    try {
      await User.create({
        name,
        username,
        passwordHash: await hashPassword(password),
        role: "player",
        playerId: player.id,
      });
    } catch (e) {
      await Player.findByIdAndDelete(player.id);
      const dup = isDuplicateKey(e, "username");
      if (dup) return fail("That username is taken. Pick another one.", 409);
      throw e;
    }

    return ok(
      { id: player.id, name: player.name, jerseyNumber: player.jerseyNumber, username },
      201,
    );
  } catch (e) {
    return serverError(e);
  }
}
