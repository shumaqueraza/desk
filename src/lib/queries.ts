import "server-only";
import { connectDB } from "@/lib/db";
import {
  Attendance,
  Match,
  Performance,
  Player,
  Session,
  User,
  toPlayer,
  toSession,
  toMatch,
} from "@/lib/models";
import { buildStats, type PlayerStats } from "@/lib/readiness";
import { todayStr } from "@/lib/dates";

export interface PlayerRecord {
  id: string;
  name: string;
  age: number;
  sport: string;
  jerseyNumber: number;
  isActive: boolean;
  username: string | null;
  stats: PlayerStats;
}

export interface SessionSummary {
  id: string;
  date: string;
  sport: string;
  status: "open" | "locked";
  present: number;
  marked: number;
  rosterSize: number;
}

export interface MatchSummary {
  id: string;
  date: string;
  sport: string;
  opponent: string;
  players: number;
  totalScore: number;
}

export interface AttendanceLine {
  date: string;
  sport: string;
  status: "present" | "absent";
  sessionStatus: "open" | "locked";
}

export interface MatchLine {
  id: string;
  date: string;
  sport: string;
  opponent: string;
  score: number;
}

/* ------------------------------------------------------------------ */
/* Stats engine                                                        */
/* ------------------------------------------------------------------ */

/**
 * Compute live stats for a set of players in bulk.
 * Sessions held = sessions for the player's sport dated today or earlier.
 */
export async function computeStats(players: Player[]): Promise<Map<string, PlayerStats>> {
  await connectDB();
  const today = todayStr();
  const ids = players.map((p) => p.id);

  const sessions = await Session.find(
    { date: { $lte: today } },
    "sport",
  );
  const attendance = ids.length
    ? await Attendance.find({ playerId: { $in: ids } }, "playerId sessionId status")
    : [];
  const performances = ids.length
    ? await Performance.find({ playerId: { $in: ids } }, "playerId")
    : [];

  const sportBySession = new Map(sessions.map((s) => [s.id, s.sport]));
  const heldBySport = new Map<string, number>();
  for (const s of sessions) heldBySport.set(s.sport, (heldBySport.get(s.sport) ?? 0) + 1);

  const presentByPlayer = new Map<string, number>();
  for (const a of attendance) {
    if (a.status !== "present") continue;
    const player = players.find((p) => p.id === a.playerId);
    if (!player) continue;
    // Only sessions of the player's (current) sport count.
    if (sportBySession.get(a.sessionId) !== player.sport) continue;
    presentByPlayer.set(a.playerId, (presentByPlayer.get(a.playerId) ?? 0) + 1);
  }

  const matchesByPlayer = new Map<string, number>();
  for (const p of performances) {
    matchesByPlayer.set(p.playerId, (matchesByPlayer.get(p.playerId) ?? 0) + 1);
  }

  const result = new Map<string, PlayerStats>();
  for (const p of players) {
    result.set(p.id, buildStats(
      presentByPlayer.get(p.id) ?? 0,
      heldBySport.get(p.sport) ?? 0,
      matchesByPlayer.get(p.id) ?? 0,
    ));
  }
  return result;
}

async function toRecords(players: Player[]): Promise<PlayerRecord[]> {
  const stats = await computeStats(players);
  const users = players.length
    ? await User.find(
        { playerId: { $in: players.map((p) => p.id) }, isActive: true },
        "username playerId",
      )
    : [];
  const usernameByPlayer = new Map(users.map((u) => [u.playerId as string, u.username]));
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    sport: p.sport,
    jerseyNumber: p.jerseyNumber,
    isActive: p.isActive,
    username: usernameByPlayer.get(p.id) ?? null,
    stats: stats.get(p.id)!,
  }));
}

/* ------------------------------------------------------------------ */
/* Rosters                                                             */
/* ------------------------------------------------------------------ */

