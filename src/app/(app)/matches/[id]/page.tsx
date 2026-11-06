import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMatchDetail } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreSheet } from "@/components/matches/score-sheet";
import { DeleteMatchButton } from "@/components/matches/delete-match-button";
import { formatDateLong } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role === "scout") redirect("/dashboard");

  const { id } = await params;
  const data = await getMatchDetail(id);
  if (!data) notFound();

  const { match, lines, eligible } = data;

  // A player sees the match, but only their own line on the sheet.
  if (user.role === "player") {
    const mine = lines.find((l) => l.playerId === user.playerId);
    return (
      <div>
        <Link href="/matches" className="inline-flex items-center gap-1.5 font-bold text-[0.92rem] text-ink-2 hover:text-green-2 mb-5">
          <ArrowLeft className="size-4" aria-hidden />
          Back to my matches
        </Link>
        <PageHeader
          kicker={`${match.sport.toUpperCase()} MATCH`}
          title={`vs ${match.opponent}`}
          sub={formatDateLong(match.date)}
        />
        {mine ? (
          <div className="bg-chalk border border-line rounded-2xl p-6 sm:p-8 flex items-center gap-5">
            <span className="jersey !w-[3.4rem] !h-[3.4rem] !text-[1.3rem]">{mine.jerseyNumber}</span>
            <div className="flex-1">
              <p className="font-bold text-[1.15rem]">{mine.name}</p>
              <p className="text-ink-2 text-[0.92rem] mt-0.5">your score in this match</p>
            </div>
            <p className="score-numeral text-[3rem] leading-none text-green">{mine.score}</p>
          </div>
        ) : (
          <div className="bg-chalk border border-dashed border-line-2 rounded-2xl p-6 sm:p-8 text-center">
            <p className="font-bold text-[1.1rem]">You did not play in this match.</p>
            <p className="text-ink-2 text-[0.94rem] mt-1.5">
              Only players present at that day&apos;s practice join the sheet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Coach: full sheet
  return (
    <div>
      <Link href="/matches" className="inline-flex items-center gap-1.5 font-bold text-[0.92rem] text-ink-2 hover:text-green-2 mb-5">
        <ArrowLeft className="size-4" aria-hidden />
        Back to matches
      </Link>
      <PageHeader
        kicker={`${match.sport.toUpperCase()} MATCH`}
        title={`vs ${match.opponent}`}
        sub={formatDateLong(match.date)}
      >
        <DeleteMatchButton matchId={match.id} opponent={match.opponent} />
      </PageHeader>
      {/* The count and total live inside ScoreSheet now — computed live on the client. */}
      <ScoreSheet matchId={match.id} lines={lines} eligible={eligible} />
    </div>
  );
}
