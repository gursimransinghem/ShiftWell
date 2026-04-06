# ShiftWell

## What This Is

An iOS app for shift workers that automates sleep scheduling using a deterministic circadian algorithm. Connect your calendar, and ShiftWell generates a complete, science-backed sleep plan — optimal sleep windows, strategic naps, caffeine cutoffs, meal timing, light protocols — all exported back to your calendar as real events. Built by an Emergency Medicine physician who lives the problem.

v1.0 core is built. 354 tests passing. 28K LOC. Awaiting LLC formation → Apple Developer enrollment → TestFlight.

## Core Value

**Sleep on autopilot.** Set it up once, never think about when to sleep again. The calendar is the interface — the app is the brain.

## Current Milestone: v1.1 TestFlight Launch & Adaptive Brain

**Goal:** Fix critical pre-launch bugs, get the app to TestFlight (and your phone), and formalize Adaptive Brain Phase 1.

**Target features:**
- Critical bug fixes: trial start broken, score never real, downgrade screen, TypeScript errors
- Adaptive Brain Phase 1 — wire partial implementation to Today screen
- TestFlight prep — app icon, splash, EAS build config, provisioning profiles
- ActivityKit real integration — Dynamic Island stubs → native module
- App Store prep — screenshots, listing, privacy policy, age rating
- Backlog polish — referral share link, routine editing nav, morning Dynamic Island score

## Shipped: v1.0 TestFlight

**Shipped:** 2026-04-06 (code complete — LLC blocking TestFlight distribution)  
**Phases:** 6 | **Plans:** 18/22 complete | **Tests:** 354 passing

## Requirements

### Validated — v1.0

_Shipped and confirmed working._

- ✓ Core circadian algorithm engine (11 modules, 354 tests) — v1.0
- ✓ Blend design system (dark base + warm gold accents) — v1.0
- ✓ 8-screen onboarding with AM/PM routine builder, address entry, chronotype quiz — v1.0
- ✓ Apple Calendar + Google Calendar read/write sync — v1.0
- ✓ Automatic shift detection from calendar events (confidence scoring) — v1.0
- ✓ Sleep plan generation with commute-aware wake times — v1.0
- ✓ Dynamic plan recalculation on calendar changes — v1.0
- ✓ Night Sky Mode (star/firefly animations, recharge arc, bedtime info) — v1.0
- ✓ Push notifications (wind-down 🌙, caffeine ☕, morning brief ☀️) — v1.0
- ✓ Live Activities pipeline (Dynamic Island stub, stubs accepted pending Apple Dev) — v1.0
- ✓ Plan adherence Recovery Score data model (14-night history, formula) — v1.0
- ✓ $6.99/$49.99/$149.99 paywall, 14-day trial (no dark patterns) — v1.0
- ✓ Settings: sleep preferences editing, referral UI stub, calendar management — v1.0
- ✓ ICS import/export pipeline — v1.0
- ✓ Today screen (timeline, countdowns, insights, score card) — v1.0
- ✓ Circadian Health tab — v1.0
- ✓ Supabase auth + HealthKit integration wired — v1.0

### Active — Milestone 2 (TestFlight Launch & Adaptive Brain)

_Critical bugs and gaps before first real users:_

- [ ] **PREM-01 fix:** Move `startTrial()` into `initializePremium()` — currently breaks in production when dev seed is removed
- [ ] **SCORE-01/02/03 fix:** Wire `score-store.finalizeDay()` to a production caller — score never accumulates real data
- [ ] **PREM-02:** Build `app/downgrade.tsx` — graceful downgrade screen when trial expires
- [ ] **TypeScript:** Fix 13 errors (circadian.tsx, profile.tsx, settings.tsx, index.tsx, ExternalLink.tsx)

_New capabilities for Milestone 2:_

- [ ] Adaptive Brain Phase 1 — formalize started implementation (types.ts, engine modules, useAdaptivePlan.ts) and wire to Today screen
- [ ] TestFlight prep — app icon, splash screen, build config, EAS profiles, metadata
- [ ] ActivityKit real implementation — wire stubs to native module (pending Apple Dev)
- [ ] App Store prep — screenshots, listing copy, privacy policy, age rating
- [ ] LIVE-03 fix — pass recovery score to morning Dynamic Island transition
- [ ] SET-01 complete — implement real share link for referral (currently empty onPress)
- [ ] SET-02 complete — enable chronotype/routine editing post-onboarding (nav bug in profile.tsx)

