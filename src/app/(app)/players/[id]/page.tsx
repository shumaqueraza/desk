import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPlayerDetail } from "@/lib/queries";
import { MarkBadge, ReadyStamp } from "@/components/shared/stamp";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
import { PlayerActions } from "@/components/players/player-actions";
import { EditPlayerButton } from "@/components/players/edit-player-button";
import { secondaryBtn } from "@/components/shared/form-styles";
import { formatDateShort } from "@/lib/dates";
import { readinessGap } from "@/lib/readiness";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // Players may only open their own record.
  if (user.role === "player" && user.playerId !== id) notFound();

  const detail = await getPlayerDetail(id);
  if (!detail) notFound();

  // Scouts may only see players who meet the ready rule.
  if (user.role === "scout" && !detail.stats.isReady) notFound();

  const isCoach = user.role === "coach";
  const canPrintCard = user.role === "coach" || user.role === "scout";
  const { stats, attendance, matches } = detail;
  const gaps = readinessGap(stats);
  const totalScore = matches.reduce((s, m) => s + m.score, 0);

  return (
    <div>
      <Link
        href={user.role === "player" ? "/dashboard" : user.role === "scout" ? "/dashboard" : "/players"}
        className="inline-flex items-center gap-1.5 font-bold text-[0.92rem] text-ink-2 hover:text-green-2 mb-5"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {user.role === "player" ? "Back to my record" : user.role === "scout" ? "Back to the board" : "Back to players"}
      </Link>

      {/* Identity header */}
      <div className="flex flex-wrap items-start gap-5">
        <span className="jersey !w-[4.2rem] !h-[4.2rem] !text-[1.7rem] !rounded-xl">
          {detail.jerseyNumber}
        </span>
        <div className="flex-1 min-w-[240px]">
          <h1 className="font-display font-extrabold text-[2.1rem] leading-tight tracking-tight">
            {detail.name}
          </h1>
          <p className="text-ink-2 text-[1rem] mt-1 flex flex-wrap items-center gap-x-2 gap-y-2">
            <span>
              {detail.sport} · age {detail.age} ·{" "}
              {detail.isActive ? (
                <span className="font-bold text-green-deep">active</span>
              ) : (
                <span className="font-bold text-red">account off</span>
              )}
              {detail.username && isCoach && (
                <> · signs in as <span className="font-data text-[0.9rem]">{detail.username}</span></>
              )}
            </span>
            <ReadyStamp ready={stats.isReady} />
          </p>
        </div>
        {canPrintCard && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isCoach && (
              <EditPlayerButton
                player={{ id: detail.id, name: detail.name, age: detail.age, sport: detail.sport }}
              />
            )}
            <a
              href={`/players/${detail.id}/card`}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryBtn}
            >
              <Printer className="size-4.5" aria-hidden />
              Print report card
            </a>
          </div>
        )}
      </div>

      {/* Readiness numbers */}
      <section
        aria-label="Readiness numbers"
        className={`rounded-2xl border-2 mt-7 overflow-hidden ${
          stats.isReady ? "pitch-surface text-bone border-pitch-line" : "bg-chalk border-line"
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line border-b border-line md:border-b-0">
          <div className="p-5">
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>Attendance</p>
            <p className="mt-2"><PercentReadout percent={stats.attendancePercent} big onDark={stats.isReady} /></p>
            <div className="mt-2.5">
              <AttendanceRuler present={stats.present} total={stats.sessionsHeld} size="sm" tone={stats.isReady ? "dark" : "light"} />
            </div>
          </div>
          <div className="p-5">
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>Present</p>
            <p className="score-numeral text-[2.6rem] leading-none mt-2">
              {stats.present}<span className={stats.isReady ? "text-chalk/50" : "text-ink-3"}>/{stats.sessionsHeld}</span>
            </p>
            <p className={`text-[0.84rem] mt-2 ${stats.isReady ? "text-chalk/70" : "text-ink-2"}`}>sessions</p>
          </div>
          <div className="p-5">
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>Matches</p>
            <p className="score-numeral text-[2.6rem] leading-none mt-2">{stats.matchesPlayed}</p>
            <p className={`text-[0.84rem] mt-2 ${stats.isReady ? "text-chalk/70" : "text-ink-2"}`}>played</p>
          </div>
          <div className="p-5">
            <p className={`micro-label !text-[0.62rem] font-semibold ${stats.isReady ? "text-bone-2" : "text-ink-3"}`}>Scored</p>
            <p className="score-numeral text-[2.6rem] leading-none mt-2">{totalScore}</p>
            <p className={`text-[0.84rem] mt-2 ${stats.isReady ? "text-chalk/70" : "text-ink-2"}`}>in matches</p>
          </div>
        </div>
        {!stats.isReady && (
          <div className="px-5 py-4 border-t border-line">
            <ul className="space-y-1">
              {gaps.map((g) => (
                <li key={g} className="text-[0.95rem] text-ink-2">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Registers */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
        <section aria-labelledby="attendance-register" className="lg:col-span-7 bg-chalk border border-line rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
            <h2 id="attendance-register" className="font-display font-extrabold text-[1.2rem] tracking-tight">
              Attendance register
            </h2>
            <span className="font-data text-[0.85rem] text-ink-2">
              {stats.present} of {stats.sessionsHeld} present
            </span>
          </div>
          {attendance.length === 0 ? (
            <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem] leading-relaxed">
              No practice marks yet for this player.
            </p>
          ) : (
            <ul className="divide-y divide-line max-h-96 overflow-y-auto">
              {attendance.map((a, i) => (
                <li key={`${a.date}-${i}`} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] text-ink-2 shrink-0 whitespace-nowrap tabular-nums">{formatDateShort(a.date)}</span>
                  <span className="text-[0.92rem] text-ink-2 flex-1 min-w-0 truncate">{a.sport} practice</span>
                  <MarkBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="match-history" className="lg:col-span-5 bg-chalk border border-line rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
            <h2 id="match-history" className="font-display font-extrabold text-[1.2rem] tracking-tight">
              Match history
            </h2>
            <span className="font-data text-[0.85rem] text-ink-2">{matches.length} played</span>
          </div>
          {matches.length === 0 ? (
            <p className="px-5 sm:px-6 py-6 text-ink-2 text-[0.94rem] leading-relaxed">
              No matches recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-line max-h-96 overflow-y-auto">
              {matches.map((m) => (
                <li key={m.id} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5">
                  <span className="rounded-full bg-field px-3 py-1.5 font-data text-[0.8rem] text-ink-2 shrink-0 whitespace-nowrap tabular-nums">{formatDateShort(m.date)}</span>
                  <span className="flex-1 min-w-0 font-bold text-[0.94rem] truncate">vs {m.opponent}</span>
                  <span className="score-numeral text-[1.2rem] text-green">{m.score}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {isCoach && (
        <section aria-label="Account controls" className="mt-10 pt-6 border-t-2 border-line">
          <h2 className="font-display font-extrabold text-[1.15rem] tracking-tight mb-3">
            Account
          </h2>
          <p className="text-ink-2 text-[0.92rem] mb-4 max-w-[42rem]">
            Switching the account off blocks this player&apos;s sign-in and removes them from new
            practice rosters. Their history stays on the books.
          </p>
          <PlayerActions playerId={detail.id} isActive={detail.isActive} />
        </section>
      )}
    </div>
  );
}
