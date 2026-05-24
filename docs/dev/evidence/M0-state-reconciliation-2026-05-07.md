# M0 State Reconciliation Evidence Bundle

Date: 2026-05-07
Runner: Codex
Branch: `fix/01-ui-cleanup`
Head: `96d382d436ec0887d55bd69ea42caa0b670c8260`
Node: `v24.14.1`
npm: `11.12.1`

## Phase

M0 State Reconciliation

Goal: establish runtime truth before deciding what is actually blocking TestFlight.

## Scope Summary

This pass reconciled current repo state, dirty worktree, tests, TypeScript, Expo/EAS config, launch docs, and major integrations: Sentry, PostHog, Supabase, RevenueCat, HealthKit, Apple Developer/App Store Connect, and enterprise API.

No product code was changed during this evidence pass.

## Current Worktree

`git status --short` at start of M0 showed:

```text
 M CLAUDE.md
 M __tests__/adaptive/autopilot.test.ts
 M __tests__/circadian/sleep-windows.test.ts
 M __tests__/lib/circadian/prediction-engine.test.ts
 M __tests__/store/plan-store.test.ts
 M docs/PROGRESS-DASHBOARD.md
 M src/components/today/AdaptiveInsightCard.tsx
 M src/lib/adaptive/autopilot.ts
 M src/lib/circadian/index.ts
 M src/lib/circadian/prediction-engine.ts
 M src/lib/circadian/sleep-windows.ts
 M src/lib/circadian/types.ts
 M src/store/plan-store.ts
?? .planning/codebase/
?? .planning/phases/01-foundation-onboarding/01-UI-REMEDIATION-PROPOSAL.md
?? .planning/ui-reviews/
?? AGENTS.md
?? COMPETITIVE-RESPONSE-2026-04-21.md
?? SHIPPING.md
?? docs/business/LLC-NAME-DECISION-2026-04-20.md
?? docs/design/STITCH-PROMPT-2026-04-20.md
?? docs/dev/PHASE_ACCEPTANCE_GATES.md
?? docs/research/RESEARCH-KNOWLEDGEBASE-PROGRAM-2026-05-07.md
?? docs/research/evidence-ledgers/
?? docs/superpowers/plans/2026-05-07-ship-learn-ai-growth.md
?? docs/superpowers/specs/2026-05-07-ship-learn-ai-growth-design.md
?? docs/vision/FUTURE_IDEAS.md
```

Classification:

- Adaptive autopilot code/tests are prior active implementation work, already verified separately by full Jest.
- Governance docs are new project-control artifacts from the Ship-Learn-AI kickoff.
- `.planning/codebase/` and `.planning/ui-reviews/` are generated audit/review artifacts and should be committed or archived intentionally.
- External product/launch docs such as `SHIPPING.md`, `AGENTS.md`, and LLC/competitive/design docs are untracked and need a separate commit hygiene pass before TestFlight.

## Commands Run

### Root Jest

Command:

```bash
npm test -- --runInBand
```

Result: PASS

```text
Test Suites: 71 passed, 71 total
Tests:       1062 passed, 1062 total
Snapshots:   0 total
Time:        2.815 s, estimated 8 s
Ran all test suites.
```

### Root TypeScript

Command:

```bash
./node_modules/.bin/tsc --noEmit --pretty false
```

Result: FAIL

Representative blockers:

```text
app/index.tsx(14,22): error TS2345: Argument of type '"/onboarding"' is not assignable...
app/paywall.tsx(247,52): error TS2339: Property 'id' does not exist on type 'UserProfile'.
dashboard/app/facilities/page.tsx(36,8): error TS2307: Cannot find module 'recharts'...
shiftwell-dashboard/next.config.ts(1,33): error TS2307: Cannot find module 'next'...
src/components/ErrorBoundary.tsx(56,16): error TS2322: Type '(props: FallbackProps) => React.JSX.Element' is not assignable...
src/lib/analytics/events.ts(94,22): error TS2345: Argument of type 'Record<string, unknown>' is not assignable...
src/lib/monitoring/sentry.ts(62,5): error TS2322: Type '(event: Event) => Event | null' is not assignable...
supabase/functions/claude-proxy/index.ts(90,1): error TS2304: Cannot find name 'Deno'.
```

Root cause grouping:

