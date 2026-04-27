# PreSales AI — Frontend

Vue 3 single-page application for **AI-assisted presales analysis**: turn a client brief and your team context into structured intelligence, a written report, and workspace artifacts you can save and revisit.

---

## Overview

The app orchestrates a **multi-agent presales pipeline** on the backend. You describe the opportunity in a guided flow; the UI shows progress while **four specialized agents** run in sequence, then renders an interactive report with exports, optional proposal tooling, and persistence when authenticated.

**What you can do**

- **Analyze** — Walk through a four-step wizard (project brief, client context, team expertise, constraints), submit, and review the generated report.
- **Export** — Download the synthesis as **Markdown** or **JSON**, or **print / save as PDF** via the browser.
- **Save to workspace** — Persist analyses as reports when signed in (title optional).
- **Reports** — Browse saved reports, open details, delete entries, and start a **new analysis** from the workspace.
- **Analytics** — Aggregated signals from saved reports (trends, mix, risk signals) when data exists.
- **Pre-check** — Before the heavy pipeline, a fast `POST /api/presales/prescreen` run opens a blocking modal (traffic-light risk, signals); you can edit inputs or continue to full analysis.
- **Tools** — From the report header, open **Tools** for call script (timer + per-phase copy), objections, competitors, follow-up email, and (when signed in) a **shareable client briefing** link. Proposal draft remains a separate action.
- **Public briefing** — Shared links open at `/briefing/:slug` (minimal chrome, copy-friendly).
- **Auth** — Sign up / sign in; email confirmation is supported when enabled by the backend. Tokens are stored in `sessionStorage` for the active tab.

---

## User flow (short)

| Step | Screen | What happens |
|------|--------|----------------|
| 1 | **Home** (`/`) | Landing / splash; entry to the product. |
| 2 | **New analysis** (`/analyze`) | Multi-step form: *Project description* → *Client messages* (optional) → *Team expertise* (optional) → *Constraints* (optional). |
| 3 | **Processing** | Animated pipeline while the API runs; mirrors the four backend agents (see below). |
| 4 | **Report** | Full report view: sections, navigation, save, exports, optional **proposal draft** CTA when applicable. |
| 5 | **Workspace** (`/reports`, `/reports/analytics`) | **Auth required.** List saved reports, paginate, open `/reports/:id`, view analytics. |

After login, users are redirected to **`/reports`** by default (unless a `?redirect=` query points elsewhere).

---

## The four agents

These names match the progress UI during analysis. The backend implements the actual orchestration; the frontend reflects their sequence.

| # | Agent | Role (high level) |
|---|--------|----------------------|
| 1 | **Analyst** | Validates inputs and extracts structured signals. |
| 2 | **Risk & Discovery** | Surfaces risks and discovery angles. |
| 3 | **Strategy** | Shapes positioning and solution framing. |
| 4 | **Synthesis** | Assembles the final presales report. |

---

## Tech stack

- **Vue 3** (Composition API), **Vue Router**, **Pinia**
- **Vite 7**, **TypeScript**
- **Element Plus** (forms, feedback)
- **Tailwind CSS 4** (via Vite plugin), project CSS variables
- **Axios** — HTTP client to the presales backend (`/api/...`)

---

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (see `package.json` → `engines`)
- **npm** (or compatible client)
- A running **presales backend** that exposes the API expected by this client (default assumed: `http://localhost:3000`)

---

## Environment variables

Vite only exposes variables prefixed with `VITE_`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Recommended | Base URL of the presales backend **without** a trailing slash, e.g. `http://localhost:3000`. If unset, the client falls back to `http://localhost:3000`. |
| `VITE_API_BASE_URL` | Optional | Alias for `VITE_API_URL` (same value; use whichever matches your deployment docs). |

Copy the example file and adjust:

```bash
cp env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

The axios client uses `{VITE_API_URL}/api` as the API prefix (see `src/api/backend-client.ts`).

---

## Local development

### 1. Clone and install

```bash
git clone <repository-url>
cd presales-app-fe
npm install
```

`postinstall` may run auxiliary codegen (e.g. OpenAPI types); ensure network access if scripts fetch remote specs.

### 2. Configure the backend URL

Ensure `.env` exists and `VITE_API_URL` matches where your API listens (same host/port as `app.listen` on the server). No trailing slash.

### 3. Start the backend

Start your presales API on the configured host/port **before** using features that call the network (analyze, auth, reports).

### 4. Start the dev server

```bash
npm run dev
```

Open the URL printed in the terminal (Vite default is often `http://localhost:5173`). The dev server proxies nothing by default—all API calls go directly to `VITE_API_URL` from the browser.

### 5. CORS

If the browser blocks requests, allow your dev origin (e.g. `http://localhost:5173`) in the backend CORS configuration.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run build-only` | Production build without a separate type-check step |
| `npm run preview` | Serve `dist/` locally (after `build`) |
| `npm run type-check` | Run `vue-tsc --build` |
| `npm run lint` | ESLint with `--fix` |
| `npm run openapi-generate` | Regenerate OpenAPI-driven types (if used in your workflow) |

---

## Authentication & API

- **Bearer tokens** — `Authorization: Bearer <access_token>` is attached when a token exists in `sessionStorage` (`presales:access_token`; refresh key `presales:refresh_token` when present).
- **401 handling** — The client clears the session and redirects to login (with optional `redirect` query) for protected navigation.
- **Sign-up confirmation** — If the backend returns an email-confirmation link, the app handles hash redirects (e.g. Supabase-style fragments) and surfaces success feedback; adjust backend redirect URLs to your deployed frontend origin.

---

## Production build

```bash
npm run build
```

Output: `dist/`. Serve static files behind HTTPS; set `VITE_API_URL` at **build time** to your production API base URL (or rely on your hosting provider’s env injection).

---

## Project structure (orientation)

- `src/views/` — Route-level views (`HomeView`, `AnalyzeView`, auth, reports)
- `src/components/` — Reusable UI (report layout, steps, loaders)
- `src/api/` — Backend client, env, feature APIs
- `src/router/` — Routes and guards
- `src/stores/` — Pinia stores (e.g. auth)

---

## IDE & tooling (optional)

- **VS Code** + [Vue — Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) for `.vue` and TypeScript integration
- [Vue DevTools](https://devtools.vuejs.org/) for component inspection in the browser

---

## License

Private / internal — refer to your organization’s policy.
