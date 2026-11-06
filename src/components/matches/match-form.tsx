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
import { Trophy, CircleAlert, Loader2 } from "lucide-react";
import { inputClass, labelClass, hintClass, primaryBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";
import { todayStr } from "@/lib/dates";

/** Record a match: date, sport, opponent. Players are added on the sheet. */
export function MatchForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-chalk border border-line-2 rounded-2xl p-6 sm:p-7 max-w-[24rem] w-[calc(100vw-2rem)]">
        <DialogHeader className="text-left space-y-1.5">
          <DialogTitle className="font-display font-extrabold text-[1.4rem] tracking-tight">
            Record a match
          </DialogTitle>
          <DialogDescription className="text-[0.94rem] text-ink-2 leading-relaxed">
            Date, sport and opponent. On the next screen the desk lists the players who were
            present at practice that day, ready for their scores.
          </DialogDescription>
        </DialogHeader>
        {open && <MatchFormBody onCreated={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function MatchFormBody({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [sport, setSport] = useState<string>(appConfig.sports[0]);
  const [opponent, setOpponent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sport, opponent }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not record the match.");
        setBusy(false);
        return;
      }
      onCreated();
      router.push(`/matches/${data.data.id}`);
    } catch {
      setError("Could not reach the desk. Try again.");
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
        <label htmlFor="m-date" className={labelClass}>Date</label>
        <input id="m-date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div>
        <label htmlFor="m-sport" className={labelClass}>Sport</label>
        <select id="m-sport" className={inputClass} value={sport} onChange={(e) => setSport(e.target.value)}>
          {appConfig.sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className={hintClass}>Only players present at that sport&apos;s practice that day can join the sheet.</p>
      </div>

      <div>
        <label htmlFor="m-opponent" className={labelClass}>Opponent</label>
        <input
          id="m-opponent"
          className={inputClass}
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="For example: Pakur Warriors"
          required
          autoComplete="off"
        />
      </div>

      <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Trophy className="size-5" aria-hidden />}
        {busy ? "Recording…" : "Record match"}
      </button>
    </form>
  );
}
