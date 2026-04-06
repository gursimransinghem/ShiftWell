# ShiftWell — Milestones

## v1.0 TestFlight (Shipped: 2026-04-06)

**Phases completed:** 6 phases, 22 plans, 23 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- Haversine geocoding utility with 8 unit tests and address entry onboarding screen (Step 7) using expo-location for commute calculation
- Complete 8-screen onboarding Stack navigator with brand-aligned welcome copy and zero hardcoded hex across all onboarding + tab screens
- One-liner:
- One-liner:
- Three-phase calendar connection onboarding — provider cards, calendar toggles with Work Schedule tag, and confidence-scored shift review with skeleton loading
- One-liner:
- One-liner:
- One-liner:
- All 243 tests pass, TypeScript clean (zero new errors), all Phase 3 wiring patterns verified — Phase 3 complete.
- Expo-notifications and react-native-svg Jest mocks + Zustand notification-prefs store with AsyncStorage persistence
- Warm emoji push notifications (wind-down 🌙, caffeine ☕, morning brief ☀️) with Zustand preference gating and SDK 55 foreground handler at app root
- StarParticles.tsx
- One-liner:
- Zustand adherence score store with ISO-date persistence, 40/35/25pt formula, and null/zero no-shift-day distinction — 27 tests green
- useRecoveryScore extended with score-store adherence fallback — Today screen shows recovery score without Apple Watch
- expo-notifications fallback for ActivityKit with correct API surface: startSleepActivity pre-schedules three transitions (wind-down/sleep/morning), wired to Night Sky Mode activation via useNightSkyMode useEffect

---

## Active

### v1.0 — TestFlight (Core Autopilot)

**Started:** 2026-04-02
**Goal:** Calendar sync + sleep plan generation + Night Sky Mode + Live Activities. 20 beta testers.
**Status:** Requirements defined, roadmap pending.

## Planned

### v1.1 — Intelligence Layer

**Goal:** AI weekly check-in, HealthKit feedback loop, Recovery Score v2, Sleep Debt Tracker.

### v1.2 — Engagement Layer

**Goal:** Gamification, Shift Crew, household mode, dashboards, weekly reports.

### v2.0 — Expansion

**Goal:** Apple Watch, SMS, travel mode, B2B pilot program.

## Completed

_None yet — first milestone in progress._

### Pre-GSD Work (v0.1 — MVP Foundation)

**Period:** 2026-03 (4 weeks)
**What shipped:**

- Core circadian algorithm engine (11 modules)
- 83 passing tests
- Onboarding flow (chronotype, household, preferences)
- Today screen, calendar view, settings
- ICS import/export
- Animations and polish
- Phase 2 infrastructure (partial: Supabase, auth, HealthKit, premium, notifications, sync)
- Borbely two-process energy model
- Landing page, business plan, App Store metadata draft