/** Full squad with live stats. Coach view. */
export async function getFullRoster(): Promise<PlayerRecord[]> {
  await connectDB();
  const docs = await Player.find().sort({ jerseyNumber: "asc" });
  const records = await toRecords(docs.map(toPlayer));
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

/** Ready players only. Scout view and public readiness board. */
export async function getReadyRoster(): Promise<PlayerRecord[]> {
  const all = await getFullRoster();
  return all.filter((p) => p.isActive && p.stats.isReady);
}

/* ------------------------------------------------------------------ */
/* Player detail                                                       */
/* ------------------------------------------------------------------ */

export interface PlayerDetail extends PlayerRecord {
  attendance: AttendanceLine[];
  matches: MatchLine[];
}

/** Full sheet for one player. Caller enforces access. */
export async function getPlayerDetail(playerId: string): Promise<PlayerDetail | null> {
  await connectDB();
  const doc = await Player.findById(playerId);
  if (!doc) return null;
  const player = toPlayer(doc);
  const [record] = await toRecords([player]);

  const marks = await Attendance.find({ playerId: player.id }, "sessionId status");
  const sessionIds = [...new Set(marks.map((m) => m.sessionId))];
  const sessionDocs = sessionIds.length
    ? await Session.find({ _id: { $in: sessionIds } }, "date sport status")
    : [];
  const sessionById = new Map(sessionDocs.map((s) => [s.id, s]));

  const attendance: AttendanceLine[] = marks
    .filter((m) => sessionById.has(m.sessionId))
    .map((m) => {
      const s = sessionById.get(m.sessionId)!;
      return {
        date: s.date,
        sport: s.sport,
        status: m.status as "present" | "absent",
        sessionStatus: s.status as "open" | "locked",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const lines = await Performance.find({ playerId: player.id }, "matchId score");
  const matchIds = [...new Set(lines.map((l) => l.matchId))];
  const matchDocs = matchIds.length
    ? await Match.find({ _id: { $in: matchIds } }, "date sport opponent")
    : [];
  const matchById = new Map(matchDocs.map((m) => [m.id, m]));

  const matchLines: MatchLine[] = lines
    .filter((l) => matchById.has(l.matchId))
    .map((l) => {
      const m = matchById.get(l.matchId)!;
      return {
        id: m.id,
        date: m.date,
        sport: m.sport,
        opponent: m.opponent,
        score: l.score,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return { ...record, attendance, matches: matchLines };
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

/** Recent sessions with present counts. */
export async function getSessions(limit = 100): Promise<SessionSummary[]> {
  await connectDB();
  const sessions = await Session.find()
    .sort({ date: "desc", createdAt: "desc" })
    .limit(limit);
  if (sessions.length === 0) return [];

  const ids = sessions.map((s) => s.id);
  const marks = await Attendance.find({ sessionId: { $in: ids } }, "sessionId status");
  const sportRoster = await Player.find({ isActive: true }, "sport");
  const activeBySport = new Map<string, number>();
  for (const p of sportRoster) activeBySport.set(p.sport, (activeBySport.get(p.sport) ?? 0) + 1);

  const marksBySession = new Map<string, { status: string }[]>();
  for (const m of marks) {
    const list = marksBySession.get(m.sessionId) ?? [];
    list.push({ status: m.status });
    marksBySession.set(m.sessionId, list);
  }

  return sessions.map((s) => {
    const mine = marksBySession.get(s.id) ?? [];
    return {
      id: s.id,
      date: s.date,
      sport: s.sport,
      status: s.status as "open" | "locked",
      present: mine.filter((m) => m.status === "present").length,
      marked: mine.length,
      rosterSize: activeBySport.get(s.sport) ?? 0,
    };
  });
}

export interface SessionRow {
  playerId: string;
  name: string;
  jerseyNumber: number;
  age: number;
  isActive: boolean;
  mark: "present" | "absent" | null;
}

export interface SessionDetailData {
  session: SessionSummary & { id: string };
  rows: SessionRow[];
}

/** The register sheet for one practice session. */
export async function getSessionDetail(sessionId: string): Promise<SessionDetailData | null> {
  await connectDB();
  const sessionDoc = await Session.findById(sessionId);
  if (!sessionDoc) return null;
  const session = toSession(sessionDoc);

  const marks = await Attendance.find({ sessionId: session.id }, "playerId status");
  const markByPlayer = new Map(marks.map((m) => [m.playerId, m.status as "present" | "absent"]));

  let rosterDocs;
  if (session.status === "open") {
    rosterDocs = await Player.find({ sport: session.sport, isActive: true }).sort({ name: "asc" });
  } else {
    const markedIds = marks.map((m) => m.playerId);
    rosterDocs = await Player.find({ _id: { $in: markedIds } }).sort({ name: "asc" });
  }

  const rows: SessionRow[] = rosterDocs.map((p) => ({
    playerId: p.id,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    age: p.age,
    isActive: p.isActive,
    mark: markByPlayer.get(p.id) ?? null,
  }));

  return {
    session: {
      id: session.id,
      date: session.date,
      sport: session.sport,
      status: session.status as "open" | "locked",
      present: marks.filter((m) => m.status === "present").length,
      marked: marks.length,
      rosterSize: rows.length,
    },
    rows,
  };
}

/* ------------------------------------------------------------------ */
/* Matches                                                             */
/* ------------------------------------------------------------------ */

export async function getMatches(limit = 100): Promise<MatchSummary[]> {
  await connectDB();
  const matches = await Match.find()
    .sort({ date: "desc", createdAt: "desc" })
    .limit(limit);
  if (matches.length === 0) return [];
  const lines = await Performance.find(
    { matchId: { $in: matches.map((m) => m.id) } },
    "matchId score",
  );
  return matches.map((m) => {
    const mine = lines.filter((l) => l.matchId === m.id);
    return {
      id: m.id,
      date: m.date,
      sport: m.sport,
      opponent: m.opponent,
      players: mine.length,
      totalScore: mine.reduce((sum, l) => sum + l.score, 0),
    };
  });
}

/** Matches one player took part in, with their score. */
export async function getPlayerMatches(playerId: string): Promise<MatchLine[]> {
  const detail = await getPlayerDetail(playerId);
  return detail?.matches ?? [];
}

export interface MatchLineFull {
  playerId: string;
  name: string;
  jerseyNumber: number;
  score: number;
}

export interface MatchDetailData {
  match: MatchSummary;
  lines: MatchLineFull[];
  eligible: { id: string; name: string; jerseyNumber: number }[];
}

/** The score sheet for one match, plus who can still be added. */
export async function getMatchDetail(matchId: string): Promise<MatchDetailData | null> {
  await connectDB();
  const matchDoc = await Match.findById(matchId);
  if (!matchDoc) return null;
  const match = toMatch(matchDoc);

  const lines = await Performance.find({ matchId: match.id }, "playerId score");
  const linePlayers = await Player.find(
    { _id: { $in: [...new Set(lines.map((l) => l.playerId))] } },
    "name jerseyNumber",
  );
  const playerById = new Map(linePlayers.map((p) => [p.id, p]));

  const sheetLines: MatchLineFull[] = lines
    .filter((l) => playerById.has(l.playerId))
    .map((l) => {
      const p = playerById.get(l.playerId)!;
      return {
        playerId: p.id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        score: l.score,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  // Eligible: marked Present in a session with the same date and sport,
  // and not already on the sheet.
  const sameDaySessions = await Session.find(
    { date: match.date, sport: match.sport },
    "_id",
  );
  const eligible: { id: string; name: string; jerseyNumber: number }[] = [];
  if (sameDaySessions.length > 0) {
    const presentMarks = await Attendance.find(
      {
        sessionId: { $in: sameDaySessions.map((s) => s.id) },
        status: "present",
      },
      "playerId",
    );
    const onSheet = new Set(sheetLines.map((l) => l.playerId));
    const candidateIds = [
      ...new Set(presentMarks.map((m) => m.playerId).filter((id) => !onSheet.has(id))),
    ];
    if (candidateIds.length > 0) {
      const candidates = await Player.find({ _id: { $in: candidateIds } }).sort({ name: "asc" });
      for (const p of candidates) {
        eligible.push({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber });
      }
    }
  }

  return {
    match: {
      id: match.id,
      date: match.date,
      sport: match.sport,
      opponent: match.opponent,
      players: sheetLines.length,
      totalScore: sheetLines.reduce((s, l) => s + l.score, 0),
    },
    lines: sheetLines,
    eligible,
  };
}

/* ------------------------------------------------------------------ */
/* Dashboards                                                          */
/* ------------------------------------------------------------------ */

export interface CoachDashboardData {
  totals: {
    players: number;
    activePlayers: number;
    sessionsHeld: number;
    openSessions: number;
    matches: number;
    ready: number;
    avgAttendance: number;
  };
  recentSessions: SessionSummary[];
  readyPlayers: PlayerRecord[];
  needsAttention: PlayerRecord[];
}

export async function getCoachDashboard(): Promise<CoachDashboardData> {
  await connectDB();
  const roster = await getFullRoster();
  const active = roster.filter((p) => p.isActive);
  const ready = active.filter((p) => p.stats.isReady);

  const today = todayStr();
  const recentSessionDocs = await Session.find().sort({ date: "desc" }).limit(200);
  const sessionsHeld = recentSessionDocs.filter((s) => s.date <= today).length;

  const recent = await getSessions(8);
  const matches = await Match.countDocuments();

  const withAttendance = active.filter((p) => p.stats.sessionsHeld > 0);
  const avgAttendance = withAttendance.length
    ? Math.round(
        withAttendance.reduce((sum, p) => sum + p.stats.attendancePercent, 0) / withAttendance.length,
      )
    : 0;

  const needsAttention = active
    .filter((p) => !p.stats.isReady && p.stats.sessionsHeld > 0)
    .sort((a, b) => a.stats.attendancePercent - b.stats.attendancePercent)
    .slice(0, 5);

  return {
    totals: {
      players: roster.length,
      activePlayers: active.length,
      sessionsHeld,
      openSessions: recentSessionDocs.filter((s) => s.status === "open" && s.date <= today).length,
      matches,
      ready: ready.length,
      avgAttendance,
    },
    recentSessions: recent,
    readyPlayers: ready.sort((a, b) => b.stats.attendancePercent - a.stats.attendancePercent),
    needsAttention,
  };
}

export interface ScoutBoardData {
  readyPlayers: PlayerRecord[];
  totals: { ready: number; tracked: number };
}

export async function getScoutBoard(): Promise<ScoutBoardData> {
  const ready = await getReadyRoster();
  const roster = await getFullRoster();
  return {
    readyPlayers: ready,
    totals: { ready: ready.length, tracked: roster.filter((p) => p.isActive).length },
  };
}

/* ------------------------------------------------------------------ */
/* Auth helpers used by API routes                                     */
/* ------------------------------------------------------------------ */

/** Next free jersey number 1..99. */
export async function nextJerseyNumber(): Promise<number> {
  await connectDB();
  const players = await Player.find({}, "jerseyNumber");
  const taken = new Set(players.map((p) => p.jerseyNumber));
  for (let n = 1; n <= 99; n++) {
    if (!taken.has(n)) return n;
  }
  throw new Error("All jersey numbers 1 to 99 are taken.");
}

/** Is a player allowed on a match sheet: Present at a session same date + sport. */
export async function isEligibleForMatch(
  match: { date: string; sport: string },
  playerId: string,
): Promise<{ eligible: boolean; reason?: string }> {
  await connectDB();
  const sessions = await Session.find({ date: match.date, sport: match.sport }, "_id");
  if (sessions.length === 0) {
    return {
      eligible: false,
      reason: `No ${match.sport.toLowerCase()} practice was held on that date, so no one can join the sheet.`,
    };
  }
  const mark = await Attendance.findOne({
    sessionId: { $in: sessions.map((s) => s.id) },
    playerId,
    status: "present",
  });
  if (!mark) {
    return {
      eligible: false,
      reason: "That player was marked absent at practice that day, so they cannot join the sheet.",
    };
  }
  return { eligible: true };
}
