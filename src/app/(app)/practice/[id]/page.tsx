import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { SessionStatusStamp, MarkBadge } from "@/components/shared/stamp";
import { AttendanceSheet } from "@/components/sessions/attendance-sheet";
import { DeleteSessionButton } from "@/components/sessions/delete-session-button";
import { formatDateLong } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "coach") redirect("/dashboard");

  const { id } = await params;
  const data = await getSessionDetail(id);
  if (!data) notFound();

  const { session, rows } = data;
  const present = rows.filter((r) => r.mark === "present").length;
  const marked = rows.filter((r) => r.mark !== null).length;

  return (
    <div>
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 font-bold text-[0.92rem] text-ink-2 hover:text-green-2 mb-5"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to practice
      </Link>

      <PageHeader
        kicker={session.sport.toUpperCase() + " PRACTICE"}
        title={formatDateLong(session.date)}
        sub={
          session.status === "open"
            ? "Mark every player, save, then close the session to lock the register."
            : "This session is closed. The register below is permanent history."
        }
      >
        <SessionStatusStamp status={session.status} />
        <DeleteSessionButton sessionId={session.id} />
      </PageHeader>

      {session.status === "open" ? (
        <AttendanceSheet sessionId={session.id} rows={rows} />
      ) : (
        <div>
          <div className="bg-red-tint/60 border border-line rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3">
            <span className="size-2 rounded-full bg-red shrink-0" aria-hidden />
            <p className="flex-1 min-w-[200px] text-[0.95rem]">
              <span className="font-bold">{present} present</span>
              <span className="text-ink-2"> · {marked} of {rows.length} marked</span>
            </p>
          </div>
          <ul className="bg-chalk border border-line rounded-2xl divide-y divide-line mt-4 overflow-hidden">
            {rows.map((r) => (
              <li key={r.playerId} className="flex items-center gap-4 px-4 sm:px-6 py-4">
                <span className="jersey">{r.jerseyNumber}</span>
                <span className="flex-1 min-w-0">
                  <Link href={`/players/${r.playerId}`} className="block font-bold text-[1rem] hover:text-green-2 truncate">
                    {r.name}
                  </Link>
                  <span className="block text-[0.84rem] text-ink-3">age {r.age}</span>
                </span>
                {r.mark ? (
                  <MarkBadge status={r.mark} />
                ) : (
                  <span className="text-[0.9rem] text-ink-3">No mark</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
