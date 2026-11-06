"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, UserRoundX } from "lucide-react";
import { ReadyStamp } from "@/components/shared/stamp";
import { AttendanceRuler, PercentReadout } from "@/components/shared/attendance-ruler";
import { appConfig } from "@/config/app.config";
import type { PlayerRecord } from "@/lib/queries";

type StatusFilter = "all" | "active" | "inactive";

/** Coach's squad register with search and filters. */
export function RosterView({ roster }: { roster: PlayerRecord[] }) {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState<string>("All sports");
  const [status, setStatus] = useState<StatusFilter>("all");

  const sports = useMemo(
    () => ["All sports", ...new Set(roster.map((p) => p.sport))],
    [roster],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roster.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (sport !== "All sports" && p.sport !== sport) return false;
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;
      return true;
    });
  }, [roster, search, sport, status]);

  return (
    <div>
      {/* Search and filter bar, with the live count on the same ruled line */}
      <div className="bg-chalk border border-line rounded-2xl p-4 sm:p-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-ink-3" aria-hidden />
          <label htmlFor="roster-search" className="sr-only">
            Search players by name
          </label>
          <input
            id="roster-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full h-12 pl-11 pr-4 bg-field border-[1.5px] border-line-2 rounded-xl text-[1rem] focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
          />
        </div>
        <p className="font-data text-[0.82rem] text-ink-3 tabular-nums order-last w-full sm:order-none sm:w-auto" role="status">
          {filtered.length} of {roster.length} shown
        </p>
        <div>
          <label htmlFor="roster-sport" className="sr-only">
            Filter by sport
          </label>
          <select
            id="roster-sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="h-12 px-3.5 bg-field border-[1.5px] border-line-2 rounded-xl text-[0.95rem] font-bold focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div role="group" aria-label="Filter by account status" className="flex border-[1.5px] border-line-2 rounded-full overflow-hidden h-12 bg-field p-0.5">
          {(["all", "active", "inactive"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              aria-pressed={status === f}
              className={`px-4 text-[0.9rem] font-bold rounded-full transition-colors ${
                status === f ? "bg-green text-chalk" : "text-ink-2 hover:bg-green-tint"
              }`}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Register table */}
      <section aria-label="Squad register" className="bg-chalk border border-line rounded-2xl overflow-hidden mt-3">
        <table className="w-full hidden md:table">
          <thead>
            <tr className="bg-pitch text-bone text-left">
              {["JERSEY", "PLAYER", "SPORT", "ATTENDANCE", "MATCHES", "READINESS", "ACCOUNT", ""].map((h, i) => (
                <th
                  key={h + i}
                  scope="col"
                  className={`font-data text-[0.72rem] tracking-[0.1em] font-semibold px-5 py-3.5 ${i === 7 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-green-tint-2/60 transition-colors ${!p.isActive ? "opacity-60" : ""}`}>
                <td className="px-5 py-4"><span className="jersey">{p.jerseyNumber}</span></td>
                <td className="px-5 py-4">
                  <span className="font-bold text-[1rem]">{p.name}</span>
                  <span className="block text-[0.84rem] text-ink-3">age {p.age}</span>
                </td>
                <td className="px-5 py-4 text-[0.95rem]">{p.sport}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PercentReadout percent={p.stats.attendancePercent} />
                    <AttendanceRuler present={p.stats.present} total={p.stats.sessionsHeld} size="sm" showCount={false} />
                  </div>
                </td>
                <td className="px-5 py-4 score-numeral text-[1.1rem]">{p.stats.matchesPlayed}</td>
                <td className="px-5 py-4"><ReadyStamp ready={p.stats.isReady} /></td>
                <td className="px-5 py-4">
                  <span className={`text-[0.88rem] font-bold ${p.isActive ? "text-ink-3" : "text-red"}`}>
                    {p.isActive ? "Active" : "Switched off"}
                  </span>
                </td>
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

        {/* Mobile stacked register */}
        <ul className="md:hidden divide-y divide-line">
          {filtered.map((p) => (
            <li key={p.id} className={p.isActive ? "" : "opacity-60"}>
              <Link href={`/players/${p.id}`} className="flex items-center gap-3.5 px-4 py-4">
                <span className="jersey">{p.jerseyNumber}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[1rem] truncate">{p.name}</span>
                  <span className="block text-[0.84rem] text-ink-3">
                    {p.sport} · age {p.age} · {p.stats.matchesPlayed} matches
                  </span>
                  <span className="block mt-2">
                    <AttendanceRuler present={p.stats.present} total={p.stats.sessionsHeld} size="sm" />
                  </span>
                </span>
                <span className="flex flex-col items-end gap-2">
                  <PercentReadout percent={p.stats.attendancePercent} />
                  <ReadyStamp ready={p.stats.isReady} />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="px-6 py-14 text-center">
            <UserRoundX className="size-9 text-ink-3 mx-auto" strokeWidth={1.8} aria-hidden />
            <p className="font-bold text-[1.1rem] mt-4">No players match this filter.</p>
            <p className="text-ink-2 text-[0.92rem] mt-1.5">
              Clear the search or pick a different sport.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
