# ShiftWell — Project Context for Claude Code

> **Copy this entire file into your Claude Code session or place it at the project root as `CLAUDE.md` to auto-load context.**

---

## What is ShiftWell?

ShiftWell is an **iOS-first sleep optimization app for shift workers**, built by **Dr. Gursimran Singh** (Emergency Medicine physician). It combines calendar import, a deterministic circadian algorithm, and calendar export to help the 700M+ global shift workers optimize sleep around rotating schedules.

**Core value prop:** Import your work schedule → get a science-backed sleep plan → export it to your calendar. No other app combines calendar import + circadian algorithm + personal calendar awareness + one-click export + meal timing + nap placement.

---

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | **Expo (React Native)** SDK 55, React 19 | File-based routing via Expo Router |
| Language | **TypeScript** ~5.9 | Strict mode |
| State | **Zustand** ^5.0 | AsyncStorage persistence |
| Algorithm | **Pure TypeScript** | Deterministic circadian math, no LLM, works offline |
| Calendar | **ical.js** ^2.2.1 | RFC 5545 .ics parsing/generation |
| Backend | **Supabase** ^2.99.1 | PostgreSQL + RLS + Auth + Edge Functions |
| HealthKit | **@kingstinct/react-native-healthkit** ^13.3.1 | iOS sleep data |
| Notifications | **expo-notifications** ^55.0.12 | Push notifications |
| Premium | **react-native-purchases** (RevenueCat) ^9.12.0 | In-app purchases (not yet configured) |
| Auth | **expo-apple-authentication** ^55.0.8 | Apple Sign-In |
| Testing | **Jest + ts-jest** | 110 tests, all passing |
| Build | **EAS (Expo)** | Cloud builds for TestFlight/App Store |

---

## Project Structure

```
/ShiftWell/
├── app/                          # Expo Router screens
│   ├── index.tsx                 # Entry (routes to onboarding or tabs)
│   ├── _layout.tsx               # Root layout (auth/premium init)
│   ├── (onboarding)/             # 5-step onboarding
│   │   ├── welcome.tsx
│   │   ├── chronotype.tsx        # MEQ quiz
│   │   ├── household.tsx
│   │   ├── preferences.tsx
│   │   └── healthkit.tsx         # Optional Apple Health
│   ├── (auth)/                   # Auth screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Main 3-tab navigation
│   │   ├── index.tsx             # Today (timeline + recovery score)
│   │   ├── schedule.tsx          # Calendar (month + day detail)
│   │   └── settings.tsx          # Profile, sync, notifications
│   ├── add-shift.tsx             # Modal: manual shift entry
│   ├── import.tsx                # Modal: .ics file import
│   └── paywall.tsx               # Premium gate (non-functional, deferred)
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Design system (Button, Card, TimeRangePicker, etc.)
│   │   ├── today/                # CountdownCard, TipCard, TimelineEvent, InsightBanner
│   │   ├── calendar/             # MonthView, DayDetail
│   │   └── recovery/             # RecoveryScoreCard, SleepComparisonCard, WeeklyTrendChart
│   │
│   ├── lib/
│   │   ├── circadian/            # THE CORE ALGORITHM (main IP)
│   │   │   ├── types.ts          # Chronotype, ShiftEvent, UserProfile, SleepPlan
│   │   │   ├── classify-shifts.ts
│   │   │   ├── sleep-windows.ts
│   │   │   ├── nap-engine.ts
│   │   │   ├── caffeine.ts
│   │   │   ├── meals.ts
│   │   │   ├── light-protocol.ts
│   │   │   └── index.ts          # generateSleepPlan() main entry
│   │   ├── supabase/             # Client, auth, DB types, storage adapter
│   │   ├── healthkit/            # Sleep data read/write, comparison, accuracy
│   │   ├── sync/                 # Offline-first queue → Supabase sync
│   │   ├── calendar/             # .ics parser, generator, shift detector
│   │   ├── notifications/        # Push notification scheduling
│   │   ├── premium/              # RevenueCat integration, entitlements
│   │   └── tips/                 # Evidence-based sleep tips
│   │
│   ├── store/                    # Zustand stores (all AsyncStorage-persisted)
│   │   ├── user-store.ts         # UserProfile + onboarding state
│   │   ├── shifts-store.ts       # ShiftEvent[] + PersonalEvent[]
│   │   ├── plan-store.ts         # SleepPlan (auto-regenerates on changes)
│   │   ├── auth-store.ts         # Auth state + methods
│   │   └── premium-store.ts      # Premium status + feature access
│   │
│   ├── hooks/                    # useExport, useTodayPlan, useRecoveryScore
│   ├── theme/                    # Dark-mode colors, spacing, typography
│   └── types/                    # healthkit.d.ts
│
├── __tests__/                    # 110 tests across algorithm, calendar, sync, accuracy
├── supabase/migrations/          # 001_initial_schema.sql (6 tables + RLS)
├── package.json
├── app.json                      # Expo config (plugins, entitlements)
├── eas.json                      # EAS build profiles (credentials TBD)
├── tsconfig.json
├── jest.config.js
└── .env.example                  # Supabase + RevenueCat placeholders
```

