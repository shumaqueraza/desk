import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { checkLoginThrottle, clearLoginFailures, recordLoginFailure } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, loginSchema);
    if (!parsed.success) return parsed.response;
    const { username, password } = parsed.data;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const throttleKey = `${username}:${ip}`;
    const throttle = checkLoginThrottle(throttleKey);
    if (throttle.blocked) {
      return fail(
        `Too many wrong attempts. Try again in about ${Math.ceil(throttle.retryInSec / 60)} minute(s), or ask the coach to reset your password.`,
        429,
      );
    }

    await connectDB();
    const user = await User.findOne({ username });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      recordLoginFailure(throttleKey);
      return fail("Wrong username or password. Check both and try again.", 401);
    }
    if (!user.isActive) {
      return fail("This account is switched off. Ask the coach to switch it back on.", 403);
    }

    clearLoginFailures(throttleKey);
    await setSessionCookie(user.id);
    return ok({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (e) {
    return serverError(e);
  }
}
