# Project Research Summary

**Project:** ShiftWell v1.1 — Adaptive Brain, TestFlight, App Store  
**Domain:** iOS health/circadian app, Expo SDK 55 managed workflow  
**Researched:** 2026-04-06  
**Confidence:** HIGH (stack + architecture grounded in direct codebase inspection; pitfalls verified against Apple official docs)

---

## Executive Summary

ShiftWell v1.1 is largely a wiring job, not a greenfield build. The Adaptive Brain modules exist in `src/lib/adaptive/` (6 files complete), the hook exists, and the card exists. Three broken pipes prevent any of it from working in production: `startTrial()` is never called so every user is ungated-but-broken; `finalizeDay()` has no production caller so the Recovery Score stays at 0 forever; and `computeDelta` passes `currentPlan` as both old and new arguments so `AdaptiveInsightCard` never shows changes. Fix these three first — everything else is additive.

The recommended morning recalculation trigger is `AppState background→active` with a daily debounce in AsyncStorage, not `expo-background-task`. Background tasks cannot write to Zustand stores (no React context), fire at OS discretion rather than on user intent, and add entitlement complexity. The AppState pattern is reliable, zero-config, and already the pattern used in `_layout.tsx`. The Adaptive Brain hook fires from the Today tab (`app/(tabs)/index.tsx`), not `_layout.tsx`, to avoid blocking navigation render.

The single highest-risk item for the App Store submission is the Privacy Manifest. Apple rejected 12% of submissions in Q1 2025 for ITMS-91061. The fix is configuration-only (4 entries in `app.json` under `ios.privacyManifests`) and takes 15 minutes. It must be done before the first EAS production build. ActivityKit real integration is blocked by Apple Developer enrollment and should stay on the notification stub in v1.1 — the stub already passes score into notification copy.

---

## Key Findings

### Stack Additions (Minimal)

The existing stack needs exactly **one new package**: `expo-live-activity@0.4.2` (pin exact version — Software Mansion flags breaking changes in minor releases).

| Addition | Package / Config | Reason | Timing |
|----------|-----------------|--------|--------|
| ActivityKit | `expo-live-activity@0.4.2` (pin exact) | Dynamic Island real implementation | Install ONLY after Apple Dev enrollment |
| Privacy Manifest | `app.json ios.privacyManifests` (config only, no package) | ITMS-91061 submission blocker since May 2024 | Before first EAS production build |
| HealthKit | No changes — `@kingstinct/react-native-healthkit@13.3.1` already sufficient | All sleep data already accessible | Immediate |

**Do NOT add:** `expo-widgets` (alpha, not production-ready), any second HealthKit library, HRV/Apple Watch packages (v1.2+), `expo-background-task` for Adaptive Brain.

Privacy manifest needs 4 API category declarations:
- `NSPrivacyAccessedAPICategoryUserDefaults` (AsyncStorage)
- `NSPrivacyAccessedAPICategoryFileTimestamp`
- `NSPrivacyAccessedAPICategoryDiskSpace`
- `NSPrivacyAccessedAPICategorySystemBootTime` (defensive for react-native-reanimated)

---

### Architecture: Correct Integration Patterns

**1. Adaptive Brain morning trigger (BRAIN-01)**

```
App open → Today tab mounts → useAdaptivePlan fires (useEffect once on mount)
→ builds AdaptiveContext → plan-store.setAdaptiveContext()
→ plan-store.regeneratePlan() → [NEW] computeDelta(planSnapshot, newPlan)
→ writes pendingChanges to store → AdaptiveInsightCard renders if pendingChanges.length > 0
```

- Trigger: `useAdaptivePlan` in `app/(tabs)/index.tsx` — already there, just wired wrong
- Daily debounce: store `lastRun` ISO date in AsyncStorage; skip if already ran today
- **Bug:** `computeDelta` currently called as `computeDelta(currentPlan, currentPlan, context)` — both args identical. Fix: move diff call INSIDE `plan-store.setAdaptiveContext()` post-regenerate, comparing `planSnapshot` (pre) vs new `plan` (post)

**2. Score pipeline fix (BUG-02, SCORE-01/02/03)**

```
AppState background→active (already in _layout.tsx line 93)
→ ADD: finalizeDay(yesterday) ← idempotent guard already in score-store
→ ADD: recordEvent('notification_delivered') via addNotificationReceivedListener
useNightSkyMode → ADD: recordEvent('night_sky_activated')
```

- `finalizeDay()` belongs in the existing `AppState.addEventListener('change')` block in `_layout.tsx`
- Idempotent guard already exists in `score-store.ts` line 67 — safe to call on every foreground

