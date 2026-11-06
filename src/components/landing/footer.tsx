import Link from "next/link";
import { appConfig } from "@/config/app.config";

/** Minimal public footer: identity, entry point, reviewer footnote. */
export function LandingFooter() {
  return (
    <footer className="border-t border-pitch-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div>
            <p className="display-poster text-bone text-[1.05rem]">ACADEMY DESK</p>
            <p className="micro-label text-bone-2/70 mt-2.5 !text-[0.6rem]">
              The register of one sports academy
            </p>
          </div>
          <Link
            href="/login"
            className="micro-label text-bone hover:text-volt transition-colors !text-[0.66rem] hover:underline underline-offset-8 decoration-volt/60"
          >
            Sign in
          </Link>
        </div>

        {/* Reviewer footnote — quiet, mono, one block */}
        {appConfig.features.showDemoAccounts && (
          <div className="mt-10 pt-6 border-t border-pitch-line/60">
            <p className="micro-label text-bone-2/50 !text-[0.58rem]">
              For reviewers — demo sign-ins
            </p>
            <ul className="mt-3 grid sm:grid-cols-3 gap-x-8 gap-y-2">
              {appConfig.demoAccounts.map((a) => (
                <li
                  key={a.username}
                  className="grid grid-cols-[3.8rem_1fr] items-baseline gap-2 font-data text-[0.8rem]"
                >
                  <span className="text-bone/85">{a.role.toLowerCase()}</span>
                  <span className="text-bone-2/80">
                    {a.username} / {a.password}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="micro-label text-bone-2/40 !text-[0.58rem]">
            © {new Date().getFullYear()} Academy Desk · Dumka, Jharkhand
          </p>
          <p className="micro-label text-bone-2/40 !text-[0.58rem]">
            Cricket · Football · Kabaddi · Athletics · Hockey
          </p>
        </div>
      </div>
    </footer>
  );
}
