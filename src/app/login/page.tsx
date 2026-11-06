import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirectIfSignedIn } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { LoginForm } from "@/components/auth/login-form";
import { SetupForm } from "@/components/auth/setup-form";
import { appConfig } from "@/config/app.config";

export const metadata = { title: "Sign in" };

export const dynamic = "force-dynamic";

async function hasAnyAccount(): Promise<boolean> {
  await connectDB();
  const count = await User.countDocuments();
  return count > 0;
}

/**
 * The door into the desk: the same pitch canvas and photography as the
 * front page, with the register itself floating on a soft rounded card.
 */
export default async function LoginPage() {
  await redirectIfSignedIn();
  const hasAccount = await hasAnyAccount();

  return (
    <main className="pitch-surface grain relative min-h-svh flex flex-col text-bone font-display">
      {/* The ground, as on the front page */}
      <div className="absolute inset-0" aria-hidden>
        <img
          src="/images/silhouette.jpg"
          alt=""
          className="h-full w-full object-cover object-[62%_center] opacity-45 brightness-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pitch/80 via-pitch/60 to-pitch" />
        <div className="absolute inset-0 bg-gradient-to-r from-pitch/70 via-transparent to-pitch/70" />
      </div>

      {/* Bar: the lockup, and the way back */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Play Ready — home">
          <img
            src="/images/play-ready-logo.png"
            alt=""
            className="h-9 w-9 rounded-lg border border-pitch-line/70 object-cover shrink-0"
          />
          <span className="min-w-0">
            <span className="display-poster block text-bone text-[1.02rem] leading-tight group-hover:text-volt transition-colors">
              PLAY READY
            </span>
            <span className="micro-label block text-bone-2/70 mt-1 !text-[0.58rem]">
              Dumka · Jharkhand
            </span>
          </span>
        </Link>
        <Link
          href="/"
          className="group inline-flex h-11 items-center gap-2 rounded-full border border-bone/25 bg-bone/5 backdrop-blur px-5 micro-label !text-[0.66rem] text-bone transition-colors hover:border-volt hover:bg-volt hover:text-pitch"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden />
          Front page
        </Link>
      </header>

      {/* The register card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-10 sm:py-14">
        <div className="w-full max-w-[27rem]">
          <div className="relative bg-chalk text-ink rounded-[28px] border border-line shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)] overflow-hidden">
            {/* the volt seam — the same thread as the public page */}
            <div className="h-[6px] bg-volt" aria-hidden />

            <div className="px-6 sm:px-9 pt-8 sm:pt-10 pb-8 sm:pb-10">
              <p className="micro-label !text-[0.6rem] text-green font-semibold flex items-center gap-2.5">
                <span className="inline-block size-1.5 rounded-full bg-green" aria-hidden />
                {hasAccount ? "The night register" : "First run"}
              </p>
              <h1 className="display-poster text-[1.55rem] sm:text-[1.7rem] mt-3">
                {hasAccount ? "Sign in to the register" : "Welcome, coach"}
              </h1>
              <p className="text-ink-2 text-[0.98rem] mt-2 mb-7">
                {hasAccount
                  ? "Use the account the coach set up for you."
                  : "This register is empty. Create the coach account to start."}
              </p>

              {hasAccount ? <LoginForm /> : <SetupForm />}

              {appConfig.features.showDemoAccounts && hasAccount && (
                <div className="mt-8 rounded-2xl bg-field border border-line px-5 py-4">
                  <p className="micro-label !text-[0.58rem] text-ink-3">
                    For reviewers — demo sign-ins
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {appConfig.demoAccounts.map((a) => (
                      <li
                        key={a.username}
                        className="inline-flex items-center gap-2 rounded-full bg-chalk border border-line px-3.5 py-1.5 font-data text-[0.78rem]"
                      >
                        <span className="font-bold text-green-deep">{a.role}</span>
                        <span className="text-ink-2">
                          {a.username} / {a.password}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <p className="micro-label !text-[0.58rem] text-bone-2/80 text-center mt-6">
            Cricket · Football · Kabaddi · Athletics · Hockey
          </p>
        </div>
      </div>
    </main>
  );
}
