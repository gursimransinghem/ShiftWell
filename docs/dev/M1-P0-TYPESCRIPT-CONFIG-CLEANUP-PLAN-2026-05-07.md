# ShiftWell M1 P0 — TypeScript & Production Config Cleanup Plan

**Date:** 2026-05-07
**Phase:** M1 (TestFlight MVP Cut) — pre-build P0 cleanup slice
**Author:** Claude (Opus 4.7), reviewing Codex's M0 evidence bundle
**Reviewer:** Codex (out-of-band, after execution)
**Approver:** Sim (Lead Engineer)
**M0 evidence:** `docs/dev/evidence/M0-state-reconciliation-2026-05-07.md` — re-verified PASS on 2026-05-07
**Source HEAD at plan time:** `96d382d436ec0887d55bd69ea42caa0b670c8260`

---

## Why this exists

M0 closed with `tsc --noEmit` failing across 7 classified bucket categories that block any clean iOS build. EAS build will compile the JS via Metro/Babel regardless of TS errors, but: (a) typed-routes lives at the boundary between TS compile and runtime — wrong route literal becomes a runtime crash, (b) Sentry/PostHog instrumentation mis-typed will silently degrade or skip events, (c) the UserProfile.id mismatch already silently coalesces via `?? ''`, masking auth state bugs. M1 P0 closes these *before* a TestFlight build, not after.

This plan is **decision-complete** — every slice has a fix locked in, no design choices left for execution time.

---

## Order of execution (fixed dependency chain)

1. **Slice 0** — Working baseline guard (no code; verifies WIP disjointness per slice)
2. **Slice 1** — Scope root tsconfig (drops dashboard + supabase/functions noise; instantly clears TS2307 + TS2304 buckets so subsequent slices have less noise to grep through)
3. **Slice 2** — Sentry SDK type drift
4. **Slice 3** — PostHog event property typing
5. **Slice 4** — UserProfile identity surface (paywall + ReferralCard)
6. **Slice 5** — `app/index.tsx` typed route literal (must run AFTER Slice 1 so tsc output is clean enough to read the route suggestion)
7. **Slice 6** — Pattern alert enum/template drift
8. **Slice 7** — API runtime entry (`api/src/index.ts`)
9. **Slice 8** — Production placeholders (DOCUMENT ONLY — does not block this cycle)

Each slice is independently committable. Each runs verification before declaring slice PASS, and the next slice does not start until the previous is PASS or RESOLVED-BY-CLASSIFICATION.

---

## Hard constraints (locked by Sim)

