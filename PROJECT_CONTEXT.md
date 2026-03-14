# NightShift — Project Context & Baseline

> **Created:** 2026-03-14
> **Founder:** ED Physician (Emergency Department) — first-time app builder
> **Status:** Week 4 Complete — MVP feature-complete, 83 tests passing, ready for TestFlight

---

## How This Project Started

This project originated from a brainstorming session exploring physician side-project ideas that leverage the rare combination of clinical expertise and tech interest. After generating and scoring 8 initial ideas across dimensions like feasibility, moat, revenue potential, and regulatory risk (documented in `PHYSICIAN_SIDE_PROJECT_IDEAS.md`), the founder proposed a 9th idea that immediately scored highest: **a sleep optimization app for shift workers**.

The insight was simple: as an ED physician who rotates through day shifts, night shifts, and everything in between, the founder lives the problem every week. No existing app solves it well.

---

## The Problem

**700 million people globally work shifts.** In the US alone, 16 million are healthcare workers, and 32% report short sleep duration due to shift work. Shift Work Sleep Disorder affects 10-38% of night shift workers, and the American Heart Association (2025) formally linked circadian disruption to cardiovascular disease, obesity, and diabetes.

Despite this, shift workers are left with:
- Generic sleep advice ("get 7-9 hours") that ignores their reality
- Manual trial-and-error to figure out when to sleep around rotating schedules
- Fragmented tools that each do one thing (Timeshifter does circadian advice but no calendar sync; Arcashift has buggy calendar import; SleepSync isn't publicly available)
- Zero integration between their work schedule and their sleep plan

**No single app combines:** calendar import → AI schedule generation → Apple Health adaptation → one-click calendar export → meal timing → nap placement → caffeine management.

---

## The Solution: NightShift

An AI-powered circadian rhythm optimization app that:

1. **Imports your shift schedule** from iCal, Google Calendar, or QGenda (the founder uses QGenda with auto-sync via subscribed calendar)
2. **Reads your full personal calendar** (appointments, kids' activities, social plans) to understand constraints
3. **Generates a complete, science-backed plan** — optimal sleep windows, strategic naps, caffeine cutoffs, meal timing, light exposure protocols — all personalized to your chronotype, household, and preferences
4. **Exports everything back to your calendar** with one click, so sleep blocks, nap windows, and caffeine cutoffs appear as events alongside your existing schedule
5. **Adapts dynamically** (Phase 2) based on Apple Health data — if you slept poorly, the plan adjusts

### Why It's Bigger Than Night Shift Workers

The core algorithm is universal circadian math. The same engine powers different "modes" for different audiences:
- **Shift workers** (MVP): nurses, paramedics, police, factory workers
- **Travelers** (Phase 4): jet lag protocols with calendar integration
- **Surgeons/on-call physicians**: adaptive plans that handle 2am disruptions
- **New parents**: sleep optimization around feeding schedules
- **DJs, bartenders, security**: irregular schedule support
- **Students**: night school + study block protection
- **Military**: watch schedule optimization

Total addressable market: essentially anyone who doesn't work 9-5.

---

## Competitive Landscape

| App | Calendar Import | Apple Health Adapt | Sleep Schedule Gen | Meal Timing | Auto-Sync to Cal | Price |
|-----|:-:|:-:|:-:|:-:|:-:|-------|
| **Timeshifter** | No (manual entry) | No | Yes (circadian) | No | No | $10/mo |
| **Arcashift** | Yes (buggy) | Partial | Yes | No | No | Free/Premium |
| **SleepSync** (Monash) | No | No | Yes | No | No | Not launched |
| **Sleep Aid** | Yes | No | Basic | No | No | Free |
| **NightShift** | Auto iCal/Google | Yes (dynamic) | Yes + naps | Yes (meals) | Yes (one-click) | TBD |

**Key gap:** No competitor combines calendar import + science-backed schedule generation + personal calendar awareness + one-click export + meal timing + nap placement. Timeshifter is Harvard-backed and award-winning but has no calendar integration at all.

---

## Key Decisions Made

### Tech Stack: Expo (React Native) + TypeScript
- **Why not Swift/native?** The founder has never built an app. AI coding tools have the deepest JS/TS coverage. Expo abstracts away Xcode/native build complexity. Cross-platform is a free bonus.
- **Why not a web app first?** Apple HealthKit (Phase 2) requires native. The mobile experience is critical for shift workers checking their plan at 3am.

### Algorithm: Deterministic, Not LLM-Based
- Circadian science is well-established math (Two-Process Model, Borbely 1982). Given shift times + chronotype + sleep history → optimal sleep window is a pure computation.
- Deterministic = testable, reproducible, zero API cost, works offline.
- LLM personalization layered on in Phase 5 (conversational AI sleep coach).

### Platform: iOS First
- Most US healthcare workers use iPhones
- Apple HealthKit is iOS-only
- Founder has a Mac for development
- Android via React Native comes free later

### MVP: Focused on Core Value
- Import shifts → generate plan → export to calendar
- No backend, no accounts, no OAuth, no HealthKit in v1
- Ship fast, validate with real users, iterate

---

## What's Been Built (Week 1)

### Core Algorithm Engine (11 TypeScript modules, 20 passing tests)

```
src/lib/circadian/
├── types.ts              — Type definitions, chronotype offsets (Horne & Ostberg, 1976)
├── classify-shifts.ts    — Pattern detection: day/night/evening/extended/transition/recovery
├── sleep-windows.ts      — THE BRAIN: computes optimal sleep blocks per day type
│                           Uses anchor sleep strategy (NIOSH/CDC), Two-Process Model,
│                           gradual delay protocol (Eastman & Burgess, 2009)
├── nap-engine.ts         — Strategic nap placement (Milner & Cote 2009, Ruggiero & Redeker 2014)
│                           Pre-shift 90-min cycles for nights, 25-min power naps for days
├── caffeine.ts           — Personalized cutoff: sleepOnset - (halfLife × 1.67)
│                           Based on Drake et al. (2013): caffeine 6h before bed still reduces sleep 1h
├── meals.ts              — Circadian-aligned timing (Manoogian 2022, Chellappa 2021)
│                           Time-restricted eating, front-loaded calories, fasting before sleep
├── light-protocol.ts     — Light exposure/avoidance (Czeisler 1990, Eastman & Burgess 2009)
│                           Blue-blockers for post-night commute, bright light for recovery days
└── index.ts              — Public API: generateSleepPlan()

src/lib/calendar/
├── ics-parser.ts         — Parses .ics files with shift detection heuristics
│                           Handles recurring events, QGenda exports, keyword matching
├── ics-generator.ts      — Generates RFC 5545 .ics with color-coded events, alarms, categories
└── shift-detector.ts     — Separates shifts from personal events by duration + keywords
```

### Algorithm Pipeline
1. **Classify** each day → day/night/evening/extended/transition/recovery/off
2. **Compute** main sleep windows per day type (conflict-aware)
3. **Place** strategic naps in gaps (pre-shift prophylactic, power, transition)
4. **Calculate** caffeine cutoffs relative to first upcoming sleep block
5. **Generate** meal timing (circadian-metabolic aligned)
6. **Schedule** light exposure/avoidance protocols
7. **Aggregate** stats (avg sleep, circadian debt score, night count, transitions)

### What the Algorithm Handles
- Night shifts: anchor sleep + pre-shift nap + blue-blocker commute protocol
- Day shifts: chronotype-aligned natural sleep
- Evening shifts: delayed but aligned sleep
- Transition to nights: gradual 2h/day delay protocol
- Recovery days: split sleep (morning recovery + early bedtime)
- Extended shifts (24h): pre-shift banking + extended recovery
- Personal event conflicts: automatic sleep window adjustment
- Household factors: young children → earlier sleep start, shorter wind-down

### Project Scaffolding
- Expo SDK 55, React Native 0.83, React 19, TypeScript 5.9
- Expo Router (file-based routing with tabs template)
- Zustand for state, AsyncStorage for persistence
- ical.js for calendar parsing, date-fns for date math
- Jest + ts-jest for testing (20 tests passing)
- Bundle ID: `com.nightshift.app`, dark UI theme configured

---

## What's Been Built (Week 2) — Core UI

### Theme & Design System
- Dark-mode-first color palette with block-type colors (sleep: purple, shifts: blue/orange/amber, meals: green, caffeine: red)
- Typography scale (xs-4xl), spacing tokens (4pt grid), border radii
- Updated Expo Router Colors.ts to use new theme

### State Management (3 Zustand Stores)
- **user-store:** UserProfile + onboarding state, AsyncStorage persisted
- **shifts-store:** CRUD for shifts/personal events, date-aware serialization, auto shift type classification
- **plan-store:** Derived SleepPlan, auto-regenerates via subscriptions when shifts or profile change

### Shared UI Components (6)
Button (primary/secondary/ghost), Card, ProgressBar, OptionCard, TimeRangePicker, barrel export

### Onboarding Flow (6 files)
- Entry router (checks onboarding state, redirects accordingly)
- Welcome screen with value propositions
- Chronotype quiz (5-question simplified MEQ → early/intermediate/late)
- Household profile (size, young children, pets)
- Sleep preferences (hours, nap preference, caffeine sensitivity, commute time)

### Calendar & Shift Entry (6 files)
- MonthView with color-coded dots per block type, day selection, month navigation
- DayDetail panel showing chronological events with color bars
- Schedule tab wired to shifts + plan stores
- Add/edit shift modal with time pickers and auto type detection
- Settings placeholder

### Navigation
- 3-tab layout: Today, Schedule, Settings (with icons)
- Root stack with onboarding group + modal screens
- 20 algorithm tests still passing

---

## What's Been Built (Week 3) — Today Screen + Import/Export

### Today Screen (Daily Driver)
- Timeline view with color-coded blocks, active/next/past states
- CountdownCards with live timers ("Sleep in 3h 22m", "Caffeine cutoff in 1h")
- InsightBanner with contextual circadian advice per day type
- TipCard with evidence-based tip of the day (25+ tips, scientific refs)
- Pull-to-refresh, empty states with CTAs
- useTodayPlan custom hook

### Import/Export
- 3-step .ics import: file picker → parse & review → confirm
- useExport hook: generateICS → temp file → share sheet
- Configurable export options (meals, light, caffeine, naps)

### Settings Screen
- Import/export sections with shift counts
- Profile display (chronotype, sleep need, caffeine sensitivity)
- About section with science references
- Reset onboarding, clear all data (with confirmations)

### Sleep Tips Engine
- 25+ evidence-based tips organized by category (sleep, caffeine, light, nutrition, recovery)
- getTipsForDay() and getTipOfTheDay() functions
- All tips sourced from peer-reviewed research

---

## What's Been Built (Week 4) — Polish + Ship Prep

### Animations
- AnimatedTransition (reusable fade-in/slide-up)
- Staggered welcome screen animations
- Smooth chronotype quiz transitions
- CountdownCard pulsing glow, TimelineEvent state animations
- MonthView month transitions, Button/OptionCard press feedback

### Testing (83 tests, all passing)
- Edge cases: back-to-back shifts, 24h shifts, 7 consecutive nights, midnight shifts, chronotype extremes, household adjustments, caffeine sensitivity
- Nap engine, caffeine cutoffs, meal timing, ICS parser

### Ship Configuration
- eas.json (dev/preview/production build profiles)
- app.json (production: dark mode, splash, bundle ID)
- App Store metadata draft
- Icon generation instructions

---

## What's Next (to ship)

1. **Generate app icon** — Follow instructions in `assets/icons/README.md`
2. **Test on physical iPhone** — `npx expo start` → scan QR
3. **EAS build** — Fill in Apple credentials in `eas.json`, run `eas build --platform ios --profile preview`
4. **TestFlight** — `eas submit --platform ios`, distribute to beta testers
5. **Iterate** — Tune algorithm based on real-world feedback

---

## Feature Roadmap (Full Vision)

### Phase 1 — MVP (Weeks 1-6)
Core loop: import shifts → generate plan → export to calendar

### Phase 2 — Smart Features (Weeks 7-12)
- Supabase backend, user accounts, subscribable calendar URLs
- Google Calendar OAuth, Apple HealthKit adaptation
- Push notifications, recovery score, caffeine/light tracking screens
- Smart sleep window notifications ("Phone down. Your body needs this.")
- Soundscapes (brown noise, rain, white noise, binaural beats)
- Family/spouse notifications ("Alex is recovering, keep it quiet until 3pm")
- Weekly/Monthly Sleep Intelligence Report (magazine-style briefing)

### Phase 3 — iOS Power Features (Months 4-6)
- Live Activities + Dynamic Island (lock screen countdowns)
- Home Screen Widgets (WidgetKit)
- Sleep Focus automation (auto-trigger iOS Focus mode)
- Alarm automation (via Shortcuts)
- Apple Watch (complications + haptic alerts)
- Social/Family Mode, Shift Transition Planner

### Phase 4 — Audience Expansion (Months 6+)
- Jet Lag Mode (travelers)
- On-Call Mode (surgeons, residents)
- New Parent Mode (feeding schedule optimization)
- Gig/Nightlife Mode (DJs, bartenders)
- Student Mode (night school + study protection)

### Phase 5 — AI Agent + B2B (Month 8+)
- In-app conversational AI sleep coach (Claude API)
- B2B team dashboards, fatigue risk scoring
- Corporate wellness (OSHA/Joint Commission compliance)

---

## Market Data

- mHealth market: **$82.45B** (2025), growing 22.3% CAGR
- Healthcare AI VC investment: **$11.1B** (2024)
- Shift workers globally: **700 million**
- US healthcare workers with short sleep: **32%** (5M of 16M)
- Shift Work Disorder prevalence: **10-38%** of night shift workers
- 20% of physicians actively exploring side businesses
- 41% of global code is now AI-generated (vibe coding era)

---

## Scientific Foundation

Every algorithm recommendation traces to published research:

1. **Two-Process Model** (Borbely, 1982) — Foundational sleep regulation model
2. **AASM Clinical Practice Guidelines** (2015, 2023) — Shift Work Disorder treatment
3. **Eastman & Burgess (2009)** — Practical circadian shifting protocols
4. **Czeisler et al. (1990)** — Bright light + circadian adaptation (1h/day shift rate)
5. **Drake et al. (2004)** — SWSD prevalence and significance
6. **AHA Scientific Statement (2025)** — Circadian disruption ↔ cardiovascular disease
7. **Boivin & Boudreau (2014)** — Shift work sleep interventions review
8. **NIOSH Training for Nurses (CDC)** — Anchor sleep strategy
9. **Gander et al. (2011)** — Fatigue risk management systems
10. **St. Hilaire et al. (2017)** — Mathematical modeling of circadian phase shifts
11. **Milner & Cote (2009)** — Benefits of napping in healthy adults
12. **Ruggiero & Redeker (2014)** — Napping and shift work
13. **Drake et al. (2013)** — Caffeine effects taken 0, 3, 6h before bed
14. **Manoogian et al. (2022)** — Time-restricted eating for shift workers
15. **Chellappa et al. (2021)** — Daytime eating prevents mood vulnerability in night work

---

## Repository Structure

```
claude-prompts/
├── PHYSICIAN_SIDE_PROJECT_IDEAS.md    — Original brainstorming (9 scored ideas)
├── setup-claude-code.sh               — Claude Code setup script
└── nightshift/                        — THE APP
    ├── IMPLEMENTATION_PLAN.md         — Full build plan (this file's companion)
    ├── PROJECT_CONTEXT.md             — This file (baseline context)
    ├── app.json                       — Expo config
    ├── package.json                   — Dependencies
    ├── tsconfig.json                  — TypeScript config
    ├── jest.config.js                 — Test config
    ├── src/lib/circadian/             — Algorithm engine (7 modules)
    ├── src/lib/calendar/              — ICS parser/generator (3 modules)
    ├── __tests__/circadian/           — Unit tests (20 passing)
    ├── app/                           — Expo Router screens (template, to be customized)
    ├── components/                    — UI components (template, to be customized)
    └── assets/                        — Icons, fonts, images
```

---

## Instructions for Future Sessions

When resuming work on this project in a new conversation:

1. **Read this file first** (`PROJECT_CONTEXT.md`) for full context
2. **Read `IMPLEMENTATION_PLAN.md`** for the detailed build plan and current phase
3. **Check the current week** in the build order to know what to work on next
4. **Run `npx jest`** in the `nightshift/` directory to verify the algorithm still passes
5. The algorithm is the core IP — any changes to `src/lib/circadian/` must maintain all existing tests
6. The founder is a physician with no coding experience — explain decisions clearly
7. Dark-mode-first UI, professional quality, science-backed everything
8. Branch: `claude/physician-side-project-ideas-UIAPK`

### Context Window Optimization — Subagent Policy

**Always prefer spawning subagents for parallelizable or self-contained tasks.** This keeps the main conversation context lean and focused on decision-making with the founder.

Use subagents for:
- **Research tasks** (web searches, competitive analysis, library comparisons)
- **File generation** (writing new modules, components, tests, documentation)
- **Exploration** (codebase searches, understanding existing patterns)
- **Planning** (architecture design, implementation strategy)
- **Bulk operations** (creating multiple files, refactoring across files)
- **Documentation updates** (updating PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md after milestones)

Keep in the main thread:
- Key decisions that need the founder's input
- High-level status updates at milestones
- Errors or blockers that change the plan
- Final commit/push operations

When multiple independent tasks exist (e.g., "build 3 UI components"), spawn parallel subagents rather than building sequentially in the main thread. This is faster AND preserves context.
