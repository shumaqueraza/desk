import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, toUser, type UserRecord } from "@/lib/models";
import { readSessionUserId } from "@/lib/session";
import { appConfig, type Role } from "@/config/app.config";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  playerId: string | null;
}

function toSessionUser(u: UserRecord): SessionUser {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role as Role,
    playerId: u.playerId,
  };
}

/** Current signed-in user, or null. Never trusts client state. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const uid = await readSessionUserId();
  if (!uid) return null;
  await connectDB();
  const doc = await User.findById(uid);
  if (!doc || !doc.isActive) return null;
  return toSessionUser(toUser(doc));
}

/** For server components: redirect to /login when signed out. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For server components: redirect signed-in users away from /login. */
export async function redirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}

/**
 * For API routes. Returns the user or a ready-to-return 401 response.
 * Usage: const auth = await requireApiUser(); if (auth instanceof NextResponse) return auth;
 */
export async function requireApiUser(roles?: Role[]): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to continue." },
      { status: 401 },
    );
  }
  if (roles && !roles.includes(user.role)) {
    return NextResponse.json(
      { ok: false, error: "Your account does not have access to this." },
      { status: 403 },
    );
  }
  return user;
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}

export function hasRole(user: SessionUser, capability: keyof typeof appConfig.roles.coach & `can${string}`): boolean {
  const role = appConfig.roles[user.role] as Record<string, boolean | string> | undefined;
  return Boolean(role?.[capability]);
}

/** Simple in-memory login throttle. Per username + IP. */
const attempts = new Map<string, { count: number; until: number }>();

export function checkLoginThrottle(key: string): { blocked: boolean; retryInSec: number } {
  const entry = attempts.get(key);
  if (!entry) return { blocked: false, retryInSec: 0 };
  if (entry.until > Date.now() && entry.count >= appConfig.auth.maxLoginAttempts) {
    return { blocked: true, retryInSec: Math.ceil((entry.until - Date.now()) / 1000) };
  }
  return { blocked: false, retryInSec: 0 };
}

export function recordLoginFailure(key: string) {
  const entry = attempts.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= appConfig.auth.maxLoginAttempts) {
    entry.until = Date.now() + appConfig.auth.loginLockoutSec * 1000;
  }
  attempts.set(key, entry);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
