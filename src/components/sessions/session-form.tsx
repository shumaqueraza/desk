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
import { CalendarPlus, CircleAlert, Loader2 } from "lucide-react";
import { inputClass, labelClass, hintClass, primaryBtn } from "@/components/shared/form-styles";
import { appConfig } from "@/config/app.config";
import { todayStr } from "@/lib/dates";

/** Open a practice session: a date and a sport. */
export function SessionForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-chalk border border-line-2 rounded-2xl p-6 sm:p-7 max-w-[24rem] w-[calc(100vw-2rem)]">
        <DialogHeader className="text-left space-y-1.5">
          <DialogTitle className="font-display font-extrabold text-[1.4rem] tracking-tight">
            Open practice
          </DialogTitle>
          <DialogDescription className="text-[0.94rem] text-ink-2 leading-relaxed">
            Pick a date and a sport. The desk lists the active players of that sport for marking.
          </DialogDescription>
        </DialogHeader>
        {open && <SessionFormBody onCreated={(id) => { onOpenChange(false); }} />}
      </DialogContent>
    </Dialog>
  );
}

function SessionFormBody({ onCreated }: { onCreated: (id: string) => void }) {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [sport, setSport] = useState<string>(appConfig.sports[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sport }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not open the practice.");
        setBusy(false);
        return;
      }
      onCreated(data.data.id);
      router.push(`/practice/${data.data.id}`);
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
        <label htmlFor="s-date" className={labelClass}>Date</label>
        <input
          id="s-date"
          type="date"
          className={inputClass}
          value={date}
          max={appConfig.session.allowFutureDates ? undefined : todayStr()}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="s-sport" className={labelClass}>Sport</label>
        <select id="s-sport" className={inputClass} value={sport} onChange={(e) => setSport(e.target.value)}>
          {appConfig.sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className={hintClass}>One register per date and sport.</p>
      </div>

      <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <CalendarPlus className="size-5" aria-hidden />}
        {busy ? "Opening…" : "Open practice"}
      </button>
    </form>
  );
}