- No `git push`. No commits unless Sim explicitly requests.
- No file deletions.
- No spending. No accepting third-party terms.
- Scope strictly to the 7 Codex-classified P0 buckets (and Slice 7's API entry, included at user direction). The 2 residual TS errors found during M0 re-verification (i18n locale literals, `paywall-experiment.ts` Variant 'C' indexing) are **out of scope** for this cycle.
- **Preserve unrelated dirty WIP** — the 13 modified adaptive/circadian files from M0's `git status` must not pick up new modifications. Slice 0 enforces this as a per-slice guard.
- M0 evidence file is edited only in the `## Signoff` block (already done as part of this cycle).
- **Prohibition:** `src/lib/circadian/types.ts` is NOT edited (Slice 4 prohibition).
- **Implementer:** Claude Code owns every code fix in this plan. Codex reviews after the fact (out-of-band second-opinion). Sim owns external credential creation in Slice 8.

---

## Slice 0 — Working baseline guard

**Files touched:** none.
**Intended fix:** decision-only. Sim's directive locked in "preserve unrelated dirty work." This slice formalizes the guard.

**Acceptance:** after every subsequent slice, the slice's `git diff --name-only` delta is intersected with the WIP path list:

```
__tests__/adaptive/autopilot.test.ts
__tests__/circadian/sleep-windows.test.ts
__tests__/lib/circadian/prediction-engine.test.ts
__tests__/store/plan-store.test.ts
docs/PROGRESS-DASHBOARD.md
src/components/today/AdaptiveInsightCard.tsx
src/lib/adaptive/autopilot.ts
src/lib/circadian/index.ts
src/lib/circadian/prediction-engine.ts
src/lib/circadian/sleep-windows.ts
src/lib/circadian/types.ts
src/store/plan-store.ts
CLAUDE.md
```

If any slice's diff intersects with that list (beyond the WIP modifications already present at slice start), halt and report.

**Verification:**
```bash
git diff --name-only | grep -F -f /tmp/wip-paths.txt
```
Empty result = guard held.

**Implementer:** Claude (executes the check; no edits).

---

## Slice 1 — Scope root tsconfig

**Files:** `tsconfig.json`

**Intended fix:** add an `exclude` array. The current root config inherits `expo/tsconfig.base` and includes `**/*.ts` + `**/*.tsx` from the working directory, which sweeps in the gitignored `dashboard/` Next.js project, the standalone `shiftwell-dashboard/` sibling, the Deno-flavored `supabase/functions/` edge functions, and the `_archive/` historical tree. None of these compile against the Expo app's Metro/React-Native typing context.

After fix, root tsconfig becomes:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "dashboard",
    "shiftwell-dashboard",
    "supabase/functions",
    "_archive"
  ]
}
```

(`node_modules` is already excluded by `expo/tsconfig.base` — no need to redeclare.)

**Acceptance criteria:**
- Zero `TS2307` errors mentioning `recharts` or `next/*` modules.
- Zero `TS2304 Cannot find name 'Deno'` errors.
- Zero `TS5097` errors (the `.ts` extension import warning was Deno-flavored too).
- Zero TS errors on any file path under `dashboard/`, `shiftwell-dashboard/`, or `supabase/functions/`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -cE "TS230(4|7)|TS5097"
# expected: 0

./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -cE "(dashboard/|shiftwell-dashboard/|supabase/functions/)"
# expected: 0
```

**Implementer:** Claude.

---

## Slice 2 — Sentry SDK type drift

**Files:**
- `src/lib/monitoring/sentry.ts` (~lines 62-65 — `beforeSend` and `beforeBreadcrumb` callbacks)
- `src/components/ErrorBoundary.tsx` (~line 56 + 71 — fallback render prop + onError signature)

**Installed SDK:** `@sentry/react-native@6.22.0` (confirmed by M0 dependency check).

**Drift detected by tsc (verbatim from `/tmp/sw-tsc-pre.log`):**
```
src/lib/monitoring/sentry.ts(62,5): error TS2322:
  Type '(event: Event) => Event | null' is not assignable to type
  '(event: ErrorEvent, hint: EventHint) => ErrorEvent | PromiseLike<ErrorEvent | null> | null'.

src/lib/monitoring/sentry.ts(63,5): error TS2322:
  Type '(breadcrumb: { [key: string]: unknown; category?: string | undefined; }) => ... | null'
  is not assignable to type '(breadcrumb: Breadcrumb, hint?: BreadcrumbHint | undefined) => Breadcrumb | null'.

src/components/ErrorBoundary.tsx(56,16): error TS2322:
  Type '(props: FallbackProps) => React.JSX.Element' is not assignable to type
  '... | FallbackRender | undefined'.
  Types of property 'error' are incompatible. Type 'unknown' is not assignable to type 'Error'.

src/components/ErrorBoundary.tsx(71,7): error TS2322:
  Type '(error: Error, componentStack: string | null) => void' is not assignable to type
  '(error: unknown, componentStack: string | undefined, eventId: string) => void'.
```

**Intended fix:**

In `src/lib/monitoring/sentry.ts`:
- Import `ErrorEvent`, `EventHint`, `Breadcrumb`, `BreadcrumbHint` types from `@sentry/react-native`.
- Retype `scrubEvent` parameter from `Event` to `ErrorEvent`, return `ErrorEvent | null`.
- Retype the `beforeBreadcrumb` parameter from the loose `{ [key: string]: unknown; category?: string }` to `Breadcrumb` (and add the optional `hint?: BreadcrumbHint` second param if used).

In `src/components/ErrorBoundary.tsx`:
- Update fallback render prop signature from `(props: FallbackProps) => JSX.Element` to match the SDK's exported `FallbackRender` shape: `({ error, componentStack, eventId, resetError }) => JSX.Element` where `error: unknown` (not `Error`). Cast or narrow to `Error` inside the body if needed.
- Update `onError` callback signature from `(error: Error, componentStack: string | null) => void` to `(error: unknown, componentStack: string | undefined, eventId: string) => void`.

**Acceptance:**
- Zero TS2322 errors on `src/lib/monitoring/sentry.ts` or `src/components/ErrorBoundary.tsx`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -cE "(src/lib/monitoring/sentry|src/components/ErrorBoundary)"
# expected: 0
```

**Implementer:** Claude. Codex reviews after.

---

## Slice 3 — PostHog event property typing

**Files:** `src/lib/analytics/events.ts`

**Drift detected by tsc:**
```
src/lib/analytics/events.ts(94,22): error TS2345:
  Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'PostHogEventProperties'.
  'string' index signatures are incompatible.
    Type 'unknown' is not assignable to type 'JsonType'.
```

**Intended fix:** PostHog v3 expects JSON-serializable properties. Replace the `unknown` value type with a JSON union. Two paths — pick whichever the installed `posthog-react-native@3.16.1` supports:

Path A (preferred — use SDK's exported type):
```ts
import type { PostHogEventProperties, JsonType } from 'posthog-react-native';

export function setSuperProperties(properties: PostHogEventProperties): void {
  _posthog?.register(properties);
}
```

Path B (fallback — define our own):
```ts
type AnalyticsValue = string | number | boolean | null | AnalyticsValue[] | { [k: string]: AnalyticsValue };
type AnalyticsProperties = Record<string, AnalyticsValue>;

export function setSuperProperties(properties: AnalyticsProperties): void {
  _posthog?.register(properties);
}
```

Apply to every public function feeding PostHog: `setSuperProperties`, the `traits` arg of `identifyUser`, and any event-capture helpers.

**Acceptance:** zero TS2345 errors mentioning `src/lib/analytics/events.ts`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -c "src/lib/analytics/events.ts"
# expected: 0
```

**Implementer:** Claude.

---

## Slice 4 — UserProfile identity surface (LOCKED to Option B)

**Files:**
- `app/paywall.tsx` (line 247 — `getPaywallVariant(profile.id ?? '')`)
- `src/components/ui/ReferralCard.tsx` (lines 30/31/33 — three `.id` accesses)
- Possibly `src/lib/growth/referral.ts` (if it consumes UserProfile.id; verified during execution)

**Strict prohibition:** `src/lib/circadian/types.ts` is **NOT** edited. UserProfile is an algorithm input shape; identity flows separately from auth.

**Identity source:** `src/store/auth-store.ts` exports `userId: string | null` (verified at line 17). Consume via:
```ts
import { useAuthStore } from '@/src/store/auth-store';

const userId = useAuthStore((s) => s.userId);
```

**Intended fix:**

In `app/paywall.tsx` (line 247):
```ts
// before:
const paywallVariant = getPaywallVariant(profile.id ?? '');

// after:
const userId = useAuthStore((s) => s.userId);
const paywallVariant = getPaywallVariant(userId ?? '');
```
(The `?? ''` fallback preserves the existing experiment-hash behavior for unauthed users — same hashing input space as before.)

In `src/components/ui/ReferralCard.tsx` (lines 30/31/33):
- Replace each `profile.id` access with the auth-store `userId`. Same `useAuthStore((s) => s.userId)` selector at the top of the component.

In `src/lib/growth/referral.ts` (if applicable): if any function takes a `UserProfile` and reads `.id`, refactor to take `userId: string | null` as a separate arg passed in by the React-side caller. No type mutation on `UserProfile`.

**Acceptance:**
- Zero `TS2339` errors of form `Property 'id' does not exist on type 'UserProfile'`.
- `git diff --name-only` does NOT include `src/lib/circadian/types.ts`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -c "Property 'id' does not exist on type 'UserProfile'"
# expected: 0

git diff --name-only | grep -Fc 'src/lib/circadian/types.ts'
# expected: 0
```

**Implementer:** Claude.

---

## Slice 5 — `app/index.tsx` typed route literal (proof-driven)

**Files:** `app/index.tsx` (line 14 only)

**Drift detected by tsc:**
```
app/index.tsx(14,22): error TS2345: Argument of type '"/onboarding"' is not assignable...
```

**Context:** `experiments.typedRoutes: true` (app.json). The onboarding flow is a route group `app/(onboarding)/` with `welcome.tsx` as the entry. Expo Router strips groups from URLs but typed routes preserve them as one of multiple valid literal forms.

**Fix protocol (proof-driven, not guessed):**

1. After Slice 1 lands, run:
   ```bash
   ./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -A 4 "app/index.tsx" > /tmp/route-error.log
   cat /tmp/route-error.log
   ```
   Expo Router's typed-route error message lists the union of valid `Href` literals. The `(onboarding)` group children show up as both `'/(onboarding)/welcome'` (with explicit group syntax) and `'/welcome'` (group stripped).

2. Pick the literal matching the welcome screen. Most likely `'/(onboarding)/welcome'` (Expo's convention with grouped routes is to require the explicit group when there's ambiguity, e.g., another `/welcome` doesn't exist at root level).

3. Edit `app/index.tsx` line 14 with the chosen literal.

4. Re-run tsc, confirm `app/index.tsx` has zero errors.

5. If the chosen literal still fails, pick the next suggestion from `/tmp/route-error.log` and retry. Cap at 2 attempts. If both fail, BLOCK and surface the literal candidates for Sim.

**Acceptance:** zero TS2345 errors on `app/index.tsx`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -c "app/index.tsx"
# expected: 0
```

**Implementer:** Claude.

---

## Slice 6 — Pattern alert enum/template drift

**Files:**
- `src/lib/patterns/alert-generator.ts` (line 71 — TS2353 confirmed)
- `src/lib/patterns/types.ts` (the `PatternType` union — read first to understand drift)
- Possibly `src/store/pattern-store.ts`, `src/components/today/PatternAlertCard.tsx`, `app/(tabs)/index.tsx`, `src/components/today/WellnessCard.tsx`

**Drift detected by tsc:**
```
src/lib/patterns/alert-generator.ts(71,3): error TS2353:
  Object literal may only specify known properties, and ''shift-transition-cluster'' does not exist
  in type 'Partial<Record<PatternType, AlertTemplate>>'.
```

**Intended fix:**

1. Read `src/lib/patterns/types.ts` to enumerate the current `PatternType` values.
2. Decide: is `'shift-transition-cluster'` a valid pattern that was added to the generator before being added to the type? OR was it renamed/removed from the type and the generator still references the old name?
3. If it's a missing-from-type case: add `'shift-transition-cluster'` to the `PatternType` union in `types.ts` (this is *type-source* drift; producer is canonical).
4. If it's a typo / rename: change the generator's literal to match the canonical name in `types.ts`.

**Decision rule:** the algorithm canonical types live in `src/lib/patterns/types.ts`. If the generator's intent is to produce a new pattern, the type union must learn about it (extend types.ts). If the generator has a stale reference, the generator is fixed (no types.ts edit). Read the generator's surrounding code (`alert-generator.ts:60-90`) to determine intent.

After fix, also confirm consumers (`pattern-store.ts`, `PatternAlertCard.tsx`, `app/(tabs)/index.tsx`) still compile — adding a new enum value can break exhaustive switch statements.

**Acceptance:** zero TS errors mentioning `patterns/` or `PatternAlert`.

**Verification:**
```bash
./node_modules/.bin/tsc --noEmit --pretty false 2>&1 | grep -cE "(patterns/|PatternAlert)"
# expected: 0
```

**Implementer:** Claude.

---

## Slice 7 — API runtime entry

**Codex original ranking:** P1. **Included at user direction (Sim's prompt explicitly named it as M1 P0 scope).**

**Files:** NEW `api/src/index.ts` (10 lines).

**Why a new file (not a `package.json` retarget):** `api/src/app.ts` exports a `buildApp()` factory only — no `app.listen()`. Retargeting `main`/`start` to `app.ts` would still fail at runtime. Creating a thin entry separates app composition from process startup, which is also the right shape for testing (Jest already imports `buildApp` directly).

**Intended fix:** create `api/src/index.ts`:
```ts
import { buildApp } from './app';

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`shiftwell-enterprise-api on :${port}`);
});
```

**Acceptance:** `npm --prefix api start` boots within 5 s and prints the boot log line. Process is killed by the perl alarm wrapper (no leftover port bind).

**Verification (perl alarm — macOS lacks GNU `timeout` by default):**
```bash
cd /Users/sima/Projects/ShiftWell/api && \
perl -e 'alarm shift; exec @ARGV' 5 npm start 2>&1 | tee /tmp/sw-api-boot.log
grep -c "shiftwell-enterprise-api on :" /tmp/sw-api-boot.log
# expected: 1
```

(Perl's `alarm` sends SIGALRM after the configured seconds; npm exits non-zero, but stdout-grep is the truth.)

**Implementer:** Claude.

---

## Slice 8 — Production placeholders (DOCUMENT, do not change)

**Files (read-only this cycle):**
- `app.json` plugin section: Sentry `organization: 'YOUR_ORG_SLUG'`, Google Sign-In `iosUrlScheme: 'com.googleusercontent.apps.PLACEHOLDER_CLIENT_ID'`
- `eas.json` submit profile: empty `appleId`, `ascAppId`, `appleTeamId`

**Two-gate framing (per Sim's directive):**

| Gate | Blocked by placeholders? |
|------|--------------------------|
| M1 P0 TypeScript & config cleanup (this plan) | NO — TS errors don't depend on these values |
| M1 milestone close (real TestFlight build) | YES — every placeholder must resolve before EAS submit |

**Build-gate dependency map** (cross-referenced to `tasks/todo.md` P2):

| Placeholder | External account/action needed | Tracked in |
|-------------|--------------------------------|------------|
| `app.json` Sentry `organization: YOUR_ORG_SLUG` | Provision Sentry org + project; copy the org slug | `tasks/todo.md` (currently no item — recommend adding) |
| `app.json` Google `iosUrlScheme: PLACEHOLDER_CLIENT_ID` | Create Google Cloud Console OAuth iOS client; copy the reverse-DNS scheme | `tasks/todo.md` P2 (Apple-related, indirectly) |
| `eas.json` `submit.production.ios.appleId` | Apple Developer account exists | `tasks/todo.md` P2 — Apple Developer enrollment |
| `eas.json` `submit.production.ios.ascAppId` | App Store Connect app record created | `tasks/todo.md` P2 — App Store Connect account active |
| `eas.json` `submit.production.ios.appleTeamId` | Apple Team ID visible in Apple Developer portal | `tasks/todo.md` P2 — Apple Developer enrollment |

All Apple-related items further depend on LLC + D-U-N-S, both also tracked in `tasks/todo.md` P2.

**This cycle's action:** none. Placeholders remain in tree.

**Acceptance:**
- `git diff --name-only -- app.json eas.json` returns empty.
- This Slice 8 documentation is preserved in the M1 P0 evidence artifact (Step G of the parent plan).

**Implementer:** Sim provides credentials in a separate cycle. Claude swaps the strings then.

---

## Final verification (after Slices 0-7 close)

Per Sim's required suite, run all 6 in order, capture output:

| # | Command | Expected |
|---|---------|----------|
| 1 | `npm test -- --runInBand` | 71 suites / 1062 PASS (regression check) |
| 2 | `./node_modules/.bin/tsc --noEmit --pretty false` | Zero errors in the 7 Codex P0 buckets |
| 3 | `npm --prefix api test -- --runInBand` | 17 PASS |
| 4 | `./node_modules/.bin/expo config --type public` | PASS, placeholders still present (Slice 8 deferred) |
| 5 | `git diff --check` | clean |
| 6 | `git status --short` | Diffs limited to slice files + the 3 docs (M0 evidence signoff, this plan, M1 P0 evidence) |

**M1 P0 PASS verdict gate:** all of:
- Cmd 1 = M0 baseline (no test regression)
- Cmd 2 = zero errors in the 7 Codex buckets (residual i18n + paywall-experiment Variant 'C' errors are out-of-scope; their continued presence does NOT block PASS)
- Cmd 3 = 17 PASS
- Cmd 4 = PASS
- Cmd 5 = clean
- Cmd 6 = no WIP-disjoint violation

**M1 P0 BLOCK verdict gate:** any one of:
- Test regression
- Any of the 7 Codex bucket errors persists
- WIP-disjoint guard tripped on any slice
- Slice 5 route literal failed both candidates
- Slice 2 Sentry types unfixable on the installed SDK version (would require version bump, out of M1 P0 scope)

---

## Residuals (out of scope, recommended for M1 P0 follow-up cycle)

These two errors were detected during M0 re-verification but are NOT in Codex's classified P0 bucket list:

1. **`src/i18n/index.ts(9,69)`** — TS2322. Spanish locale value types are string-literal unions that don't match English literals. Fix: widen value types to `string` (or generate Spanish strings as exact matches if i18n strictness is intentional). Probable scope: 1 file, 5-10 lines.

2. **`src/lib/growth/paywall-experiment.ts(53,10)`** — TS7053. `Variant` type allows `"C"` but lookup record `Record<"A" | "B", PaywallVariant>` only declares A/B. Fix: either narrow `Variant` to `"A" | "B"` (drop the unused 'C' branch) or extend the record with a 'C' variant. Probable scope: 1 file, 3-5 lines.

Recommend Sim creates a follow-up M1 P0' (prime) plan for these two — keeps this cycle clean.

---

## Codex review handoff (when this plan executes)

After execution, Codex receives a brief (under 200 words) summarizing:
- Which slices PASSED, BLOCKED, or RESOLVED-BY-CLASSIFICATION
- Files modified, with line ranges
- The two residuals flagged
- Any decisions Codex should second-guess (e.g., Slice 4 Option B, Slice 6 fix direction)

Codex's review is asynchronous and does not block M1 P0 closure. Lead Engineer (Sim) signoff does.
