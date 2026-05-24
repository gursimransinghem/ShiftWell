# MX HealthKit Map Pilot — Evidence Bundle

Date: 2026-05-16
Runner: Hermes Agent (Telegram control-plane triage)
Branch: `fix/01-ui-cleanup`
Head at start: `96d382d436ec0887d55bd69ea42caa0b670c8260`
Guide: `docs/dev/SHIFTWELL-ARCHITECTURE-MAP-DEBUGGING-GUIDE-2026-05-15.md`

## Purpose

Run the first architecture-map pilot lane for ShiftWell's HealthKit boundary and verify whether the current repo actually has the onboarding HealthKit consent step described in the guide and architecture docs.

## Conclusion

The original pilot phrasing was stale.

**Verified current repo reality:**
- current onboarding flow has **6 screens**
- there is **no dedicated HealthKit consent screen** in onboarding
- `requestAuthorization()` exists in the HealthKit service but has **no live caller**
- `healthkitConnected` exists in persisted user state but has **no live consumer/caller outside the store/tests**
- current app behavior is closer to **passive availability checks + read attempts after onboarding**, not an explicit onboarding permission flow

So the correct blocker framing is:

> HealthKit permission flow is missing / stale vs architecture docs

not:

> onboarding reaches a HealthKit consent step and crashes

unless a fresh runtime repro proves that separately.

## Files inspected

### Onboarding flow
- `app/(onboarding)/_layout.tsx`
- `src/constants/onboarding.ts`
- `app/(onboarding)/plan-ready.tsx`

### HealthKit boundary
- `src/lib/healthkit/healthkit-service.ts`
- `src/hooks/useAdaptivePlan.ts`
- `src/hooks/useRecoveryScore.ts`
- `src/store/user-store.ts`
- `src/types/healthkit.d.ts`

### Architecture/doc sources
- `docs/dev/PHASE_2_ARCHITECTURE.md`
- `docs/dev/SHIFTWELL-ARCHITECTURE-MAP-DEBUGGING-GUIDE-2026-05-15.md`

## Concrete evidence

### 1. Onboarding is six screens only

`app/(onboarding)/_layout.tsx` registers:
- `welcome`
- `chronotype`
- `sleep-and-naps`
- `household`
- `shifts`
- `plan-ready`

`src/constants/onboarding.ts` confirms:
- `ONBOARDING_TOTAL_STEPS = 6`
- no HealthKit step constant exists

### 2. No caller of requestAuthorization()

Repo search for `requestAuthorization(` returned only:
- `src/lib/healthkit/healthkit-service.ts`
- `src/types/healthkit.d.ts`

No onboarding screen, tab screen, hook, or settings flow currently calls it.

### 3. HealthKit reads happen passively later

Observed live call pattern:
- `useAdaptivePlan()` calls `isAvailable()` and then `getSleepHistory(...)`
- `useRecoveryScore()` calls `isAvailable()` and then `getLastNightSleep(...)` / `getSleepHistory(...)`

These are mounted from `app/(tabs)/index.tsx`, i.e. **post-onboarding Today-tab runtime**, not onboarding consent UX.

### 4. Architecture doc still describes onboarding permission UX

`docs/dev/PHASE_2_ARCHITECTURE.md` still says:
- "Request permissions — called during onboarding (optional step)"
- onboarding should show a dedicated HealthKit explanation screen

That is not true of the current repo.

## Commands run

### Targeted Jest verification

Command:
```bash
npm test -- --runInBand __tests__/lib/healthkit/sleep-ingestion.test.ts __tests__/healthkit/hrv-reader.test.ts
```

Result: PASS

```text
Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
```

## Actions taken

- patched `docs/dev/SHIFTWELL-ARCHITECTURE-MAP-DEBUGGING-GUIDE-2026-05-15.md` so the pilot lane now reflects current repo reality
- appended a bridge observation to `~/Documents/Claude/bridge/hermes-observations.jsonl`
- added a findings task for follow-up triage

## Recommended next move

Pick one explicit direction:

### Option A — implement real HealthKit consent UX
Add an optional onboarding or settings entry point that:
- explains read/write behavior accurately
- calls `requestAuthorization()` explicitly
- handles grant / deny / skip safely
- updates `healthkitConnected` from real permission state

### Option B — declare HealthKit passive/post-onboarding
Keep the current passive read path, but then:
- remove stale onboarding-permission claims from docs
- define where permission should actually be requested (if ever)
- align tests and state naming with passive availability/read behavior

## Acceptance gate for this pilot

This pilot is complete when the blocker statement matches the actual repo state.

That condition is now met.
