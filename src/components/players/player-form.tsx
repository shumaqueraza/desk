"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleAlert, Loader2, UserPlus } from "lucide-react";
import { inputClass, labelClass, hintClass, primaryBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";

export interface EditablePlayer {
  id: string;
  name: string;
  age: number;
  sport: string;
}

/** Add or edit a player. One dialog, two modes. */
export function PlayerForm({
  open,
  onOpenChange,
  mode,
  player,
  nextJersey,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "add" | "edit";
  player?: EditablePlayer;
  nextJersey?: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-chalk border border-line-2 rounded-2xl p-6 sm:p-7 max-w-[26rem] w-[calc(100vw-2rem)]">
        <DialogHeader className="text-left space-y-1.5">
          <DialogTitle className="font-display font-extrabold text-[1.4rem] tracking-tight">
            {mode === "add" ? "Add a player" : "Edit player details"}
          </DialogTitle>
          <DialogDescription className="text-[0.94rem] text-ink-2 leading-relaxed">
            {mode === "add"
              ? `Name, age and sport. The player gets jersey number ${nextJersey ?? "?"} and a login for their own record.`
              : "Change the name, age or sport. History is kept."}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <PlayerFormBody mode={mode} player={player} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Mounted fresh each time the dialog opens, so state starts clean. */
function PlayerFormBody({
  mode,
  player,
  onDone,
}: {
  mode: "add" | "edit";
  player?: EditablePlayer;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(player?.name ?? "");
  const [age, setAge] = useState(player ? String(player.age) : "");
  const [sport, setSport] = useState<string>(player?.sport ?? appConfig.sports[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const url = mode === "add" ? "/api/players" : `/api/players/${player!.id}`;
      const body = mode === "add" ? { name, age, sport, username, password } : { name, age, sport };
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save the player. Try again.");
        setBusy(false);
        return;
      }
      onDone();
      router.refresh();
      if (mode === "add") router.push(`/players/${data.data.id}`);
    } catch {
      setError("Could not reach the desk. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-5" noValidate>
      {error && (
        <div role="alert" className="flex items-start gap-2.5 border border-red bg-red-tint text-red rounded-xl p-3 text-[0.9rem] font-bold">
          <CircleAlert className="size-5 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="p-name" className={labelClass}>Full name</label>
        <input id="p-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="p-age" className={labelClass}>Age</label>
          <input id="p-age" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} required inputMode="numeric" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="p-sport" className={labelClass}>Sport</label>
          <select id="p-sport" className={inputClass} value={sport} onChange={(e) => setSport(e.target.value)}>
            {appConfig.sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {mode === "add" && (
        <>
          <div>
            <label htmlFor="p-username" className={labelClass}>Login username</label>
            <input
              id="p-username"
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="off"
            />
            <p className={hintClass}>{appConfig.accounts.usernameHint}.</p>
          </div>
          <div>
            <label htmlFor="p-password" className={labelClass}>Password</label>
            <input
              id="p-password"
              type="text"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off"
            />
            <p className={hintClass}>
              At least {appConfig.accounts.minPasswordLength} characters. The player signs in with this and the username.
            </p>
          </div>
        </>
      )}

      <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <UserPlus className="size-5" aria-hidden />}
        {busy ? "Saving…" : mode === "add" ? "Add player" : "Save changes"}
      </button>
    </form>
  );
}
