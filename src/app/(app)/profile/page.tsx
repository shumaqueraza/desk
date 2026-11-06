import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { CoachAccountEditor } from "@/components/auth/coach-account-editor";
import { appConfig } from "@/config/app.config";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const role = appConfig.roles[user.role];
  const isCoach = user.role === "coach";

  return (
    <div>
      <PageHeader kicker="MY ACCOUNT" title={user.name} sub={`Signed in as ${user.username}`} />

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <section aria-label="Account" className="bg-chalk border border-line rounded-2xl p-6 sm:p-7">
          <h2 className="font-display font-extrabold text-[1.25rem] tracking-tight">Account</h2>

          {isCoach ? (
            <div className="mt-5">
              <CoachAccountEditor initialName={user.name} initialUsername={user.username} />
              <dl className="mt-5 divide-y divide-line border-t border-line">
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink-2">Role</dt>
                  <dd className="font-bold">{role.label}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <dl className="mt-5 divide-y divide-line border-t border-line">
              <div className="flex justify-between gap-4 py-3.5">
                <dt className="text-ink-2">Name</dt>
                <dd className="font-bold">{user.name}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3.5">
                <dt className="text-ink-2">Username</dt>
                <dd className="font-data font-semibold">{user.username}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3.5">
                <dt className="text-ink-2">Role</dt>
                <dd className="font-bold">{role.label}</dd>
              </div>
            </dl>
          )}

          <p className="text-ink-2 text-[0.92rem] leading-relaxed mt-5">{role.description}</p>
          <div className="rule-double my-5" aria-hidden />
          <SignOutButton quiet />
        </section>
      </div>
    </div>
  );
}