- App-scope typed-route issue: `app/index.tsx` routes to `"/onboarding"` but the router tree exposes grouped onboarding routes.
- App-scope profile typing issue: paywall/referral logic expects `profile.id`, but `UserProfile` in `src/lib/circadian/types.ts` has no `id`.
- Sentry SDK type drift: `ErrorBoundary` and `beforeSend` signatures no longer match current `@sentry/react-native` types.
- Analytics event property typing: `unknown` properties do not satisfy PostHog JSON property type.
- Pattern alert enum/template drift.
- Dashboard packages are included by root `tsconfig.json` but dashboard dependencies/types are not present in root.
- Supabase Edge Function Deno imports are included by root `tsconfig.json`, which is not configured for Deno URL imports or global `Deno`.

### API Jest

Initial sandboxed command:

```bash
npm --prefix api test -- --runInBand
```

Sandbox result: FAIL with local socket permission denial.

```text
Error: listen EPERM: operation not permitted 0.0.0.0
```

Approved outside-sandbox rerun:

```bash
npm --prefix api test -- --runInBand
```

Result: PASS

```text
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        0.441 s, estimated 1 s
Ran all test suites.
```

### API Runtime Start

Command:

```bash
npm --prefix api start
```

Result: FAIL

```text
Error: Cannot find module './index.ts'
Require stack:
- /Users/sima/Projects/ShiftWell/api/src/imaginaryUncacheableRequireResolveScript
```

Confirmed cause:

- `api/package.json` points `"main"` and `"start"` at `src/index.ts`.
- `api/src/index.ts` does not exist.
- `api/src/app.ts` contains the Express app factory used by tests.

### Expo Config

Command:

```bash
./node_modules/.bin/expo --version
```

Result:

```text
55.0.16
```

Command:

```bash
./node_modules/.bin/expo config --type public
```

Result: PASS

Findings:

- Expo SDK: `55.0.0`
- App version: `1.0.0`
- Bundle ID: `com.shiftwell.app`
- HealthKit entitlements present.
- Privacy accessed API manifest present.
- Sentry Expo plugin configured but uses placeholder `organization: YOUR_ORG_SLUG`.
- Google Sign-In plugin uses placeholder `iosUrlScheme: com.googleusercontent.apps.PLACEHOLDER_CLIENT_ID`.
- Local `.env` was detected by Expo config and exported Supabase/RevenueCat public variables only.

### Expo Doctor

Command:

```bash
npx --no-install expo-doctor
```

Result: INCONCLUSIVE

The command produced no output after a reasonable wait and was terminated. `expo-doctor` is not installed under `node_modules/.bin`; only `expo`, `expo-modules-autolinking`, `sentry-expo-upload-sourcemaps`, and `tsc` are present.

### Dependency Presence

Command:

```bash
npm ls expo @supabase/supabase-js posthog-react-native @sentry/react-native react-native-purchases @kingstinct/react-native-healthkit --depth=0
```

Result: PASS

```text
@kingstinct/react-native-healthkit@13.3.1
@sentry/react-native@6.22.0
@supabase/supabase-js@2.99.1
expo@55.0.6
posthog-react-native@3.16.1
react-native-purchases@9.12.0
```

## Integration State

### Sentry

Status: Wired but not production-verified.

Evidence:

- `src/lib/monitoring/sentry.ts` initializes `@sentry/react-native`.
- `app/_layout.tsx` calls `initSentry()` and exports `Sentry.wrap(RootLayout)`.
- `src/components/ErrorBoundary.tsx` wraps the root tree.

Blockers:

- `EXPO_PUBLIC_SENTRY_DSN` is required but not listed in `.env.example`.
- Expo plugin still has placeholder `YOUR_ORG_SLUG`.
- Sentry types currently fail TypeScript.
- No controlled production event ID captured in this pass.

### PostHog

Status: Wired but not production-verified.

Evidence:

- `AnalyticsProvider` exists in `src/lib/analytics/posthog.tsx`.
- `app/_layout.tsx` wraps the app in `AnalyticsProvider`.
- Event constants exist in `src/lib/analytics/events.ts`.

Blockers:

- `expo config --type public` did not report `EXPO_PUBLIC_POSTHOG_KEY`; provider silently disables instrumentation if absent.
- Event property typing fails TypeScript.
- No live event proof captured in this pass.

### Supabase

Status: Wired but not deployment-verified.

Evidence:

