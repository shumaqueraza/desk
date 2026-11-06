import { Stamp as StampIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoutBoard } from "@/components/dashboard/scout-board";
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
          <ScoutBoard players={readyPlayers} />
        </section>
      )}
    </div>
  );
}
