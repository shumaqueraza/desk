import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

/**
 * Consistent API responses: { ok: true, data } or { ok: false, error }.
 */

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error, details }, { status });
}

/** Parse and validate a JSON body against a Zod schema. Returns a discriminated result. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { success: false, response: fail("The request body must be valid JSON.", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first.path.length ? `${first.path.join(".")}: ` : "";
    return {
      success: false,
      response: fail(`${where}${first.message}`, 422, flattenZod(parsed.error)),
    };
  }
  return { success: true, data: parsed.data };
}

function flattenZod(error: ZodError) {
  return error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

export function serverError(e: unknown) {
  console.error("[api]", e);
  const name = e instanceof Error ? e.name : "";
  const message =
    name === "MongooseServerSelectionError"
      ? "Cannot reach the database right now. Try again."
      : name === "MongoNetworkError" || /ECONNRESET|ETIMEDOUT|network/i.test(String(e))
        ? "The database connection dropped for a moment. Try again — it usually works on the next go."
        : "Something went wrong on our side. Try again.";
  return fail(message, 500);
}

/** Duplicate-key errors from MongoDB unique indexes (code 11000). */
export function isDuplicateKey(e: unknown, ...fieldHints: string[]): string | null {
  const err = e as { code?: number; keyPattern?: Record<string, unknown>; message?: string };
  if (err?.code !== 11000) return null;
  const keys = Object.keys(err.keyPattern ?? {});
  const target = keys.length ? keys.join(",") : String(err.message ?? "");
  for (const hint of fieldHints) {
    if (target.toLowerCase().includes(hint.toLowerCase())) return hint;
  }
  return fieldHints[0] ?? "That record already exists.";
}
