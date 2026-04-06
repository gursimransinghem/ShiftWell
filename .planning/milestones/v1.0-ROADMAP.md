# Roadmap: ShiftWell

## Overview

Six phases that deliver the core autopilot promise for TestFlight. The work starts with a design system refresh and onboarding redesign (what users see first), moves into the two major new capabilities (calendar sync, sleep plan generation), then layers in the premium experience features (Night Sky Mode, notifications, Live Activities, Recovery Score), and closes with the premium/trial flow and final polish. Existing infrastructure (Supabase, auth, HealthKit service, algorithm) is already in place — phases wire it together rather than build from scratch.

## Milestones

- 🚧 **v1.0 TestFlight** — Phases 1-6 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Onboarding** - Design system refresh + complete routine builder onboarding (completed 2026-04-02, human visual gate pending)
- [x] **Phase 2: Calendar Sync** - Apple + Google read/write with auto-detection and dynamic updates (completed 2026-04-02, device test gate pending)
- [x] **Phase 3: Sleep Plan Generation** - Algorithm-to-calendar pipeline with dynamic rescheduling (completed 2026-04-02)
- [x] **Phase 4: Night Sky Mode & Notifications** - Bedtime UI + warm push notification cadence (completed 2026-04-02, visual gate pending)
- [x] **Phase 5: Live Activities & Recovery Score** - Dynamic Island pipeline + plan adherence score (completed 2026-04-02, ActivityKit stub — pending Apple Dev enrollment)
- [ ] **Phase 6: Premium, Settings & Polish** - Partially shipped outside GSD; critical gaps (PREM-01, SCORE-01/02/03, PREM-02) move to Milestone 2

## Phase Details

### Phase 1: Foundation & Onboarding
**Goal**: Users experience a cohesive design system and complete a rich onboarding that captures everything the algorithm needs
**Depends on**: Nothing (first phase)
**Requirements**: DES-01, DES-02, DES-03, ONB-01, ONB-02, ONB-03, ONB-04, ONB-05, ONB-06
**Success Criteria** (what must be TRUE):
  1. Every screen in the app uses the blend design system — dark base, warm gold accents, no mismatched legacy colors
  2. New user completes onboarding including AM routine builder (wake through commute) and PM routine builder (dinner through lights-out)
  3. User can enter work and home addresses during onboarding so commute time is captured
  4. Onboarding captures chronotype, household profile, and sleep preferences in a single cohesive flow
  5. Animations feel smooth and premium throughout — no jank, no clinical sterility
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Design system gold tokens + UI component color audit + data model extension
- [x] 01-02-PLAN.md — AM/PM routine builder screens + preferences cleanup
- [x] 01-03-PLAN.md — Address entry screen + commute estimation utility + expo-location config
- [x] 01-04-PLAN.md — Layout wiring + existing screen polish + user store tests + visual checkpoint

**UI hint**: yes

### Phase 2: Calendar Sync
**Goal**: Users can connect their real calendars and ShiftWell reads shifts automatically
**Depends on**: Phase 1
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06
**Success Criteria** (what must be TRUE):
  1. User can connect Apple Calendar and grant read access — shifts and personal events appear in the app
  2. User can connect Google Calendar with the same read-access result
  3. App correctly identifies shift events from calendar noise without user tagging each one
  4. After plan generation, sleep blocks appear in the user's calendar as real events (not just in-app)
  5. When the user adds or changes a shift in their calendar, sleep blocks update automatically
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Dependencies, types, calendar store, Apple CalendarService, shift confidence scoring, Jest mocks
- [x] 02-02-PLAN.md — Google Calendar REST API client, background sync task, AppState sync wiring
- [x] 02-03-PLAN.md — Onboarding calendar screen, provider cards, calendar toggles, shift review UI
- [x] 02-04-PLAN.md — Settings calendar management section with write/notification preferences

**UI hint**: yes

### Phase 3: Sleep Plan Generation
**Goal**: Users have a complete, personalized sleep plan generated from their calendar data that updates whenever anything changes
**Depends on**: Phase 2
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06
**Success Criteria** (what must be TRUE):
  1. After connecting calendar, the app generates a full sleep plan (sleep windows, naps, caffeine cutoffs, meal timing, light protocols)
  2. Wake-up times account for commute — a 30-minute commute shifts the alarm 30 minutes earlier without any manual input
  3. Free mornings are detected and the plan automatically proposes sleeping in rather than defaulting to an alarm
  4. The Today screen shows a "preview" message like "3 nights next week — pre-adapt starting Thursday"
  5. When calendar changes (new shift added, shift moved), the sleep plan recalculates and the calendar updates
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Test scaffold + plan-store calendar write-back + Circadian Reset subscription + debounce
- [x] 03-02-PLAN.md — SchedulePreview component + Today screen WHAT'S AHEAD section
- [x] 03-03-PLAN.md — Final validation + visual checkpoint (autonomous: false)

