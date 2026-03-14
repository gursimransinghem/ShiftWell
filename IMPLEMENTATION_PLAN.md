# ShiftWell App — Implementation Plan

> **Scope:** This document covers the technical "how and when" — stack, structure, build order, phases, and features.
> **For project background** (problem, market, competitive landscape, decisions, science): see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)

**Goal:** Working MVP on TestFlight in ~4-6 weeks, App Store submission shortly after.

> **Business plan:** See [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) for LLC setup, monetization, marketing, legal, and financial planning.

---

## Phase 0 — Business Setup (Pre-Launch)

| Step | Action | Status |
|------|--------|--------|
| 1 | Form single-member LLC | ⬜ |
| 2 | Get EIN from IRS | ⬜ |
| 3 | Open business bank account | ⬜ |
| 4 | Register domain | ⬜ |
| 5 | Enroll in Apple Developer Program ($99/yr) | ⬜ |
| 6 | Create privacy policy page | ⬜ |
| 7 | Generate app icon | ⬜ |
| 8 | Test on physical iPhone | ⬜ |
| 9 | Beta test with 10-20 shift workers (2 weeks) | ⬜ |
| 10 | Submit to App Store | ⬜ |

See [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) for detailed instructions on each step.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Expo (React Native) + Expo Router | Abstracts native complexity, file-based routing is intuitive, AI coding tools have deepest JS/TS support |
| **Language** | TypeScript | Type safety catches bugs early, great autocomplete |
| **State** | Zustand + AsyncStorage | Simplest state management, persists locally |
| **Sleep Algorithm** | Deterministic TypeScript (pure functions) | Circadian science is established math — no LLM needed. Testable, offline, zero API cost |
| **Calendar Parsing** | ical.js | Zero-dependency, works in React Native, handles recurring events |
| **Calendar Export** | Custom .ics generator (RFC 5545) | Simple text format, subscribable in any calendar app |
| **Backend (Phase 2)** | Supabase | Auth, Postgres, Edge Functions, Storage — generous free tier |
| **HealthKit (Phase 2)** | @kingstinct/react-native-healthkit | Production-ready Expo plugin, TypeScript, Nitro Modules |
| **Builds** | EAS (Expo Application Services) | Cloud iOS builds, TestFlight submission, no Xcode wrangling |

---

## MVP Scope (Phase 1 — Weeks 1-4)

