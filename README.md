# Softonix Vue Guidelines

Due to standardization purposes among our teams in Softonix, we would like to have a pretty strict standard project structure based on top of Vue.js.

Besides this, we also propose a list of frontend best practices which we must follow for consistency reasons.

### Prerequisition
- Familiarity with the command line
- Install Node.js version 20.19.0 or higher (22.12.0+ recommended)
- Copy `env.example` to `.env` (or use `.env.example` if you add that filename locally) and set `VITE_API_URL` to your presales **backend** base URL (no trailing slash), e.g. `http://localhost:3000`.

### Presales app: backend + frontend

1. Start the backend API (default `http://localhost:3000` or your deployment URL).
2. In the project root, create `.env` from `.env.example` and set `VITE_API_URL` to that same base URL.
3. Run `npm install` and `npm run dev`. Open the URL shown in the terminal (usually `http://localhost:5173`).

**Auth tokens:** Access (and optional refresh) tokens are stored in `sessionStorage` under keys `presales:access_token` / `presales:refresh_token`. They are cleared on logout and on `401` responses. `sessionStorage` is scoped to the tab and cleared when the tab closes; for stricter isolation use in-memory-only tokens (not implemented here).

**CORS:** If the browser blocks requests, configure the backend to allow your dev origin (e.g. `http://localhost:5173`) in its CORS policy.

**Main UI:** The default route loads `HomeView.vue`: splash → multi-step form (`StepForm`) → loading (`AgentProgress`) → full report (`ReportView`). The top nav (`AppLayout`) wraps this flow and adds **Log in / Sign up**, **My reports**, and the user menu.

**Test flow:** Sign up → complete the analyze steps (no login required for the API call) → on the report screen, **Save** (when logged in) or **Log in to save** → **My reports** → open a report detail.

**API client:** All presales-backend calls use `axios` with `Content-Type: application/json` via `src/api/backend-client.ts`. Protected routes send `Authorization: Bearer <access_token>`.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Type-Check

```sh
npm run type-check
```