### Phase 4: Night Sky Mode & Notifications
**Goal**: The app guides users into sleep with a calming bedtime experience and delivers warm, timely push notifications throughout the day
**Depends on**: Phase 3
**Requirements**: NSM-01, NSM-02, NSM-03, NSM-04, NSM-05, NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05
**Success Criteria** (what must be TRUE):
  1. As bedtime approaches, the app visibly shifts into Night Sky Mode — dark sky, firefly/star animations, minimal UI
  2. Night Sky Mode shows exactly three things: alarm confirmation, latest acceptable wake time, next morning's schedule
  3. The recharge animation updates in real time — if the user is 30 minutes past bedtime, projected sleep quality drops visibly
  4. User receives a wind-down push notification 30-60 minutes before bedtime with warm tone and emoji (not clinical)
  5. User receives a caffeine cutoff reminder and a morning brief (score + first open block) — all notifications customizable in timing
**Plans**: 4 plans

Plans:
- [x] 04-01-PLAN.md — Jest mocks + notification-store Zustand slice
- [x] 04-02-PLAN.md — Notification service upgrade (warm copy, morning brief, SDK 55 handler)
- [x] 04-03-PLAN.md — Night Sky components (StarParticles, RechargeArc, BedtimeTipCycler, NightSkyOverlay)
- [x] 04-04-PLAN.md — useNightSkyMode hook + Today screen wiring + Settings notification preferences

**UI hint**: yes

### Phase 5: Live Activities & Recovery Score
**Goal**: Users can glance at Dynamic Island or lock screen to see their sleep status, and the Today screen shows a meaningful plan-adherence score
**Depends on**: Phase 4
**Requirements**: LIVE-01, LIVE-02, LIVE-03, SCORE-01, SCORE-02, SCORE-03
**Success Criteria** (what must be TRUE):
  1. During wind-down, the Dynamic Island shows a countdown to bedtime without opening the app
  2. At bedtime, the Live Activity transitions to a calm "Sleep" message with the ShiftWell logo
  3. In the morning, the Live Activity shows the sleep score or AM routine countdown
  4. The Today screen prominently displays a Shift Readiness Score based on how closely the user followed their plan
  5. Score trends are visible over time — user can see if they're improving or slipping
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — adherence-calculator + score-store (data layer, SCORE-01/03)
- [x] 05-02-PLAN.md — useRecoveryScore extension + Today screen gate fix (SCORE-01/02/03)
- [x] 05-03-PLAN.md — live-activity-service stub + useNightSkyMode wiring (LIVE-01/02/03)

**UI hint**: yes

### Phase 6: Premium, Settings & Polish
**Goal**: The full premium experience is gated behind a 14-day trial with a graceful free-tier fallback, referrals are enabled, and the app is beta-ready
**Depends on**: Phase 5
**Requirements**: PREM-01, PREM-02, PREM-03, PREM-04, PREM-05, PREM-06, SET-01, SET-02, SET-03
**Success Criteria** (what must be TRUE):
  1. New user automatically gets 14 days of full premium access — no paywall, no restrictions, no dark patterns
  2. After trial ends, the app gracefully downgrades: user sees clear messaging about what they lose, retains algorithm + manual entry + basic today view
  3. Pricing is clearly presented ($6.99/mo, $49.99/yr, $149.99 lifetime) with easy cancellation
  4. User can share a referral link from Settings — "Spread the Sleep" is findable without hunting
  5. User can edit their profile, AM/PM routines, and preferences post-onboarding without starting over
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md — Trial state in premium-store + entitlement gating (PREM-01/02/03/04)
- [ ] 06-02-PLAN.md — Paywall redesign + downgrade screen (PREM-05/06)
- [ ] 06-03-PLAN.md — Referral + profile editing + Sleep Focus in Settings (SET-01/02/03)
- [ ] 06-04-PLAN.md — TypeScript polish + downgrade redirect + trial countdown badge

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Onboarding | 4/4 | Complete | 2026-04-02 |
| 2. Calendar Sync | 4/4 | Complete | 2026-04-02 |
| 3. Sleep Plan Generation | 3/3 | Complete | 2026-04-02 |
| 4. Night Sky Mode & Notifications | 4/4 | Complete | 2026-04-02 |
| 5. Live Activities & Recovery Score | 3/3 | Complete | 2026-04-02 |
| 6. Premium, Settings & Polish | 0/4 | Partial (code shipped outside GSD; gaps tracked in v1.0-MILESTONE-AUDIT.md) | - |
