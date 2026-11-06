"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CircleAlert, Loader2 } from "lucide-react";
import { appConfig } from "@/config/app.config";

export function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Could not create the coach account.");
        setBusy(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the desk. Check your connection and try again.");
      setBusy(false);
    }
  }

  const minLen = appConfig.accounts.minPasswordLength;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-red bg-red-tint text-red rounded-xl p-3 text-[0.9rem] font-bold"
        >
          <CircleAlert className="size-5 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="coach-name" className="micro-label !text-[0.68rem] text-ink-2 mb-2 block">
          Your full name
        </label>
        <input
          id="coach-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-[52px] px-3.5 bg-chalk border-[1.5px] border-line-2 rounded-xl text-[1rem] focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
        />
      </div>

      <div>
        <label htmlFor="coach-username" className="micro-label !text-[0.68rem] text-ink-2 mb-2 block">
          Username
        </label>
        <input
          id="coach-username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className="w-full h-[52px] px-3.5 bg-chalk border-[1.5px] border-line-2 rounded-xl text-[1rem] focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
        />
        <p className="text-[0.82rem] text-ink-3 mt-1.5">{appConfig.accounts.usernameHint}.</p>
      </div>

      <div>
        <label htmlFor="coach-password" className="micro-label !text-[0.68rem] text-ink-2 mb-2 block">
          Password
        </label>
        <div className="relative">
          <input
            id="coach-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[52px] px-3.5 pr-14 bg-chalk border-[1.5px] border-line-2 rounded-xl text-[1rem] focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1 h-[44px] w-[44px] flex items-center justify-center rounded-xl text-ink-2 hover:bg-green-tint"
          >
            {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
        <p className="text-[0.82rem] text-ink-3 mt-1.5">At least {minLen} characters.</p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full h-[52px] bg-volt hover:bg-volt-deep disabled:opacity-70 text-pitch font-extrabold text-[1rem] rounded-full flex items-center justify-center gap-2.5 transition-colors"
      >
        {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {busy ? "Creating…" : "Create coach account"}
      </button>
    </form>
  );
}