---

## Current Status (as of March 2026)

### What's DONE (MVP Feature-Complete)
- **Circadian algorithm** — 7 modules: shift classification, sleep windows, nap engine, caffeine cutoffs, meal timing, light protocols. Pure TS, deterministic, fully tested.
- **5-step onboarding** — Welcome → Chronotype (MEQ) → Household → Preferences → HealthKit (optional)
- **3-tab navigation** — Today (timeline + recovery), Schedule (calendar), Settings
- **Today screen** — Recovery score ring, countdown cards, timeline blocks, insight banner, tip of the day
- **Calendar screen** — Month view with color-coded dots, day detail panel
- **Manual shift entry** — Add/edit shifts with auto-classification
- **.ics import** — 3-step flow: pick file → review → confirm
- **.ics export** — Generate RFC 5545 file → share sheet
- **Settings** — Account, sync status, notification toggles, import/export
- **Zustand stores (5)** — User, Shifts, Plan, Auth, Premium (all persisted)
- **Supabase backend** — Schema, client, auth (Apple + email), sync engine
- **HealthKit integration** — Read sleep data, compare planned vs actual, accuracy scoring
- **Push notifications** — Sleep reminders, caffeine cutoffs, wake alarms
- **Premium/RevenueCat** — SDK wired, 14 features mapped, entitlements module
- **Recovery score dashboard** — Circular ring, comparison cards, weekly trend chart
- **110 passing tests** — Algorithm, calendar, sync, accuracy
- **Expert committee review** — 7 experts, all top-10 issues resolved
- **All documentation** — Business plan, deployment guide, privacy policy, health disclaimers, App Store listing, design assets guide

### What's NOT Done / Pending

**Deployment blockers (founder action required):**
- [ ] Form LLC in home state
- [ ] Enroll in Apple Developer Program ($99/yr)
- [ ] Create Supabase project, run migration SQL, fill `.env` credentials
- [ ] Fill `eas.json` with Apple credentials (appleId, ascAppId, appleTeamId)
- [ ] Generate app icon (AI prompts in DESIGN_ASSETS_GUIDE.md)
- [ ] Run EAS build → TestFlight → beta test with 10-20 shift workers

**Code work remaining (Phase 3+):**
- [ ] WritePlannedSleep call to trigger iOS Sleep Focus
- [ ] Caffeine & light tracking dedicated screens
- [ ] Post-sleep debrief ("How did you sleep?") quick log
- [ ] Smart sleep window notifications ("Phone down, head to bed")
- [ ] Live Activities (lock screen plan preview)
- [ ] iOS widgets (4 homescreen sizes)
- [ ] Apple Watch companion app
- [ ] RevenueCat paywall integration (deferred to v1.2+ per expert consensus)

