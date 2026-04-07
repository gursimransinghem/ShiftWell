# Requirements: ShiftWell v1.1

**Defined:** 2026-04-06  
**Core Value:** Sleep on autopilot — set it up once, never think about when to sleep again.  
**Milestone:** v1.1 — TestFlight Launch & Adaptive Brain

---

## v1.1 Requirements

### Critical Bug Fixes

Three integration pipes are broken in production. These must be fixed before any real users touch the app.

- [ ] **BUG-01**: Trial starts automatically on first launch — `startTrial()` moved into `initializePremium()`, removed from dev-only `seedMockData()`
- [ ] **BUG-02**: Recovery Score accumulates real data — `score-store.finalizeDay()` called from `AppState` background→active handler in `_layout.tsx`
- [ ] **BUG-03**: Expired trial has a graceful path — `app/downgrade.tsx` exists with re-subscribe CTA and feature summary
- [x] **BUG-04**: EAS build succeeds — all 13 TypeScript errors fixed (circadian.tsx, profile.tsx, settings.tsx, index.tsx, ExternalLink.tsx)
- [x] **BUG-05**: AdaptiveInsightCard shows real plan changes — `computeDelta` receives distinct pre/post plan snapshots (not identical `currentPlan` for both args)
- [x] **BUG-06**: Morning Dynamic Island transition includes recovery score — `startSleepActivity()` receives `todayScore()` from score-store

### Adaptive Brain Core

Formalize and wire the partial Adaptive Brain implementation to production.

- [x] **BRAIN-01**: Morning recalculation runs once per day on app foreground — AppState background→active trigger with AsyncStorage daily debounce, no expo-background-task
- [x] **BRAIN-02**: Sleep debt engine operational — rolling 14-night debt tracker with banking protocol (extra sleep on off-days reduces upcoming debt)
- [ ] **BRAIN-03**: Circadian transition protocols fire correctly — 5 transition types (pre-shift, post-shift, rotating, recovery, off-sequence) route to correct protocol handler
- [x] **BRAIN-04**: AdaptiveInsightCard renders on Today screen when plan changes — shows what changed, which factors drove it, with undo action
- [ ] **BRAIN-05**: SleepDebtCard shows dual-meter visualization — current debt (minutes) vs banked credit on same gauge
- [x] **BRAIN-06**: Plan change logger produces human-readable explanation — "Bedtime moved earlier because your next shift starts at 6am and debt is high"

### TestFlight Prep

Configuration and infrastructure for first EAS production build.

- [ ] **TF-01**: Privacy manifest declared in `app.json` — 4 API categories: UserDefaults, FileTimestamp, DiskSpace, SystemBootTime (prevents ITMS-91061 rejection)
- [ ] **TF-02**: Both HealthKit entitlements declared — `com.apple.developer.healthkit` + `com.apple.developer.healthkit.background-delivery`
- [ ] **TF-03**: App icon (1024×1024) and splash screen configured in EAS — no default Expo assets in production build
- [ ] **TF-04**: EAS production build profile configured — `eas.json` with production profile, provisioning, bundle ID matches App Store Connect
- [ ] **TF-05**: `installedAt` ISO timestamp written at onboarding completion — saved to AsyncStorage + Supabase; enables v1.2 grandfathering logic

### App Store Prep

Required before App Store submission (not TestFlight).

- [ ] **APP-01**: Account deletion in Settings — "Delete Account" flow that removes Supabase auth record and revokes HealthKit consent (Apple required since 2022)
- [ ] **APP-02**: Medical disclaimer in onboarding and Settings — "Not a substitute for medical advice. Consult your physician." (required for HealthKit apps)
- [ ] **APP-03**: App Store screenshots in correct dimensions — 1290×2796 (iPhone 16 Pro Max, 6.9-inch); older sizes rejected
- [ ] **APP-04**: App Privacy nutrition labels completed in App Store Connect — HealthKit data types, usage purpose, and data linkage declared
- [ ] **APP-05**: App Review notes written — demo account credentials, HealthKit permission explanation, Live Activity explanation for reviewers

### ActivityKit Integration

Gated on Apple Developer enrollment. Safe to defer — stub is functional for all earlier phases.

- [ ] **LIVE-04**: `expo-live-activity@0.4.2` installed and config plugin wired — exact version pinned (Software Mansion breaking changes in minor releases)
- [ ] **LIVE-05**: Real Dynamic Island transitions implemented — wind-down, sleep start, and morning transitions using native ActivityKit; replaces notification stub

---

## v2 Requirements

Deferred to v1.2+. Tracked but not in current roadmap.

### Adaptive Brain Phase 2

- **BRAIN-07**: HealthKit feedback loop — real sleep duration from HealthKit feeds back to algorithm
- **BRAIN-08**: Apple Watch HRV integration — HRV data incorporated into recovery score (requires Apple Watch pairing)
- **BRAIN-09**: 30-day autopilot mode — algorithm makes changes without user review after Day 30 baseline established

### Intelligence Layer

- **AI-01**: Claude API weekly brief — AI-generated personalized sleep summary every Monday
- **AI-02**: Pattern recognition alerts — unusual pattern detection with natural language explanation

### Premium Gating

- **PREM-03**: RevenueCat hard gating — adaptive brain + advanced features behind paywall (currently disabled, all features free)
- **PREM-04**: Grandfathering logic — users who installed before paywall date retain free access

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| `expo-background-task` for Adaptive Brain | Can't write to Zustand/React context; AppState trigger is superior |
| `expo-widgets` | Alpha, not production-ready in Expo SDK 55 |
| Android | iOS first; Android deferred to v2.0+ |
| Apple Watch app | watchOS deferred to v2.0 |
| HRV integration | Requires Apple Watch baseline data; v1.2 |
| AI weekly check-in | Requires 30-day real user data baseline; v1.2 |
| Sleep Focus / DND trigger | iOS restrictions on Focus mode APIs; v1.1+ |
| Social features (Shift Crew) | v1.2 |
| Gamification | v1.2 |

---

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 7 | Pending |
| BUG-02 | Phase 7 | Pending |
| BUG-03 | Phase 7 | Pending |
| BUG-04 | Phase 7 | Complete |
| BUG-05 | Phase 7 | Complete |
| BUG-06 | Phase 7 | Complete |
| BRAIN-01 | Phase 8 | Complete |
| BRAIN-02 | Phase 8 | Complete |
| BRAIN-03 | Phase 9 | Pending |
| BRAIN-04 | Phase 8 | Complete |
| BRAIN-05 | Phase 9 | Pending |
| BRAIN-06 | Phase 8 | Complete |
| TF-01 | Phase 10 | Pending |
| TF-02 | Phase 10 | Pending |
| TF-03 | Phase 10 | Pending |
| TF-04 | Phase 10 | Pending |
| TF-05 | Phase 10 | Pending |
| APP-01 | Phase 11 | Pending |
| APP-02 | Phase 11 | Pending |
| APP-03 | Phase 11 | Pending |
| APP-04 | Phase 11 | Pending |
| APP-05 | Phase 11 | Pending |
| LIVE-04 | Phase 12 | Pending |
| LIVE-05 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-06*  
*Last updated: 2026-04-06 after v1.1 milestone initialization*
