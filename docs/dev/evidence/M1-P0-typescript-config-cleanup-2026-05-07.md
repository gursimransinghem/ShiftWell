# M1 P0 TypeScript & Config Cleanup — Evidence Bundle

Date: 2026-05-07
Runner: Claude (Opus 4.7, plan-then-execute mode)
Branch: `fix/01-ui-cleanup`
Head at start: `96d382d436ec0887d55bd69ea42caa0b670c8260` (matches M0 baseline)
Plan: `docs/dev/M1-P0-TYPESCRIPT-CONFIG-CLEANUP-PLAN-2026-05-07.md`
Upstream gate: `docs/dev/evidence/M0-state-reconciliation-2026-05-07.md` (Claude PASS, Lead Engineer PENDING)

## Phase

M1 P0 — TypeScript & Production Config Cleanup. Pre-build slice of M1 (TestFlight MVP Cut). Closes the 7 Codex-classified P0 buckets from M0 plus the `api/src/index.ts` runtime entry (Codex P1, included at Sim's direction).

## Scope Summary

8 slices executed in dependency order. Slice 0 was a per-slice WIP-disjoint guard (no code). Slice 1 cut the most error noise by excluding unrelated subprojects from root TypeScript. Slices 2-7 each closed one Codex P0 bucket. Slice 8 documented placeholder build-gate without modifying app.json/eas.json (deferred until external accounts exist).

## Commands Run (final verification suite)

### Root Jest

Command:
```bash
npm test -- --runInBand
```

Result: PASS (no regression)

```text
Test Suites: 71 passed, 71 total
Tests:       1062 passed, 1062 total
Snapshots:   0 total
Time:        16.919 s
Ran all test suites.
```

### Root TypeScript

Command:
```bash
./node_modules/.bin/tsc --noEmit --pretty false
```

Result: 2 errors remaining, BOTH out of scope for M1 P0 (pre-existing TypeScript drift not in Codex's representative bucket list).

```text
src/i18n/index.ts(9,69): error TS2322: Type '{ readonly onboarding: { readonly welcome: "Bienvenido a ShiftWell"; ... }' is not assignable to type '{ readonly onboarding: { readonly welcome: "Welcome to ShiftWell"; ... }'.
src/lib/growth/paywall-experiment.ts(53,10): error TS7053: Element implicitly has an 'any' type because expression of type 'Variant' can't be used to index type 'Record<"A" | "B", PaywallVariant>'.
```

Pre-cleanup baseline (M0): 71 error lines across 8 buckets.
Post-cleanup: 5 lines / 2 errors. **Reduction: 66 of 71 error lines (93%) cleared.** All 7 Codex P0 buckets resolved.

### API Jest

Command:
```bash
npm --prefix api test -- --runInBand
```

Result: PASS

```text
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        0.45 s, estimated 1 s
```

### API Runtime Boot Smoke Test (perl alarm; macOS lacks GNU `timeout`)

Command:
```bash
cd /Users/sima/Projects/ShiftWell/api && \
  perl -e 'alarm shift; exec @ARGV' 5 npm start
```

Result: PASS

```text
> shiftwell-enterprise-api@1.0.0 start
> ts-node src/index.ts

shiftwell-enterprise-api on :3000
```

Process killed by SIGALRM after 5 s. Boot log line confirmed. New entry file at `api/src/index.ts` (10 lines).

### Expo Config

Command:
```bash
./node_modules/.bin/expo config --type public
```

Result: PASS (placeholders still present, deferred per Slice 8).

Confirmed in output:
- `version: '1.0.0'`
- `bundleIdentifier: 'com.shiftwell.app'`
- Sentry plugin: `organization: 'YOUR_ORG_SLUG'` (placeholder retained)
- Google Sign-In plugin: `iosUrlScheme: 'com.googleusercontent.apps.PLACEHOLDER_CLIENT_ID'` (placeholder retained)

### git diff --check

Command:
```bash
git diff --check
```

Result: PASS (exit 0, no conflict markers, no whitespace errors).

### git status --short (post-cleanup)

Eight modified + 1 new untracked file from this session, plus the 13 pre-existing WIP files Sim left and the planning doc additions:

**This session's edits (8 modified + 1 new):**
```
 M app/index.tsx                              (Slice 5)
 M app/paywall.tsx                            (Slice 4)
 M src/components/ErrorBoundary.tsx           (Slice 2)
 M src/components/ui/ReferralCard.tsx         (Slice 4)
 M src/lib/analytics/events.ts                (Slice 3)
 M src/lib/monitoring/sentry.ts               (Slice 2)
 M src/lib/patterns/alert-generator.ts        (Slice 6)
 M tsconfig.json                              (Slice 1)
?? api/src/index.ts                           (Slice 7 — new file)
```

**Plus 2 new docs from this cycle:**
```
?? docs/dev/M1-P0-TYPESCRIPT-CONFIG-CLEANUP-PLAN-2026-05-07.md
?? docs/dev/evidence/M1-P0-typescript-config-cleanup-2026-05-07.md  (this file)
```

**WIP-disjoint guard: HELD.** No edit in this cycle touched any of the 13 pre-existing modified files (`__tests__/adaptive/*`, `__tests__/circadian/*`, `__tests__/lib/circadian/*`, `__tests__/store/plan-store.test.ts`, `docs/PROGRESS-DASHBOARD.md`, `src/components/today/AdaptiveInsightCard.tsx`, `src/lib/adaptive/autopilot.ts`, `src/lib/circadian/*` including `types.ts`, `src/store/plan-store.ts`, `CLAUDE.md`).

In particular: **`src/lib/circadian/types.ts` was NOT modified** (Slice 4 prohibition held).

## Per-Slice Outcomes

| Slice | Subject | Outcome | Files | Buckets cleared |
|-------|---------|---------|-------|-----------------|
| 0 | WIP baseline guard | OBSERVED | (none — guard logic) | — |
| 1 | Scope root tsconfig | PASS | `tsconfig.json` | TS2304 Deno × 4, TS2307 dashboard externals × 15, TS5097 × 1, TS7006 × 13 (in dashboard files) → 71 → 36 lines |
| 2 | Sentry SDK type drift | PASS (after fallback to dropping `_hint` params; `EventHint`/`BreadcrumbHint` not exposed by `@sentry/react-native@6.22` public barrel) | `src/lib/monitoring/sentry.ts`, `src/components/ErrorBoundary.tsx` | TS2322 × 4 (lines 56, 62, 63, 71) → 36 → 16 |
| 3 | PostHog event property typing | PASS (after fallback to local `JsonValue`/`PostHogEventProperties` types; the public barrel doesn't re-export `posthog-core` types) | `src/lib/analytics/events.ts` | TS2345 × 1 → 16 → 13 |
| 4 | UserProfile identity (Option B locked) | PASS, prohibition on `src/lib/circadian/types.ts` HELD | `app/paywall.tsx` (3 sites), `src/components/ui/ReferralCard.tsx` (3 sites) | TS2339 × 6 → 13 → 7 |
| 5 | `app/index.tsx` typed route literal | PASS first attempt | `app/index.tsx` line 14 (`'/onboarding'` → `'/(onboarding)/welcome'`) | TS2345 × 1 → 7 → 6 |
| 6 | Pattern alert template/enum drift | PASS — orphan template removed (no detector or test referenced `'shift-transition-cluster'`; was dead code, not missing-from-type) | `src/lib/patterns/alert-generator.ts` (lines 71-76 removed) | TS2353 × 1 → 6 → 5 |
| 7 | API runtime entry | PASS (after destructuring fix — `buildApp()` returns `{ app: Express }`, not `Express`) | NEW `api/src/index.ts` | (TS-clean entry; perl-alarm boot smoke confirms `:3000` listen) |
| 8 | Production placeholders | DEFERRED (documented, no edits) | `app.json` + `eas.json` left intact | (n/a — does not block M1 P0; blocks real TestFlight build) |

## Implementation Notes / Decisions Worth Reviewing

1. **Slice 2 EventHint/BreadcrumbHint absence.** `@sentry/react-native@6.22.0`'s main entry does NOT re-export `EventHint` or `BreadcrumbHint` (TS2694/TS2724). The fix dropped the optional `_hint` params on `scrubEvent` and `beforeBreadcrumb` — TypeScript's parameter bivariance allows fewer-arg functions to satisfy more-arg callback types. This is correct and idiomatic, but if Codex's review prefers explicit hint imports, the deep path `import type { EventHint } from '@sentry/react-native/dist/typescript/types'` exists as a fallback.

2. **Slice 3 PostHogEventProperties absence.** Same pattern — `posthog-react-native`'s main barrel does NOT re-export the core `JsonType`/`PostHogEventProperties`. Defined locally to match the SDK's shape. Trade-off: if the SDK re-exports them in a future minor version, the local types should be replaced with imports.

3. **Slice 4 went deeper than the M0 evidence implied.** M0 listed paywall.tsx line 247 + "referral code" generically. Reality: paywall.tsx had 3 `profile.id` sites (247, 265, 266); the actual referral consumer was `src/components/ui/ReferralCard.tsx` (3 sites at 30/31/33), not `src/lib/growth/referral.ts`. Slice 4 scope expanded to cover all 6 sites cleanly via auth-store consumption.

4. **Slice 4 also has a behavioral side-effect worth noting.** Before: `paywall.tsx` line 265 `if (profile.id)` was always falsy because `UserProfile` had no `.id` field — exposure logging never fired. After: the check uses real `userId` from auth-store; for authed users, exposure logging now fires. This is a *correct* behavior change (the original was a silent no-op bug), but it should be confirmed against the GRO-04 experiment expectations.

5. **Slice 6 was an orphan-template, not a missing-from-type case.** `'shift-transition-cluster'` had ZERO detector references and ZERO test references — no producer in the system emits this pattern. Removing the orphan template was the cleanest fix; if a future PR wires detection, both type and template can be added together.

## Residuals (Out of Scope, Recommend Follow-up)

These two errors are NOT in Codex's classified P0 buckets. They were detected during M0 re-verification and persist after M1 P0:

1. **`src/i18n/index.ts(9,69)` — TS2322.** Spanish locale strings have different literal types than English (`"Bienvenido a ShiftWell"` ≠ `"Welcome to ShiftWell"`). Probable fix: widen locale value types from string-literal unions to `string`. Estimated scope: 1 file, 5-10 lines.

2. **`src/lib/growth/paywall-experiment.ts(53,10)` — TS7053.** `Variant` allows `"C"` but the lookup record only declares `"A" | "B"`. Probable fix: either narrow `Variant` to `"A" | "B"` (drop unused 'C' branch) or extend the record with a 'C' variant. Estimated scope: 1 file, 3-5 lines.

Recommend Sim raise an M1 P0' (prime) cycle for both — outside the strictly-scoped M0 → M1 P0 chain.

## Slice 8 Build-Gate Reminder

The placeholder triplet remains intact:
- `app.json` plugins: `Sentry organization: 'YOUR_ORG_SLUG'`, `Google iosUrlScheme: '...PLACEHOLDER_CLIENT_ID'`
- `eas.json` `submit.production.ios`: empty `appleId`, `ascAppId`, `appleTeamId`

These do **not** block this M1 P0 cleanup but **do** block any real TestFlight build. Each maps to an external account that must exist first (Apple Developer enrollment after LLC + D-U-N-S, Sentry org provision, Google Cloud Console OAuth client). Tracked in `tasks/todo.md` P2.

## Known Residual Risks

- **Slice 2 fallback signature hides hint info.** Sentry callbacks no longer receive `_hint`. Functionally fine — neither callback used it — but if Codex's review wants to log hint metadata, that requires the deep-path type import.
- **Slice 4 behavioral shift in exposure logging.** Already noted; recommend confirming with GRO-04 experiment owner.
- **No simulator/device UAT was run as part of this cycle.** The plan was strictly TS/config cleanup. Onboarding cold-start route trace (`router.replace('/(onboarding)/welcome')` actually lands on welcome.tsx) is recommended before EAS build.

## Codex Review Brief (handoff for second-opinion review)

```
Subject: ShiftWell M1 P0 — review Claude's TS/config cleanup
Branch: fix/01-ui-cleanup, no commits added by Claude
Files modified (8) + new (1):
  M tsconfig.json                              [Slice 1: exclude dashboard,shiftwell-dashboard,supabase/functions,_archive]
  M src/lib/monitoring/sentry.ts               [Slice 2: scrubEvent now takes ErrorEvent; beforeBreadcrumb takes Breadcrumb]
  M src/components/ErrorBoundary.tsx           [Slice 2: FallbackRenderProps with error: unknown; onError signature updated]
  M src/lib/analytics/events.ts                [Slice 3: local JsonValue/PostHogEventProperties; setSuperProperties + trackEvent retyped]
  M app/paywall.tsx                            [Slice 4: profile.id → useAuthStore userId, 3 sites]
  M src/components/ui/ReferralCard.tsx         [Slice 4: same pattern, 3 sites]
  M app/index.tsx                              [Slice 5: '/onboarding' → '/(onboarding)/welcome']
  M src/lib/patterns/alert-generator.ts        [Slice 6: removed orphan 'shift-transition-cluster' template]
  + api/src/index.ts                           [Slice 7: 6-line entry that listens on PORT||3000]

Specific things to second-guess:
  1. Slice 2: dropped _hint params from scrubEvent + beforeBreadcrumb. Sentry types EventHint/BreadcrumbHint
     are NOT exposed by @sentry/react-native@6.22 public barrel. Was this the right move? Or should the hints
     be imported via deep path?
  2. Slice 3: hand-rolled JsonValue/PostHogEventProperties because posthog-react-native main barrel doesn't
     re-export them either. Acceptable? Or import from posthog-core/src deep path?
  3. Slice 4: behavioral shift — paywall exposure logging now fires for authed users (was silently no-op).
     Confirm GRO-04 experiment expects this.
  4. Slice 6: removed orphan template instead of extending PatternType. Detector + tests reference zero
     'shift-transition-cluster' — should this stay orphaned for a future PR?

Verification commands re-runnable from /Users/sima/Projects/ShiftWell:
  npm test -- --runInBand                   # 71/1062 PASS
  ./node_modules/.bin/tsc --noEmit --pretty false  # 2 residuals (out of M1 P0 scope)
  npm --prefix api test -- --runInBand      # 17 PASS
  cd api && perl -e 'alarm shift; exec @ARGV' 5 npm start  # boots on :3000
  git diff --check                          # clean
  git status --short                        # 8 mod + 1 new + pre-existing WIP

Out-of-scope residuals tracked: src/i18n/index.ts:9 (locale literals), src/lib/growth/paywall-experiment.ts:53 (Variant 'C').

Build-gate placeholders intact (Slice 8 deferred): YOUR_ORG_SLUG (Sentry), PLACEHOLDER_CLIENT_ID (Google),
empty appleId/ascAppId/appleTeamId (eas.json).
```

## M1 P0' (Prime) Cycle — Residual + Semantics Cleanup

Date: 2026-05-07 (continuation, post-Codex review)

Codex's second-opinion review returned **BLOCK** on M1 P0 closure with two findings:
1. **Residual TS errors are app-scope, not framework noise** — the 2 residuals (`src/i18n/index.ts:9`, `src/lib/growth/paywall-experiment.ts:53`) had been classified out-of-scope, but Codex argued (correctly) that for a pre-TestFlight TS cleanup gate, app-scope errors must hit zero before Lead signoff.
2. **MEDIUM: paywall exposure logging semantically wrong** — my Slice 4 threaded `userId` from auth-store correctly but left the `logExposure` call inside `handleStartTrial`. That records trial-start CLICKS, not paywall IMPRESSIONS. GRO-04 uses exposure as the conversion-rate denominator, so misplacement biases the metric.

Codex confirmed acceptable on the other 4 flagged decisions (Sentry hint drop, PostHog local types, auth-store identity direction, pattern-alert orphan removal).

### Prime fixes applied

| Slice | File | Fix |
|-------|------|-----|
| A | `src/i18n/index.ts` | Replaced `type TranslationMap = typeof en` with `type TranslationMap = Loosen<typeof en>` where `Loosen<T>` is a recursive mapped type that widens string-literal types to `string` while preserving structural shape. Spanish strings can now differ from English literals; the dictionary-shape contract is still enforced. |
| B | `src/lib/growth/paywall-experiment.ts` | Replaced `VARIANTS[variant] ?? VARIANTS.A` with an `if (variant === 'A' \|\| variant === 'B')` narrowing block. Per Codex: keep the global `Variant = 'A' \| 'B' \| 'C'` framework intact; narrow at the call site for this 2-arm experiment. Same runtime behavior; type-safe. |
| C | `app/paywall.tsx` | Moved `logExposure(...)` from inside `handleStartTrial` into a new `useEffect` that fires when paywall renders for an identified user. Effect depends on `[userId, paywallVariant.variantId]`. Auth-store `userId` consumption (Slice 4 change) is preserved. Imports updated to add `useEffect`. |

### Final verification (post-prime)

| # | Command | Result |
|---|---------|--------|
| 1 | `npm test -- --runInBand` | **PASS** — 71 suites / 1062 tests / 2.715 s |
| 2 | `./node_modules/.bin/tsc --noEmit --pretty false` | **PASS** — 0 errors. Full clean. |
| 3 | `npm --prefix api test -- --runInBand` | **PASS** — 17 tests / 0.598 s |
| 4 | `git diff --check` | **PASS** — exit 0 |

WIP-disjoint guard held: prime fixes only touched the 3 named files (`src/i18n/index.ts`, `src/lib/growth/paywall-experiment.ts`, `app/paywall.tsx`); none of the 13 pre-existing adaptive/circadian WIP files acquired new modifications.

### Behavioral note (Slice C)

Exposure event semantics are now correct: `logExposure` fires on paywall mount for any user whose `userId` is non-null, with the variant arm derived from `paywallVariant.variantId`. The trial-start click handler is now a pure purchase trigger. GRO-04 conversion-rate denominator (impressions) and numerator (start-trial → purchase) are now logically separable.

One subtlety: the effect re-fires if `userId` transitions from `null` to a string while the paywall is mounted (e.g., user signs in inside the paywall flow). That's consistent with "user was exposed once they're identifiable," which is the intended semantic. If GRO-04 wants strict once-per-mount dedup, a session-level dedup is a separate (out-of-scope) follow-up.

## Signoff

- Codex: **PASS** for M1 P0 + M1 P0' (prime cycle) after brief-store flake resolution. Root Jest, root TypeScript, API Jest, and `git diff --check` all pass. Evidence reviewed at `docs/dev/evidence/M1-P0-typescript-config-cleanup-2026-05-07.md`, date 2026-05-08.
- Claude: **PASS** for M1 P0 + M1 P0' (prime cycle). All 7 Codex-classified P0 buckets + Slice 7 API entry + 2 residual app-scope TS errors + 1 paywall-exposure semantics correction. tsc shows zero errors. Evidence at `docs/dev/evidence/M1-P0-typescript-config-cleanup-2026-05-07.md`, date 2026-05-07.
- Lead Engineer: **PASS**. Sim explicitly signed off in-session, date 2026-05-07.
- Agents: N/A.

## Codex Closeout Re-Review — Session Close

Date: 2026-05-07 22:07 EDT

Verdict: **BLOCK** for final M1 P0 closure.

Codex verified the prime diff and agrees that the three prime fixes are directionally correct:

- `src/i18n/index.ts` widens locale string literals while preserving dictionary shape.
- `src/lib/growth/paywall-experiment.ts` narrows the 2-arm experiment locally without changing the global A/B/C framework.
- `app/paywall.tsx` moves GRO-04 exposure logging to paywall render for identified users instead of Start Trial click.

Final closeout commands:

```text
npm test -- --runInBand                         -> FAIL, 1 test failing
./node_modules/.bin/tsc --noEmit --pretty false -> PASS, 0 errors
npm --prefix api test -- --runInBand            -> PASS, 17 tests
git diff --check                                -> PASS
./node_modules/.bin/expo config --type public   -> PASS
```

Blocking failure:

```text
FAIL __tests__/store/brief-store.test.ts
useBriefStore - generateBrief - sets lastGeneratedISO to today

Expected: "2026-05-08"
Received: "2026-05-07"
```

Cause:

- `src/store/brief-store.ts` stores local date using `date-fns format(new Date(), 'yyyy-MM-dd')`.
- `__tests__/store/brief-store.test.ts` expects UTC date using `new Date().toISOString().slice(0, 10)`.
- At 2026-05-07 20:21 EDT, local date is `2026-05-07` while UTC date is `2026-05-08`.

Required fix before Lead Engineer signoff:

- Update the test to expect the store's local-date semantics, likely with `format(new Date(), 'yyyy-MM-dd')`.
- Do not change product behavior unless a later decision explicitly chooses UTC dates for weekly brief history.

## Brief-store flake resolved

Date: 2026-05-08
Runner: Codex

Scope:

- Updated `__tests__/store/brief-store.test.ts` only.
- The test now imports `format` from `date-fns` and expects `format(new Date(), 'yyyy-MM-dd')`, matching `src/store/brief-store.ts`.
- Product behavior remains local-date based; `src/store/brief-store.ts` was not changed.
- Unrelated adaptive/circadian WIP files were not touched.

Final verification:

```text
npm test -- --runInBand
-> PASS
Test Suites: 71 passed, 71 total
Tests:       1062 passed, 1062 total
Snapshots:   0 total
Time:        3.753 s
Ran all test suites.

./node_modules/.bin/tsc --noEmit --pretty false
-> PASS, exit 0, no output

npm --prefix api test -- --runInBand
-> PASS
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        0.631 s, estimated 1 s
Ran all test suites.

git diff --check
-> PASS, exit 0, no output
```

Final verdict:

- M1 P0 + M1 P0' Prime: **PASS** for Codex/Claude verification.
- Lead Engineer: **PASS**. Sim explicitly signed off in-session, date 2026-05-07.
- Next phase direction: M1 simulator UAT for onboarding, schedule setup, plan generation, Today screen, feedback capture, settings, and permission-flow proof per `docs/dev/PHASE_ACCEPTANCE_GATES.md`.
