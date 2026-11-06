"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Loader2, Save, Lock, CircleAlert, CheckCheck, Users } from "lucide-react";
import { primaryBtn, secondaryBtn } from "@/components/shared/form-styles";
import type { SessionRow } from "@/lib/queries";

type Mark = "present" | "absent";

/**
 * The attendance register for one open session.
 * Mark everyone Present or Absent, save, then close and lock.
 */
export function AttendanceSheet({
  sessionId,
  rows,
}: {
  sessionId: string;
  rows: SessionRow[];
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, Mark | null>>(
    Object.fromEntries(rows.map((r) => [r.playerId, r.mark])),
  );
  const [baseline, setBaseline] = useState<Record<string, Mark | null>>(
    Object.fromEntries(rows.map((r) => [r.playerId, r.mark])),
  );
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const present = useMemo(() => Object.values(marks).filter((m) => m === "present").length, [marks]);
  const marked = useMemo(() => Object.values(marks).filter((m) => m !== null).length, [marks]);
  const unmarked = rows.length - marked;
  const dirty = useMemo(
    () => JSON.stringify(marks) !== JSON.stringify(baseline),
    [marks, baseline],
  );

  function setMark(playerId: string, mark: Mark) {
    setMarks((m) => ({ ...m, [playerId]: mark }));
    setNotice(null);
    setError(null);
  }

  function markAllPresent() {
    setMarks(Object.fromEntries(rows.map((r) => [r.playerId, "present" as Mark])));
    setNotice(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = Object.entries(marks)
        .filter(([, v]) => v !== null)
        .map(([playerId, status]) => ({ playerId, status }));
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save the marks.");
      } else {
        setBaseline({ ...marks });
        setNotice(`Saved. ${data.data.present} present, ${data.data.absent} absent.`);
      }
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    setClosing(true);
    setError(null);
    try {
      // Save current marks first so nothing on screen is lost, then lock.
      const payload = Object.entries(marks)
        .filter(([, v]) => v !== null)
        .map(([playerId, status]) => ({ playerId, status }));
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: payload }),
      });
      const res = await fetch(`/api/sessions/${sessionId}/close`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not close the session.");
        setClosing(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the desk. Try again.");
      setClosing(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="bg-chalk border border-line rounded-2xl px-6 py-10 text-center">
        <Users className="size-9 text-ink-3 mx-auto" strokeWidth={1.8} aria-hidden />
        <p className="font-bold text-[1.1rem] mt-4">No active players play this sport.</p>
        <p className="text-ink-2 text-[0.94rem] mt-1.5 max-w-md mx-auto leading-relaxed">
          Add players for this sport first, then come back to mark this session.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Action bar */}
      <div className="bg-chalk border border-line rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3">
        <p className="flex-1 min-w-[200px] text-[0.95rem]">
          <span className="font-bold">{present} present</span>
          <span className="text-ink-2">
            {" "}· {marked} of {rows.length} marked
            {unmarked > 0 && (
              <span className="text-red"> · {unmarked} still to mark</span>
            )}
          </span>
        </p>
        <button type="button" onClick={markAllPresent} className={secondaryBtn} disabled={busy || closing}>
          <CheckCheck className="size-4.5" aria-hidden />
          Mark all present
        </button>
        {dirty ? (
          <button type="button" onClick={save} className={primaryBtn} disabled={busy || closing}>
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
            {busy ? "Saving…" : "Save attendance"}
          </button>
        ) : (
          <span
            className="h-12 px-5 inline-flex items-center gap-2 bg-green-tint text-green-deep font-bold text-[0.94rem] rounded-full border-2 border-green/30"
            aria-live="polite"
          >
            <CheckCheck className="size-5" aria-hidden />
            Saved
          </span>
        )}
        <button
          type="button"
          onClick={() => setCloseOpen(true)}
          className="h-12 px-5 inline-flex items-center gap-2 bg-green-deep hover:bg-green text-chalk font-bold text-[0.94rem] rounded-full border-2 border-green-deep transition-colors disabled:opacity-70"
          disabled={busy || closing}
        >
          <Lock className="size-4.5" aria-hidden />
          Close session
        </button>
      </div>

      {(error || notice || (dirty && !busy)) && (
        <div
          role="status"
          className={`mt-3 flex items-start gap-2.5 border rounded-xl p-3 text-[0.9rem] font-bold ${
            error ? "border-red bg-red-tint text-red" : notice ? "border-green bg-green-tint text-green-deep" : "border-line-2 bg-green-tint-2 text-ink-2"
          }`}
        >
          <CircleAlert className="size-4.5 shrink-0 mt-0.5" aria-hidden />
          {error ?? notice ?? "You have marks on screen that are not saved yet."}
        </div>
      )}

      {/* The register */}
      <ul className="bg-chalk border border-line rounded-2xl divide-y divide-line mt-4 overflow-hidden">
        {rows.map((r) => (
          <li key={r.playerId} className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
            <span className="jersey">{r.jerseyNumber}</span>
            <span className="flex-1 min-w-[140px]">
              <span className="block font-bold text-[1rem]">{r.name}</span>
              <span className="block text-[0.84rem] text-ink-3">age {r.age}</span>
            </span>
            <div
              role="group"
              aria-label={`Mark ${r.name}`}
              className="flex gap-2 w-[228px] max-w-full"
            >
              <button
                type="button"
                aria-pressed={marks[r.playerId] === "present"}
                onClick={() => setMark(r.playerId, "present")}
                className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-[0.92rem] font-bold rounded-xl border-[1.5px] transition-colors ${
                  marks[r.playerId] === "present"
                    ? "bg-green text-chalk border-green-deep"
                    : "bg-chalk text-ink-2 border-line-2 hover:bg-green-tint"
                }`}
              >
                <Check className="size-4.5" strokeWidth={3} aria-hidden />
                Present
              </button>
              <button
                type="button"
                aria-pressed={marks[r.playerId] === "absent"}
                onClick={() => setMark(r.playerId, "absent")}
                className={`flex-1 h-12 inline-flex items-center justify-center gap-2 text-[0.92rem] font-bold rounded-xl border-[1.5px] transition-colors ${
                  marks[r.playerId] === "absent"
                    ? "bg-red text-chalk border-[#7d2a1c]"
                    : "bg-chalk text-ink-2 border-line-2 hover:bg-red-tint"
                }`}
              >
                <X className="size-4.5" strokeWidth={3} aria-hidden />
                Absent
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[0.85rem] text-ink-3 mt-4 leading-relaxed max-w-[46rem]">
        Save often while practice runs. Closing the session locks the register for good:
        marks can no longer be changed, and players without a mark are recorded absent.
      </p>

      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent className="bg-chalk border border-line-2 rounded-2xl p-6 sm:p-7 max-w-[26rem] w-[calc(100vw-2rem)]">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="font-display font-extrabold text-[1.35rem] tracking-tight">
              Close this session and lock it?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[0.96rem] text-ink-2 leading-relaxed">
              The register becomes permanent history. Marks cannot be changed after this.
              <span className="block mt-2 font-bold text-ink">
                On closing, the register records {present} present and {rows.length - present} absent.
              </span>
              {unmarked > 0 && (
                <span className="block mt-1 font-bold text-ink">
                  {unmarked} player{unmarked > 1 ? "s" : ""} without a mark will be recorded absent.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3 sm:gap-3 flex-col sm:flex-col sm:space-x-0">
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                close();
              }}
              className="h-12 bg-green hover:bg-green-2 text-chalk font-bold text-[0.96rem] rounded-full border-2 border-green-deep w-full"
              disabled={closing}
            >
              {closing ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4.5" aria-hidden />}
              {closing ? "Closing…" : "Close and lock"}
            </AlertDialogAction>
            <AlertDialogCancel className="h-12 bg-chalk text-ink font-bold text-[0.96rem] rounded-full border-[1.5px] border-line-2 hover:bg-green-tint-2 w-full mt-0">
              Keep it open
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
