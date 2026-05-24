# Codebase Structure

**Analysis Date:** 2026-05-05

## Directory Layout

```
ShiftWell/
├── app/                    # Expo Router screens & layouts
├── src/
│   ├── components/         # Shared RN UI (today, calendar, night-sky, ui, …)
│   ├── hooks/              # Composition hooks (adaptive, recovery, brief, …)
│   ├── store/              # Zustand stores
│   ├── lib/                # Domain logic & integrations (single largest layer)
│   ├── theme/              # Colors, tokens
│   ├── i18n/               # Locale strings (en, es)
│   └── constants/          # e.g. onboarding step metadata
├── components/             # Root-level Expo template helpers (useColorScheme, Themed, …)
├── constants/              # Small shared constants at repo root
├── assets/                   # Images, fonts
├── api/                      # Express enterprise API (separate package.json)
├── shiftwell-dashboard/    # Next.js app (own package.json)
├── dashboard/                # Partial Next-style snippet (no package.json): facilities page + API route + component
├── supabase/                 # Edge functions + shared TS for Deno
├── website/                  # Additional web/marketing assets (not the main RN app)
├── __tests__/                # Jest tests (root-co-located suites)
├── __mocks__/                # Jest + Metro resolver mocks for native modules
├── scripts/                  # Automation scripts
├── docs/                     # Project documentation
├── _archive/                 # Archived material
├── app.json                  # Expo config (plugins, bundle IDs, experiments.typedRoutes)
├── eas.json                  # EAS Build profiles
├── metro.config.js           # Sentry-aware Metro + native mock resolutions
├── jest.config.js            # ts-jest, path alias @/, native mocks
├── jest.setup.ts             # Test env bootstrap
├── tsconfig.json             # strict; paths "@/*" → "./*"
├── package.json              # Main Expo app dependencies & scripts
├── package-lock.json
├── expo-env.d.ts
├── .env                      # Present locally — secrets; never commit contents
├── .env.example              # Documented variable names for developers
├── .planning/                # Internal planning docs
├── .github/                  # CI/workflows
└── node_modules/             # Dependencies (do not map in detail)
```

## Directory Purposes

