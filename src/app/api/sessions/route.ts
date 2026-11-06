import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Session } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { parseBody, ok, fail, serverError, isDuplicateKey } from "@/lib/api";
import { sessionCreateSchema } from "@/lib/validators";
import { todayStr, isValidDateStr } from "@/lib/dates";
import { appConfig } from "@/config/app.config";

/** Open a practice session: a date and a sport. Coach only. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;

    const parsed = await parseBody(request, sessionCreateSchema);
    if (!parsed.success) return parsed.response;
    const { date, sport } = parsed.data;

    if (!isValidDateStr(date)) return fail("Pick a valid date.", 422);
    if (!appConfig.session.allowFutureDates && date > todayStr()) {
      return fail("Pick today or an earlier date.", 422);
    }

    await connectDB();
    const existing = await Session.findOne({ date, sport });
    if (existing) {
      return fail(
        `A ${sport.toLowerCase()} practice on ${date} already exists. Open it from the practice list.`,
        409,
      );
    }

    const session = await Session.create({ date, sport, createdById: auth.id });
    return ok({ id: session.id, date, sport }, 201);
  } catch (e) {
    const dup = isDuplicateKey(e, "date");
    if (dup) return fail("A practice for that date and sport already exists.", 409);
    return serverError(e);
  }
}
