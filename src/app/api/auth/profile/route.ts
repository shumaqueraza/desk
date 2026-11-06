import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, toUser } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError, isDuplicateKey } from "@/lib/api";
import { coachProfileSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";

/**
 * Update the signed-in coach's own account: name, username, password.
 * Coaches only — player and scout accounts are read-only by design.
 * The session cookie stores the user id, so a username change keeps the
 * coach signed in.
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;

    const parsed = await parseBody(request, coachProfileSchema);
    if (!parsed.success) return parsed.response;
    const { name, username, password } = parsed.data;

    await connectDB();
    const doc = await User.findById(auth.id);
    if (!doc) return fail("No such account.", 404);

    doc.name = name;
    doc.username = username;
    if (password) {
      doc.passwordHash = await hashPassword(password);
    }
    await doc.save();

    const updated = toUser(doc);
    return ok({ id: updated.id, name: updated.name, username: updated.username });
  } catch (e) {
    const dup = isDuplicateKey(e, "username");
    if (dup) return fail("That username is already taken. Pick another one.", 409);
    return serverError(e);
  }
}
