import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Match, Performance } from "@/lib/models";
import { requireApiUser, isResponse } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/api";
import { getMatchDetail } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

/**
 * One match's score sheet. Coach only — players see their own match lines on
 * their dashboard, and scouts see only ready players, so neither may open a
 * full sheet.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    const detail = await getMatchDetail(id);
    if (!detail) return fail("No such match.", 404);
    return ok(detail);
  } catch (e) {
    return serverError(e);
  }
}

/** Delete a match and every score on its sheet. Coach only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const auth = await requireApiUser(["coach"]);
    if (isResponse(auth)) return auth;
    const { id } = await params;

    await connectDB();
    const match = await Match.findById(id);
    if (!match) return fail("No such match.", 404);

    await Performance.deleteMany({ matchId: id });
    await Match.findByIdAndDelete(id);

    return ok({ id });
  } catch (e) {
    return serverError(e);
  }
}
