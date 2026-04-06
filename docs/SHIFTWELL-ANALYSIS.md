# ShiftWell — Comprehensive Project Analysis
> Generated: 2026-03-23 | Source: Deep read of ~/projects/shiftwell/ (symlink: ~/ShiftWell/)
> Purpose: Onboarding context for future agents and collaborators

---

## 1. Project Overview

**ShiftWell** is an iOS app that generates personalized, science-backed sleep optimization plans for shift workers. Built by Dr. Gursimran Singh (Emergency Medicine physician, HCA Tampa) — someone who lives the problem personally.

**The Problem:** Shift work disrupts the body's circadian rhythm, causing chronic sleep deprivation, increased cardiovascular risk, and cognitive impairment. Existing apps either (a) give generic sleep advice or (b) require manual data entry and don't understand shift schedules at all.

**The Solution:** Import your work schedule (via `.ics` file), answer a 5-question chronotype quiz, and ShiftWell generates a full daily plan: when to sleep, when to nap, when to drink caffeine, when to eat, and when to seek/avoid light — all timed around your specific shift pattern.

**Who It's For:**
- Primary: Healthcare workers (nurses, physicians, paramedics, residents)
- Secondary: Any structured shift worker (police, fire, factory, airline)
- Later: Jet lag sufferers, new parents, on-call professionals

