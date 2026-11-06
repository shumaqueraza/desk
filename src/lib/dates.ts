/** Date helpers. Sessions and matches store dates as YYYY-MM-DD strings. */

export function todayStr(): string {
  // IST date (YYYY-MM-DD) in every environment — server, local dev, any browser TZ.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidDateStr(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime());
}

/** "2026-11-04" -> "Wed, 4 Nov" */
export function formatDateShort(d: string): string {
  const date = new Date(`${d}T00:00:00+05:30`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

/** "2026-11-04" -> "Wednesday, 4 November 2026" */
export function formatDateLong(d: string): string {
  const date = new Date(`${d}T00:00:00+05:30`);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** "2026-11-04" -> "04 NOV 26" (scoreboard style) */
export function formatDateCompact(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${day} ${months[Number(m) - 1]} ${y.slice(2)}`;
}

export function daysAgoStr(days: number): string {
  const now = new Date(Date.now() + 5.5 * 3600 * 1000);
  now.setUTCDate(now.getUTCDate() - days);
  return now.toISOString().slice(0, 10);
}

export function monthLabel(d: string): string {
  const date = new Date(`${d}T00:00:00+05:30`);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