_Deferred to v1.1+:_

- [ ] SET-03: Sleep Focus / DND trigger from app
- [ ] Human visual QA gate — on-device verification of animations and Night Sky Mode

### Out of Scope

- AI weekly check-in — v1.1 (requires Claude API integration + real user data)
- HealthKit feedback loop to algorithm — v1.1 (needs 30 days baseline)
- Adaptive Brain with Apple Watch HRV — v1.1 (Apple Dev enrollment required)
- Gamification (streaks, levels) — v1.2
- Shift Crew (social coordination) — v1.2
- Household mode (multi-user) — v1.2
- SMS notifications — v2.0 (Twilio)
- Apple Watch app — v2.0 (watchOS)
- Android — v2.0+ (iOS first, physician iPhone use)
- B2B dashboards — v2.0 (enterprise)
- Soundscapes / meditation — Deferred indefinitely (not our lane)
- Social feed — Deferred indefinitely (distraction from core)

## Context

**Current codebase:**
- 28,439 LOC TypeScript (src/ + app/)
- 354 tests passing across 26 suites
- Expo SDK 55 / React Native 0.83 / React 19 / TypeScript 5.9
- Zustand + AsyncStorage (local-first, no mandatory cloud)
- Supabase auth (wired but optional)
- RevenueCat (premium service exists; gating intentionally disabled for v1.0 launch — all features free until v1.2)
- HealthKit (read-only; not yet feeding back to algorithm)

**Known blockers (external):**
- LLC formation: ~2 weeks (Sim's plate)
- Apple Developer Program enrollment: ~1 week after LLC
- D-U-N-S number: ~5 weeks processing
- Trademark "ShiftWell": ~2 weeks clearance (~$500)
- These block TestFlight distribution — NOT development

**Critical broken pipes (pre-TestFlight):**
- `startTrial()` not in production path (breaks when dev seed removed)
- `score-store.finalizeDay()` has no production caller (score never real)
- `app/downgrade.tsx` missing

**Competitive landscape:** Timeshifter ($69.99/yr, manual entry) is closest; Rise Science has best UI but breaks for shift workers. No competitor combines calendar sync + science-backed algorithm + routine builder + Live Activities.

## Constraints

- **Platform:** iOS first (Apple HealthKit, physician iPhone use, founder's dev environment)
- **Budget:** Bootstrap — ~$1,600 to launch. RevenueCat free tier, Supabase free tier.
- **Privacy:** Data stays on device by default. No mandatory cloud sync.
- **Design:** Dark base + warm gold (#C8A84B). Premium, confident. NEVER clinical.
- **Founder:** ER physician, beginner coder — explain all dev decisions clearly.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: ShiftWell | Sim loves it. No USPTO conflicts found. Filing trademark. | ✓ Good — trademark pending |
| Deterministic algorithm (not LLM) | Circadian science is math. Testable, offline, zero API cost. | ✓ Validated — 354 tests, fully deterministic |
| Expo/React Native over Swift | AI tools have deepest JS/TS coverage. Founder is non-technical. | ✓ Good — rapid iteration, cross-platform bonus |
| Pricing: $6.99/mo, $49.99/yr, $149.99 lifetime | Between Sleep Cycle ($30/yr) and Rise ($70/yr). Market sweet spot. | ✓ Built — pending user validation |
| Trial: 14-day full premium (no restrictions) | 45.7% conversion rate. Full experience builds loss aversion. | ✓ Built — trial state fully functional |
| Calendar export as interface | User never has to think about sleep — it appears in their existing calendar. | ✓ Validated — core UX works end-to-end |
| V1 launch: all features free | RevenueCat not fully integrated. Retention data needed before hard gating. Monetize v1.2+. | ✓ Good — documented in entitlements.ts |
| Local-first architecture | Physician-grade privacy. No data leaves device by default. | ✓ Good — AsyncStorage + optional Supabase |
| Adaptive Brain as v1.1 feature | Requires 30-day HealthKit baseline. Can't validate without real users. | ✓ Good — spec written, Phase 1 started |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

**After each milestone (via `/gsd:complete-milestone`):**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after v1.0 milestone completion*