**Core Differentiator:** Built by a physician who actually works nights. No competitor combines:
1. Calendar-based schedule import
2. Full circadian algorithm (sleep + naps + caffeine + meals + light)
3. Personal calendar awareness (appointments, kids' activities)
4. One-click `.ics` export back to native calendar

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Expo (React Native) | ~55.0.6 | File-based routing via Expo Router |
| Language | TypeScript | ~5.9.2 | Strict mode throughout |
| State | Zustand | ^5.0.11 | + AsyncStorage persistence |
| Persistence | AsyncStorage | ^3.0.1 | Device-local, no backend needed for v1 |
| Calendar I/O | ical.js | ^2.2.1 | Parse + generate RFC 5545 .ics files |
| Date Math | date-fns | ^4.1.0 | Date manipulation, classification |
| Backend (Phase 2) | Supabase | integrated | Auth, PostgreSQL, Edge Functions |
| Health (Phase 2) | react-native-healthkit | ^13.3.1 | Apple Health read/write |
| Notifications (Phase 2) | expo-notifications | ^55.0.12 | Sleep/wake reminders |
| Premium (Phase 2) | RevenueCat | integrated | In-app purchases, paywall |
| Testing | Jest + ts-jest | ^30.3.0 | Unit tests for algorithm + utilities |
| Build | EAS (Expo Application Services) | configured | Dev/Preview/Production profiles |

**Key design decision:** The circadian algorithm is **100% offline, deterministic TypeScript** — no LLM, no API calls, no operating cost. Pure math based on peer-reviewed sleep science. This makes it fully testable and works offline.

---

## 3. Architecture

### Directory Structure

```
shiftwell/
├── app/                           # Expo Router screens
│   ├── _layout.tsx               # Root layout: theme, auth init, premium init
│   ├── index.tsx                 # Entry router (onboarding check → route)
│   ├── (auth)/                   # Auth screens (Phase 2 - currently wired)
│   │   ├── sign-in.tsx           # Apple Sign-In + email/password
│   │   └── sign-up.tsx
│   ├── (onboarding)/             # 5-screen onboarding flow
│   │   ├── welcome.tsx
│   │   ├── chronotype.tsx        # 5-question MEQ quiz → early/intermediate/late
│   │   ├── household.tsx         # Household size, kids, pets, commute
│   │   ├── preferences.tsx       # Sleep need, nap preference, caffeine sensitivity
│   │   └── healthkit.tsx         # Optional Apple Health connection
│   ├── (tabs)/                   # Main app (3-tab nav)
│   │   ├── index.tsx             # TODAY — timeline, countdowns, recovery
│   │   ├── schedule.tsx          # CALENDAR — month view, shift management
│   │   └── settings.tsx          # SETTINGS — profile, sync, import/export
│   ├── add-shift.tsx             # Modal: add/edit shift
│   ├── import.tsx                # 3-step .ics import flow
│   └── paywall.tsx               # Premium paywall (non-functional, see Issues)
│
├── src/
│   ├── lib/
│   │   ├── circadian/            # CORE IP — 8-module algorithm engine
│   │   │   ├── types.ts          # ShiftType, DayType, UserProfile, PlanBlock, SleepPlan
│   │   │   ├── index.ts          # generateSleepPlan() — main entry point
│   │   │   ├── classify-shifts.ts # Pattern detection per day
│   │   │   ├── sleep-windows.ts  # Two-Process Model computation
│   │   │   ├── nap-engine.ts     # Nap placement (Milner & Cote 2009)
│   │   │   ├── caffeine.ts       # Half-life cutoff calculation
│   │   │   ├── meals.ts          # Circadian-aligned meal timing
│   │   │   └── light-protocol.ts # Light exposure/avoidance
│   │   ├── calendar/             # ICS import/export + shift detection heuristics
│   │   ├── healthkit/            # Apple Health integration (Phase 2)
│   │   ├── notifications/        # Push notifications (Phase 2)
│   │   ├── premium/              # RevenueCat integration (Phase 2)
│   │   ├── supabase/             # Backend client + auth + sync adapter (Phase 2)
│   │   ├── sync/                 # Offline-first sync engine (Phase 2)
│   │   └── tips/                 # 25+ evidence-based sleep tips
│   ├── store/                    # Zustand stores (5 stores)
│   │   ├── user-store.ts         # Profile + onboarding state
│   │   ├── shifts-store.ts       # Shift CRUD + personal events (persisted)
│   │   ├── plan-store.ts         # Derived sleep plan, auto-regenerate on changes
│   │   ├── auth-store.ts         # Session management (Phase 2)
│   │   └── premium-store.ts      # Feature gating via RevenueCat (Phase 2)
│   ├── components/
│   │   ├── ui/                   # Shared primitives: Button, Card, ProgressBar, etc.
│   │   ├── today/                # Today screen: TimelineEvent, CountdownCard, etc.
│   │   ├── calendar/             # MonthView, DayDetail
│   │   └── recovery/             # Recovery score dashboard (Phase 2)
│   ├── hooks/
│   │   ├── useTodayPlan.ts       # Derives today's data from plan store
│   │   ├── useExport.ts          # Generate .ics + trigger share sheet
│   │   └── useRecoveryScore.ts   # HealthKit accuracy tracking (Phase 2)
│   └── theme/                    # colors.ts, typography.ts, spacing.ts
│
├── __tests__/                    # 116 tests (all passing)
│   ├── circadian/                # Algorithm unit tests + edge cases
│   └── calendar/                 # ICS parser tests
│
├── supabase/migrations/          # 6 tables, RLS policies, auto-update triggers
│
└── [15+ documentation files]     # See Section 7
```

### Data Flow

```
User adds shift (manually or via .ics import)
     ↓
shifts-store.ts mutates → triggers plan-store.ts subscription
     ↓
plan-store.ts calls generateSleepPlan(profile, shifts, personalEvents)
     ↓
circadian/index.ts orchestrates:
  1. classify-shifts.ts → DayClassification[] for each day
  2. sleep-windows.ts   → main sleep blocks per day (Two-Process Model)
  3. nap-engine.ts      → prophylactic + recovery naps
  4. caffeine.ts        → personalized cutoff times
  5. meals.ts           → meal timing windows
  6. light-protocol.ts  → light/dark exposure blocks
  7. Overlap resolver   → merge adjacent blocks, deduplicate
     ↓
SleepPlan stored in plan-store
     ↓
Today screen (useTodayPlan hook) derives:
  - Active block right now
  - Next 3 blocks with countdowns
  - Contextual insight for current day type
     ↓
Schedule screen shows month view with color-coded dots per day
```

---

## 4. The Algorithm (Core IP)

**Scientific Foundation — 15+ peer-reviewed papers:**
- Borbely (1982) — Two-Process Model (homeostatic pressure + circadian oscillator)
- AASM Clinical Practice Guidelines (2015, 2023)
- Eastman & Burgess (2009) — gradual circadian shifting (1h/day shift rate)
- Czeisler et al. (1990) — bright light adaptation protocols
- Drake et al. (2004, 2013) — caffeine half-life, SWSD prevalence
- Milner & Cote (2009) — napping in healthy adults
- Manoogian et al. (2022) — time-restricted eating for shift workers
- AHA (2025) — circadian disruption ↔ cardiovascular disease

**Day Type Classification** (`classify-shifts.ts`):
Reads all shifts + personal events → classifies each day as one of:
`work-day` | `work-evening` | `work-night` | `work-extended` | `off` | `transition-to-nights` | `transition-to-days` | `recovery`

**Sleep Windows** (`sleep-windows.ts`):
Runs Two-Process Model per day type, adjusts for:
- Chronotype (early/intermediate/late bird)
- Personal calendar conflicts (appointments, school pickups)
- Returns shifted window if conflicts detected

**Nap Engine** (`nap-engine.ts`):
- Prophylactic naps (90-min REM prep before night shifts)
- Power naps (25-min for day shifts, transitions)
- Respects user's nap preference toggle

**Caffeine** (`caffeine.ts`):
`cutoff = sleepOnset − (halfLife × 1.67)` per Drake et al.
Personalized: default 5h half-life, user-adjustable

**Meals** (`meals.ts`):
- Front-loaded calories, peak hunger windows
- 3h fast before sleep anchor
- Time-restricted eating windows for night shifts (Manoogian 2022)

**Light Protocol** (`light-protocol.ts`):
- Bright light during intended wake hours
- Blue-blocker recommendation post-night commute
- Light avoidance before anchor sleep

**Overlap Resolution** (`index.ts`):
Merges adjacent blocks across multi-day plans, priority: `main-sleep > naps > recommendations`. Minimum 2h block threshold.

---

## 5. Current Status

**Phase 1 MVP — COMPLETE** (Weeks 1–4 of 6-week plan)

| Component | Status |
|-----------|--------|
| Circadian algorithm (8 modules) | ✅ Complete |
| 5-screen onboarding | ✅ Complete |
| ICS import (3-step flow) | ✅ Complete |
| ICS export with sharing | ✅ Complete |
| Today screen (timeline + countdowns) | ✅ Complete |
| Schedule screen (month view + shift CRUD) | ✅ Complete |
| Settings screen | ✅ Complete |
| Test suite | ✅ 116 tests passing |
| Phase 2 architecture (Supabase, HealthKit, Premium) | ✅ Code written, not yet activated |
| Recovery score dashboard (UI) | ✅ Built (requires HealthKit) |
| Expert committee review (7 experts, 30 issues) | ✅ Complete |
| Business plan, privacy policy, deployment guide | ✅ Complete |

**Not yet done (before TestFlight):**
- App icon (prompts exist in APP_ICON_GUIDE.md — needs generation)
- Fix 6 CRITICAL issues from committee review (see Section 6)
- Physical iPhone testing
- LLC formation + Apple Developer enrollment (Sim's action items)

---

## 6. Issues — Prioritized

### CRITICAL (must fix before any App Store submission)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | **Bundle ID is `com.nightshift.app`** — wrong name, irreversible after first submission | `app.json` | Change to `com.shiftwell.app` before first EAS build |
| 2 | **Privacy policy has placeholder company name** `[Company Name] LLC` | `PRIVACY_POLICY.md`, settings screen | Replace with actual entity + contact email |
| 3 | **Health disclaimer not in the app** | Exists in `HEALTH_DISCLAIMERS.md` only | Add to welcome.tsx onboarding screen + Settings About section |
| 4 | **Stale closure in `useTodayPlan`** | `src/hooks/useTodayPlan.ts` | Add `tick` to `useMemo` deps array — countdown timers only update on plan/shift change, not every minute |
| 5 | **Silent plan generation errors** | `src/store/plan-store.ts` | Show error banner on Today screen with Retry button when generation fails |
| 6 | **Paywall is non-functional** (buttons do nothing) and contradicts "100% FREE" App Store listing | `app/paywall.tsx` | Committee consensus: ship v1 as 100% free, remove paywall entirely for now |

### HIGH (fix before launch)

| # | Issue | Fix |
|---|-------|-----|
| 7 | `hasPets` collected in onboarding but not used | Either use it (add 15–30 min buffer in sleep windows) or remove the toggle |
| 8 | No shift deletion confirmation dialog | Add `Alert.alert()` — 10 lines |
| 9 | Schedule tab has no empty state for new users | Add illustration + "Add your first shift" CTA |
| 10 | Auth screens use hardcoded hex colors instead of theme tokens | Refactor sign-in.tsx / sign-up.tsx to use theme imports |
| 11 | Almost no accessibility labels | Systematic pass: add `accessibilityLabel`/`accessibilityRole` to all interactive elements |
| 12 | Supabase client silently creates broken client if env vars missing | Add startup validation — throw in dev, gracefully disable cloud features in prod |

### MEDIUM (v1.1 — post-launch)

| # | Issue |
|---|-------|
| 13 | Onboarding progress bar says "1 of 4" but there are 5 steps (fix: change `totalSteps` to 5) |
| 14 | No analytics SDK — can't measure onboarding completion, retention, feature engagement (recommend PostHog/TelemetryDeck) |
| 15 | Google Calendar live sync missing (ICS import only) — this is a competitive gap |
| 16 | No haptic feedback (`expo-haptics` — cosmetic, post-launch) |
| 17 | No ESLint/Prettier config — code stays clean without it, but will drift |

---

## 7. Pending Work — Prioritized Roadmap

### Before TestFlight (Next Session — ~8–10h)
1. Fix all 6 CRITICAL issues above
2. Fix 5 HIGH issues (shifts delete confirm, empty state, auth colors, accessibility start, Supabase guard)
3. Generate app icon (Sim uses AI image tool, follow APP_ICON_GUIDE.md)
4. Test on physical iPhone (`npx expo start`)

### Sim's Action Items (parallel — not Claude's)
1. Form LLC (home state or Wyoming, ~30 min, $100–200)
2. Get EIN from IRS (free, ~10 min at irs.gov)
3. Enroll in Apple Developer Program ($99/yr at developer.apple.com)
4. Set up business bank account
5. Recruit 10–20 beta testers from ED department

### TestFlight Beta (Weeks 5–6)
- Run: `eas build --platform ios --profile preview`
- Submit: `eas submit --platform ios --profile preview`
- Distribute to beta testers
- Collect feedback: crash-free rate, onboarding completion, export success
- Iterate based on real-world feedback

### App Store Submission
- Screenshots (6.7" and 6.5" iPhone sizes, 3–10 each)
- Privacy policy URL (host on GitHub Pages or simple site)
- Production build: `eas build --platform ios --profile production`
- Submit via App Store Connect
- Expect review: 1–3 days

### Phase 2 Features (after launch validation)
- Supabase backend activation: user accounts, cloud sync, subscribable calendar URLs
- Apple HealthKit: actual sleep data → recovery score
- Push notifications: sleep/wake/caffeine reminders
- Google Calendar OAuth sync (vs. ICS file import)
- RevenueCat premium: feature gating (once user base validated)

### Phase 3+ Roadmap
- Live Activities + Dynamic Island (lock screen countdowns)
- Home Screen Widgets (WidgetKit)
- Apple Watch (complications + haptics)
- Jet Lag Mode, On-Call Mode, New Parent Mode
- In-app AI sleep coach (Claude API)
- B2B: team dashboards, fatigue risk scoring

---

## 8. Code Quality Assessment

**Overall: Strong for a solo founder project. Algorithm layer is production-ready.**

| Area | Quality | Notes |
|------|---------|-------|
| Algorithm engine (`src/lib/circadian/`) | ★★★★★ | Peer-reviewed basis, full test coverage, pure functions, no side effects |
| Test suite | ★★★★★ | 116 tests, edge cases covered (back-to-back shifts, 7 consecutive nights, midnight boundaries) |
| State management | ★★★★☆ | Clean Zustand pattern, async persistence, date serialization handled correctly |
| TypeScript typing | ★★★★☆ | Consistent interface definitions, domain types well-defined |
| Component structure | ★★★☆☆ | Good separation, but Phase 2 components mixed with Phase 1 (future concern) |
| Theme consistency | ★★★☆☆ | Auth screens use hardcoded colors (known issue #10) |
| Error handling | ★★☆☆☆ | Silent failures in plan-store (known issue #5); Supabase guard missing (issue #12) |
| Accessibility | ★★☆☆☆ | Very sparse — almost no a11y labels (known issue #11) |
| Analytics | ★☆☆☆☆ | None implemented — blind after launch (known issue #14) |

**Code strengths:**
- Algorithm is deterministic, offline, testable — the right call for v1
- Local-first architecture means network failures don't break core features
- Zustand stores have clean separation of concerns
- Phase 2 code is written and waiting behind feature flags — smart pre-architecture

**Code risks:**
- No ESLint/Prettier — will drift under feature pressure post-launch
- Phase 2 code already lives in src/ alongside Phase 1 — could create confusion
- Paywall screen is in a broken state and should be removed/hidden before submission

---

## 9. Competitive Landscape

| Feature | Timeshifter | Arcashift | SleepSync | **ShiftWell** |
|---------|:-----------:|:---------:|:---------:|:-------------:|
| Calendar import | ✗ | ✓ (buggy) | ✗ | ✓ |
| AI schedule gen | ✓ | ✓ | ✓ | ✓ |
| Meal timing | ✗ | ✗ | ✗ | ✓ |
| Nap placement | ✗ | ✗ | ✗ | ✓ |
| Caffeine timing | ✗ | ✗ | ✗ | ✓ |
| Apple Health adapt | ✗ | Partial | ✗ | ✓ (Phase 2) |
| Personal calendar-aware | ✗ | ✗ | ✗ | ✓ |
| One-click export | ✗ | ✗ | ✗ | ✓ |
| Price | $10/mo | Free/Premium | — | Free → $4.99/mo |

**Timeshifter** is the main competitor (Harvard-backed), but has zero calendar integration.
**ShiftWell's moat:** Built by a physician who works nights + fullest circadian feature set of any competitor.

---

## 10. Market Context

- 700 million shift workers globally; 16 million in US healthcare alone
- 32% report short sleep from shift work; 10–38% develop Shift Work Sleep Disorder (SWSD)
- mHealth market: $82.45B (2025), 22.3% CAGR
- Break-even: just 7 premium subscribers at $4.99/mo (extremely low bar)
- Target Month 12: 1,000 users, 10% premium conversion = ~$600 MRR

---

## 11. Documentation Index

All docs live in the repo root (`~/projects/shiftwell/`):

| File | Contents |
|------|----------|
| `CLAUDE.md` | Session instructions, context window, commands, resume state |
| `PROJECT_CONTEXT.md` | Problem, solution, market, tech stack, weekly progress |
| `IMPLEMENTATION_PLAN.md` | Build order, phases, detailed feature specs, tech decisions |
| `BUSINESS_PLAN.md` | LLC setup, testing strategy, App Store plan, monetization, financials |
| `COMMITTEE_REVIEW.md` | 7-expert panel, 30 issues ranked CRITICAL/HIGH/MEDIUM |
| `ACTIVITY_LOG.md` | 9-session development history with outcomes |
| `PHASE_2_ARCHITECTURE.md` | Cloud sync, HealthKit, premium — detailed design |
| `VISUAL_ROADMAP.md` | Architecture flow diagrams |
| `HEALTH_DISCLAIMERS.md` | Required disclaimer text (NOT yet in the app — Critical Issue #3) |
| `PRIVACY_POLICY.md` | GDPR/CCPA compliant (has placeholder company name — Critical Issue #2) |
| `DEPLOYMENT_GUIDE.md` | Step-by-step TestFlight + App Store submission |
| `APP_ICON_GUIDE.md` | AI prompts for icon generation |
| `APP_STORE_LISTING.md` | Keywords, marketing copy, screenshots plan |
| `DESIGN_ASSETS_GUIDE.md` | Brand colors, fonts, logo prompts, social templates |
| `FOUNDER_ACTION_GUIDE.md` | Beginner-friendly LLC/EIN/Apple Dev setup |
| `SOCIAL_MEDIA_GUIDE.md` | Launch messaging, Twitter/Reddit/Product Hunt templates |
| `APP_NAMING_ANALYSIS.md` | Why "ShiftWell" was chosen |
| `PHYSICIAN_SIDE_PROJECT_IDEAS.md` | Original brainstorm (9 ideas, scored) |

---

## 12. Key Commands

```bash
# Dev server (scan QR with Expo Go on iPhone)
cd ~/projects/shiftwell && npx expo start

# Run tests
cd ~/projects/shiftwell && npx jest

# Run specific test suite
cd ~/projects/shiftwell && npx jest __tests__/circadian/

# EAS build (requires Apple Dev enrollment + LLC)
eas build --platform ios --profile preview       # TestFlight
eas build --platform ios --profile production    # App Store

# EAS submit
eas submit --platform ios --profile preview
```

---

## 13. Questions for Sim

1. **Paywall decision:** Committee 5/7 recommended shipping as 100% free. Do you want to remove the paywall entirely for v1, or keep it but implement RevenueCat so it actually works?

2. **LLC status:** Have you started the LLC process yet? This is on the critical path for Apple Developer enrollment and receiving revenue.

3. **Beta tester recruits:** Do you have 10–20 colleagues in mind for TestFlight beta? ED nurses and residents are the ideal first cohort.

4. **hasPets data:** The onboarding collects whether you have pets but doesn't use it in the algorithm. Should we (a) implement it as a ~30-min sleep buffer, (b) remove the toggle, or (c) keep it for Phase 2?

5. **App icon:** Have you generated the icon yet? It's required before the first EAS build. `APP_ICON_GUIDE.md` has the prompts.

6. **Privacy policy company name:** What entity name should go in? (e.g., "ShiftWell LLC", or whatever you name the business)

7. **Google Calendar sync:** ICS file import is functional but not live-sync. Is this a blocker for beta or acceptable as a v1 limitation?

---

## 14. Critical Path to Launch

```
TODAY (this session)
  └─ Fix 6 CRITICAL issues + 5 HIGH issues (~8–10h)

IN PARALLEL (Sim's action items — 2–3h total)
  ├─ Form LLC
  ├─ Get EIN
  ├─ Enroll Apple Developer Program
  └─ Generate app icon (from APP_ICON_GUIDE.md prompts)

NEXT WEEK
  └─ Physical iPhone testing + EAS preview build + TestFlight

WEEKS 5–6
  └─ Beta with 10–20 testers, iterate on feedback

LATE APRIL 2026 (target)
  └─ App Store submission → Review (1–3 days) → LIVE
```

---
*Analysis saved to: /Users/claud/shiftwell-analysis/SHIFTWELL-ANALYSIS.md*
*Repo location: /Users/sima/projects/shiftwell/ (symlink: ~/ShiftWell/)*
*Last updated: 2026-03-23*
