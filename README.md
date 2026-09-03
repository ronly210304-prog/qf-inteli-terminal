# QF Inteli Terminal

Mobile-first personal market intelligence terminal built with Next.js, React, TypeScript, Tailwind CSS, and Lightweight Charts.

## Deployment

This project is prepared for GitHub + Vercel deployment.

### 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Add your own FRED API key to `.env.local`:

```text
FRED_API_KEY=YOUR_KEY_HERE
```

Never commit `.env.local` or any real API key.

### 2. Test

```bash
npm run build
npm start
```

### 3. GitHub

Create a GitHub repository and push the project files. The repository intentionally excludes `.env.local`, `.next`, `node_modules`, and other local artifacts through `.gitignore`.

### 4. Vercel

Import the GitHub repository into Vercel. In **Project Settings → Environment Variables**, add:

- `FRED_API_KEY` — your FRED API key

Then deploy.

## Data-source notes

- Market data: Yahoo Finance chart endpoint used server-side; this is an unofficial endpoint and may change without notice.
- Macro/economic releases: FRED API; requires a free FRED API key.
- Crypto Fear & Greed: Alternative.me public API.
- News: Yahoo Finance RSS endpoint where available.

The application does not intentionally create synthetic financial data. If a provider is unavailable, the UI should show an unavailable/no-data state.

## Security

Real API credentials belong only in local/Vercel environment variables. Do not put them in source code, GitHub, screenshots, or `.env.example`.
