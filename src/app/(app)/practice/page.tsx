import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSessions } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SessionStatusStamp } from "@/components/shared/stamp";
import { OpenPracticeButton } from "@/components/sessions/open-practice-button";
import { ClipboardList } from "lucide-react";
import { formatDateShort, monthLabel } from "@/lib/dates";

export const metadata = { title: "Practice" };
export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await requireUser();
  if (user.role !== "coach") redirect("/dashboard");

  const sessions = await getSessions(100);

  // Group by month for a readable register.
  const groups = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const label = monthLabel(s.date);
    const list = groups.get(label) ?? [];
    list.push(s);
    groups.set(label, list);
  }

  return (
    <div>
      <PageHeader
        kicker="PRACTICE REGISTER"
        title="Practice"
        sub={`${sessions.length} sessions in the book${sessions.filter((s) => s.status === "open").length ? `, ${sessions.filter((s) => s.status === "open").length} still open` : ""}. Open a session to mark it, close it to lock it forever.`}
      >
        <OpenPracticeButton />
      </PageHeader>

      {sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No practice yet"
          body="Open the first session: pick a date and a sport, mark every player present or absent, then close the register."
        >
          <OpenPracticeButton />
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([month, list]) => (
            <section key={month} aria-label={month}>
              <h2 className="font-data text-[0.8rem] tracking-[0.14em] font-semibold text-ink-3 mb-3">
                {month.toUpperCase()}
              </h2>
              <ul className="bg-chalk border border-line rounded-2xl divide-y divide-line overflow-hidden">
                {list.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`/practice/${s.id}`}
                      className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-green-tint-2/60 transition-colors"
                    >
                      <span className="rounded-full bg-green-tint-2 px-3 py-1.5 font-data text-[0.8rem] font-semibold text-green-deep shrink-0 whitespace-nowrap tabular-nums">
                        {formatDateShort(s.date).replace(/, /, " · ")}
                      </span>
                      <span className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-bold text-[1rem] truncate">{s.sport}</span>
                        <span className="font-data text-[0.84rem] text-ink-3 tabular-nums">
                          {s.status === "open"
                            ? `${s.marked}/${s.rosterSize} marked`
                            : `${s.present}/${s.marked || s.rosterSize} present`}
                        </span>
                      </span>
                      <SessionStatusStamp status={s.status} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
