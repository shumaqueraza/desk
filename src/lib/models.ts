import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * Mongoose models for Play Ready. The shapes mirror the academy's paper
 * registers: users sign in, players practice, sessions take attendance,
 * matches keep score. Foreign keys are stored as id strings.
 */

/* ------------------------------------------------------------------ */
/* Interfaces                                                          */
/* ------------------------------------------------------------------ */

export interface IUser {
  name: string;
  username: string;
  passwordHash: string;
  role: "coach" | "player" | "scout";
  playerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayer {
  name: string;
  age: number;
  sport: string;
  jerseyNumber: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  date: string; // YYYY-MM-DD
  sport: string;
  status: "open" | "locked";
  lockedAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  sessionId: string;
  playerId: string;
  status: "present" | "absent";
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMatch {
  date: string; // YYYY-MM-DD
  sport: string;
  opponent: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPerformance {
  matchId: string;
  playerId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Plain views with a string `id` instead of ObjectId `_id`. */
export type UserRecord = IUser & { id: string };
export type Player = IPlayer & { id: string };
export type SessionRecord = ISession & { id: string };
export type AttendanceRecord = IAttendance & { id: string };
export type MatchRecord = IMatch & { id: string };
export type PerformanceRecord = IPerformance & { id: string };

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

/** Every document exposes `id` (string) alongside `_id`. */
function withId(schema: Schema): Schema {
  schema.virtual("id").get(function (this: HydratedDocument<unknown>) {
    return String(this._id);
  });
  schema.set("toJSON", { virtuals: true, versionKey: false });
  schema.set("toObject", { virtuals: true, versionKey: false });
  return schema;
}

const userSchema = withId(
  new Schema<IUser>(
    {
      name: { type: String, required: true, trim: true },
      username: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      role: { type: String, required: true, enum: ["coach", "player", "scout"] },
      // Kept absent (not null) for coach/scout so the sparse unique index
      // never sees more than one null.
      playerId: { type: String, unique: true, sparse: true },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);

const playerSchema = withId(
  new Schema<IPlayer>(
    {
      name: { type: String, required: true, trim: true },
      age: { type: Number, required: true, min: 0 },
      sport: { type: String, required: true },
      jerseyNumber: { type: Number, required: true, unique: true, min: 1, max: 99 },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
playerSchema.index({ sport: 1 });

const sessionSchema = withId(
  new Schema<ISession>(
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      sport: { type: String, required: true },
      status: { type: String, required: true, enum: ["open", "locked"], default: "open" },
      lockedAt: { type: Date, default: null },
      createdById: { type: String, required: true },
    },
    { timestamps: true },
  ),
);
sessionSchema.index({ date: 1, sport: 1 }, { unique: true });
sessionSchema.index({ status: 1, date: 1 });

const attendanceSchema = withId(
  new Schema<IAttendance>(
    {
      sessionId: { type: String, required: true },
      playerId: { type: String, required: true },
      status: { type: String, required: true, enum: ["present", "absent"] },
      markedAt: { type: Date, required: true },
    },
    { timestamps: true },
  ),
);
attendanceSchema.index({ sessionId: 1, playerId: 1 }, { unique: true });
attendanceSchema.index({ playerId: 1, status: 1 });

const matchSchema = withId(
  new Schema<IMatch>(
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      sport: { type: String, required: true },
      opponent: { type: String, required: true, trim: true },
      createdById: { type: String, required: true },
    },
    { timestamps: true },
  ),
);
matchSchema.index({ date: 1 });
matchSchema.index({ sport: 1, date: 1 });

const performanceSchema = withId(
  new Schema<IPerformance>(
    {
      matchId: { type: String, required: true },
      playerId: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 999 },
    },
    { timestamps: true },
  ),
);
performanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true });
performanceSchema.index({ playerId: 1 });

/* ------------------------------------------------------------------ */
/* Models (reuse compiled models across hot reloads)                    */
/* ------------------------------------------------------------------ */

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
export const Player: Model<IPlayer> =
  mongoose.models.Player ?? mongoose.model<IPlayer>("Player", playerSchema);
export const Session: Model<ISession> =
  mongoose.models.Session ?? mongoose.model<ISession>("Session", sessionSchema);
export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ?? mongoose.model<IAttendance>("Attendance", attendanceSchema);
export const Match: Model<IMatch> =
  mongoose.models.Match ?? mongoose.model<IMatch>("Match", matchSchema);
export const Performance: Model<IPerformance> =
  mongoose.models.Performance ?? mongoose.model<IPerformance>("Performance", performanceSchema);

/* ------------------------------------------------------------------ */
/* Doc -> plain mappers                                                */
/* ------------------------------------------------------------------ */

type WithId<T> = HydratedDocument<T> & { id: string };

export function toUser(d: WithId<IUser>): UserRecord {
  return {
    id: d.id,
    name: d.name,
    username: d.username,
    passwordHash: d.passwordHash,
    role: d.role,
    playerId: d.playerId ?? null,
    isActive: d.isActive,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export function toPlayer(d: WithId<IPlayer>): Player {
  return {
    id: d.id,
    name: d.name,
    age: d.age,
    sport: d.sport,
    jerseyNumber: d.jerseyNumber,
    isActive: d.isActive,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export function toSession(d: WithId<ISession>): SessionRecord {
  return {
    id: d.id,
    date: d.date,
    sport: d.sport,
    status: d.status,
    lockedAt: d.lockedAt ?? null,
    createdById: d.createdById,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export function toMatch(d: WithId<IMatch>): MatchRecord {
  return {
    id: d.id,
    date: d.date,
    sport: d.sport,
    opponent: d.opponent,
    createdById: d.createdById,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}