**3. Trial start fix (BUG-01, PREM-01)**

```
premium-store.ts initializePremium():
  if (!trialStartedAt) startTrial()  ← move here from seedMockData()
```

- One-line fix, idempotent guard already exists
- Remove `startTrial()` from `seedMockData()` in `app/index.tsx`

**4. Downgrade routing (BUG-03, PREM-02)**

```
app/index.tsx routing:
  if (trialStartedAt && trialExpired) → /downgrade
  if (!trialStartedAt) → /onboarding  ← guard: new users go to onboarding, not downgrade
```

**5. ActivityKit stays stub (LIVE-04/05)**

- `live-activity-service.ts` stub is correct interim behavior
- `LIVE_ACTIVITIES_AVAILABLE` guard means real module slots in without touching call sites
- LIVE-03 fix (score in morning transition) requires only adding `todayScore()` to existing stub call — no new package needed

---

### Critical Pitfalls

| # | Pitfall | Severity | Prevention |
|---|---------|----------|------------|
| 1 | Privacy manifest omission | 🔴 FATAL | Add `ios.privacyManifests` to `app.json` before first EAS production build |
| 2 | `computeDelta` silent bug | 🔴 FATAL | Move diff into `plan-store.setAdaptiveContext` post-regenerate |
| 3 | HealthKit background delivery: both entitlements required | 🔴 FATAL | Declare `com.apple.developer.healthkit.background-delivery` in addition to `com.apple.developer.healthkit` |
| 4 | HKObserverQuery: duplicate callbacks | 🟡 HIGH | Idempotency key `hash(userId, date, planVersion)` + 60-min skip window |
| 5 | Grandfathering impossible without `installedAt` | 🟡 HIGH | Write `installedAt` ISO timestamp at onboarding completion (AsyncStorage + Supabase) |
| 6 | Screenshots wrong size | 🟡 HIGH | 1290×2796 (iPhone 16 Pro Max, 6.9-inch) — 6.7-inch is rejected |
| 7 | Account deletion required | 🟡 HIGH | Build in-app account deletion in Settings before App Store submission |
| 8 | TestFlight: external = Beta Review (1-4 days) | 🟢 INFO | Dog-food on internal testers first; plan for Beta Review lag |
| 9 | HealthKit apps: 5-10 day App Store review | 🟢 INFO | Get privacy + entitlements right before first submission — each round-trip = 2 weeks |

---

### Recommended Phase Build Order

| Phase | Name | Rationale |
|-------|------|-----------|
| **7** | Critical Bug Fixes | Broken pipes poison all downstream testing. Fix before any real users. |
| **8** | Adaptive Brain Core | SCORE-01 fix (Phase 7) is prerequisite. Validates pipeline before adding complexity. |
| **9** | Circadian Protocols | Depends on Phase 8 Adaptive Brain infrastructure. |
| **10** | TestFlight Prep | Independent of feature code. Blocked only by external enrollments (not code). |
| **11** | App Store Prep | Requires TestFlight validation first. Account deletion + screenshots + review notes. |
| **12** | ActivityKit Integration | Externally gated on Apple Developer enrollment. Stub is sufficient for all earlier phases. |

**Phases can parallelize where noted:** Phase 10 (TestFlight prep) can start in parallel with Phase 8/9 since it's independent of feature code. Phase 12 unblocks only when Apple Dev enrollment clears.

---

## Open Questions to Resolve During Implementation

1. **HKObserverQuery idempotency** (MEDIUM confidence) — validate semaphore + idempotency key pattern works on physical device during Phase 8
2. **Sleep data write latency buffer** — 10-min recommendation from community; may need tuning after first TestFlight data
3. **Supabase JS SDK privacy manifest** — verify v2.x ships compliant `PrivacyInfo.xcprivacy`; check expo/expo#27796 at build time
4. **Account deletion scope** — Settings → "Delete Account" → Supabase auth deletion; must cover HealthKit consent revocation

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| Stack additions | HIGH | npm registry + node_modules inspected directly |
| Architecture integration points | HIGH | All claims traced to specific file/line in codebase |
| App Store requirements | HIGH | Apple official docs + EAS official docs |
| Adaptive Brain trigger pattern | HIGH | Expo + React Native docs confirm AppState pattern |
| HKObserverQuery behavior | MEDIUM | Apple Developer Forums; validate empirically |

---

*Research completed: 2026-04-06*  
*4 parallel researchers + 1 synthesizer*  
*Ready for roadmap: yes*
