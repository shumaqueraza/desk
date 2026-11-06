import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPlayerDetail } from "@/lib/queries";
import { PrintCardButton } from "@/components/players/print-card-button";
import { formatDateLong, formatDateShort, todayStr } from "@/lib/dates";
import { readinessGap } from "@/lib/readiness";
import { appConfig } from "@/config/app.config";

export const dynamic = "force-dynamic";

export default async function PlayerReportCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role === "player") notFound();

  const { id } = await params;
  const detail = await getPlayerDetail(id);
  if (!detail) notFound();

  // Scouts may only see players who meet the ready rule.
  if (user.role === "scout" && !detail.stats.isReady) notFound();

  const { stats, matches } = detail;
  const gaps = readinessGap(stats);

  const scores = matches.map((m) => m.score);
  const highest = scores.length ? Math.max(...scores) : null;
  const lowest = scores.length ? Math.min(...scores) : null;
  const total = scores.reduce((s, x) => s + x, 0);
  const noMatches = matches.length === 0;

  const recentMatches = matches.slice(0, 12);

  const backHref = user.role === "scout" ? "/dashboard" : "/players";
  const backLabel = user.role === "scout" ? "Back to the board" : "Back to players";

  return (
    <div className="min-h-svh py-8 px-4 print:p-0">
      <div className="mx-auto w-full max-w-[210mm] mb-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 font-bold text-[0.92rem] text-ink-2 hover:text-green-2"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
          <PrintCardButton />
        </div>
      </div>

      <article className="print-sheet bg-chalk text-ink mx-auto w-full max-w-[210mm] border border-line shadow-xl sm:rounded-2xl">
        {/* Header */}
        <header className="px-7 py-6 flex items-start justify-between gap-6 border-b border-line">
          <div className="min-w-0">
            <p className="font-data text-[0.68rem] tracking-[0.14em] text-green-deep">
              PLAY READY · PLAYER REPORT CARD
            </p>
            <h1 className="font-display font-extrabold text-[1.85rem] leading-tight mt-2">
              {detail.name}
            </h1>
            <p className="text-[0.88rem] text-ink-2 mt-2">
              {detail.sport} · Age {detail.age} ·{" "}
              {stats.isReady ? (
                <span className="font-bold text-green-deep">Ready</span>
              ) : (
                <span className="font-bold text-red">Not ready</span>
              )}
            </p>
          </div>
          <span className="jersey jersey-outline">{detail.jerseyNumber}</span>
        </header>

        {/* Not-ready line */}
        {!stats.isReady && (
          <p className="px-7 pt-4 text-[0.9rem] text-ink-2">
            Not ready yet — {gaps.join(" · ")}
          </p>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-line border-y border-line">
          <div className="px-4 py-4">
            <p className="micro-label text-ink-3">ATTENDANCE</p>
            <p className="score-numeral text-[1.9rem] leading-none text-ink mt-2">
              {stats.attendancePercent}%
            </p>
            <p className="font-data text-[0.72rem] text-ink-3 mt-1">
              {stats.present} of {stats.sessionsHeld} sessions
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="micro-label text-ink-3">MATCHES</p>
            <p className="score-numeral text-[1.9rem] leading-none text-ink mt-2">
              {stats.matchesPlayed}
            </p>
            <p className="font-data text-[0.72rem] text-ink-3 mt-1">played</p>
          </div>
          <div className="px-4 py-4">
            <p className="micro-label text-ink-3">HIGHEST</p>
            <p className="score-numeral text-[1.9rem] leading-none text-ink mt-2">
              {highest ?? "—"}
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="micro-label text-ink-3">LOWEST</p>
            <p className="score-numeral text-[1.9rem] leading-none text-ink mt-2">
              {lowest ?? "—"}
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="micro-label text-ink-3">TOTAL</p>
            <p className="score-numeral text-[1.9rem] leading-none text-ink mt-2">
              {noMatches ? "—" : total}
            </p>
            <p className="font-data text-[0.72rem] text-ink-3 mt-1">in matches</p>
          </div>
        </div>

        {/* Match record */}
        <h2 className="px-7 pt-6 pb-2 micro-label text-ink-3">MATCH RECORD</h2>
        {matches.length === 0 ? (
          <p className="px-7 py-4 text-ink-2">No matches on record.</p>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {recentMatches.map((m) => (
                <li key={m.id} className="px-7 py-2.5 flex items-center gap-4">
                  <span className="font-data text-[0.8rem] leading-tight text-ink-2 w-[7.5rem] shrink-0 tabular-nums">
                    {formatDateShort(m.date)}
                  </span>
                  <span className="font-bold text-[0.92rem] leading-tight flex-1 min-w-0 truncate">
                    vs {m.opponent}
                  </span>
                  <span className="score-numeral text-[1.15rem] leading-none text-ink tabular-nums">
                    {m.score}
                  </span>
                </li>
              ))}
            </ul>
            {matches.length > 12 && (
              <p className="px-7 py-2 text-[0.78rem] text-ink-3">
                …and {matches.length - 12} more matches.
              </p>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 px-7 py-4 border-t border-line flex flex-wrap justify-between gap-2 font-data text-[0.72rem] text-ink-3">
          <span>Play Ready · {appConfig.appLocation}</span>
          <span>Generated {formatDateLong(todayStr())} · page 1 of 1</span>
        </footer>
      </article>
    </div>
  );
}
