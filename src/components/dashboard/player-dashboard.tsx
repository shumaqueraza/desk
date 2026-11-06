import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Stamp, MarkBadge } from "@/components/shared/stamp";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
import { formatDateShort } from "@/lib/dates";
import { readinessGap } from "@/lib/readiness";
import { appConfig } from "@/config/app.config";
import type { PlayerDetail } from "@/lib/queries";

export function PlayerDashboard({ detail }: { detail: PlayerDetail }) {
  const { stats, attendance, matches } = detail;
  const gaps = readinessGap(stats);

  return (
    <div>
      <PageHeader
        kicker="MY RECORD"
        title={detail.name}
        sub={`${detail.sport} · age ${detail.age} · jersey ${detail.jerseyNumber}`}
      />

      {/* Readiness verdict: the biggest thing on the page */}
      <section
        aria-label="Trial readiness"
        className={`rounded-2xl p-6 sm:p-7 border-2 ${
          stats.isReady ? "pitch-surface text-bone border-pitch-line" : "bg-chalk border-line"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-volt" : "text-ink-3 opacity-70"}`}>
              Trial readiness
            </p>
            {stats.isReady ? (
              <>
                <h2 className="font-display font-extrabold text-[1.9rem] sm:text-[2.2rem] leading-tight mt-2">
                  You are ready for trials.
                </h2>
                <p className="mt-2 text-[0.98rem] opacity-85 max-w-[34rem]">
                  Keep coming to practice and playing matches to stay ready.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display font-extrabold text-[1.9rem] sm:text-[2.2rem] leading-tight mt-2">
                  Not ready for trials yet.
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {gaps.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-[0.98rem] text-ink-2">
                      <X className="size-4 mt-1 shrink-0 text-red" strokeWidth={3} aria-hidden />
                      {g}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {stats.isReady && <Stamp tone="green"><Check className="size-4" strokeWidth={3} aria-hidden /> Ready</Stamp>}
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t ${stats.isReady ? "border-pitch-line" : "border-line"}`}>
          <div>
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>
              Attendance
            </p>
            <p className="mt-1.5">
              <PercentReadout percent={stats.attendancePercent} big onDark={stats.isReady} />
            </p>
            <div className="mt-2">
              <AttendanceRuler present={stats.present} total={stats.sessionsHeld} size="sm" tone={stats.isReady ? "dark" : "light"} />
            </div>
          </div>
          <div>
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>
              Sessions
            </p>
            <p className="score-numeral text-[2.4rem] leading-none mt-1.5">
              {stats.present}<span className={stats.isReady ? "text-chalk/50" : "text-ink-3"}>/{stats.sessionsHeld}</span>
            </p>
            <p className={`text-[0.85rem] mt-1.5 ${stats.isReady ? "text-chalk/75" : "text-ink-2"}`}>came to practice</p>
          </div>
          <div>
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>
              Matches
            </p>
            <p className="score-numeral text-[2.4rem] leading-none mt-1.5">
              {stats.matchesPlayed}
              <span className={stats.isReady ? "text-chalk/50" : "text-ink-3"}>/{appConfig.readiness.minMatchesPlayed}</span>
            </p>
            <p className={`text-[0.85rem] mt-1.5 ${stats.isReady ? "text-chalk/75" : "text-ink-2"}`}>matches played</p>
          </div>
          <div>
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>
              Runs + points
            </p>
            <p className="score-numeral text-[2.4rem] leading-none mt-1.5">
              {matches.reduce((s, m) => s + m.score, 0)}
            </p>
            <p className={`text-[0.85rem] mt-1.5 ${stats.isReady ? "text-chalk/75" : "text-ink-2"}`}>scored in matches</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Match history */}
        <section aria-labelledby="my-matches" className="lg:col-span-5 bg-chalk border border-line rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
            <h2 id="my-matches" className="font-display font-extrabold text-[1.25rem] tracking-tight">
              My matches
            </h2>
            <span className="font-data text-[0.85rem] text-ink-2">{matches.length} played</span>
          </div>
          {matches.length === 0 ? (
            <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem] leading-relaxed">
              No matches yet. When the coach puts you on a match sheet, your score shows up here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {matches.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-3.5 px-5 sm:px-6 py-4">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] text-ink-2 shrink-0 whitespace-nowrap tabular-nums">{formatDateShort(m.date)}</span>
                  <span className="flex-1 min-w-0 font-bold text-[0.96rem] truncate">vs {m.opponent}</span>
                  <span className="score-numeral text-[1.3rem] text-green">{m.score}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 sm:px-6 py-3 border-t border-line">
            <Link href="/matches" className="inline-flex items-center gap-1 font-bold text-green-2 hover:text-green text-[0.92rem]">
              All my matches <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Attendance history */}
        <section aria-labelledby="my-attendance" className="lg:col-span-7 bg-chalk border border-line rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
            <h2 id="my-attendance" className="font-display font-extrabold text-[1.25rem] tracking-tight">
              My attendance
            </h2>
            <span className="font-data text-[0.85rem] text-ink-2">
              {stats.present} of {stats.sessionsHeld} present
            </span>
          </div>
          {attendance.length === 0 ? (
            <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem] leading-relaxed">
              No practice recorded yet. Your marks will show up here after the first session.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {attendance.slice(0, 8).map((a, i) => (
                <li key={`${a.date}-${i}`} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] text-ink-2 shrink-0 whitespace-nowrap tabular-nums">{formatDateShort(a.date)}</span>
                  <span className="text-[0.92rem] text-ink-2 flex-1 min-w-0 truncate">{a.sport} practice</span>
                  <MarkBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
