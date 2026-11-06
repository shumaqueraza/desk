"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2, CircleAlert, ShieldAlert } from "lucide-react";
import { primaryBtn, secondaryBtn } from "@/components/shared/form-styles";
import type { MatchDetailData } from "@/lib/queries";

type Line = MatchDetailData["lines"][number];
type EligiblePlayer = MatchDetailData["eligible"][number];
type SheetLine = Line & { pending?: boolean };

/**
 * Score inputs are digits-only: letters, symbols, spaces and pasted junk are
 * stripped as they are typed, leading zeros are dropped ("012" → "12") and
 * the value is capped at three digits to match the server's 0–999 rule.
 */
function sanitizeScore(raw: string): string {
  return raw
    .replace(/[^0-9]/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, 3);
}

/**
 * The match score sheet — local-first, built for a slow or flaky network.
 *
 * Adding, removing and editing scores happen ONLY in page state: every click
 * is instant, nothing waits for the server. The player count and sheet total
 * are computed right here, so what you see is always what the sheet says.
 *
 * Pressing Save sends the whole set of changes (adds, edits, removes) to the
 * server as ONE request. If that request fails, nothing is lost — the local
 * state is untouched, so simply pressing Save again retries everything.
 */
export function ScoreSheet({
  matchId,
  lines: initialLines,
  eligible: initialEligible,
}: {
  matchId: string;
  lines: Line[];
  eligible: EligiblePlayer[];
}) {
  const router = useRouter();
  const [lines, setLines] = useState<SheetLine[]>(initialLines);
  const [eligibleList, setEligibleList] = useState<EligiblePlayer[]>(initialEligible);
  const [scores, setScores] = useState<Record<string, string>>(
    Object.fromEntries(initialLines.map((l) => [l.playerId, String(l.score)])),
  );
  const [candidateScores, setCandidateScores] = useState<Record<string, string>>({});
  // The score each line was last confirmed at on the server.
  const [saved, setSaved] = useState<Record<string, number>>(
    Object.fromEntries(initialLines.map((l) => [l.playerId, l.score])),
  );
  // Players that exist on the server and were removed locally (saved later).
  const [removedSaved, setRemovedSaved] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Server data changed (router.refresh): resync the local mirror to it.
  const [syncedFrom, setSyncedFrom] = useState({ lines: initialLines, eligible: initialEligible });
  if (syncedFrom.lines !== initialLines || syncedFrom.eligible !== initialEligible) {
    setSyncedFrom({ lines: initialLines, eligible: initialEligible });
    setLines(initialLines);
    setEligibleList(initialEligible);
    setScores(Object.fromEntries(initialLines.map((l) => [l.playerId, String(l.score)])));
    setSaved(Object.fromEntries(initialLines.map((l) => [l.playerId, l.score])));
    setRemovedSaved([]);
    setCandidateScores({});
  }

  /** Numeric score of a line: empty or invalid input counts as 0. */
  const numOf = (l: SheetLine) => Number(scores[l.playerId] ?? String(l.score)) || 0;

  const pendingAdds = lines
    .filter((l) => l.pending)
    .map((l) => ({ playerId: l.playerId, score: numOf(l) }));
  const pendingUpdates = lines
    .filter((l) => !l.pending && numOf(l) !== saved[l.playerId])
    .map((l) => ({ playerId: l.playerId, score: numOf(l) }));
  const dirty = pendingAdds.length > 0 || pendingUpdates.length > 0 || removedSaved.length > 0;

  const total = lines.reduce((s, l) => s + numOf(l), 0);

  /** Instant, local: the row moves onto the sheet right now. No network. */
  function addPlayer(p: EligiblePlayer) {
    setError(null);
    setNotice(null);
    const score = Number(candidateScores[p.id] || "0") || 0;
    setLines((ls) =>
      [
        ...ls,
        { playerId: p.id, name: p.name, jerseyNumber: p.jerseyNumber, score, pending: true },
      ].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    );
    setScores((s) => ({ ...s, [p.id]: String(score) }));
    setEligibleList((es) => es.filter((e) => e.id !== p.id));
    setCandidateScores((cs) => {
      const next = { ...cs };
      delete next[p.id];
      return next;
    });
  }

  /** Instant, local: the row moves back to the eligible list right now. */
  function removePlayer(playerId: string) {
    setError(null);
    setNotice(null);
    const line = lines.find((l) => l.playerId === playerId);
    if (!line) return;
    setLines((ls) => ls.filter((l) => l.playerId !== playerId));
    setEligibleList((es) =>
      [...es, { id: line.playerId, name: line.name, jerseyNumber: line.jerseyNumber }].sort(
        (a, b) => a.jerseyNumber - b.jerseyNumber || a.name.localeCompare(b.name),
      ),
    );
    if (!line.pending) setRemovedSaved((rs) => [...rs, playerId]);
    setSaved((sv) => {
      const next = { ...sv };
      delete next[playerId];
      return next;
    });
    setScores((s) => {
      const next = { ...s };
      delete next[playerId];
      return next;
    });
  }

  /** ONE request with every change. Failure keeps local state intact. */
  async function saveSheet() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/players/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adds: pendingAdds,
          updates: pendingUpdates,
          removes: removedSaved,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save the sheet. Your changes are still here — press Save again.");
        return;
      }
      // Confirmed: the sheet as it stands is now the server's state too.
      const confirmed = Object.fromEntries(lines.map((l) => [l.playerId, numOf(l)]));
      setSaved(confirmed);
      setLines((ls) =>
        ls.map(({ playerId, name, jerseyNumber, score }) => ({ playerId, name, jerseyNumber, score })),
      );
      setRemovedSaved([]);
      setNotice("Sheet saved.");
      // Background only — the page above already shows the right numbers.
      router.refresh();
    } catch {
      setError("Could not reach the desk. Your changes are still here — press Save again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="font-bold text-[1.02rem] text-ink" aria-live="polite">
        {lines.length} players on the sheet, {total} scored.
      </p>

      {(error || notice) && (
        <div
          role="status"
          className={`flex items-start gap-2.5 border rounded-xl p-3 text-[0.9rem] font-bold ${
            error ? "border-red bg-red-tint text-red" : "border-green bg-green-tint text-green-deep"
          }`}
        >
          <CircleAlert className="size-4.5 shrink-0 mt-0.5" aria-hidden />
          <span>{error ?? notice}</span>
        </div>
      )}

      {/* The sheet */}
      <section aria-labelledby="sheet-lines" className="bg-chalk border border-line rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
          <h2 id="sheet-lines" className="font-display font-extrabold text-[1.25rem] tracking-tight">
            Score sheet
          </h2>
          {dirty ? (
            <button type="button" onClick={saveSheet} disabled={busy} className={primaryBtn}>
              {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
              {busy ? "Saving…" : "Save"}
            </button>
          ) : (
            <span
              className="h-10 px-4 inline-flex items-center gap-2 bg-green-tint-2 text-green-deep font-bold text-[0.85rem] rounded-full border-[1.5px] border-green/30"
              aria-live="polite"
            >
              <Save className="size-4" aria-hidden />
              Saved
            </span>
          )}
        </div>

        {lines.length === 0 ? (
          <p className="px-5 sm:px-6 py-8 text-ink-2 text-[0.95rem] leading-relaxed">
            No players on the sheet yet. Add them from the eligible list below.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.playerId} className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
                <span className="jersey">{l.jerseyNumber}</span>
                <span className="font-bold text-[1rem] flex-1 min-w-[140px] truncate">{l.name}</span>
                <div className="flex items-center gap-3">
                  <label htmlFor={`score-${l.playerId}`} className="sr-only">
                    Score for {l.name}
                  </label>
                  <input
                    id={`score-${l.playerId}`}
                    inputMode="numeric"
                    autoComplete="off"
                    value={scores[l.playerId] ?? ""}
                    onChange={(e) =>
                      setScores((s) => ({ ...s, [l.playerId]: sanitizeScore(e.target.value) }))
                    }
                    className="w-[92px] h-12 px-3 text-center font-data font-semibold text-[1.1rem] bg-chalk border-[1.5px] border-line-2 rounded-xl hover:border-green focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(l.playerId)}
                    disabled={busy}
                    className="h-12 px-4 inline-flex items-center gap-2 rounded-full border-[1.5px] border-line-2 text-ink-2 font-bold text-[0.88rem] hover:bg-red hover:text-chalk hover:border-red transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="size-4.5" aria-hidden />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {lines.length > 0 && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t-2 border-line-2 bg-green-tint-2/50">
            <span className="font-bold text-[0.95rem]">Sheet total</span>
            <span className="score-numeral text-[1.5rem] text-green-deep">{total}</span>
          </div>
        )}
      </section>

      {/* Eligible players */}
      <section aria-labelledby="eligible-list" className="bg-chalk border border-line rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-line">
          <h2 id="eligible-list" className="font-display font-extrabold text-[1.25rem] tracking-tight">
            Present at practice that day
          </h2>
          <p className="text-[0.9rem] text-ink-2 mt-1 leading-relaxed">
            Only these players can join the sheet. Anyone marked absent at practice is refused.
          </p>
        </div>

        {eligibleList.length === 0 ? (
          <div className="px-5 sm:px-6 py-8">
            <div className="flex items-start gap-3 border-[1.5px] border-dashed border-line-2 rounded-2xl p-4 bg-green-tint-2/50">
              <ShieldAlert className="size-6 text-ink-3 shrink-0 mt-0.5" aria-hidden />
              <p className="text-[0.94rem] text-ink-2 leading-relaxed">
                No one else was marked present at practice on this date for this sport. If
                that looks wrong, check the practice register for that day.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {eligibleList.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
                <span className="jersey jersey-outline">{p.jerseyNumber}</span>
                <span className="font-bold text-[1rem] flex-1 min-w-[140px] truncate">{p.name}</span>
                <div className="flex items-center gap-3">
                  <label htmlFor={`add-score-${p.id}`} className="sr-only">
                    Score for {p.name}
                  </label>
                  <input
                    id={`add-score-${p.id}`}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={candidateScores[p.id] ?? ""}
                    onChange={(e) =>
                      setCandidateScores((s) => ({ ...s, [p.id]: sanitizeScore(e.target.value) }))
                    }
                    className="w-[92px] h-12 px-3 text-center font-data font-semibold text-[1.1rem] bg-chalk border-[1.5px] border-line-2 rounded-xl hover:border-green focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25"
                  />
                  <button
                    type="button"
                    onClick={() => addPlayer(p)}
                    disabled={busy}
                    className={secondaryBtn}
                  >
                    <Plus className="size-4.5" aria-hidden />
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
