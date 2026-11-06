# Play Ready

The register for one sports academy in Dumka, Jharkhand. The coach keeps the players,
marks who came to practice, records match scores, and sees who is ready for trials.
Built for the Vibe Coding Challenge 2.0.

- Live app: see the submission line for the deployed URL
- Stack: Next.js (App Router) + TypeScript + MongoDB (Atlas, Mongoose) + Tailwind CSS
- Design system: see [DESIGN.md](./DESIGN.md)

## The rules this desk enforces

- Every player has a name, age, sport and a jersey number, added by the coach.
- A practice session is a date and a sport. The coach marks each player Present or
  Absent, then closes the session. Closed sessions are locked forever.
- A match has a date, sport and opponent. Only players who were marked Present at
  practice that same day and sport can be put on the score sheet. Anyone absent
  that day is refused.
- A player is **Ready** for trials at 75% attendance and at least 2 matches played.
  Both together. The desk recalculates after every mark and every score.
- The scout sees only ready players. A player sees only their own record.

All thresholds live in `src/config/app.config.ts` (`readiness` block). Change them
there and every page follows.

## Demo sign-ins

Seeded by `bun run seed` (development only):

| Role | Username | Password | What they can do |
| --- | --- | --- | --- |
| Coach | `coach` | `coach1234` | Everything: players, practice, matches, readiness |
| Player | `arjun` | `player1234` | Own attendance, scores and readiness (Arjun is ready) |
| Scout | `scout` | `scout1234` | Ready players only |

The seed data is engineered to demonstrate the four test cases, including Kailash
Hansda at exactly 75% attendance with 2 matches (ready) and Manoj Tudu at 100%
attendance with 1 match (not ready).

## Run it locally

Prerequisites: Node.js 20+, and a free MongoDB Atlas cluster.

```bash
# 1. Install dependencies
bun install        # or: npm install

# 2. Environment — copy .env.example to .env and fill in:
#    MONGODB_URI    = mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
#    SESSION_SECRET = any long random string (openssl rand -hex 32)

# 3. Seed the demo academy (wipes the six collections, development only)
bun run seed

# 4. Start the dev server
bun run dev        # or: npm run dev
#    open http://localhost:3000
```

With an empty database the login screen offers to create the first coach account,
so you can also start from a blank register without seeding.

## Deploy to Vercel

1. Push this repo to GitHub (public repo name:
   `vibe-coding-challenge-2-0-<team-name>`).
2. In MongoDB Atlas → Network Access, add a rule allowing access from anywhere
   (`0.0.0.0/0`) — Vercel functions egress from a dynamic IP pool.
3. On Vercel: import the GitHub repo (framework preset: Next.js), then add the
   environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `SESSION_SECRET` — long random string
4. Deploy. `npm run build` is a plain `next build` — nothing else is needed.

Note: cookies are `Secure` in production, which requires HTTPS (Vercel provides it).

## Project structure

```
src/
  config/app.config.ts     one file for every business rule and setting
  lib/
    db.ts                  Mongoose connection singleton
    models.ts              schemas: User, Player, Session, Attendance, Match, Performance
    session.ts             signed HTTP-only cookie sessions (HMAC-SHA256)
    password.ts            bcrypt hashing
    auth.ts                current user, role guards, login throttling
    validators.ts          Zod schemas for every input
    readiness.ts           the ready rule, pure functions
    queries.ts             data access used by server components
    api.ts                 consistent API responses and error handling
  app/
    page.tsx               landing (the front desk)
    login/                 sign in + first-run coach setup
    (app)/                 authenticated pages per role
      dashboard/ players/ practice/ matches/ profile/
    api/                   route handlers for every mutation, role-checked
  components/              UI, grouped by feature
scripts/
  seed.ts                  demo data (development only)
  ps-tests.mjs             the 4 problem-statement test cases, end-to-end over HTTP
  e2e-api.sh               33 API tests incl. the 4 problem-statement cases
  browser-qa.mjs           Playwright screenshot + golden-path suite
DESIGN.md                  the design system
```

## Database

MongoDB (Atlas) via Mongoose. Collections in `src/lib/models.ts`:

- `users` - accounts. Unique lowercase username. Roles: coach, player, scout.
  A player account links to its player profile. Inactive accounts cannot sign in.
- `players` - name, age, sport, unique jersey number, optional linked account.
- `sessions` - practice: date + sport, unique together, `open` or `locked`.
- `attendances` - one mark per session and player (unique pair): present or absent.
- `matches` - date, sport, opponent.
- `performances` - one score line per match and player (unique pair).

Readiness is always computed live from these records; there is no cached state to
go stale.

## Testing

- `node scripts/ps-tests.mjs` - the four problem-statement test cases exactly as
  written, end-to-end over HTTP (attendance, match refusal, readiness boundaries,
  role visibility). Re-seed afterwards to restore the demo academy.
- `bash scripts/e2e-api.sh` - 33 checks against a running dev server: auth,
  rate limiting, RBAC, session locking, match eligibility refusals. Ends by
  re-seeding clean demo data.
- `node scripts/browser-qa.mjs` - Playwright pass over every page at 1440, 768
  and 390 px: real clicks through marking, saving, closing, match sheets, and
  screenshot capture. Verifies zero console errors.
- `npx tsc --noEmit` and `bun run lint` must both pass clean.

## Security notes

- Passwords are bcrypt-hashed (cost 10). Sessions are signed HTTP-only cookies
  (SameSite=Lax, Secure in production) with a 7-day expiry.
- Every API route re-checks the session and role on the server. Player data is
  filtered per role: players see only their own record, scouts only ready players.
- Login is throttled per username and IP (5 failures, 15-minute lockout).
- All input is validated with Zod before it touches the database.
