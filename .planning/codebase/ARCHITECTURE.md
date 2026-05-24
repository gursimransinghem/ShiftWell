# Architecture

**Analysis Date:** 2026-05-05

## Pattern Overview

**Overall:** Expo (SDK 55) + React Native mobile app with **file-based routing** (Expo Router), **Zustand** for client state, and **domain logic extracted into `src/lib/`**. The repository also ships an **Express enterprise API** (`api/`), **Supabase Edge Functions** (`supabase/functions/`), and a **Next.js dashboard** (`shiftwell-dashboard/`).

**Key Characteristics:**
- Screens live under `app/` as routes; heavy UI and behavior compose stores + hooks + `src/components/`.
- Cross-cutting setup runs from `app/_layout.tsx`: Sentry, Posthog `AnalyticsProvider`, fonts/splash, Google Sign-In config, calendar background sync registration, app foreground/background hooks (scores, re-engagement).
- Feature domains (circadian, calendar, adaptive brain, AI briefs, enterprise helpers) are isolated as pure-ish TypeScript modules under `src/lib/` with unit tests co-located or under `__tests__/`.

## Layers

**Presentation (routes):**
- Purpose: Expo Router navigation tree, thin screen wiring, modal/stack declarations.
- Location: `app/`
- Contains: `_layout.tsx` stacks and tabs, route files (`index.tsx`, `(tabs)/*`, `(onboarding)/*`, `(auth)/*`, modals).
- Depends on: `@/src/store/*`, `@/src/components/*`, `@/src/hooks/*`, `@/src/lib/*`, `@/src/theme`, `@/components/useColorScheme`.
- Used by: OS / Expo Router entry (`package.json` → `expo-router/entry`).

**Presentation (shared UI):**
- Purpose: Reusable RN views—Today tab cards, calendar UI, night-sky visuals, settings widgets, primitives.
- Location: `src/components/` (primary), root `components/` (Expo template remnants e.g. `useColorScheme`).
- Contains: Feature folders (`today/`, `calendar/`, `night-sky/`, `recovery/`, etc.), `providers/AdaptiveColorProvider.tsx`, `ErrorBoundary.tsx`, `ui/*`.
- Depends on: Stores, hooks, theme, `src/lib` for copy/logic where needed.
- Used by: `app/*` screens.

**Application state:**
- Purpose: Auth session, onboarding flags, plans, shifts, scores, premium, notifications, AI/brief state, etc.
- Location: `src/store/`
- Contains: Zustand stores (`auth-store.ts`, `plan-store.ts`, …); `persist` + `AsyncStorage` patterns (e.g. `plan-store.ts`).
- Depends on: `src/lib/supabase`, `src/lib/sync`, domain libs (calendar, notifications).
- Used by: Screens, hooks, other stores (cross-store reads/writes appear in places like `plan-store.ts`).

**Domain & integrations:**
- Purpose: Algorithms (circadian, fatigue, nap, caffeine), calendar sync, HealthKit adapters, AI clients, analytics, growth, enterprise aggregation—**no routing**.
- Location: `src/lib/` with subpackages: `adaptive/`, `circadian/`, `calendar/`, `healthkit/`, `notifications/`, `sync/`, `supabase/`, `ai/`, `analytics/`, `monitoring/`, `enterprise/`, etc.
- Contains: Services, types, engines; Supabase typed client `src/lib/supabase/client.ts` + generated `database.types.ts`.
- Depends on: NPM packages (Supabase, date-fns, …), Expo modules; env names documented in `.env.example` (do not read `.env*` in-repo docs).
- Used by: Stores and hooks (e.g. `src/hooks/useAdaptivePlan.ts`, `usePredictiveSchedule.ts`).

**Hooks (composition):**
- Purpose: Bridge reactive store subscriptions + effects (daily predictive run, weekly brief, recovery score).
- Location: `src/hooks/`
- Depends on: Stores + `src/lib` feature gates (`premium/feature-gate.ts`).
- Used by: Tab screens such as `app/(tabs)/index.tsx`.

**Backend — Enterprise API:**
- Purpose: REST ingestion/reporting for employer scenarios—Express app factory, JWT middleware, versioned routes.
- Location: `api/src/` — `app.ts` exports `buildApp()`, routes under `routes/schedule.ts`, `routes/outcomes.ts`, middleware in `middleware/`.
- Contains: Test-oriented dependency injection for repos; health + OAuth token stub; global error handler.
- Depends on: Express, `jose`, `zod`, `uuid`.
- Used by: `api/src/__tests__/routes.test.ts`; **`api/package.json` declares `"main": "src/index.ts"` and `"start": "ts-node src/index.ts"` but no `src/index.ts` is present** — runtime entry must be added or scripts updated before `npm start` works.

