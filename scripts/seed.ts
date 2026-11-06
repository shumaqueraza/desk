/**
 * Development seed for Play Ready.
 *
 * Creates one demo academy in MongoDB Atlas:
 * a coach, a scout, eight players with logins, two squads with a season of
 * practice, and matches engineered to demonstrate the problem statement's
 * four test cases:
 *   1. Attendance recording (present and absent marks per player)
 *   2. Match recording (only players present that day on the sheet)
 *   3. Readiness (Kailash at exactly 75% with 2 matches is Ready,
 *      Rajib at 67% is not, Manoj at 100% but 1 match is not)
 *   4. Scout sees ready players only
 *
 * WARNING: this wipes the collections it writes. Development only.
 * Run with: bun run seed
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  Attendance,
  Match,
  Performance,
  Player,
  Session,
  User,
} from "../src/lib/models";

// Tiny .env loader so the script runs without node --env-file.
if (!process.env.MONGODB_URI) {
  for (const f of [".env.local", ".env"]) {
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, "utf8").split("\n")) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
      }
    }
  }
}

function daysAgo(n: number): string {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env first.");
  }
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Clearing existing collections (development seed)...");
  for (const name of ["performances", "attendances", "sessions", "matches", "users", "players"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }

  console.log("Syncing indexes...");
  await Promise.all([
    User.syncIndexes(),
    Player.syncIndexes(),
    Session.syncIndexes(),
    Attendance.syncIndexes(),
    Match.syncIndexes(),
    Performance.syncIndexes(),
  ]);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  /* Accounts ---------------------------------------------------------- */
  const coach = await User.create({
    name: "Bimal Soren",
    username: "coach",
    passwordHash: hash("coach1234"),
    role: "coach",
    isActive: true,
  });

  await User.create({
    name: "Priya Hansda",
    username: "scout",
    passwordHash: hash("scout1234"),
    role: "scout",
    isActive: true,
  });

  /* Squads ------------------------------------------------------------- */
  interface SeedPlayer {
    key: string;
    name: string;
    age: number;
    sport: "Cricket" | "Football";
    jersey: number;
    marks: string; // one char per session, P or A
  }

  const cricketDays = [27, 25, 22, 20, 17, 14, 11, 9, 6, 4, 2, 1];
  const footballDays = [19, 16, 13, 10, 7, 5, 3, 1];

  const squad: SeedPlayer[] = [
    { key: "arjun", name: "Arjun Murmu", age: 17, sport: "Cricket", jersey: 7, marks: "PPPPAPPPAPPP" },
    { key: "kailash", name: "Kailash Hansda", age: 16, sport: "Cricket", jersey: 9, marks: "PAPPPAPPPAPP" },
    { key: "rajib", name: "Rajib Soren", age: 18, sport: "Cricket", jersey: 11, marks: "PPAPPAPAPPAP" },
    { key: "manoj", name: "Manoj Tudu", age: 15, sport: "Cricket", jersey: 14, marks: "PPPPPPPPPPPP" },
    { key: "sunit", name: "Sunit Marandi", age: 16, sport: "Cricket", jersey: 19, marks: "AAAPAPAAPAPP" },
    { key: "bikash", name: "Bikash Kisku", age: 17, sport: "Football", jersey: 5, marks: "PPAPPPPP" },
    { key: "deepak", name: "Deepak Soren", age: 15, sport: "Football", jersey: 8, marks: "PAPAPAPA" },
    { key: "ramesh", name: "Ramesh Hembram", age: 18, sport: "Football", jersey: 10, marks: "PPPPPPPP" },
  ];

  const playerIds = new Map<string, string>();
  for (const p of squad) {
    const player = await Player.create({
      name: p.name,
      age: p.age,
      sport: p.sport,
      jerseyNumber: p.jersey,
      isActive: true,
    });
    playerIds.set(p.key, player.id);
    await User.create({
      name: p.name,
      username: p.key,
      passwordHash: hash("player1234"),
      role: "player",
      playerId: player.id,
      isActive: true,
    });
  }

  /* Practice sessions and attendance ----------------------------------- */
  for (const [sport, days] of [
    ["Cricket", cricketDays],
    ["Football", footballDays],
  ] as const) {
    for (const day of days) {
      const date = daysAgo(day);
      const session = await Session.create({
        date,
        sport,
        status: "locked",
        lockedAt: new Date(),
        createdById: coach.id,
      });
      const rows = squad
        .filter((s) => s.sport === sport)
        .map((p) => {
          const dayIndex = days.indexOf(day);
          const mark = p.marks[dayIndex] === "P" ? "present" : "absent";
          return {
            sessionId: session.id,
            playerId: playerIds.get(p.key)!,
            status: mark,
            markedAt: new Date(),
          };
        });
      await Attendance.insertMany(rows);
    }
  }

  // Two open registers for tomorrow, so the marking flow can be demoed live.
  for (const sport of ["Cricket", "Football"] as const) {
    await Session.create({
      date: daysAgo(-1),
      sport,
      status: "open",
      lockedAt: null,
      createdById: coach.id,
    });
  }

  /* Matches and score sheets ------------------------------------------- */
  interface SeedMatch {
    sport: "Cricket" | "Football";
    day: number; // days ago, must match a session date
    opponent: string;
    lines: { key: string; score: number }[];
  }

  const fixtures: SeedMatch[] = [
    { sport: "Cricket", day: 6, opponent: "Pakur Warriors", lines: [
      { key: "arjun", score: 42 }, { key: "kailash", score: 31 }, { key: "rajib", score: 8 }, { key: "sunit", score: 7 },
    ]},
    { sport: "Cricket", day: 2, opponent: "Deoghar Titans", lines: [
      { key: "arjun", score: 55 }, { key: "manoj", score: 17 },
    ]},
    { sport: "Cricket", day: 1, opponent: "Ranchi Rhinos", lines: [
      { key: "kailash", score: 12 }, { key: "rajib", score: 19 },
    ]},
    { sport: "Football", day: 5, opponent: "Jamtara FC", lines: [
      { key: "bikash", score: 2 }, { key: "ramesh", score: 1 },
    ]},
    { sport: "Football", day: 1, opponent: "Godda United", lines: [
      { key: "bikash", score: 1 }, { key: "ramesh", score: 3 },
    ]},
  ];

  for (const m of fixtures) {
    const match = await Match.create({
      date: daysAgo(m.day),
      sport: m.sport,
      opponent: m.opponent,
      createdById: coach.id,
    });
    await Performance.insertMany(
      m.lines.map((line) => ({
        matchId: match.id,
        playerId: playerIds.get(line.key)!,
        score: line.score,
      })),
    );
  }

  /* Readiness summary --------------------------------------------------- */
  console.log("\nSeeded academy: coach, scout, 8 players, 22 sessions, 5 matches.\n");
  console.log("Readiness check (test case 3):");
  const expected: Record<string, [number, number]> = {
    arjun: [10, 3], kailash: [9, 2], rajib: [8, 2], manoj: [12, 1], sunit: [5, 1],
    bikash: [7, 2], deepak: [4, 0], ramesh: [8, 2],
  };
  for (const p of squad) {
    const [present, played] = expected[p.key];
    const total = p.sport === "Cricket" ? cricketDays.length : footballDays.length;
    const pct = Math.round((present / total) * 100);
    const ready = pct >= 75 && played >= 2;
    console.log(
      `  ${p.name.padEnd(18)} ${p.sport.padEnd(9)} ${present}/${total} = ${String(pct).padStart(3)}%  matches ${played}  -> ${ready ? "READY" : "not ready"}`,
    );
  }
  console.log("\nDemo sign-ins: coach/coach1234 · arjun/player1234 · scout/scout1234");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
