# Word Quest — Battle of Words 🎯

Duolingo-style vocabulary trainer for Grade 7 · 200 words · 20 days · Multi-user · Weekly leaderboard

---

## Deploy to Vercel in 5 minutes

### Step 1 — Push to GitHub

Open Terminal, navigate to this folder, and run:

```bash
cd /Users/ramya/workspace/bow/wordquest-app
git init
git add .
git commit -m "Word Quest - initial"
```

Then go to [github.com/new](https://github.com/new), create a repo called `wordquest`, and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wordquest.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up free** (use your GitHub account)
2. Click **Add New → Project**
3. Click **Import** next to your `wordquest` repo
4. Leave all settings as default → click **Deploy**
5. Wait ~60 seconds — your app is live at `https://wordquest-xxxx.vercel.app`

### Step 3 — Add the database (Vercel KV)

Without this step, data resets when the server restarts. Do this once:

1. In your Vercel project dashboard, click the **Storage** tab
2. Click **Create Database → KV (Redis)**
3. Name it `wordquest-kv` → click **Create & Continue → Connect**
4. Vercel automatically adds the database credentials to your project
5. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

Your app is now fully live with persistent data for all students.

---

## Run locally (optional)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## How it works

| Page | URL | Description |
|------|-----|-------------|
| Profile select | `/` | Students pick or create their profile |
| Game | `/game` | 20-day vocabulary journey |
| Leaderboard | `/leaderboard` | Weekly XP rankings for all students |

### Game features
- **Learn phase** — flip flashcards showing word, pronunciation (🔊), definition, synonyms, antonyms, example sentence
- **Practice phase** — 30 quiz questions per day: definition match, synonym match, fill-in-the-sentence
- **Rewards** — XP, 1–3 stars per day, streaks, levels, 13 achievement badges
- **Leaderboard** — resets every Monday; gold/silver/bronze podium; shows how many XP needed to overtake the player above you

### Tech stack
- **Next.js 14** (App Router) — React framework, Vercel-native
- **Vercel KV** (Redis) — stores all user progress and leaderboard scores
- **Tailwind CSS** — styling
