import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Match } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError } from "@/lib/api";
import { matchCreateSchema } from "@/lib/validators";
import { isValidDateStr } from "@/lib/dates";

/** Record a match: date, sport, opponent. Scores are added on the sheet. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;

    const parsed = await parseBody(request, matchCreateSchema);
    if (!parsed.success) return parsed.response;
    const { date, sport, opponent } = parsed.data;

    if (!isValidDateStr(date)) return fail("Pick a valid date.", 422);

    await connectDB();
    const existing = await Match.findOne({ date, sport, opponent });
    if (existing) {
      return fail("This match is already recorded. Open it from the match list.", 409);
    }

    const match = await Match.create({ date, sport, opponent, createdById: auth.id });
    return ok({ id: match.id, date, sport, opponent }, 201);
  } catch (e) {
    return serverError(e);
  }
}