**IN:**
- Onboarding: chronotype quiz (simplified MEQ), sleep need preference, household size (# of people, kids ages — factors into noise/interruption modeling and realistic sleep windows)
- Shift entry: manual add/edit + .ics file import (covers QGenda export)
- **Personal calendar integration:** Import the user's main Apple/Google Calendar (not just shifts). The algorithm reads all events — kids' activities, appointments, social plans — and fits sleep windows around existing commitments. "You have a dentist appt at 10am, so your post-night-shift sleep window shifts to 11:30am-17:00"
- Core algorithm: sleep windows, nap placement, caffeine cutoffs, meal timing — all aware of personal calendar conflicts
- Calendar view: month view showing shifts (color-coded) + generated sleep/nap/meal blocks
- Today screen: glanceable timeline with countdowns ("Sleep in 3h", "Caffeine cutoff in 1h")
- **Sleep Tips & Insights:** Contextual, evidence-based tips surfaced at relevant moments (e.g., "Pre-night-shift: avoid bright screens 2h before your anchor nap" or "Your sleep debt is accumulating — prioritize tonight's full block")
- One-tap .ics export via share sheet (user imports into Apple/Google Calendar)
- Dark-mode UI throughout (shift workers use phones at night)

**OUT (deferred to Phase 2+):**
- Google Calendar OAuth sync
- Apple HealthKit integration
- Subscribable calendar URL (auto-updating)
- Push notifications
- User accounts / backend
- Apple Watch

---

## Project Structure

```
nightshift/
├── app/                           # Expo Router screens (MUST be at root, not src/)
│   ├── _layout.tsx               # Root layout (providers, fonts, theme)
│   ├── index.tsx                 # Entry → onboarding or tabs
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── chronotype.tsx        # MEQ quiz
│   │   └── preferences.tsx       # Sleep need, nap pref
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar
│   │   ├── schedule.tsx          # Calendar view
│   │   ├── today.tsx             # Today's plan
│   │   └── settings.tsx          # Preferences, export, about
│   ├── add-shift.tsx             # Modal: add/edit shift
│   └── import.tsx                # Import .ics file
├── src/
│   ├── components/
│   │   ├── calendar/             # MonthView, DayCell, ShiftBlock, SleepBlock
│   │   ├── onboarding/           # ChronotypeQuiz
│   │   └── ui/                   # Button, Card, TimeRangePicker
│   ├── lib/
│   │   ├── circadian/            # THE ALGORITHM (pure TS, no React)
│   │   │   ├── types.ts
│   │   │   ├── classify-shifts.ts
│   │   │   ├── sleep-windows.ts
│   │   │   ├── nap-engine.ts
│   │   │   ├── caffeine.ts
│   │   │   ├── meals.ts
│   │   │   ├── light-protocol.ts
│   │   │   └── index.ts          # Public API: generateSleepPlan()
│   │   ├── calendar/
│   │   │   ├── ics-parser.ts
│   │   │   ├── ics-generator.ts
│   │   │   └── shift-detector.ts
│   │   └── storage/
│   │       └── async-storage.ts
│   ├── hooks/                    # useShifts, useSleepPlan, useOnboarding
│   ├── store/
│   │   └── shifts-store.ts       # Zustand store
│   └── theme/                    # Colors, typography (dark mode)
├── __tests__/
│   └── circadian/                # Unit tests for algorithm
├── constants/                    # App constants
└── assets/                       # Icon, splash, fonts
```

---

## Build Order (Week by Week)

### Week 1: Foundation + The Algorithm [COMPLETED]

**Days 1-2: Project scaffolding**
- `npx create-expo-app nightshift --template tabs`
- Install deps: `zustand`, `date-fns`, `ical.js`, `@react-native-async-storage/async-storage`
- Set up directory structure, TypeScript config, dark theme
- Configure `app.json` (bundle ID: `com.nightshift.app`)

**Days 3-5: Circadian algorithm (the core IP)**
Build and unit-test these pure TypeScript modules with zero UI:
1. `types.ts` — ShiftEvent, UserProfile, SleepBlock, SleepPlan types
2. `classify-shifts.ts` — Given shift times, classify as day/night/evening/off/transition
3. `sleep-windows.ts` — For each classified day, compute main sleep block using the two-process model:
   - Night shifts: anchor sleep 08:00-15:00, pre-shift nap 18:00-19:00
   - Day shifts: sleep 23:00-06:30 (chronotype-adjusted)
   - Evening shifts: sleep 01:00-09:00
   - Transitions: gradual 2h/day delay or advance
4. `nap-engine.ts` — Strategic nap placement for night shifts and transitions
5. `caffeine.ts` — Cutoff = target sleep onset - (half-life * 1.67)
6. `meals.ts` — Meal windows in first 10h of wake, fasting last 3h before sleep

**Days 6-7: Calendar parsing + generation**
1. `ics-parser.ts` — Parse .ics files using ical.js into ShiftEvent[]
2. `shift-detector.ts` — Filter events: duration >= 6h, keyword matching ("shift", "ED", etc.)
3. `ics-generator.ts` — Generate RFC 5545 .ics with VEVENT blocks for sleep, naps, meals, caffeine cutoffs

### Week 2: Core UI [COMPLETED]

**Days 8-10: Onboarding flow**
- Welcome screen with app value proposition
- Simplified chronotype quiz (5 questions from MEQ)
- Household profile: # of people, kids (ages), pets — factors into noise/interruption modeling and sleep window realism
- Sleep preferences (hours needed, nap preference, caffeine sensitivity)
- Store results in Zustand → AsyncStorage

**Days 11-14: Calendar view + shift entry**
- Month calendar component with color-coded dots (shifts: blue/orange, sleep: purple, naps: light purple)
- "Add Shift" modal with start/end time pickers and auto shift type detection
- Zustand store CRUD for shifts (persisted with date-aware serialization)
- Plan store auto-regenerates via subscriptions when shifts or profile change
- Dark theme design system (colors, typography, spacing tokens)
- Shared UI components: Button (3 variants), Card, ProgressBar, OptionCard, TimeRangePicker
- 3-tab navigation: Today, Schedule, Settings

### Week 3: Today Screen + Import/Export [COMPLETED]

**Days 15-17: Today screen**
- Timeline view with color-coded blocks and active/next/past states
- CountdownCards with live timers ("Sleep in 3h 22m")
- Status header (on shift, sleep window, greeting)
- InsightBanner with contextual circadian advice
- TipCard with evidence-based tip of the day (25+ tips with scientific refs)
- Pull-to-refresh plan regeneration, empty states with CTAs
- useTodayPlan hook for all data derivation

**Days 18-19: .ics import**
- 3-step flow: file picker → parse & review detected shifts → confirm import
- Checkboxes for shift selection, colored type badges
- Uses expo-document-picker + expo-file-system

**Days 20-21: .ics export**
- useExport hook: generateICS → temp file → expo-sharing share sheet
- Configurable export options (meals, light protocol, caffeine, wind-down, naps)

### Week 4: Polish + TestFlight [COMPLETED]

**Days 22-24: Visual polish**
- AnimatedTransition component (fade-in/slide-up)
- Welcome screen staggered animations
- Chronotype quiz smooth question transitions
- CountdownCard pulsing glow on urgent items
- TimelineEvent active/next state animations
- MonthView smooth month transitions and selection animation
- Button/OptionCard press scale animations (tactile feedback)

**Days 25-26: Testing (83 tests passing)**
- Edge case tests: back-to-back shifts, 24h shifts, 7 consecutive nights, midnight shifts, chronotype extremes, household adjustments
- Nap engine tests: prophylactic, power, preference toggle
- Caffeine tests: sensitivity levels, cutoff timing
- Meal tests: night shift nutrition, fasting periods
- ICS parser tests: single/multi events, shift detection, malformed input

**Days 27-28: TestFlight deployment**
- eas.json configured (dev/preview/production profiles)
- app.json production-ready (dark mode, splash, bundle ID)
- App Store metadata drafted (description, keywords, category)
- Icon generation instructions provided
- Distribute to 5-10 fellow shift workers

### Weeks 5-6: Iterate + App Store

- Fix issues from TestFlight feedback
- Tune algorithm based on real-world feedback from colleagues
- Add missing shift patterns (24h shifts, split shifts, on-call)
- Prepare App Store listing (screenshots, description, keywords)
- Submit to App Store review

---

## Phase 2 (Weeks 7-12): Smart Features

1. **Supabase backend** — User accounts, cross-device sync, subscribable calendar URLs
2. **Google Calendar OAuth** — Two-way shift sync
3. **Apple HealthKit** — Read actual sleep data, HRV, steps → dynamic plan adaptation
4. **Push notifications** — "Wind down in 30min", "Caffeine cutoff now"
5. **Recovery Score** — Daily readiness based on actual vs target sleep + circadian alignment
6. **Caffeine & Light screens** — Dedicated UI for tracking and protocols
7. **Smart sleep window notifications** — During sleep windows: gentle, escalating reminders ("Phone down. Your body needs this right now."). Science-referenced nudges, not generic alarms
8. **Soundscapes** — Built-in wind-down audio: brown noise, rain, white noise, binaural beats. Timer-based auto-stop after sleep onset window
9. **Family/Spouse Notifications** — Automated text or push notification to designated family member: "Alex is entering recovery sleep after a night shift. Please keep noise down until ~3pm." Also: if sleep/recovery was poor, notify spouse: "Alex had a rough recovery — may need extra support today." User controls opt-in and message tone
10. **Weekly/Monthly Sleep Intelligence Report** — A beautifully designed, magazine-style briefing delivered every Monday AM (and monthly summary). Quick-read format covering:
    - This week's schedule at a glance with sleep window changes highlighted
    - Health impact forecast: "3 night shifts in a row — your circadian debt will peak Wednesday. Recovery plan built in for Thursday"
    - Trend analysis: sleep quality trend, recovery scores, circadian alignment over time (charts)
    - Goals progress: "You hit your sleep target 5/7 days last week (up from 3/7)"
    - AI-generated suggestions: "Consider swapping your Friday shift — back-to-back night-to-day turnaround will cost you ~4 hours of sleep debt" or "Your HRV has been declining — prioritizing the Thursday nap window is critical"
    - Upcoming risks flagged proactively: "Next week has a brutal transition on Tuesday. Here's your pre-built adaptation plan"
    - Shareable: can forward to spouse, export as PDF, or share a link

## Phase 3 (Months 4-6): Native iOS Power Features

1. **Live Activities + Dynamic Island** — Real-time countdown on lock screen: "Sleep in 2h 15m" → "Wind down now" → "Lights out". Uses `ActivityKit`. Stays visible without opening the app
2. **Home Screen Widgets** — WidgetKit widgets showing today's next sleep window, recovery score, caffeine cutoff. Small, medium, and large sizes
3. **Sleep Focus Automation** — Automatically trigger iOS Sleep Focus mode at wind-down time via `INShortcut` / Shortcuts integration. Silences notifications, dims screen, enables Do Not Disturb
4. **Alarm Automation** — Set/adjust iOS alarms automatically to match the generated wake times. Uses Shortcuts integration since direct alarm API is restricted
5. **Smart Notifications** — During sleep windows: "Phone down. Your body needs this. Goodnight." Gentle, science-referenced nudges. Escalating urgency if phone is still being used during sleep window
6. **Soundscapes** — Built-in ambient audio for wind-down and sleep: brown noise, rain, white noise, binaural beats. Timer-based auto-stop. Phase 3 because audio playback in background requires careful battery management
7. **Apple Watch** — Complications: "Nap in 2h", "Caffeine cutoff in 45m", "Wind down in 30m". Haptic alerts for key transitions
8. **Social/Family Mode** — Mark available windows, share via link
9. **Shift Transition Planner** — Multi-day visual protocol for hard transitions (night-to-day turnarounds)

## Phase 4 (Months 6+): Audience Expansion

The core circadian algorithm is the same — different personas just need different input modes and UI skins:

1. **Jet Lag Mode** — Input: departure city, arrival city, trip dates. Algorithm computes optimal pre-trip circadian shifting, in-flight light/sleep protocol, and arrival adaptation plan. Timeshifter's original product but with calendar integration they lack
2. **On-Call Mode** — For surgeons, residents. Input: on-call windows. Algorithm generates "best case" and "disrupted" sleep plans. If called in at 2am, the plan auto-adjusts the next 48 hours
3. **New Parent Mode** — Input: baby feeding schedule (or connect to baby tracking app). Algorithm optimizes parent sleep shifts around feeding windows, suggests partner tag-team schedules
4. **Gig/Nightlife Mode** — For DJs, bartenders, security. Input: irregular work blocks. Algorithm handles non-repeating schedules gracefully
5. **Student Mode** — For night school, med students on rotations. Input: class schedule + study blocks. Algorithm protects sleep while maximizing productive study hours

## Phase 5 (Month 8+): AI Agent + B2B

1. **In-App AI Sleep Coach** — Conversational AI agent (Claude API) that answers questions like "I slept terribly, what should I adjust tonight?", "Can I have coffee right now?", "I picked up an extra shift tomorrow, replan my week." Personalized to the user's data
2. **B2B** — Team dashboards, fatigue risk scoring, admin portal for hospital wellness programs, airlines, EMS agencies
3. **Corporate Wellness** — Pitch to employers as fatigue risk management (OSHA/Joint Commission compliance play)

---

## Key Dependencies (MVP)

```json
{
  "expo": "~55.x",
  "expo-router": "~55.x",
  "expo-document-picker": "~55.x",
  "expo-sharing": "~55.x",
  "expo-file-system": "~55.x",
  "ical.js": "^2.2.1",
  "date-fns": "^4.x",
  "zustand": "^5.x",
  "@react-native-async-storage/async-storage": "^3.x"
}
```

---

## Verification Plan

1. **Unit tests:** Run `npx jest` — all circadian algorithm tests must pass
2. **Manual flow test:** Onboarding → enter 3 night shifts → verify sleep plan makes clinical sense → export .ics → import into Apple Calendar → verify events appear correctly
3. **QGenda test:** Export your real QGenda .ics → import into app → verify shifts detected correctly
4. **TestFlight:** Build and deploy, test on physical iPhone
5. **Peer validation:** Have 2-3 fellow ED shift workers test and validate the sleep recommendations match their intuition and experience

---

## Additional Features Brainstormed (Full List)

All of these are tracked for future phases:
- **Shift swap impact preview** — "If you take this shift, here's how your sleep plan changes"
- **Partner/spouse mode** — Share your sleep windows so family knows when you're unavailable
- **Commute buffer** — Factor in drive time (drowsy driving is a real risk post-night-shift)
- **Post-shift debrief** — Quick "how did you sleep?" log to improve future predictions
- **Streak/gamification** — Track consecutive days of hitting sleep targets
- **Dark room reminder** — Notification to set up blackout environment before sleep
- **Grocery list generator** — Based on meal timing, suggest shift-worker-friendly meal prep lists
- **Live Activities + Dynamic Island** — Lock screen countdowns for sleep/wake transitions
- **Home Screen Widgets** — Glanceable next-action and recovery score
- **Sleep Focus automation** — Auto-trigger iOS Focus mode at wind-down
- **Alarm automation** — Auto-set wake alarms via Shortcuts
- **Smart sleep window notifications** — "Phone down, head to bed" nudges during sleep windows
- **Soundscapes** — Brown noise, rain, white noise, binaural beats with auto-stop timer
- **In-app AI Sleep Coach** — Conversational agent for personalized Q&A and replanning
- **Apple Watch complications + haptics** — Wrist-level awareness of transitions
- **Family/spouse auto-notifications** — "Your partner is recovering, please keep it quiet until 3pm" + poor recovery alerts
- **Household-aware scheduling** — Factor in kids, roommates, noise levels for realistic sleep windows
- **Personal calendar awareness** — Read all calendar events (not just shifts) to fit sleep around life
- **Contextual sleep tips** — Evidence-based insights surfaced at the right moment, not a generic tips page
- **Weekly/Monthly Sleep Intelligence Report** — Magazine-style briefing with schedule preview, health impact forecast, trends, goals, AI shift trade suggestions, proactive risk alerts. Shareable PDF

---

> Scientific references and evidence base documented in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#scientific-foundation)
