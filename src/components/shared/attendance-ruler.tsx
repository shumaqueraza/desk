/**
 * The attendance bar: one rounded track, filled by the share of sessions
 * attended. Data-true, instant to read at any size.
 * tone="light" for chalk cards, tone="dark" for the pitch surface.
 */
export function AttendanceRuler({
  present,
  total,
  size = "md",
  tone = "light",
  showCount = true,
}: {
  present: number;
  total: number;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  showCount?: boolean;
}) {
  const pct = total === 0 ? 0 : Math.round((Math.min(present, total) / total) * 100);
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-2.5" : "h-2";
  const track = tone === "dark" ? "bg-chalk/25" : "bg-line/70";
  const fill = tone === "dark" ? "bg-volt" : "bg-green";

  if (total === 0) {
    return (
      <p className={`text-[0.9rem] ${tone === "dark" ? "text-chalk/70" : "text-ink-3"}`}>
        No practice held yet.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2.5" aria-label={`${present} of ${total} sessions present, ${pct}%`}>
      <div className={`${h} ${track} rounded-full min-w-12 flex-1 overflow-hidden`} aria-hidden>
        <div className={`${h} ${fill} rounded-full transition-[width]`} style={{ width: `${pct}%` }} />
      </div>
      {showCount && (
        <span
          className={`font-data text-[0.85rem] font-semibold tabular-nums shrink-0 ${
            tone === "dark" ? "text-chalk/85" : "text-ink-2"
          }`}
        >
          {present}/{total}
        </span>
      )}
    </div>
  );
}

/** Percentage readout used next to rulers and in stat bands. */
export function PercentReadout({
  percent,
  big = false,
  onDark = false,
}: {
  percent: number;
  big?: boolean;
  onDark?: boolean;
}) {
  const tone = onDark
    ? "text-chalk"
    : percent >= 75
      ? "text-green"
      : percent >= 50
        ? "text-ink"
        : "text-red";
  return (
    <span className={`score-numeral ${tone} ${big ? "text-[3.2rem] leading-none" : "text-[1.05rem]"}`}>
      {percent}%
    </span>
  );
}
