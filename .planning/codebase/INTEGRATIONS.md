# External Integrations

**Analysis Date:** 2026-05-05

## APIs & External Services

**Backend-as-a-service & auth:**
- **Supabase** — Postgres-backed app data, Row Level Security (migrations `supabase/migrations/`), auth used with Apple ID token and email/password (`src/lib/supabase/auth.ts`). Client: `@supabase/supabase-js` with session persisted via **`SecureStoreAdapter`** (`src/lib/supabase/storage-adapter.ts`, `expo-secure-store`).

**AI:**
- **Anthropic Claude** — Called only from Edge Function `supabase/functions/claude-proxy/index.ts` (HTTPS `api.anthropic.com/v1/messages`). API key expected as Supabase secret **`ANTHROPIC_API_KEY`** (documented in `.env.example`, not client-exposed). Rate limits enforced against table `ai_request_log`.

**Subscriptions:**
- **RevenueCat** — `react-native-purchases` configured with **`EXPO_PUBLIC_REVENUECAT_API_KEY`** (`src/lib/premium/premium-service.ts`, `.env.example`).

**Analytics:**
- **PostHog** — `posthog-react-native` via `AnalyticsProvider` (`src/lib/analytics/posthog.tsx`). Env: **`EXPO_PUBLIC_POSTHOG_KEY`**, **`EXPO_PUBLIC_POSTHOG_HOST`** (defaults to `https://us.i.posthog.com`). Screen autocapture, lifecycle events; opt-out in `src/lib/analytics/opt-out.ts`.

**Errors & session replay:**
- **Sentry** — `@sentry/react-native`: init in `src/lib/monitoring/sentry.ts`, **`EXPO_PUBLIC_SENTRY_DSN`**, wrapped root layout (`app/_layout.tsx`), `Sentry.ErrorBoundary` (`src/components/ErrorBoundary.tsx`), Zustand breadcrumbs (`src/lib/monitoring/zustand-middleware.ts`). Expo plugin placeholders in `app.json` (`organization`, `project`).

**Calendar & identity:**
- **Google Sign-In** — `@react-native-google-signin/google-signin` for OAuth tokens used with calendar flows (`app/(onboarding)/calendar.tsx`, `src/components/calendar/CalendarSettingsSection.tsx`, configure in `app/_layout.tsx`). iOS URL scheme placeholder in `app.json` plugin config.
- **Sign in with Apple** — `expo-apple-authentication` + Supabase `signInWithIdToken` (`src/lib/supabase/auth.ts`).

**Enterprise HTTP API (optional product surface):**
- **ShiftWell Enterprise API** — Express app `api/src/app.ts`: **`GET /health`**, **`POST /oauth/token`** (client_credentials stub for dev), **`/v1/schedules`**, **`/v1/outcomes`** (routers under `api/src/routes/`). JWT verification via **`jose`** and env **`JWT_PUBLIC_KEY`** (see `api/src/middleware/auth.ts`). Test override **`TEST_JWT_SECRET`**.

## Data Storage

**Databases:**
- **Supabase (PostgreSQL)** — Schema evolution via `supabase/migrations/` (initial schema, AI request log, RLS, audit logs, RPCs, indexes). Typed access: `src/lib/supabase/database.types.ts`.

**File Storage:**
- Local/device via **expo-file-system**, **expo-document-picker**, **expo-sharing**; no third-party blob SDK detected in manifests.

**Caching:**
- **AsyncStorage** (`@react-native-async-storage/async-storage`) — Used in app (metro mocks for Expo Go); not a remote cache.

## Authentication & Identity

**Auth Provider:**
- **Supabase Auth** — Email/password and Apple (`src/lib/supabase/auth.ts`). Session storage: secure device storage adapter.

**Enterprise tokens:**
- Bearer JWTs validated with RS256 public key from **`JWT_PUBLIC_KEY`** or test paths (`api/src/middleware/auth.ts`).

## Monitoring & Observability

**Error Tracking:**
- **Sentry** — See stack doc; disabled in `__DEV__` (`enabled: !__DEV__` in `src/lib/monitoring/sentry.ts`).

**Logs:**
- Console logging in HealthKit and feedback paths; **PostHog** for product analytics (not log shipping).

## CI/CD & Deployment

**Hosting:**
- Mobile: **EAS Build** (`eas.json`). Edge: **Supabase Functions** (Deno). API package is Node/Express — deployment target not defined in-repo.

**CI Pipeline:**
- Not detected in this exploration (no `.github/workflows` audit).

## Environment Configuration

**Required env vars (names only, from docs/code):**
- **Client (Expo):** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_SENTRY_DSN`.
- **Supabase (secrets):** `ANTHROPIC_API_KEY` (Edge Function).
- **Enterprise API:** `JWT_PUBLIC_KEY`; tests/dev: `TEST_JWT_SECRET`, `NODE_ENV`.

**Secrets location:**
- Production secrets expected in Supabase dashboard / EAS; `.env` files locally (existence only — not read).

## Webhooks & Callbacks

**Incoming:**
- Edge Function HTTP handler for Claude proxy (Supabase-invoked URL pattern standard for Supabase Functions).

**Outgoing:**
- App calls Supabase REST/RPC, Anthropic (via proxy), PostHog, Sentry, RevenueCat, Google OAuth endpoints as driven by SDKs.

## Apple HealthKit

**Integration:**
- **`@kingstinct/react-native-healthkit`** — Sleep, HRV, biometrics (`src/lib/healthkit/healthkit-service.ts`, `hrv-reader.ts`, `biometric-reader.ts`). iOS entitlements and usage strings in `app.json`.

---

*Integration audit: 2026-05-05*
