# SupportMate

Local NDIS invoicing app for support workers — clients, shifts, calculations, and PDF invoices. Data is stored in SQLite on your Mac.

## Run locally

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

Opens the app at **http://localhost:8080** (Vite frontend + Express/SQLite API on port 3001).

You can also double-click **SupportMate.command** in Finder to start the dev server and open the browser.

Other scripts:

- `npm run build` — production frontend build
- `npm start` — run the API server in production mode (serves built frontend)
- `npm run test` — unit tests (Vitest)
- `npm run test:blackbox` — API integration tests against SQLite

## shiftHug

The cloud-hosted Supabase version is **[shiftHug](https://github.com/coconutHaven/shiftHug)** — deployed to GitHub Pages. It uses separate line items for labour, travel, and expenses on invoices. SupportMate folds km and expenses into the invoice hours total at the client's hourly rate.
