"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CheckCircle2, Loader2 } from "lucide-react";
import { inputClass, labelClass, hintClass, primaryBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";

const { minPasswordLength, usernameHint } = appConfig.accounts;

/**
 * Coach-only account editor: name, username and password. Players and
 * scouts keep their read-only Profile tab.
 */
export function CoachProfileForm({
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save your details.");
        return;
      }
      setPassword("");
      setSaved(true);
      router.refresh(); // updates the masthead name and the page header
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <div>
        <label htmlFor="coach-name" className={labelClass}>
          Name
        </label>
        <input
          id="coach-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={60}
          required
        />
      </div>

      <div>
        <label htmlFor="coach-username" className={labelClass}>
          Username
        </label>
        <input
          id="coach-username"
          className={inputClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          maxLength={20}
          required
        />
        <p className={hintClass}>{usernameHint}. You sign in with this.</p>
      </div>

      <div>
        <label htmlFor="coach-password" className={labelClass}>
          New password
        </label>
        <input
          id="coach-password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Leave blank to keep your current password"
        />
        <p className={hintClass}>
          At least {minPasswordLength} characters. Leave blank to keep your current one.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border rounded-xl p-3 text-[0.9rem] font-bold border-red bg-red-tint text-red"
        >
          <CircleAlert className="size-4.5 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}
      {saved && (
        <div
          role="status"
          className="flex items-start gap-2.5 border rounded-xl p-3 text-[0.9rem] font-bold border-green bg-green-tint text-green-deep"
        >
          <CheckCircle2 className="size-4.5 shrink-0 mt-0.5" aria-hidden />
          <span>Saved. Your details are updated.</span>
        </div>
      )}

      <button type="submit" disabled={busy} className={primaryBtn}>
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        Save changes
      </button>
    </form>
  );
}
