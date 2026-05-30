# Deploying MTG Marketplace

The app deploys as a **single web service**: the Express backend serves the
built React frontend on the same origin, so the entire app — including
real-time auction bids over WebSockets — runs from one URL with no CORS or
cross-site-cookie issues.

---

## Option A — Render (recommended, uses `render.yaml`)

1. Make sure this branch is pushed to GitHub.
2. Open the **[Render dashboard](https://dashboard.render.com)** → **New +** → **Blueprint**.
3. Connect the `IlyaStetsiuk/MtgMarketPlace` repository and pick the
   `claude/mtg-marketplace-auction-Cl1nQ` branch.
4. Render reads `render.yaml`, creates the **mtg-marketplace** web service,
   generates a `JWT_SECRET`, and builds. First build takes ~3–5 minutes.
5. When it's live, open the `https://mtg-marketplace-XXXX.onrender.com` URL on
   your phone.

> **Free-tier notes:** the service sleeps after ~15 min of inactivity (first
> request after sleeping takes ~30s to wake). The SQLite database lives on
> ephemeral storage, so data resets on redeploys — perfect for a demo. For
> persistence later, switch `DATABASE_URL` to a Postgres instance and change
> the Prisma provider.

---

## Option B — Railway

Railway auto-detects the root `package.json`:

1. Open **[railway.app](https://railway.app)** → **New Project** → **Deploy from GitHub repo**.
2. Select the repo and this branch.
3. Add environment variables in the service **Variables** tab:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (any long random string)
   - `DATABASE_URL` = `file:./dev.db`
4. Railway runs `npm run build` then `npm start` automatically and gives you a
   public `*.up.railway.app` URL. Click **Settings → Networking → Generate Domain**
   if a domain isn't created automatically.

---

## How the build works

- `npm run build` →
  - builds the frontend (`frontend/dist`)
  - installs backend deps, runs `prisma generate`, `prisma db push` (creates the
    SQLite schema), and compiles TypeScript (`backend/dist`)
- `npm start` → runs `backend/dist/index.js`, which serves the API, the
  WebSocket server, and the static frontend.

Build commands use `npm install --include=dev` because hosts set
`NODE_ENV=production`, which would otherwise skip the build tools
(Vite, TypeScript, Prisma, Tailwind).

---

## Verified locally

Running the production build (`NODE_ENV=production`) confirms:

- `GET /api/health` → `{"status":"ok"}`
- `GET /` → serves the React `index.html`
- `GET /browse` (client-side route) → 200 via SPA fallback
- static JS/CSS assets → 200
- the server stays up even if an upstream API call fails