**Backend — Supabase Edge:**
- Purpose: Server-side proxy/rate limiting for Claude API (`supabase/functions/claude-proxy/index.ts`), shared CORS (`supabase/functions/_shared/cors.ts`).
- Depends on: Deno-style imports (`esm.sh` Supabase client).

**Web dashboards:**
- Purpose: Employer-facing or marketing web UI (separate from the mobile bundle).
- Location: `shiftwell-dashboard/` — full Next.js app (`package.json`, App Router style usage). Partial duplicate/experiment: `dashboard/` holds only `app/facilities/page.tsx`, `app/api/facilities/route.ts`, `components/ManagerAlerts.tsx` without its own `package.json`.

## Data Flow

**Cold start → main UI:**
1. `app/_layout.tsx` loads fonts, wraps tree in `ShiftWellErrorBoundary`, `AnalyticsProvider`, Navigation themes, `AdaptiveColorProvider`.
2. `checkSession()` (`auth-store`) and `initializePremium()` run; Google Sign-In configured; calendar sync kicked off if connected.
3. `app/index.tsx` reads `onboardingComplete` from `user-store`; routes to `/(tabs)` or `'/onboarding'` (other onboarding navigation uses explicit `'/(onboarding)/…'` paths).

**Today tab composition:**
1. `app/(tabs)/index.tsx` composes night-sky mode, plan/shifts/prediction/brief stores, and many `src/components/today/*` cards.
2. Hooks (`useTodayPlan`, `useRecoveryScore`, `useAdaptivePlan`, …) pull derived state and side effects from `src/lib` engines.

**Calendar sync:**
1. `registerCalendarBackgroundSync` / `runCalendarSync` from `src/lib/calendar/` triggered from root layout and app lifecycle.
2. Background task wired via side-effect import `import '@/src/lib/calendar/background-sync'` in `app/_layout.tsx`.

**Auth / cloud:**
1. `auth-store` coordinates Supabase auth helpers (`src/lib/supabase/auth.ts`), SecureStore session marker, optional `migrateLocalDataToCloud` (`src/lib/sync/data-migration.ts`).

**State Management:**
- Zustand stores module-scoped; persistence via `zustand/middleware` + `AsyncStorage` where applied (see `plan-store.ts`).
- Monitoring middleware referenced from `src/lib/monitoring/zustand-middleware.ts` (instrumentation layer).

## Key Abstractions

**Sleep plan & adaptive brain:**
- Purpose: Generated sleep plans, adaptive regeneration, transparency logs, autopilot bounds.
- Examples: `src/store/plan-store.ts`, `src/lib/adaptive/*`, `src/lib/circadian/*`.
- Pattern: Store holds authoritative plan + adaptive metadata; pure functions in `lib` compute deltas.

**Circadian / prediction:**
- Purpose: Fatigue, naps, caffeine modeling, predictions.
- Examples: `src/lib/circadian/fatigue-model.ts`, `prediction-engine.ts`, `src/store/prediction-store.ts`.

**Feature gating:**
- Purpose: Premium / beta flags for optional behaviors (e.g. predictive scheduling).
- Examples: `src/lib/premium/feature-gate.ts`, `usePredictiveSchedule.ts`.

## Entry Points

**Mobile bundle:**
- Location: `package.json` `"main": "expo-router/entry"` → `app/_layout.tsx` default export wrapped with `Sentry.wrap`.
- Triggers: Expo / Xcode / Android Studio launch.
- Responsibilities: Global providers, native notification handler registration, stack navigator registration (`index`, `(auth)`, `(onboarding)`, `(tabs)`, modals).

**Tab shell:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: Navigation to `/(tabs)` after onboarding.
- Responsibilities: `Tabs` with custom `FloatingTabBar`.

**Enterprise API (tests):**
- Location: `buildApp()` in `api/src/app.ts`, exercised by `api/src/__tests__/routes.test.ts`.

## Error Handling

**Strategy:** Layered—React error boundary for subtree failures, Sentry for crash/reporting, Expo Router exported `ErrorBoundary`, Express 404 + centralized 500 JSON handler in `api/src/app.ts`.

**Patterns:**
- `ShiftWellErrorBoundary` (`src/components/ErrorBoundary.tsx`) integrates `@sentry/react-native` `beforeCapture` / `showReportDialog` patterns.
- API errors logged with `console.error` then sanitized JSON response (`INTERNAL_ERROR`).

## Cross-Cutting Concerns

**Logging:** Console in API; mobile relies on Sentry + dev-only UI in error fallback (`__DEV__` message block in `ErrorBoundary.tsx`).

**Validation:** Zod in enterprise API routes/types; client validation scattered per screen/store actions.

**Authentication:** Supabase session on device (`auth-store` + SecureStore-backed Supabase client); enterprise API uses JWT middleware (`api/src/middleware/auth.ts`) with test secret injection.

---

*Architecture analysis: 2026-05-05*
