# Agent Trader Arena

A futuristic dark crypto dashboard built with React and Vite. It includes animated market panels, AI trader cards, token cards, and leaderboard cards with responsive layouts.

## Live Market Data

The app is wired for live Birdeye token data.

- Frontend hook: `src/hooks/useBirdeyeTokens.js`
- API client with timeout, retry, caching, and response normalization: `src/services/birdeyeClient.js`
- Secure Vercel serverless proxy: `api/birdeye/token-list.js`

The advanced path is the serverless proxy. The browser calls `/api/birdeye/token-list`, and the API route calls Birdeye with `BIRDEYE_API_KEY`. This keeps the private key out of the React bundle after deployment.

For local Vite-only development, the client can fall back to `VITE_BIRDEYE_API_KEY` because Vite does not run Vercel API routes by itself. Treat that fallback key as public.

## Get A Birdeye API Key

1. Create or sign in to a Birdeye Data Services account:
   https://bds.birdeye.so/auth/sign-in
2. Open the dashboard security/API key area.
3. Generate an API key.
4. Copy it into your local `.env` file:

```bash
BIRDEYE_API_KEY=your_private_birdeye_key_for_vercel_api_route
VITE_BIRDEYE_API_KEY=optional_browser_fallback_key_for_vite_only_dev
```

Use `BIRDEYE_API_KEY` in Vercel project environment variables. Only use `VITE_BIRDEYE_API_KEY` for local Vite testing if you are comfortable exposing that key to the browser.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Local Development Modes

Run with Vite:

```bash
npm run dev
```

This uses the browser fallback key if the `/api` route is unavailable.

Run with Vercel's local runtime when you want to test the secure serverless proxy locally:

```bash
npx vercel dev
```

## Deploy To Vercel

This project is ready for Vercel:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `BIRDEYE_API_KEY`

The included `vercel.json` configures the production build and SPA rewrites.
