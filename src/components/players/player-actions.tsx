"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power, KeyRound, CircleAlert, Loader2 } from "lucide-react";
import { secondaryBtn, dangerBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";

/** Coach controls for one player: account on/off and password reset. */
export function PlayerActions({
  playerId,
  isActive,
}: {
  playerId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"status" | "password" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function toggleStatus() {
    setBusy("status");
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/players/${playerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not change the account.");
      } else {
        setNotice(
          data.data.isActive
            ? "Account switched on. The player can sign in and appears on new practice rosters."
            : "Account switched off. The player cannot sign in. History is kept.",
        );
        router.refresh();
      }
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function resetPassword() {
    const password = window.prompt(
      `Set a new password for this player (at least ${appConfig.accounts.minPasswordLength} characters):`,
    );
    if (password === null) return;
    setBusy("password");
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/players/${playerId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not reset the password.");
      } else {
        setNotice("Password updated. Tell the player their new password.");
      }
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {(error || notice) && (
        <div
          role="status"
          className={`flex items-start gap-2.5 border rounded-xl p-3 text-[0.88rem] font-bold ${
            error ? "border-red bg-red-tint text-red" : "border-green bg-green-tint text-green-deep"
          }`}
        >
          <CircleAlert className="size-4.5 shrink-0 mt-0.5" aria-hidden />
          <span>{error ?? notice}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={busy !== null}
          className={isActive ? dangerBtn : secondaryBtn}
        >
          {busy === "status" ? (
            <Loader2 className="size-4.5 animate-spin" aria-hidden />
          ) : (
            <Power className="size-4.5" aria-hidden />
          )}
          {isActive ? "Switch account off" : "Switch account on"}
        </button>
        <button type="button" onClick={resetPassword} disabled={busy !== null} className={secondaryBtn}>
          {busy === "password" ? (
            <Loader2 className="size-4.5 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="size-4.5" aria-hidden />
          )}
          Reset password
        </button>
      </div>
    </div>
  );
}
