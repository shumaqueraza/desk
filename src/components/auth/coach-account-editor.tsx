"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, Loader2, Save } from "lucide-react";
import { hintClass, inputClass, labelClass, primaryBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";

/**
 * Coach-only account editor on the Profile page. Coaches can change their
 * own name, username and password. Players and scouts never see this —
 * their profile stays read-only.
 */
export function CoachAccountEditor({
  initialName,
  initialUsername,
}: {
  initialName: string;
  initialUsername: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const unchanged =
    name.trim() === initialName && username.trim() === initialUsername && password === "";

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save the changes.");
        return;
      }
      setPassword("");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-red bg-red-tint text-red rounded-xl p-3 mb-4 text-[0.9rem] font-bold"
        >
          <CircleAlert className="size-5 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}
      {saved && !error && (
        <div
          role="status"
          className="flex items-start gap-2.5 border border-green bg-green-tint text-green-deep rounded-xl p-3 mb-4 text-[0.9rem] font-bold"
        >
          <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden />
          <span>Saved. Your account details are updated.</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="p-name" className={labelClass}>Name</label>
          <input
            id="p-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label htmlFor="p-username" className={labelClass}>Username</label>
          <input
            id="p-username"
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            spellCheck={false}
            required
          />
          <p className={hintClass}>You sign in with this name. {appConfig.accounts.usernameHint}.</p>
        </div>

        <div>
          <label htmlFor="p-password" className={labelClass}>New password</label>
          <input
            id="p-password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className={hintClass}>
            Leave blank to keep your current password. Otherwise at least{" "}
            {appConfig.accounts.minPasswordLength} characters.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <button type="submit" disabled={busy || unchanged} className={primaryBtn}>
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
