# Cyber Digital Twin Platform — Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the Cyber Digital Twin security platform.
This package is **frontend only** — it expects your teammate's FastAPI backend to be running separately.

## Tech stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (theme tokens in `src/index.css`)
- React Router v7 (protected routes via Context API)
- Axios (centralized service layer in `src/api`)
- Recharts (dashboard charts)
- React Flow (attack graph)
- Lucide React (icons)

## Getting started

```bash
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL to point at the FastAPI backend
npm run dev
```

The app runs at **http://localhost:5173** by default.

## Configuring the backend URL

Edit `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

All requests go through `src/api/axios.ts`, which reads this value, attaches the
`Authorization: Bearer <token>` header automatically, and redirects to `/login` on 401s.

## API contract implemented

Every endpoint below is called from `src/api/services.ts`:

| Endpoint | Used in |
|---|---|
| `POST /auth/login` | Login page |
| `GET /dashboard/summary` | Dashboard |
| `GET /dashboard/risk-trend` | Dashboard (Recharts line chart) |
| `GET /dashboard/recent-drifts` | Dashboard (table) |
| `GET /dashboard/control-health` | Dashboard (horizontal bar chart) |
| `GET /dashboard/recommendations` | Dashboard (cards) |
| `GET /projects` | Projects, Baseline Controls, Digital Twin, Risk, Recommendations, Attack Graph, Settings |
| `GET /baseline/{project_id}` | Projects (drilldown), Baseline Controls |
| `POST /twin/create` | Digital Twin |
| `PUT /twin/update` | Digital Twin |
| `POST /twin/detect-drift/{twin_id}` | Digital Twin |
| `POST /risk/{twin_id}` | Risk Analysis (gauges) |
| `POST /recommendation/{twin_id}` | Recommendations |
| `POST /change-request` | Settings → Change Requests |
| `POST /approval/{request_id}` | Settings → Manager Approval queue |
| `GET /attack-graph/{twin_id}` | Attack Graph (React Flow) |
| `POST /copilot/chat` | AI Copilot (floating widget + full page) |

> **Note on mock fallback:** dashboard/project/twin/risk/recommendation/attack-graph reads fall back to
> realistic mock data (`src/mocks/mockData.ts`) *only* if the real API call throws, so the UI stays
> renderable while your backend is still coming online. Every call still hits the real endpoint first.
> Once the backend is reachable, real responses are used automatically — no code changes needed.
> Set `USE_MOCKS = false` at the top of `src/api/services.ts` to disable this fallback entirely
> (recommended before shipping to production).

## Project structure

```
src/
  api/            axios instance + typed service layer (one function per endpoint)
  context/        AuthContext (Context API session state)
  components/
    layout/       Sidebar, Navbar, MobileSidebar, AppLayout, ProtectedRoute
    ui/           Button, Card, Badge, StatCard, RiskGauge, Loader, ErrorBanner
    dashboard/    RiskTrendChart, ControlHealthChart, RecentDriftsTable, RecommendationCard
    copilot/      CopilotWidget (floating chatbot)
  pages/          Login, Dashboard, Projects, BaselineControls, DigitalTwin,
                  RiskAnalysis, Recommendations, AttackGraph, AICopilot, Settings
  mocks/          mockData.ts (fallback-only, see note above)
  types/          shared TypeScript interfaces matching the API contract
```

## Auth & protected routes

- `AuthContext` (Context API) holds the current user and token in `localStorage`.
- `ProtectedRoute` redirects to `/login` if unauthenticated.
- If the backend is unreachable, Login falls back to a demo session so the UI remains explorable —
  remove this fallback in `src/context/AuthContext.tsx` before production use.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

## Theme

Colors are defined as Tailwind v4 theme tokens in `src/index.css`:

| Token | Hex |
|---|---|
| Background | `#0F172A` |
| Card | `#1E293B` |
| Accent | `#3B82F6` |
| Safe | `#22C55E` |
| Warning | `#F97316` |
| Critical | `#EF4444` |
