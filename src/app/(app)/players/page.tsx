import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFullRoster, nextJerseyNumber } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { RosterView } from "@/components/players/roster-view";
import { AddPlayerButton } from "@/components/players/add-player-button";
import { appConfig } from "@/config/app.config";

export const metadata = { title: "Players" };
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const user = await requireUser();

  // Players see only their own row, so send them to their own record.
  if (user.role === "player") {
    redirect(user.playerId ? `/players/${user.playerId}` : "/dashboard");
  }

  if (user.role === "scout") {
    redirect("/dashboard"); // the scouting board is the ready roster
  }

  const roster = await getFullRoster();
  const nextJersey = await nextJerseyNumber();
  const active = roster.filter((p) => p.isActive).length;

  return (
    <div>
      <PageHeader
        kicker="THE SQUAD"
        title="Players"
        sub={`${roster.length} on the books, ${active} active. Attendance and readiness update live after every practice and match.`}
      >
        <AddPlayerButton nextJersey={nextJersey} />
      </PageHeader>
      <RosterView roster={roster} />
      <p className="text-[0.85rem] text-ink-3 mt-4 max-w-[46rem] leading-relaxed">
        A player is ready for trials at {appConfig.readiness.minAttendancePercent}% attendance
        and {appConfig.readiness.minMatchesPlayed} matches. Switching an account off keeps the
        player&apos;s history but blocks their sign-in.
      </p>
    </div>
  );
}
