import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { appConfig } from "@/config/app.config";

/**
 * Stateless signed-cookie sessions.
 * Cookie payload: base64url(JSON { uid, exp }) + "." + HMAC-SHA256 signature.
 * No session store needed; forgery requires the server secret.
 */

interface SessionPayload {
  uid: string;
  exp: number;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set. Copy .env.example and set it.");
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(userId: string): { token: string; maxAge: number } {
  const payload: SessionPayload = {
    uid: userId,
    exp: Date.now() + appConfig.auth.sessionDurationSec * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${data}.${sign(data)}`, maxAge: appConfig.auth.sessionDurationSec };
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(data);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (!payload.uid || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const { token, maxAge } = createSessionToken(userId);
  const jar = await cookies();
  jar.set(appConfig.auth.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(appConfig.auth.cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const payload = verifySessionToken(jar.get(appConfig.auth.cookieName)?.value);
  return payload?.uid ?? null;
}
