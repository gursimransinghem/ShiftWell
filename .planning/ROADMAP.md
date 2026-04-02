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

- [ ] **Phase 1: Foundation & Onboarding** - Design system refresh + complete routine builder onboarding
- [ ] **Phase 2: Calendar Sync** - Apple + Google read/write with auto-detection and dynamic updates
- [ ] **Phase 3: Sleep Plan Generation** - Algorithm-to-calendar pipeline with dynamic rescheduling
- [ ] **Phase 4: Night Sky Mode & Notifications** - Bedtime UI + warm push notification cadence
- [ ] **Phase 5: Live Activities & Recovery Score** - Dynamic Island pipeline + plan adherence score
- [ ] **Phase 6: Premium, Settings & Polish** - Trial flow, free tier, referral, and final quality pass

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
- [ ] 01-01-PLAN.md — Design system gold tokens + UI component color audit + data model extension
- [ ] 01-02-PLAN.md — AM/PM routine builder screens + preferences cleanup
- [ ] 01-03-PLAN.md — Address entry screen + commute estimation utility + expo-location config
- [ ] 01-04-PLAN.md — Layout wiring + existing screen polish + user store tests + visual checkpoint

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
**Plans**: TBD
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
**Plans**: TBD

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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Onboarding | 0/4 | Planned | - |
| 2. Calendar Sync | 0/TBD | Not started | - |
| 3. Sleep Plan Generation | 0/TBD | Not started | - |
| 4. Night Sky Mode & Notifications | 0/TBD | Not started | - |
| 5. Live Activities & Recovery Score | 0/TBD | Not started | - |
| 6. Premium, Settings & Polish | 0/TBD | Not started | - |
