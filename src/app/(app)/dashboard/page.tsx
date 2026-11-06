import { requireUser } from "@/lib/auth";
import { getCoachDashboard, getPlayerDetail, getScoutBoard } from "@/lib/queries";
import { CoachDashboard } from "@/components/dashboard/coach-dashboard";
import { PlayerDashboard } from "@/components/dashboard/player-dashboard";
import { ScoutDashboard } from "@/components/dashboard/scout-dashboard";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "coach") {
    const data = await getCoachDashboard();
    return <CoachDashboard coachName={user.name} data={data} />;
  }

  if (user.role === "player") {
    if (!user.playerId) redirect("/profile");
    const detail = await getPlayerDetail(user.playerId);
    if (!detail) redirect("/profile");
    return <PlayerDashboard detail={detail} />;
  }

  const data = await getScoutBoard();
  return <ScoutBoardWrapper data={data} />;
}

function ScoutBoardWrapper({ data }: { data: Awaited<ReturnType<typeof getScoutBoard>> }) {
  return <ScoutDashboard data={data} />;
}