**`app/`:**
- Purpose: All routed screens and navigation structure for the mobile app.
- Contains: `_layout.tsx` (root stack), `index.tsx` (gate: onboarding vs tabs), route groups `(tabs)`, `(onboarding)`, `(auth)`, plus standalone routes (`paywall.tsx`, `add-shift.tsx`, `import.tsx`, `downgrade.tsx`, `autopilot-log.tsx`, `+not-found.tsx`, `+html.tsx`).
- Key files: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx` (Today), `app/(onboarding)/_layout.tsx`.

**`src/components/`:**
- Purpose: Feature-grouped reusable UI.
- Contains: `today/`, `calendar/`, `night-sky/`, `recovery/`, `circadian/`, `settings/`, `ai/`, `outcomes/`, `navigation/FloatingTabBar.tsx`, `providers/`, `ui/` primitives (`Button`, `Card`, `Text`, …), `ErrorBoundary.tsx`.
- Key files: `src/components/ErrorBoundary.tsx`, `src/components/navigation/FloatingTabBar.tsx`.

**`src/store/`:**
- Purpose: Global application state.
- Contains: Per-domain stores + `index.ts` barrel; typical names `*-store.ts` (`auth-store.ts`, `plan-store.ts`, `user-store.ts`, `premium-store.ts`, …).

**`src/lib/`:**
- Purpose: Business logic, algorithms, and external service adapters.
- Contains: Top-level domains — `adaptive/`, `circadian/`, `calendar/`, `healthkit/`, `hrv/`, `notifications/`, `sync/`, `supabase/`, `ai/`, `analytics/`, `monitoring/`, `enterprise/`, `premium/`, `growth/`, `patterns/`, `prescriptions/`, `predictive/`, `tips/`, etc.; tests under `**/__tests__/**` or next to modules.

**`src/hooks/`:**
- Purpose: Reusable React hooks tying stores to screens (effects + selectors).
- Contains: `useAdaptivePlan.ts`, `useRecoveryScore.ts`, `useWeeklyBrief.ts`, `usePredictiveSchedule.ts`, `useNightSkyMode.ts`, etc.

**`src/theme/`:**
- Purpose: Shared styling tokens (e.g. `colors.ts`, `index.ts`).

**`src/i18n/`:**
- Purpose: Localization tables (`en.ts`, `es.ts`, `index.ts`).

**Root `components/`:**
- Purpose: Legacy/template utilities imported from root `_layout` (`useColorScheme`).
- Key files: `components/useColorScheme.ts`, `components/useColorScheme.web.ts`.

**`api/`:**
- Purpose: Standalone Node/Express service for enterprise schedules/outcomes.
- Key files: `api/src/app.ts`, `api/src/routes/*.ts`, `api/package.json`.
- Note: Declared start script targets missing `src/index.ts` — align entry file or script before running.

**`shiftwell-dashboard/`:**
- Purpose: Full Next.js 16 project (`package.json`, standard `app/` routing conventions for that package).

**`dashboard/`:**
- Purpose: Small isolated slice (facilities UI + route handler + `ManagerAlerts`) — not a complete installable app without a parent Next workspace.

**`supabase/functions/`:**
- Purpose: Edge functions (e.g. `claude-proxy/index.ts`) and `_shared/` helpers.

**`__tests__/` and `src/**/__tests__/`:**
- Purpose: Jest tests; root `jest.config.js` sets `roots` to `__tests__` and `src`.

**`__mocks__/`:**
- Purpose: Shared mocks for Metro (`metro.config.js` `resolveRequest`) and Jest (`moduleNameMapper`).

## Key File Locations

**Entry Points:**
- `package.json`: `"main": "expo-router/entry"` launches Expo Router into `app/_layout.tsx`.

**Configuration:**
- `app.json`: Expo app metadata, iOS/Android identifiers, plugins (router, HealthKit, Google Sign-In, Sentry, …).
- `eas.json`: EAS build/submit profiles (`development`, `preview`, `production`).
- `tsconfig.json`: Path alias `@/*` → `./*` (use `@/src/...` and `@/components/...` consistently).
- `metro.config.js`: `@sentry/react-native/metro` + redirects for Expo Go–missing native modules.
- `jest.config.js` + `jest.setup.ts`: Node test environment, `@/` mapping, native stubs.

**Core Logic:**
- `src/lib/**/*`: Domain implementations (prefer extending here vs inflating screens).
- `src/store/*-store.ts`: Mutable app state and persistence boundaries.

**Testing:**
- `__tests__/**/*.test.ts`: Cross-cutting suites (AI, circadian, patterns, …).
- `src/lib/**/__tests__/*.test.ts`: Domain tests (calendar, enterprise, autopilot, …).
- `api/src/__tests__/routes.test.ts`: HTTP API integration-style tests.

## Naming Conventions

**Files:**
- Routes: Expo Router — `page` analog is default export component file names (`index.tsx`, `settings.tsx`, `_layout.tsx`).
- Stores: `something-store.ts`.
- Tests: `*.test.ts` under `__tests__/` trees.

**Directories:**
- `src/lib/<domain>/`: domain-clustered modules.
- `src/components/<feature>/`: feature-clustered UI.

## Where to Add New Code

**New Feature (mobile):**
- Primary route screen: `app/` (new file or folder under existing group).
- Reusable UI: `src/components/<feature>/`.
- State: new `src/store/<feature>-store.ts` (follow existing Zustand patterns; add persist only if product requires offline continuity).
- Algorithms/API glue: `src/lib/<domain>/`.
- Tests: `__tests__/<domain>/` or `src/lib/<domain>/__tests__/`.

**New Tab or Stack Screen:**
- Tabs: register in `app/(tabs)/_layout.tsx` after adding `app/(tabs)/<name>.tsx`.
- Modal: add file under `app/` and register `<Stack.Screen>` in `app/_layout.tsx` if needed.

**Utilities:**
- Shared RN-agnostic helpers: `src/lib/` nearest domain folder.
- Shared hooks: `src/hooks/`.

**Enterprise API endpoint:**
- New router: `api/src/routes/<name>.ts`, mount in `api/src/app.ts` under `/v1/...`.

**Edge function:**
- New folder under `supabase/functions/<name>/` with `index.ts`.

## Special Directories

**`.expo/`:**
- Purpose: Local Expo tooling cache/state.
- Generated: Yes.
- Committed: Typically gitignored (verify `.gitignore`).

**`node_modules/`:**
- Purpose: Installed packages.
- Generated: Yes.
- Committed: No.

**`.planning/`:**
- Purpose: Internal phase notes and codebase docs (including this file).
- Generated: Mixed.
- Committed: Often yes for team alignment.

---

*Structure analysis: 2026-05-05*