- `src/lib/supabase/client.ts` creates a typed Supabase client with secure-store session persistence.
- `src/lib/supabase/auth.ts` supports Apple ID token auth and email/password auth.
- Migrations exist under `supabase/migrations/`.
- Edge Function exists under `supabase/functions/claude-proxy/index.ts`.

Blockers:

- Edge Function is included in root TypeScript and fails due Deno imports/globals.
- No Supabase deployment/smoke proof captured.
- Previous UAT audit says `delete_user` RPC SQL exists in docs but deployment not proven.

### RevenueCat

Status: SDK wired but not purchase-verified.

Evidence:

- `src/lib/premium/premium-service.ts` configures `react-native-purchases` with `EXPO_PUBLIC_REVENUECAT_API_KEY`.
- Purchase, restore, customer info, entitlement extraction, and listener functions exist.
- Dependency installed at `react-native-purchases@9.12.0`.

Blockers:

- No sandbox purchase/restore proof captured.
- `.env.example` uses placeholder value.
- App Store subscription metadata not verified.

### HealthKit

Status: Configured and implemented, but hardware/TestFlight verification pending.

Evidence:

- `app.json` includes HealthKit entitlements and usage strings.
- `@kingstinct/react-native-healthkit` plugin is configured.
- `src/lib/healthkit/healthkit-service.ts` requests sleep, HRV, resting HR, wrist temperature, and step count reads.
- `getSleepHistory()` and related readers exist.

Blockers:

- Real HealthKit data flow needs physical iPhone/Apple Watch and TestFlight/dev build.
- UAT audit flags HealthKit and device lifecycle tests as pending.

### Apple Developer / App Store Connect / EAS Submit

Status: Externally blocked.

Evidence:

- `eas.json` production profile exists for `com.shiftwell.app`.
- `eas.json` submit profile has empty `appleId`, `ascAppId`, and `appleTeamId`.
- Launch guide exists at `docs/launch/LAUNCH_GUIDE.md`.
- UAT audit lists LLC, D-U-N-S, Apple Developer enrollment, App Store Connect, and TestFlight as external gates.

Blockers:

- LLC filing not started.
- D-U-N-S pending after LLC.
- Apple Developer enrollment pending.
- App Store Connect app record pending.
- EAS submit credentials empty.

## Stale Or Conflicting Docs

- `CLAUDE.md` previously pointed to missing `docs/launch/LAUNCH_CHECKLIST.md`; this has been corrected to `docs/launch/LAUNCH_GUIDE.md`.
- `tasks/todo.md` remains last edited 2026-04-20 and still lists many P0 UI/premium tasks as active.
- `.planning/v1.1-UAT-AUDIT.md` is still useful and identifies unresolved human/device/external UAT gates.
- `.planning/codebase/CONCERNS.md` correctly flags the API entry mismatch and Live Activity native stubs.
- `docs/launch/LAUNCH_GUIDE.md` is dated 2026-04-05 and should be refreshed against current Apple/EAS setup before App Store Connect work.

## Blocker Ranking

### P0: Blocks TestFlight MVP Cut

1. Root TypeScript fails in app-scope production surfaces:
   - `app/index.tsx` typed route mismatch.
   - `app/paywall.tsx` / referral code expect `UserProfile.id`.
   - Sentry SDK type drift in `src/components/ErrorBoundary.tsx` and `src/lib/monitoring/sentry.ts`.
   - PostHog event property typing.
2. Root TypeScript scope includes dashboard and Supabase Edge Function files that are not compatible with the root Expo app `tsconfig`.
3. App production placeholders remain:
   - Google Sign-In `PLACEHOLDER_CLIENT_ID`.
   - Sentry plugin `YOUR_ORG_SLUG`.
   - EAS submit `appleId`, `ascAppId`, `appleTeamId` empty.
4. Onboarding/first-run production path needs confirmation:
   - UAT audit previously called out `app/index.tsx` dev seed/onboarding bypass; current file routes to `/onboarding`, which also fails typed routes.
5. No simulator/device screenshot evidence exists for the M1 core path in this bundle.

### P1: Blocks Full Pilot Quality But Not Initial Code Triage

1. API runtime start command points to missing `api/src/index.ts`; API Jest passes outside sandbox.
2. HealthKit real data, Sleep Focus/DND, notification lifecycle, Google Calendar OAuth, and device lifecycle tests require real device/TestFlight.
3. Sentry/PostHog/Supabase/RevenueCat are wired but lack live proof.
4. Live Activity native path is stubbed and should remain out of MVP claims unless implemented.
5. `expo-doctor` was inconclusive because the command hung and the package is not installed locally.

