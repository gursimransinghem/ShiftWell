---
phase: 17-growth-engine
plan: "01"
subsystem: growth
tags: [referral, ab-testing, push-notifications, paywall, expo-notifications, async-storage]

requires:
  - phase: 05-live-activities-recovery-score
    provides: expo-notifications scheduling pattern (scheduleNotificationAsync)
  - phase: 08-adaptive-brain-core
    provides: user-store profile.id for A/B bucketing seed

provides:
  - Referral deep link system (buildReferralUrl, storeReferralCode, first-write-wins)
  - A/B testing framework with deterministic hash bucketing (getVariant, getOrAssignVariant, logExposure)
  - Re-engagement D1/D3/D7 push notification sequence (handleAppOpen, scheduleReengagementSequence)
  - Paywall pricing experiment ($29.99 control vs $24.99 experiment) via getPaywallVariant
  - ReferralCard UI component with native Share sheet in Settings

affects:
  - 18-revenucat-hard-gating (paywall-experiment feeds into RevenueCat purchase flow)
  - 19-ai-coaching-research (A/B framework reusable for coaching variant tests)
  - 22-predictive-calendar-engine (referral system can track power-user cohort)

tech-stack:
  added: []
  patterns:
    - Deterministic A/B bucketing via djb2 hash of experimentId:userId — no external SDK
    - First-write-wins referral code storage prevents overwrite on multiple deep-link opens
    - AppState foreground/background dual-listener for re-engagement schedule/cancel
    - Paywall experiment injects variant into display-only price, RevenueCat purchase uses actual offering

key-files:
  created:
    - src/lib/growth/referral.ts
    - src/lib/growth/ab-testing.ts
    - src/lib/growth/reengagement.ts
    - src/lib/growth/paywall-experiment.ts
    - src/components/ui/ReferralCard.tsx
  modified:
    - app/(tabs)/settings.tsx
    - app/paywall.tsx
    - app/_layout.tsx

key-decisions:
  - "Referral URL format is https://shiftwell.app/r/{userId} (not hashed code) — userId IS the code in v1, Supabase resolves on backend"
  - "Re-engagement schedule triggers on BOTH foreground (handleAppOpen = cancel + conditionally reschedule) and background (scheduleReengagementSequence)"
  - "Paywall experiment variant only affects display price — RevenueCat purchase call still uses actual package from offerings"
  - "A/B framework supports 2 or 3 variants via variantCount parameter — reusable for future experiments"

patterns-established:
  - "Growth modules live in src/lib/growth/ — one file per concern (referral, ab-testing, reengagement, paywall-experiment)"
  - "A/B exposure events logged to AsyncStorage with shiftwell:ab:exposures key for batch upload in Phase 19"
  - "Re-engagement IDs stored in AsyncStorage under shiftwell:reengagement-ids for targeted cancellation"

requirements-completed: [GRO-01, GRO-02, GRO-03, GRO-04]

duration: 8min
completed: "2026-04-07"
---

# Phase 17 Plan 01: Growth Engine Summary

**Deterministic A/B bucketing framework, referral deep links, D1/D3/D7 re-engagement push sequence, and paywall pricing experiment wired into Settings and paywall screens**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-07T17:54:58Z
- **Completed:** 2026-04-07T18:03:00Z
- **Tasks:** 2 completed
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- Four growth modules created: referral, A/B testing, re-engagement notifications, paywall experiment
- 44 unit tests passing across all growth modules (ab-testing.test.ts, referral.test.ts, reengagement.test.ts)
- ReferralCard component with native Share sheet wired into Settings screen
- Paywall experiment serving $29.99 (control) or $24.99 (experiment) based on deterministic userId hash
- Re-engagement D1/D3/D7 notification sequence wired to AppState foreground/background transitions in _layout.tsx

## Task Commits

1. **Task 1: Referral service and re-engagement notification module** - `7256b98` (feat)
2. **Task 2: Paywall experiment, ReferralCard, and app wiring** - `425629d` (feat)

## Files Created/Modified

- `src/lib/growth/referral.ts` - buildReferralUrl, storeReferralCode (first-write-wins), buildReferralRecord, shareReferralLink
- `src/lib/growth/ab-testing.ts` - getVariant (deterministic djb2 hash), getOrAssignVariant (persisted), logExposure/getExposureLog/clearExposureLog
- `src/lib/growth/reengagement.ts` - scheduleReengagementSequence (D1/D3/D7), cancelReengagementSequence, handleAppOpen, recordAppOpen, isUserInactive
- `src/lib/growth/paywall-experiment.ts` - getPaywallVariant(userId) returning $29.99 or $24.99 variant
- `src/components/ui/ReferralCard.tsx` - "Invite a colleague" card with referral link display and Share button
- `app/(tabs)/settings.tsx` - Replaced stub handleReferral with ReferralCard component
- `app/paywall.tsx` - Wired getPaywallVariant for pricing display, logExposure on purchase
- `app/_layout.tsx` - handleAppOpen on foreground, scheduleReengagementSequence on background

## Decisions Made

- Referral URL format is `https://shiftwell.app/r/{userId}` — userId is the code in v1, Supabase resolves attribution on the backend. No hashing needed in v1.
- Re-engagement wired to both AppState transitions: foreground calls `handleAppOpen` (which cancels + conditionally reschedules), background calls `scheduleReengagementSequence` directly.
- Paywall experiment affects display-only pricing. RevenueCat purchase call still uses actual package from offerings to avoid App Store review issues.
- A/B framework supports variantCount 2 or 3, making it reusable for all future experiments without changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Growth module filenames diverge from plan spec**
- **Found during:** Task 1 (reading existing files)
- **Issue:** Plan specified `referral-service.ts` and `reengagement-notifications.ts`, but files were already implemented as `referral.ts` and `reengagement.ts` with matching test imports
- **Fix:** Used existing filenames — tests already import from `referral` and `reengagement`, changing filenames would break 44 tests
- **Files modified:** None (deviation was to not rename)
- **Verification:** All 44 tests pass with existing filenames

**2. [Rule 2 - Missing Critical] Re-engagement also triggered on background transition**
- **Found during:** Task 2 (_layout.tsx wiring)
- **Issue:** Plan said "wire scheduleReengagementSequence to AppState background handler" separately from handleAppOpen on foreground. handleAppOpen already calls cancelReengagementSequence, but we also need to schedule on background.
- **Fix:** Added both: handleAppOpen on foreground (cancels + conditionally reschedules for inactive users) + scheduleReengagementSequence on background (schedules fresh sequence)
- **Files modified:** app/_layout.tsx

---

**Total deviations:** 2 auto-handled
**Impact on plan:** Both deviations improved correctness. Filename consistency preserved all 44 existing tests. Dual AppState wiring ensures re-engagement fires reliably.

## Issues Encountered

None — all 778 tests pass after implementation.

## User Setup Required

None - no external service configuration required. Push notification permissions are handled by existing expo-notifications setup.

## Next Phase Readiness

- Growth infrastructure complete — Phase 18 (RevenueCat hard gating) can use `getPaywallVariant` directly
- A/B framework reusable for Phase 19 (AI coaching) variant tests
- Referral deep link handling needs Phase 19 Supabase insert to track attribution server-side

---
*Phase: 17-growth-engine*
*Completed: 2026-04-07*
