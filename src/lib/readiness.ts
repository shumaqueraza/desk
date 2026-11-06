import { appConfig } from "@/config/app.config";

/**
 * The readiness engine. Attendance percentage is presents divided by sessions
 * held for the player's sport, and readiness needs both the attendance
 * threshold and the minimum matches. Stats are always derived from live
 * records, so they update automatically whenever attendance or scores change.
 */

export interface PlayerStats {
  sessionsHeld: number;
  present: number;
  attendancePercent: number;
  matchesPlayed: number;
  isReady: boolean;
  attendanceMet: boolean;
  matchesMet: boolean;
}

export function attendancePercent(present: number, sessionsHeld: number): number {
  if (sessionsHeld <= 0) return 0;
  return Math.round((present / sessionsHeld) * 100);
}

export function isReady(percent: number, matchesPlayed: number): boolean {
  return (
    percent >= appConfig.readiness.minAttendancePercent &&
    matchesPlayed >= appConfig.readiness.minMatchesPlayed
  );
}

export function buildStats(present: number, sessionsHeld: number, matchesPlayed: number): PlayerStats {
  const percent = attendancePercent(present, sessionsHeld);
  const attendanceMet = percent >= appConfig.readiness.minAttendancePercent;
  const matchesMet = matchesPlayed >= appConfig.readiness.minMatchesPlayed;
  return {
    sessionsHeld,
    present,
    attendancePercent: percent,
    matchesPlayed,
    isReady: attendanceMet && matchesMet,
    attendanceMet,
    matchesMet,
  };
}

/** A plain-language explanation of what a player still needs. */
export function readinessGap(stats: PlayerStats): string[] {
  const gaps: string[] = [];
  if (!stats.attendanceMet) {
    gaps.push(
      `Attendance is ${stats.attendancePercent}%. It needs to be ${appConfig.readiness.minAttendancePercent}% or more.`,
    );
  }
  if (!stats.matchesMet) {
    const need = appConfig.readiness.minMatchesPlayed - stats.matchesPlayed;
    gaps.push(
      need === 1
        ? "One more recorded match is needed."
        : `${need} more recorded matches are needed.`,
    );
  }
  return gaps;
}
