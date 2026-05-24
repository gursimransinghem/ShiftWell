# Coding Conventions

**Analysis Date:** 2026-05-05

## Naming Patterns

**Files:**

- **Route / Expo Router:** `app/` uses Expo Router file-based routing (`_layout.tsx`, `+not-found.tsx`, segment folders). See `app/_layout.tsx`.
- **Stores:** kebab-case with `-store` suffix — e.g. `plan-store.ts`, `auth-store.ts` in `src/store/`.
- **Libraries:** kebab-case files under feature folders — e.g. `calendar-service.ts`, `plan-write-service.ts` in `src/lib/calendar/`.
- **Hooks:** `use` prefix + PascalCase remainder — e.g. `useAdaptivePlan.ts` in `src/hooks/`.
- **Components:** PascalCase — e.g. `AdaptiveInsightCard.tsx` in `src/components/today/`.
- **Tests:** `*.test.ts` (no `*.spec.*` in repo). Top-level suites live under `__tests__/` mirroring domains (`circadian/`, `store/`, `lib/...`). Co-located tests: `src/lib/**/__tests__/*.test.ts`.

**Functions:**

- camelCase for functions and methods — e.g. `requestCalendarAccess`, `buildApp`, `generateSleepPlan`.
- Factory/builder naming: `buildApp`, `createScheduleRouter` in `api/src/`.

**Variables:**

- camelCase for locals and properties. UPPER_SNAKE for module-level test constants — e.g. `TEST_SECRET`, `MOCK_PLAN`, `COMPONENT_PATH` in tests.

**Types:**

- PascalCase for interfaces and types — e.g. `PlanState`, `SleepPlan`, `PlanBlock`, `AppDependencies`. Type-only imports use `import type { ... }` alongside value imports where applicable — see `src/store/plan-store.ts`.

## Code Style

**Formatting:**

- No committed Prettier config (`.prettierrc*`), ESLint config (`.eslintrc*`, `eslint.config.*`), or Biome (`biome.json`) detected at repo root or in `package.json` scripts. Rely on TypeScript strict mode and consistent team/editor defaults.

**Linting:**

- Not detected in project manifests. `package.json` at root and `api/package.json` do not declare eslint/prettier/biome.

## Import Organization

**Order (typical in `app/` and `src/`):**

1. External packages (`react`, `expo-*`, `@react-navigation/*`, `date-fns`, etc.).
2. Path alias `@/` for app-root-relative imports — e.g. `@/components/useColorScheme`, `@/src/store/plan-store` in `app/_layout.tsx`.
3. Relative imports for same feature tree — e.g. `../calendar-service` from `src/lib/calendar/__tests__/calendar-service.test.ts`.

**Path aliases:**

- Root `tsconfig.json` maps `@/*` → `./*`. Imports use both `@/src/...` and `../../src/...` from `__tests__/` (prefer matching the file you are editing).

## Error Handling

**Patterns:**

- API routes return structured JSON with `code` (e.g. `VALIDATION_ERROR`, `MISSING_TOKEN`) — asserted in `api/src/__tests__/routes.test.ts`.
- Stores expose `error: string | null` where relevant — see `PlanState` in `src/store/plan-store.ts`.

## Logging

**Framework:** Sentry for monitoring (`initSentry` in `app/_layout.tsx` via `src/lib/monitoring/sentry`). PostHog for analytics (`AnalyticsProvider`). No single shared logger abstraction documented in sampled files.

**Patterns:**

- Use product-specific modules under `src/lib/monitoring/` and `src/lib/analytics/` rather than ad hoc `console` in production paths (tests use mocks and direct assertions).

## Comments

**When to Comment:**

- File-level block comments describe purpose, phase IDs, and bullet lists of behaviors — e.g. `api/src/app.ts`, `__tests__/store/plan-store.test.ts`, `__tests__/hooks/useAdaptivePlan.test.ts`.
- Section dividers: ASCII rules like `// ── Adaptive Brain ────────────────────────────────────────────────────────` in `src/store/plan-store.ts` and `// ─── Helpers ───` in API tests.

**JSDoc/TSDoc:**

- TSDoc-style `/** ... */` on exported surfaces and complex test strategies. Not required on every private helper.

## Function Design

**Size:** Large store modules (e.g. `plan-store.ts`) combine state shape, actions, and subscriptions; prefer extracting pure logic to `src/lib/*` and keeping stores as orchestration.

**Parameters:** Prefer explicit objects for domain payloads (schedule ingestion bodies, adaptive context). Optional dependency injection via factory params — e.g. `buildApp(deps?: AppDependencies)` in `api/src/app.ts`.

**Return Values:** Explicit TypeScript return types on exported factories and parsers; async functions return `Promise<...>` where used in tests.

## Module Design

**Exports:** Named exports predominate (`buildApp`, `createScheduleRouter`). Expo Router re-exports `ErrorBoundary` from `expo-router` in `app/_layout.tsx`.

**Barrel Files:** Feature `index.ts` re-exports — e.g. `generateSleepPlan` from `../lib/circadian` in `plan-store.ts`. Use for stable public API of a folder.

## Environment variables (names only)

`.env.example` documents client-safe `EXPO_PUBLIC_*` names: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`. Server-side AI key is described as a Supabase secret (`ANTHROPIC_API_KEY`), not an Expo public var. Tests set dummy `EXPO_PUBLIC_SUPABASE_*` in `jest.setup.ts` — do not commit real values.

---

*Convention analysis: 2026-05-05*
