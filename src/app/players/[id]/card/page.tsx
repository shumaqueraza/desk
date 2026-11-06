import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPlayerDetail } from "@/lib/queries";
import { MarkBadge, ReadyStamp } from "@/components/shared/stamp";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
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

  const { stats, attendance, matches } = detail;
  const gaps = readinessGap(stats);

  const scores = matches.map((m) => m.score);
  const highest = scores.length ? Math.max(...scores) : null;
  const lowest = scores.length ? Math.min(...scores) : null;
  const total = scores.reduce((s, x) => s + x, 0);
  const noMatches = matches.length === 0;

  const recentAttendance = attendance.slice(0, 12);
  const recentMatches = matches.slice(0, 12);

  const backHref = user.role === "scout" ? "/dashboard" : "/players";
  const backLabel = user.role === "scout" ? "Back to the board" : "Back to players";

  const chips = [
    { label: "HIGHEST", value: highest === null ? "—" : highest },
    { label: "LOWEST", value: lowest === null ? "—" : lowest },
    { label: "TOTAL", value: noMatches ? "—" : total },
  ];

  return (
    <div className="min-h-svh py-8 px-4 print:min-h-0 print:p-0">
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

      <article className="bg-chalk text-ink mx-auto w-full max-w-[210mm] rounded-2xl border border-line shadow-xl print:shadow-none print:rounded-none print:border-0 p-8 sm:p-12 print-sheet">
        {/* Header band */}
        <header className="bg-pitch text-bone rounded-xl p-6">
          <p className="font-data text-[0.75rem] font-semibold tracking-[0.14em] text-volt">
            PLAY READY · PLAYER REPORT CARD
          </p>
          <h1 className="font-display font-extrabold text-[2rem] leading-tight tracking-tight mt-1.5">
            {detail.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.92rem] text-bone-2">
            <span className="jersey !w-8 !h-8 !text-[0.82rem] !rounded-lg">
              {detail.jerseyNumber}
            </span>
            <span>
              {detail.sport} · age {detail.age} ·{" "}
              {detail.isActive ? (
                <span className="font-bold text-volt">active</span>
              ) : (
                <span className="font-bold text-red">account off</span>
              )}
            </span>
            <span className="font-data text-[0.8rem]">
              Generated {formatDateLong(todayStr())}
            </span>
          </div>
        </header>

        {/* Verdict */}
        <div className="mt-4 flex flex-wrap items-start gap-x-4 gap-y-2">
          <ReadyStamp ready={stats.isReady} />
          {stats.isReady ? (
            <ul className="space-y-0.5 text-[0.9rem] text-ink-2">
              <li className="flex items-start gap-1.5">
                <Check className="size-4 mt-0.5 shrink-0 text-green" strokeWidth={3} aria-hidden />
                <span>
                  Attendance {stats.attendancePercent}% — meets the{" "}
                  {appConfig.readiness.minAttendancePercent}% rule
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="size-4 mt-0.5 shrink-0 text-green" strokeWidth={3} aria-hidden />
                <span>
                  {stats.matchesPlayed} matches — meets the{" "}
                  {appConfig.readiness.minMatchesPlayed}-match rule
                </span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-0.5 text-[0.9rem] text-ink-2">
              {gaps.map((gap) => (
                <li key={gap}>· {gap}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Attendance register */}
        <section className="mt-5">
          <h2 className="font-display font-extrabold text-[1.15rem] tracking-tight">
            Attendance register
          </h2>
          <div className="rule-double mt-2" />

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <PercentReadout percent={stats.attendancePercent} big />
            <span className="font-data text-[0.9rem] text-ink-2">
              {stats.present} of {stats.sessionsHeld} present
            </span>
            <div className="min-w-[9rem] flex-1">
              <AttendanceRuler present={stats.present} total={stats.sessionsHeld} />
            </div>
          </div>

          {attendance.length === 0 ? (
            <p className="mt-3 text-[0.92rem] text-ink-2">No practice marks yet.</p>
          ) : (
            <ul className="mt-2.5 divide-y divide-line">
              {recentAttendance.map((a, i) => (
                <li key={`${a.date}-${i}`} className="flex items-center gap-3 py-0.5">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] leading-none text-ink-2 shrink-0 whitespace-nowrap tabular-nums">
                    {formatDateShort(a.date)}
                  </span>
                  <span className="text-[0.9rem] text-ink-2 flex-1 min-w-0 truncate">
                    {a.sport} practice
                  </span>
                  <MarkBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
          {attendance.length > 12 && (
            <p className="mt-1 font-data text-[0.8rem] text-ink-3">
              …and {attendance.length - 12} more sessions on the desk.
            </p>
          )}
        </section>

        {/* Match ledger */}
        <section className="mt-5">
          <h2 className="font-display font-extrabold text-[1.15rem] tracking-tight">
            Match ledger
          </h2>
          <div className="rule-double mt-2" />

          <div className="mt-3 grid grid-cols-3 gap-3">
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="rounded-xl border border-line bg-green-tint-2/60 px-4 py-2.5"
              >
                <p className="micro-label text-ink-3">{chip.label}</p>
                <p className="score-numeral text-green text-[1.7rem] leading-none mt-1">
                  {chip.value}
                </p>
              </div>
            ))}
          </div>

          {matches.length === 0 ? (
            <p className="mt-3 text-[0.92rem] text-ink-2">No matches on record.</p>
          ) : (
            <ul className="mt-2.5 divide-y divide-line">
              {recentMatches.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-0.5">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] leading-none text-ink-2 shrink-0 whitespace-nowrap tabular-nums">
                    {formatDateShort(m.date)}
                  </span>
                  <span className="text-[0.9rem] font-bold flex-1 min-w-0 truncate">
                    vs {m.opponent}
                  </span>
                  <span className="score-numeral text-[1.1rem] leading-none text-green">
                    {m.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {matches.length > 12 && (
            <p className="mt-1 font-data text-[0.8rem] text-ink-3">
              …and {matches.length - 12} more matches.
            </p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-5 pt-3 border-t border-line flex items-center gap-2 font-data text-[0.78rem] text-ink-3">
          <span>
            Play Ready · {appConfig.appLocation} · page 1 of 1
          </span>
        </footer>
      </article>
    </div>
  );
}
