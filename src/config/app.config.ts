/**
 * Central configuration for Play Ready.
 * Every business rule and app setting that a maintainer might want to change
 * lives here. Secrets stay in environment variables (.env.local / .env).
 */

export const appConfig = {
  /** Branding */
  appName: "Play Ready",
  appLocation: "Dumka, Jharkhand",
  appTagline:
    "The register for one sports academy: who came to practice, who scored, and who is ready for trials.",

  /** Sports offered at the academy. Rosters and filters follow this list. */
  sports: ["Cricket", "Football", "Kabaddi", "Athletics", "Hockey"],

  /** Eligibility rules for trial readiness. */
  readiness: {
    /** Minimum attendance percentage required (inclusive). */
    minAttendancePercent: 75,
    /** Minimum matches played required (inclusive). */
    minMatchesPlayed: 2,
  },

  /** Attendance and accounts */
  attendance: {
    /** Players with no mark when a session closes are recorded as this. */
    defaultMarkOnClose: "absent" as const,
  },

  /** Accounts */
  accounts: {
    minPasswordLength: 8,
    minAge: 5,
    maxAge: 60,
    /** Usernames are lowercased and must match this pattern. */
    usernamePattern: /^[a-z0-9_]{3,24}$/,
    usernameHint: "3 to 24 characters: lowercase letters, numbers, underscore",
  },

  /** Sessions */
  session: {
    /** How many sessions show in the "recent practice" feed. */
    recentCount: 6,
    /** Allow creating sessions dated in the future (planned practice). */
    allowFutureDates: true,
  },

  /** Signed cookie sessions */
  auth: {
    cookieName: "academydesk_session",
    /** Seconds until sign-in expires: 7 days. */
    sessionDurationSec: 60 * 60 * 24 * 7,
    /** Failed login attempts before a temporary lockout. */
    maxLoginAttempts: 5,
    /** Lockout window in seconds. */
    loginLockoutSec: 15 * 60,
    /** bcrypt cost factor. */
    bcryptRounds: 10,
  },

  /** Pagination defaults for list endpoints. */
  pagination: {
    defaultPageSize: 50,
    maxPageSize: 200,
  },

  /** Role permissions. Server-side checks read from here. */
  roles: {
    coach: {
      label: "Coach",
      description: "Runs the academy: players, practice, matches, readiness.",
      canManagePlayers: true,
      canManageSessions: true,
      canManageMatches: true,
      canViewAllPlayers: true,
    },
    player: {
      label: "Player",
      description: "Sees their own attendance, matches and readiness.",
      canManagePlayers: false,
      canManageSessions: false,
      canManageMatches: false,
      canViewAllPlayers: false,
    },
    scout: {
      label: "Scout",
      description: "Sees players who meet the ready criteria only.",
      canManagePlayers: false,
      canManageSessions: false,
      canManageMatches: false,
      canViewAllPlayers: false,
    },
  } as const,

  /** Navigation per role. Order is the display order. */
  navigation: {
    coach: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/players", label: "Players" },
      { href: "/practice", label: "Practice" },
      { href: "/matches", label: "Matches" },
      { href: "/profile", label: "Profile" },
    ],
    player: [
      { href: "/dashboard", label: "My record" },
      { href: "/matches", label: "My matches" },
      { href: "/profile", label: "Profile" },
    ],
    scout: [
      { href: "/dashboard", label: "Ready players" },
      { href: "/profile", label: "Profile" },
    ],
  } as Record<Role, { href: string; label: string }[]>,

  /** Feature toggles */
  features: {
    /** Show demo sign-in hints on the login page (dev/demo builds). */
    showDemoAccounts: true,
  },

  /**
   * Demo accounts created by `bun run seed` (development only).
   * Shown on the login page only while features.showDemoAccounts is on.
   */
  demoAccounts: [
    { role: "Coach", username: "coach", password: "coach1234", note: "Runs the academy" },
    { role: "Player", username: "arjun", password: "player1234", note: "Ready for trials" },
    { role: "Scout", username: "scout", password: "scout1234", note: "Sees ready players only" },
  ],

  /** Motion preferences. All animation respects prefers-reduced-motion regardless. */
  motion: {
    enabled: true,
    durationFast: 0.1,
    durationNormal: 0.15,
  },
} as const;

export type Role = "coach" | "player" | "scout";

export const roleOrder: Role[] = ["coach", "player", "scout"];
