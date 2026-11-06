import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getMatches, getPlayerMatches } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RecordMatchButton } from "@/components/matches/record-match-button";
import { Trophy } from "lucide-react";
import { formatDateCompact, formatDateShort } from "@/lib/dates";

export const metadata = { title: "Matches" };
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const user = await requireUser();
  if (user.role === "scout") redirect("/dashboard");

  if (user.role === "player") {
    if (!user.playerId) redirect("/dashboard");
    const matches = await getPlayerMatches(user.playerId);
    return (
      <div>
        <PageHeader
          kicker="MY MATCHES"
          title="Matches"
          sub={`${matches.length} played, ${matches.reduce((s, m) => s + m.score, 0)} scored in total.`}
        />
        {matches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No matches yet"
            body="When the coach puts you on a match sheet, the match and your score show up here."
          />
        ) : (
          <ul className="bg-chalk border border-line rounded-2xl divide-y divide-line overflow-hidden">
            {matches.map((m) => (
              <li key={m.id}>
                <a
                  href={`/matches/${m.id}`}
                  className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-green-tint-2/60 transition-colors"
                >
                  <span className="rounded-full bg-green-tint-2 px-3 py-1.5 font-data text-[0.8rem] font-semibold text-green-deep shrink-0 whitespace-nowrap tabular-nums">
                    {formatDateShort(m.date).replace(/, /, " · ")}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[1rem] truncate">vs {m.opponent}</span>
                    <span className="block text-[0.84rem] text-ink-3">{m.sport}</span>
                  </span>
                  <span className="score-numeral text-[1.5rem] text-green">{m.score}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Coach
  const matches = await getMatches(100);

  return (
    <div>
      <PageHeader
        kicker="MATCH RECORD"
        title="Matches"
        sub={`${matches.length} recorded. Only players present at that day's practice can be put on a sheet.`}
      >
        <RecordMatchButton />
      </PageHeader>

      {matches.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No matches recorded"
          body="Record a match with its date, sport and opponent, then fill the sheet with the players who were present that day."
        >
          <RecordMatchButton />
        </EmptyState>
      ) : (
        <ul className="bg-chalk border border-line rounded-2xl divide-y divide-line overflow-hidden">
          {matches.map((m) => (
            <li key={m.id}>
              <a
                href={`/matches/${m.id}`}
                className="flex items-center gap-x-4 px-4 sm:px-6 py-4 hover:bg-green-tint-2/60 transition-colors"
              >
                <span className="hidden sm:inline-flex items-center rounded-full bg-green-tint-2 px-3 py-1.5 font-data text-[0.8rem] font-semibold text-green-deep shrink-0 whitespace-nowrap tabular-nums">
                  {formatDateShort(m.date).replace(/, /, " · ")}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-data text-[0.7rem] tracking-wide text-ink-3 sm:hidden">
                    {formatDateCompact(m.date)}
                  </span>
                  <span className="block font-bold text-[1rem] truncate">vs {m.opponent}</span>
                  <span className="block text-[0.84rem] text-ink-3">{m.sport}</span>
                </span>
                <span className="hidden sm:block font-data text-[0.85rem] text-ink-2 shrink-0 w-[5.5rem] text-right">
                  {m.players} player{m.players === 1 ? "" : "s"}
                </span>
                <span className="shrink-0 text-right w-[4.5rem]">
                  <span className="score-numeral block text-[1.5rem] text-green leading-none">{m.totalScore}</span>
                  <span className="block text-[0.72rem] text-ink-3 mt-1">scored</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
