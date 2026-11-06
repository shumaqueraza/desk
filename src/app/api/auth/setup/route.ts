import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { parseBody, ok, fail, serverError, isDuplicateKey } from "@/lib/api";
import { setupSchema } from "@/lib/validators";

/**
 * First-run bootstrap: create the coach account, but only while the academy
 * has no accounts at all. Keeps a stray deployment from being hijacked.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, setupSchema);
    if (!parsed.success) return parsed.response;
    const { name, username, password } = parsed.data;

    await connectDB();
    const existing = await User.countDocuments();
    if (existing > 0) {
      return fail("The coach account already exists. Sign in instead.", 409);
    }

    const user = await User.create({
      name,
      username,
      passwordHash: await hashPassword(password),
      role: "coach",
    });

    await setSessionCookie(user.id);
    return ok({ id: user.id, name: user.name, role: user.role }, 201);
  } catch (e) {
    if (isDuplicateKey(e, "username")) {
      return fail("That username is taken. Pick another one.", 409);
    }
    return serverError(e);
  }
}
