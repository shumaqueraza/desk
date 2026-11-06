# Play Ready — deploy guide (zip → live URL in ~15 minutes)

Everything here uses only **free** tiers: MongoDB Atlas M0, Vercel Hobby, GitHub.
The app is a plain Next.js (App Router) project with a remote database, so Vercel
needs **zero special config** — only two environment variables.

---

## 0. What you need

| Thing | Where | Cost |
| --- | --- | --- |
| Node.js 20+ | nodejs.org | free |
| A GitHub account | github.com | free |
| A Vercel account (sign in **with GitHub**) | vercel.com | free Hobby plan |
| A MongoDB Atlas account | mongodb.com/atlas | free M0 cluster |

---

## 1. Run it on your laptop first

```bash
# unzip the project, open a terminal inside the folder, then:
npm install

# create your local env file: copy .env.example to .env and fill in:
#   MONGODB_URI    -> your own Atlas string (step 2 below)
#   SESSION_SECRET -> openssl rand -hex 32   (any long random string)

npm run seed     # optional: loads the demo academy + demo logins (WIPES collections)
npm run dev      # http://localhost:3000
```

Demo logins after seeding: `coach / coach1234`, `arjun / player1234`, `scout / scout1234`.
On a brand-new empty database, the login screen instead offers to create the first
coach account — that is all you need in production.

You never need `npm start` locally: use `npm run dev` for testing and let Vercel
run the production build.

---

## 2. Create your free MongoDB Atlas database

1. mongodb.com/atlas → sign up → **Build a Database** → **M0 FREE** (any region close to you, e.g. Mumbai).
2. **Database Access** → Add New Database User → username + password (save them).
3. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**.
   This is required — Vercel servers do not have fixed IPs.
4. **Database → Connect → Drivers** → copy the `mongodb+srv://...` string,
   replace `<password>` with your real password, and put your database name
   before the `?` (e.g. `...mongodb.net/academydesk?retryWrites=true...`).
5. Paste that finished string into `.env` (local) and keep it for step 4 (Vercel).

---

## 3. Push to GitHub (repo name is a RULE)

The problem statement requires a **public** repo named exactly:

```
vibe-coding-challenge-2-0-<your-team-name>
```

Example: `vibe-coding-challenge-2-0-code-cats`.

```bash
git init
git add .
git commit -m "Play Ready — first build day"
git branch -M main
git remote add origin https://github.com/<you>/vibe-coding-challenge-2-0-<team-name>.git
git push -u origin main
```

**Safety check before pushing:** the real `.env` (with your Atlas password) is
already listed in `.gitignore` and will not be committed. Only `.env.example`
with placeholders goes to the repo — that is correct.

**Hackathon commit rules to respect:**
- One commit at the end of each build day.
- A new rule was added to the problem statement page on Wednesday 4 Nov 11:00 IST — re-read it before you push again.
- **No push after the End time — any later commit disqualifies the team.**

---

## 4. Deploy to Vercel

1. vercel.com → **Add New… → Project** → **Import** your `vibe-coding-challenge-2-0-...` repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings untouched.
3. Open **Environment Variables** and add exactly two:

   | Key | Value |
   | --- | --- |
   | `MONGODB_URI` | your Atlas string from step 2 |
   | `SESSION_SECRET` | any long random string |

4. Click **Deploy** and wait ~2 minutes.
5. Your public live URL appears: `https://vibe-coding-challenge-2-0-<team-name>.vercel.app` —
   that is the URL for the submission line.

Every later `git push` to `main` redeploys automatically.

---

## 5. First run on the live site

- Open the live URL → the login page offers to **create the first coach account**
  (only works while the academy has no coach). Then add players from the coach panel.
- If you want the demo data online instead: run `npm run seed` **locally** with the
  **same Atlas URI** you gave Vercel — it seeds the shared database (warning: it
  wipes the collections first).

---

## 6. If something breaks

| Symptom | Fix |
| --- | --- |
| Login/pages return 500 on Vercel | `MONGODB_URI` or `SESSION_SECRET` missing/typo'd in Vercel env vars — add them, then **Redeploy** |
| `MongooseServerSelectionError` | Atlas **Network Access** is not `0.0.0.0/0`, or wrong password / database name in the URI |
| Build fails on Vercel but works locally | Check the build log line; almost always a missing env var or a TypeScript error (`npm run lint` locally first) |
| Cookie not sticking on the live site | Normal cause: reopened before deploy finished — hard-refresh the page |

That's it. Free plan, no credit card, no Docker, no server to manage.
