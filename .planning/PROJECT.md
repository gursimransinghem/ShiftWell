# ShiftWell

## What This Is

An AI-powered circadian rhythm optimization app that automates sleep scheduling for shift workers. Import your calendar, and ShiftWell generates a complete, science-backed sleep plan — optimal sleep windows, strategic naps, caffeine cutoffs, meal timing, light protocols — all exported back to your calendar as real events. Built by an Emergency Medicine physician who lives the problem.

## Core Value

**Sleep on autopilot.** Set it up once, never think about when to sleep again. The calendar is the interface — the app is the brain.

## Current Milestone: v1.0 — TestFlight

**Goal:** Deliver the core autopilot promise — calendar sync, sleep plan generation, Night Sky Mode, Live Activities — polished enough for 20 beta testers.

**Target features:**
- Calendar sync (Apple + Google) with auto sleep block generation
- Redesigned onboarding with AM/PM routine builder
- Night Sky Mode (adaptive bedtime UI)
- Live Activities (wind-down countdown → sleep → morning score)
- Push notification cadence (wind-down, caffeine, morning brief)
- 14-day full premium trial with graceful downgrade
- Blend design (dark + warm accents)

## Requirements

### Validated

_Shipped and confirmed working._

- ✓ Core circadian algorithm engine (11 modules, 83 tests) — v0.1
- ✓ ICS import/export pipeline — v0.1
- ✓ Chronotype quiz (simplified MEQ) — v0.1
- ✓ Today screen (timeline, countdowns, insights, tips) — v0.1
- ✓ Calendar view (month, day detail, shift CRUD) — v0.1
- ✓ Settings screen (import/export, profile, about) — v0.1
- ✓ Onboarding flow (welcome, chronotype, household, sleep prefs) — v0.1
- ✓ Animations (transitions, pulsing, press feedback) — v0.1
- ✓ Borbely two-process energy model — v0.1
- ✓ Phase 2 infra (Supabase client, auth store, HealthKit service, premium service, notification service, sync engine) — v0.1 (partial)

### Active

_Building toward these in v1.0._

- [ ] Calendar sync: Apple Calendar (read + write sleep events)
- [ ] Calendar sync: Google Calendar (read + write sleep events)
- [ ] Onboarding: AM routine builder (wake, shower, breakfast, kids/pets, commute)
- [ ] Onboarding: PM routine builder (dinner, wind-down, phone down, lights out)
- [ ] Onboarding: work/home address for commute calculation
- [ ] Night Sky Mode (fireflies, minimal UI, recharge animation, alarm confirmation)
- [ ] Live Activities: wind-down countdown
- [ ] Live Activities: bedtime message ("Sleep [logo]")
- [ ] Live Activities: morning score / AM routine timer
- [ ] Push notifications: wind-down reminder
- [ ] Push notifications: caffeine cutoff
- [ ] Push notifications: morning brief (score + first open block)
- [ ] Recovery Score (basic — plan adherence)
- [ ] 14-day full premium trial flow
- [ ] Premium downgrade to free tier (algorithm + manual entry + basic today)
- [ ] "Spread the Sleep" referral in Settings
- [ ] Blend design system (dark base + warm accents)

### Out of Scope

_Explicit boundaries for v1.0._

- AI weekly check-in — v1.1 (requires Claude API integration)
- HealthKit feedback loop — v1.1 (needs real user sleep data first)
- Gamification (streaks, levels) — v1.2 (engagement layer)
- Shift Crew — v1.2 (social infrastructure)
- Household mode — v1.2 (multi-user architecture)
- SMS notifications — v2.0 (Twilio integration)
- Apple Watch — v2.0 (watchOS development)
- B2B dashboards — v2.0 (enterprise features)
- Soundscapes / meditation — Deferred indefinitely (not our lane)
- Social feed / community — Deferred indefinitely (distraction from core)

## Context

**Technical environment:**
- Expo SDK 55, React Native 0.83, React 19, TypeScript 5.9
- Zustand + AsyncStorage (local-first)
- Supabase (auth, DB, sync — partially wired)
- RevenueCat (premium — service exists, needs paywall flow)
- HealthKit service exists but not yet feeding back to algorithm

**Prior work:** 4 weeks of rapid MVP development. Core algorithm is the IP — 11 modules, 83 tests, all passing. UI exists for onboarding, today screen, calendar view, settings. Phase 2 infrastructure partially wired (Supabase, auth, HealthKit, premium, notifications, sync).

**Competitive landscape:** 38 products analyzed. No competitor combines calendar sync + AI + social coordination + routine builder + Live Activities. Timeshifter is closest but requires manual entry and costs $69.99/yr. Rise Science has the best UI but breaks for shift workers. Full analysis: `.planning/research/COMPETITOR_ANALYSIS.md`

**Brand positioning:** Premium, confident, mission-first. "Built by an ED physician who lives the problem." NEVER desperate for signups. The product speaks for itself.

## Constraints

- **Platform:** iOS first (Apple HealthKit, physician iPhone use, founder's dev environment)
- **Budget:** Bootstrap — minimize recurring costs, free tiers where possible. ~$1,600 to launch.
- **Timeline:** TestFlight in 4-6 weeks. Sim handles LLC/Apple Dev/trademark in parallel.
- **Privacy:** Physician-grade data ethics. Data stays on device unless user opts into sync.
- **Design:** Dark base + warm accents. Premium, not clinical. Gold on black brand identity.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: ShiftWell | Sim loves it. BCEHS app abandoned. No USPTO trademark. Will file our own. | — Pending (trademark search) |
| AI: Built-in Claude API | Seamless UX > bring-your-own. ~$0.40/user/mo. AI is the moat. | ✓ Good |
| Pricing: $6.99/mo, $49.99/yr | Between Sleep Cycle ($30/yr, declining) and Rise ($70/yr, complaints). Sweet spot per research. | — Pending |
| Trial: 14-day full premium | 45.7% conversion rate. Full experience builds loss aversion. No paywall. | ✓ Good |
| Calendar export as free/premium divide | Free: see plan. Premium: export to calendar. Natural conversion point. | ✓ Good |
| Expo/React Native over Swift | AI tools have deepest JS/TS coverage. Cross-platform bonus. Founder is non-technical. | ✓ Good |
| Algorithm: deterministic, not LLM | Circadian science is math. Testable, reproducible, zero API cost, offline. | ✓ Good |
| Enterprise: compliance > wellness | Calm sells "nice to have." We sell "must have." Faster enterprise adoption path. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-02 after milestone v1.0 initialization*
