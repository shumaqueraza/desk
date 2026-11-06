import Link from "next/link";
import { ArrowRight, Stamp as StampIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
import { appConfig } from "@/config/app.config";
import type { ScoutBoardData } from "@/lib/queries";

export function ScoutDashboard({ data }: { data: ScoutBoardData }) {
  const { readyPlayers, totals } = data;

  return (
    <div>
      <PageHeader
        kicker="SCOUTING BOARD"
        title="Ready players"
        sub={`Players appear here only when they meet the ready rule: ${appConfig.readiness.minAttendancePercent}% attendance and at least ${appConfig.readiness.minMatchesPlayed} matches played. ${totals.ready} of ${totals.tracked} players qualify.`}
      />

      {readyPlayers.length === 0 ? (
        <EmptyState
          icon={StampIcon}
          title="No players are ready yet"
          body={`Nobody has both ${appConfig.readiness.minAttendancePercent}% attendance and ${appConfig.readiness.minMatchesPlayed} recorded matches. Check back after the next practice or match.`}
        />
      ) : (
        <section aria-label="Ready players" className="bg-chalk border border-line rounded-2xl overflow-hidden">
          {/* Desktop register table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-pitch text-bone text-left">
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5">
                  JERSEY
                </th>
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5">
                  PLAYER
                </th>
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5">
                  SPORT
                </th>
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5">
                  ATTENDANCE
                </th>
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5">
                  MATCHES
                </th>
                <th scope="col" className="font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5 text-right">
                  SHEET
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {readyPlayers.map((p) => (
                <tr key={p.id} className="hover:bg-green-tint-2/60 transition-colors">
                  <td className="px-5 py-4"><span className="jersey">{p.jerseyNumber}</span></td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[1rem]">{p.name}</span>
                    <span className="block text-[0.84rem] text-ink-3">age {p.age}</span>
                  </td>
                  <td className="px-5 py-4 text-[0.95rem]">{p.sport}</td>
                  <td className="px-5 py-4">
                    <PercentReadout percent={p.stats.attendancePercent} />
                    <span className="block mt-1.5">
                      <AttendanceRuler present={p.stats.present} total={p.stats.sessionsHeld} size="sm" />
                    </span>
                  </td>
                  <td className="px-5 py-4 score-numeral text-[1.1rem]">{p.stats.matchesPlayed}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/players/${p.id}`}
                      className="inline-flex items-center gap-1.5 h-11 px-4 border-[1.5px] border-line-2 rounded-full font-bold text-[0.9rem] hover:bg-green hover:text-chalk hover:border-green-deep transition-colors"
                    >
                      View <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards: stacked register rows */}
          <ul className="md:hidden divide-y divide-line">
            {readyPlayers.map((p) => (
              <li key={p.id}>
                <Link href={`/players/${p.id}`} className="flex items-center gap-3.5 px-4 py-4">
                  <span className="jersey">{p.jerseyNumber}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[1rem] truncate">{p.name}</span>
                    <span className="block text-[0.84rem] text-ink-3">
                      {p.sport} · {p.stats.matchesPlayed} matches
                    </span>
                    <span className="block mt-2">
                      <AttendanceRuler present={p.stats.present} total={p.stats.sessionsHeld} size="sm" />
                    </span>
                  </span>
                  <PercentReadout percent={p.stats.attendancePercent} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
