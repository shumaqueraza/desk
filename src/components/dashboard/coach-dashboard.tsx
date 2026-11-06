import Link from "next/link";
import { ArrowRight, Plus, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SessionStatusStamp, ReadyStamp } from "@/components/shared/stamp";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateLong, todayStr } from "@/lib/dates";
import type { CoachDashboardData } from "@/lib/queries";
import { appConfig } from "@/config/app.config";

export function CoachDashboard({ coachName, data }: { coachName: string; data: CoachDashboardData }) {
  const { totals, recentSessions, readyPlayers, needsAttention } = data;

  return (
    <div>
      <PageHeader
        kicker="COACH DESK"
        title={`Hello, ${coachName.split(" ")[0]}`}
        sub={`${formatDateLong(todayStr())} · ${totals.sessionsHeld} practices held, ${totals.matches} matches recorded this register.`}
      >
        <Link
          href="/practice"
          className="h-12 px-5 inline-flex items-center gap-2 bg-green hover:bg-green-2 text-chalk font-bold text-[0.94rem] rounded-full border-2 border-green-deep transition-colors"
        >
          <Plus className="size-5" aria-hidden />
          Open practice
        </Link>
        <Link
          href="/matches"
          className="h-12 px-5 inline-flex items-center gap-2 bg-chalk hover:bg-green-tint-2 text-ink font-bold text-[0.94rem] rounded-full border-[1.5px] border-line-2 transition-colors"
        >
          Record match
        </Link>
      </PageHeader>

      {/* Stat band: one ruled panel, not identical cards */}
      <section aria-label="Academy numbers" className="bg-chalk border border-line rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line overflow-hidden">
        <StatSegment label="Players on the books" value={String(totals.players)} />
        <StatSegment label="Practice sessions held" value={String(totals.sessionsHeld)} />
        <StatSegment label="Matches recorded" value={String(totals.matches)} />
        <div className="pitch-surface text-bone p-5">
          <p className="micro-label !text-[0.62rem] text-volt">
            Ready for trials
          </p>
          <p className="score-numeral text-[3.3rem] leading-none mt-2 text-volt">{totals.ready}</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Practice register feed */}
        <section aria-labelledby="practice-feed" className="lg:col-span-7 bg-chalk border border-line rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
            <h2 id="practice-feed" className="font-display font-extrabold text-[1.25rem] tracking-tight">
              Practice register
            </h2>
            <Link href="/practice" className="inline-flex items-center gap-1 font-bold text-green-2 hover:text-green text-[0.92rem]">
              All practice <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardList}
                title="No practice yet"
                body="Open the first practice session: pick a date and a sport, and the desk will show the roster to mark."
              >
                <Link
                  href="/practice"
                  className="h-12 px-5 inline-flex items-center gap-2 bg-green text-chalk font-bold text-[0.94rem] rounded-full border-2 border-green-deep"
                >
                  Open practice
                </Link>
              </EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/practice/${s.id}`}
                    className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-green-tint-2/60 transition-colors"
                  >
                    <span className="rounded-full bg-green-tint-2 px-3 py-1.5 font-data text-[0.8rem] font-semibold text-green-deep shrink-0 whitespace-nowrap tabular-nums">
                      {s.date.slice(8)} {MONTHS[Number(s.date.slice(5, 7)) - 1]}
                    </span>
                    <span className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-bold text-[0.98rem] truncate">{s.sport}</span>
                      <span className="font-data text-[0.84rem] text-ink-3 tabular-nums">
                        {s.status === "open"
                          ? `${s.marked}/${s.rosterSize} marked`
                          : `${s.present}/${s.marked || s.rosterSize} present`}
                      </span>
                    </span>
                    <SessionStatusStamp status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 sm:px-6 py-3 border-t border-line flex items-center justify-between">
            <span className="text-[0.85rem] text-ink-3">
              Showing the latest {recentSessions.length} sessions
            </span>
            <Link href="/practice" className="inline-flex items-center gap-1 font-bold text-green-2 hover:text-green text-[0.88rem]">
              All practice <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Ready + attention columns */}
        <div className="lg:col-span-5 space-y-6">
          <section aria-labelledby="ready-list" className="bg-chalk border border-line rounded-2xl">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
              <h2 id="ready-list" className="font-display font-extrabold text-[1.25rem] tracking-tight">
                Ready for trials
              </h2>
              <span className="font-data text-[0.85rem] text-ink-2">{readyPlayers.length} players</span>
            </div>
            {readyPlayers.length === 0 ? (
              <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem] leading-relaxed">
                No one meets the ready rule yet. It takes {appConfig.readiness.minAttendancePercent}% attendance
                and {appConfig.readiness.minMatchesPlayed} recorded matches.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {readyPlayers.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link href={`/players/${p.id}`} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-green-tint-2/60 transition-colors">
                      <span className="jersey">{p.jerseyNumber}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-[0.96rem] truncate">{p.name}</span>
                        <span className="block text-[0.82rem] text-ink-3">{p.sport}</span>
                      </span>
                      <AttendanceRuler present={p.stats.present} total={p.stats.sessionsHeld} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="attention-list" className="bg-chalk border border-line rounded-2xl">
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-line">
              <h2 id="attention-list" className="font-display font-extrabold text-[1.25rem] tracking-tight">
                Needs attention
              </h2>
              <p className="text-[0.85rem] text-ink-3 mt-0.5">Lowest attendance on the books.</p>
            </div>
            {needsAttention.length === 0 ? (
              <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem]">
                Everyone active is either ready or has no practice recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {needsAttention.map((p) => (
                  <li key={p.id}>
                    <Link href={`/players/${p.id}`} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-green-tint-2/60 transition-colors">
                      <span className="jersey jersey-outline">{p.jerseyNumber}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-[0.96rem] truncate">{p.name}</span>
                        <span className="block text-[0.82rem] text-ink-3">{p.sport}</span>
                      </span>
                      <PercentReadout percent={p.stats.attendancePercent} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatSegment({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <p className="font-data text-[0.72rem] tracking-[0.12em] font-semibold text-ink-3">{label.toUpperCase()}</p>
      <p className="score-numeral text-[3.3rem] leading-none text-ink mt-2">{value}</p>
    </div>
  );
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
