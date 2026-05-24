# Technology Stack

**Analysis Date:** 2026-05-05

## Languages

**Primary:**
- **TypeScript** — Strict mode across the Expo/React Native app (`tsconfig.json` extends `expo/tsconfig.base`) and the Enterprise API (`api/tsconfig.json`, CommonJS output to `api/dist`).

**Secondary:**
- **JavaScript** — Metro bundler config (`metro.config.js`), Jest config (`jest.config.js`).
- **SQL** — Supabase migrations under `supabase/migrations/`.
- **Deno-flavored TypeScript** — Supabase Edge Functions (e.g. `supabase/functions/claude-proxy/index.ts`) import via URL (`esm.sh`).

## Runtime

**Environment:**
- **Node.js** — Used for Jest, `ts-node`, and the Enterprise API tooling (exact engine version not pinned in repo; no `.nvmrc`).

**Package Manager:**
- **npm** — Lockfiles: `package-lock.json` (root), `api/package-lock.json`.

## Frameworks

**Core:**
- **Expo SDK ~55** (`expo` ~55.0.6) — Managed workflow, `main`: `expo-router/entry`.
- **React** 19.2.0 — UI layer.
- **React Native** 0.83.2 — Native runtime; **react-native-web** ~0.21.0 for web.
- **expo-router** ~55.0.5 — File-based routing; **typed routes** enabled in `app.json` experiments.
- **Express** ^4.21.2 — Enterprise REST API assembled in `api/src/app.ts` (`buildApp()` factory).

**State & data client:**
- **Zustand** ^5.0.11 — Client state (optional Sentry middleware in `src/lib/monitoring/zustand-middleware.ts`).
- **@supabase/supabase-js** ^2.99.1 — Typed client (`src/lib/supabase/client.ts`, `database.types.ts`).

**Testing:**
- **Jest** ^30.3.0 — Root preset `ts-jest`, Node environment, `jest.setup.ts` seeds test env vars for Supabase URL/key.
- **ts-jest** ^29.4.6 — TypeScript transform.
- **supertest** ^7.1.0 — API route tests (`api/src/__tests__/routes.test.ts`).
- API package embeds duplicate Jest config in `api/package.json` in addition to root `jest.config.js`.

**Build/Dev:**
- **Metro** — Bundler; wrapped with `getSentryExpoConfig` from `@sentry/react-native/metro` in `metro.config.js` (Sentry source maps / tooling).
- **EAS Build** — `eas.json` profiles: development (simulator), preview (internal), production (store, auto-increment).
- **TypeScript** ~5.9.2 (app), ^5.8.3 (api).

## Key Dependencies

**Critical (mobile product):**
- **expo-router**, **expo-*** modules — Notifications, calendar, location, secure store, background tasks, Apple Authentication, document picker, AV, etc. (see root `package.json`).
- **react-native-reanimated** 4.2.1 / **react-native-worklets** 0.7.2 — Animations pipeline.
- **@kingstinct/react-native-healthkit** ^13.3.1 — Apple HealthKit (`src/lib/healthkit/*`).
- **react-native-purchases** ^9.12.0 — RevenueCat subscriptions (`src/lib/premium/premium-service.ts`).
- **@react-native-google-signin/google-signin** — Google OAuth for calendar flows (`app/_layout.tsx`, onboarding/settings).
- **@sentry/react-native** ^6.0.0 — Errors, replay, navigation integration (`src/lib/monitoring/sentry.ts`, `app/_layout.tsx`).
- **posthog-react-native** ^3.3.7 — Product analytics (`src/lib/analytics/posthog.tsx`, `events.ts`, hooks).

**Infrastructure / utilities:**
- **date-fns** ^4.1.0 — Date handling.
- **ical.js** ^2.2.1 — Calendar / ICS parsing.
- **zod** ^3.25.63 — Schema validation (API).
- **jose** ^5.10.0 — JWT verify/sign (`api/src/middleware/auth.ts`, OAuth stub in `api/src/app.ts`).
- **uuid** ^11.1.0 — Request IDs and identifiers.

## Configuration

**Environment:**
- `.env.example` documents client-safe `EXPO_PUBLIC_*` variables (Supabase, RevenueCat, PostHog). Comments describe server-side **Anthropic** key via Supabase secrets (`ANTHROPIC_API_KEY`). Additional runtime vars referenced in code include **`EXPO_PUBLIC_SENTRY_DSN`** (`src/lib/monitoring/sentry.ts`). Local `.env` files may exist; contents not audited here.

**Build:**
- `app.json` — Expo config: iOS bundle id `com.shiftwell.app`, HealthKit entitlements, plugins (HealthKit, Google Sign-In placeholder scheme, Sentry Expo plugin with project/org placeholders).
- `eas.json` — Build/submit profiles; submit placeholders for Apple IDs.
- `tsconfig.json` — Path alias `@/*` → `./*`.

## Platform Requirements

**Development:**
- Node + npm for installs and scripts.
- **Expo CLI / EAS** for native builds; iOS requires Xcode toolchain for simulator/device builds entitlements (HealthKit, Sign in with Apple).

**Production:**
- **iOS / Android** store targets per `eas.json` production profile; static web output configured under `app.json` → `expo.web` (Metro, static).

---

*Stack analysis: 2026-05-05*