**Known TODOs in code:**
- `app/paywall.tsx` — Two TODO comments for RevenueCat purchase/restore handlers (intentionally deferred; all features are free in v1)

---

## Key Architecture Decisions

1. **All features FREE in v1** — Expert committee (7/7 consensus) recommended free launch to validate PMF before monetization
2. **Deterministic algorithm, not LLM** — Testable, offline, zero API cost, reproducible
3. **Expo over native Swift** — Faster iteration, AI coding tool support, cross-platform bonus
4. **iOS-first** — HealthKit only on iOS, target audience uses iPhones
5. **Offline-first** — Plan generation is local; Supabase is optional cloud sync
6. **Auth is non-blocking** — Core features work without an account
7. **Zustand over Redux** — Simpler for small team
8. **Supabase over Firebase** — PostgreSQL, RLS, no vendor lock-in

---

## Database Schema (Supabase PostgreSQL)

6 tables with Row-Level Security: `users`, `shifts`, `personal_events`, `sleep_plans`, `health_data`, `subscriptions`. Full schema in `supabase/migrations/001_initial_schema.sql`.

---

## Commands

```bash
# Install dependencies
npm install

# Run tests (110 tests)
npm test

# Start Expo dev server
npx expo start

# Build for TestFlight (requires Apple credentials in eas.json)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

---

## Development Guidelines

- **Dark-mode-first** — All UI uses dark theme tokens from `src/theme/`
- **Algorithm is pure TS** — No React dependencies in `src/lib/circadian/`. Must remain testable in Node.
- **Plan auto-regenerates** — `plan-store` subscribes to `shifts-store` + `user-store` changes
- **Notifications auto-schedule** — `schedulePlanNotifications()` fires after every `regeneratePlan()`
- **Premium gating is soft** — Features show lock icon + paywall redirect, no hard blocks on core
- **Test before shipping** — Run `npm test` and ensure all 110 tests pass

---

## Documentation Index

| File | Purpose |
|------|---------|
| `ACTIVITY_LOG.md` | Session-by-session development log (read first each session) |
| `PROJECT_CONTEXT.md` | Origin story, problem, market, competitive landscape |
| `IMPLEMENTATION_PLAN.md` | Tech stack, phases, MVP scope |
| `PHASE_2_ARCHITECTURE.md` | Supabase, auth, HealthKit, sync design |
| `BUSINESS_PLAN.md` | LLC, pricing, go-to-market, financial model |
| `DEPLOYMENT_GUIDE.md` | Step-by-step TestFlight & App Store |
| `COMMITTEE_REVIEW.md` | Expert review (7 experts, all issues resolved) |
| `VISUAL_ROADMAP.md` | Architecture diagrams, screen flow |
| `APP_STORE_LISTING.md` | Optimized metadata & keywords |
| `DESIGN_ASSETS_GUIDE.md` | Brand identity, logo prompts, screenshots |
| `PRIVACY_POLICY.md` | GDPR/CCPA-compliant privacy policy |
| `HEALTH_DISCLAIMERS.md` | Medical disclaimers for App Store |
| `FOUNDER_ACTION_GUIDE.md` | Beginner-friendly launch prep tasks |

---

## Roadblocks & Notes

- **No active code roadblocks** — all 110 tests pass, zero TypeScript errors
- **Supabase not yet provisioned** — needs project creation + credential setup
- **RevenueCat not configured** — intentionally deferred; paywall screen is non-functional by design
- **EAS credentials empty** — needs Apple Developer enrollment first
- **HealthKit requires native build** — cannot test in Expo Go, needs `eas build` or dev client
- **App was renamed** from "NightShift" to "ShiftWell" (trademark avoidance) — all references updated across codebase

---

## Session Continuity

When resuming work:
1. Read `ACTIVITY_LOG.md` for latest session context
2. Run `npm test` to verify baseline (expect 110 passing)
3. Check `git log --oneline -10` for recent changes
4. Refer to "What's NOT Done / Pending" section above for next tasks