### P2: External/Human Gates

1. LLC name and filing.
2. D-U-N-S.
3. Apple Developer Program enrollment.
4. App Store Connect app record.
5. App Store screenshots/metadata/privacy labels.
6. RevenueCat/App Store subscription product configuration.
7. Real pilot cohort definition.

## Recommended Next Executable Phase

Proceed to an M1 TestFlight MVP Cut preparation slice only after a focused P0 TypeScript/config cleanup plan is written.

Recommended immediate slice:

1. Fix or scope root TypeScript so the Expo app can be checked independently from dashboard and Deno Edge Function code.
2. Fix app-scope TypeScript blockers:
   - typed route for onboarding entry.
   - profile identity source for paywall/referral experiments.
   - Sentry SDK signature drift.
   - PostHog event property typing.
3. Replace or gate production placeholders:
   - Google iOS client ID.
   - Sentry org/project config.
   - EAS submit credentials after Apple account exists.
4. Run M1 simulator UAT for onboarding, schedule setup, plan generation, Today, feedback, settings, and paywall if included.

Research lane can run in parallel, but it should not block the M1 cleanup unless it changes public claims, algorithm validation, or App Store copy.

## Claude Review Attempt

Command:

```bash
claude -p "Review the ShiftWell M0 evidence bundle at docs/dev/evidence/M0-state-reconciliation-2026-05-07.md..."
```

Result: BLOCKED by provider-side rate limit.

```text
API Error: Server is temporarily limiting requests (not your usage limit) · Rate limited
```

Action required: rerun Claude verification when the rate limit clears, then update the signoff section below.

## Signoff

- Codex: PASS for M0 evidence capture, date 2026-05-07.
- Claude: PASS, evidence reviewed at `docs/dev/evidence/M0-state-reconciliation-2026-05-07.md`, date 2026-05-07.

  Re-verification (HEAD `96d382d436ec0887d55bd69ea42caa0b670c8260`, run by Claude Opus 4.7 in plan-then-execute mode):

  - `git status --short` → matches M0 snapshot (13 modified, ~16 untracked, including `?? docs/dev/PHASE_ACCEPTANCE_GATES.md` and `?? docs/dev/evidence/`). ✓
  - `git rev-parse HEAD` → `96d382d436ec0887d55bd69ea42caa0b670c8260`. ✓
  - `npm test -- --runInBand` → 71 suites / 1062 tests PASS in 3.156 s. ✓
  - `./node_modules/.bin/tsc --noEmit --pretty false` → FAIL, 71 error lines. Bucket histogram: TS2307×15, TS7006×13, TS2339×6, TS2322×6, TS2304×4, TS2345×2, TS7053×1, TS5097×1, TS2353×1. All 7 Codex-classified categories reproduced (route, UserProfile.id, Sentry, PostHog, pattern-alert, dashboard externals, Deno). ✓
  - `npm --prefix api test -- --runInBand` → 17 tests PASS. ✓
  - `./node_modules/.bin/expo config --type public` → PASS, `YOUR_ORG_SLUG` + `PLACEHOLDER_CLIENT_ID` placeholders confirmed present in resolved config. ✓
  - `git diff --check` → clean. ✓

  Two findings outside Codex's representative bucket list (pre-existing, not classified P0; recommended as out-of-scope residuals for an M1 P0 follow-up cycle):
  - `src/i18n/index.ts(9,69)` — Spanish locale literal types don't match English (`"Bienvenido a ShiftWell"` ≠ `"Welcome to ShiftWell"` etc.). Likely needs widening locale value types from string-literal unions to `string`.
  - `src/lib/growth/paywall-experiment.ts(53,10)` — TS7053: `Variant` type can index `"C"` but `Record<"A" | "B", PaywallVariant>` only declares A and B. Either narrow `Variant` or extend the record.

  One scope refinement for the M1 P0 plan (does not change M0 verdict): the UserProfile.id TS2339 errors live in `src/components/ui/ReferralCard.tsx` lines 30/31/33 — not `src/lib/growth/referral.ts`. Same fix pattern (pull `userId` from `auth-store`).

- Lead Engineer: PENDING (Sim signoff required to advance to M1).
- Agents: N/A (no subagent reviewers used during M0 capture).
