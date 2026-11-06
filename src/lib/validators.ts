import { z } from "zod";
import { appConfig, roleOrder, type Role } from "@/config/app.config";

const { accounts, sports } = appConfig;

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
});

export const setupSchema = z.object({
  name: z.string().trim().min(2, "Enter the coach's full name.").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(accounts.usernamePattern, `Username: ${accounts.usernameHint}.`),
  password: z.string().min(accounts.minPasswordLength, `Password needs at least ${accounts.minPasswordLength} characters.`),
});

export const playerCreateSchema = z.object({
  name: z.string().trim().min(2, "Enter the player's full name.").max(60),
  age: z.coerce
    .number({ message: "Age must be a number." })
    .int("Age must be a whole number.")
    .min(accounts.minAge, `Age must be at least ${accounts.minAge}.`)
    .max(accounts.maxAge, `Age can be at most ${accounts.maxAge}.`),
  sport: z.enum(sports as unknown as [string, ...string[]], { message: "Pick a sport." }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(accounts.usernamePattern, `Login name: ${accounts.usernameHint}.`),
  password: z
    .string()
    .min(accounts.minPasswordLength, `Password needs at least ${accounts.minPasswordLength} characters.`),
});

export const playerUpdateSchema = z.object({
  name: z.string().trim().min(2, "Enter the player's full name.").max(60),
  age: z.coerce
    .number({ message: "Age must be a number." })
    .int("Age must be a whole number.")
    .min(accounts.minAge, `Age must be at least ${accounts.minAge}.`)
    .max(accounts.maxAge, `Age can be at most ${accounts.maxAge}.`),
  sport: z.enum(sports as unknown as [string, ...string[]], { message: "Pick a sport." }),
});

export const playerStatusSchema = z.object({
  isActive: z.boolean(),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(accounts.minPasswordLength, `Password needs at least ${accounts.minPasswordLength} characters.`),
});

/** Coach self-service profile edit. Empty password = keep the current one. */
export const coachProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(accounts.usernamePattern, `Username: ${accounts.usernameHint}.`),
  password: z.string().refine(
    (v) => v.length === 0 || v.length >= accounts.minPasswordLength,
    `Password needs at least ${accounts.minPasswordLength} characters.`,
  ),
});

export const sessionCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  sport: z.enum(sports as unknown as [string, ...string[]], { message: "Pick a sport." }),
});

export const attendanceSaveSchema = z.object({
  marks: z
    .array(
      z.object({
        playerId: z.string().min(1),
        status: z.enum(["present", "absent"]),
      }),
    )
    .max(200),
});

export const matchCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  sport: z.enum(sports as unknown as [string, ...string[]], { message: "Pick a sport." }),
  opponent: z.string().trim().min(2, "Enter the opponent's name.").max(60),
});

export const matchPlayerSchema = z.object({
  playerId: z.string().min(1),
  score: z.coerce
    .number({ message: "Score must be a number." })
    .int("Score must be a whole number.")
    .min(0, "Score cannot be negative.")
    .max(999, "Score can be at most 999."),
});

/**
 * One Save press = one request. The client keeps the whole sheet in local
 * state (adds, edits, removes happen instantly offline of the network) and
 * sends the full set of changes here in a single round trip.
 */
export const matchSheetSyncSchema = z.object({
  adds: z.array(matchPlayerSchema).max(100).default([]),
  updates: z.array(matchPlayerSchema).max(100).default([]),
  removes: z.array(z.string().min(1)).max(100).default([]),
});

export const matchScoresSchema = z.object({
  scores: z
    .array(
      z.object({
        playerId: z.string().min(1),
        score: z.coerce
          .number({ message: "Score must be a number." })
          .int("Score must be a whole number.")
          .min(0, "Score cannot be negative.")
          .max(999, "Score can be at most 999."),
      }),
    )
    .max(100),
});

export const roleSchema = z.enum(roleOrder as unknown as [Role, ...Role[]]);
