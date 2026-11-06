import { Check, Lock, X } from "lucide-react";

export type StampTone = "green" | "red" | "ink";

/** Rubber-stamp state marker. READY / LOCKED / OPEN. Never decorative. */
export function Stamp({ tone, children }: { tone: StampTone; children: React.ReactNode }) {
  return <span className={`stamp stamp-${tone}`}>{children}</span>;
}

export function ReadyStamp({ ready }: { ready: boolean }) {
  return ready ? (
    <Stamp tone="green">
      <Check className="size-3.5" strokeWidth={3} aria-hidden />
      Ready
    </Stamp>
  ) : (
    <span className="stamp stamp-ink stamp-flat">Not ready</span>
  );
}

export function SessionStatusStamp({ status }: { status: "open" | "locked" }) {
  return status === "open" ? (
    <Stamp tone="ink">Open</Stamp>
  ) : (
    <Stamp tone="red">
      <Lock className="size-3.5" strokeWidth={2.5} aria-hidden />
      Locked
    </Stamp>
  );
}

export function MarkBadge({ status }: { status: "present" | "absent" }) {
  return status === "present" ? (
    <span className="inline-flex items-center gap-1.5 font-bold text-green text-[0.92rem]">
      <Check className="size-4" strokeWidth={3} aria-hidden />
      Present
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-bold text-red text-[0.92rem]">
      <X className="size-4" strokeWidth={3} aria-hidden />
      Absent
    </span>
  );
}
