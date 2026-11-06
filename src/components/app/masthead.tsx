"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  UserRound,
  Stamp,
  LogOut,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { appConfig, type Role } from "@/config/app.config";
import type { SessionUser } from "@/lib/auth";

export const navIconByHref: Record<string, { icon: typeof Users; label: string }> = {
  "/dashboard": { icon: LayoutDashboard, label: "Dashboard" },
  "/players": { icon: Users, label: "Players" },
  "/practice": { icon: ClipboardList, label: "Practice" },
  "/matches": { icon: Trophy, label: "Matches" },
  "/profile": { icon: UserRound, label: "Profile" },
};

/** Label overrides per role come from config; icons are keyed by href. */
export function navItems(role: Role) {
  return appConfig.navigation[role].map((item) => ({
    ...item,
    icon: (item.href === "/dashboard"
      ? role === "player"
        ? UserRound
        : role === "scout"
          ? Stamp
          : LayoutDashboard
      : navIconByHref[item.href]?.icon ?? LayoutDashboard),
  }));
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The desk masthead: the same pitch-black bar as the public site —
 * one lockup, one volt thread, one pill button. The register changes,
 * the club does not.
 */
export function Masthead({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const items = navItems(user.role);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="pitch-surface text-bone sticky top-0 z-40 border-b border-pitch-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="min-w-0 shrink group flex items-center gap-2.5" aria-label="Play Ready — dashboard">
            <img
              src="/images/play-ready-logo.png"
              alt=""
              className="h-8 w-8 rounded-lg border border-pitch-line/70 object-cover shrink-0"
            />
            <span className="min-w-0">
              <p className="display-poster text-bone text-[0.98rem] leading-none tracking-tight group-hover:text-volt transition-colors">
                PLAY READY
              </p>
              <p className="micro-label text-bone-2/70 mt-1 !text-[0.56rem] sm:!text-[0.6rem]">
                DUMKA · {appConfig.roles[user.role].label.toUpperCase()}
              </p>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-bone/10 px-3.5 py-1.5 text-[0.88rem] text-bone/85">
              <span className="size-1.5 rounded-full bg-volt" aria-hidden />
              {user.name}
            </span>
            <button
              onClick={signOut}
              disabled={busy}
              className="h-10 px-4 sm:px-5 inline-flex items-center gap-2 rounded-full border border-bone/25 font-bold text-[0.86rem] text-bone transition-colors hover:border-volt hover:bg-volt hover:text-pitch disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <LogOut className="size-4" aria-hidden />
              )}
              <span className="hidden xs:inline sm:inline">Sign out</span>
              <span className="inline sm:hidden">Exit</span>
            </button>
          </div>
        </div>

        {/* Desktop tabs — volt underline marks the open page */}
        <nav aria-label="Main" className="hidden md:flex items-end gap-1 -mb-px">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`h-12 px-4 inline-flex items-center gap-2 text-[0.95rem] font-bold border-b-[3px] rounded-t-lg transition-colors ${
                  active
                    ? "border-volt text-volt"
                    : "border-transparent text-bone/55 hover:text-bone hover:border-bone/30"
                }`}
              >
                <Icon className="size-[18px]" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function BottomTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItems(role);

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-chalk/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`h-[64px] flex flex-col items-center justify-start pt-[6px] gap-1 text-[0.78rem] font-bold leading-none transition-colors ${
                active ? "text-green" : "text-ink-2"
              }`}
            >
              <span
                className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                  active ? "bg-pitch text-volt" : ""
                }`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
