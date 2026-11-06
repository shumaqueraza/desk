import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword } from "@/lib/password";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError, isDuplicateKey } from "@/lib/api";
import { profileUpdateSchema } from "@/lib/validators";

/** A coach updates their own account: name, username and (optionally) password. */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;

    const parsed = await parseBody(request, profileUpdateSchema);
    if (!parsed.success) return parsed.response;
    const { name, username, password } = parsed.data;

    await connectDB();

    const taken = await User.findOne({ username, _id: { $ne: auth.id } });
    if (taken) return fail("That username is already taken.", 409);

    const update: Record<string, string> = { name, username };
    if (password) update.passwordHash = await hashPassword(password);

    try {
      await User.findByIdAndUpdate(auth.id, update);
    } catch (e) {
      const dup = isDuplicateKey(e, "username");
      if (dup) return fail("That username is already taken.", 409);
      throw e;
    }

    return ok({ id: auth.id, name, username });
  } catch (e) {
    return serverError(e);
  }
}
