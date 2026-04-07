# ShiftWell Design Audit & Ship Path

## Context

ShiftWell is a 28K-line, 38-phase iOS app for shift worker sleep optimization. It has a science-backed circadian algorithm (354 tests passing), full calendar sync, and extensive features — but zero users. The app is blocked on LLC formation (~5-8 weeks to TestFlight). This audit identifies what to keep, simplify, archive, and improve to ship a focused TestFlight build, then learn from real users before expanding.

**Core insight:** The algorithm is the moat. Everything else is premature until validated by users.

---

## Part 1: Audit Findings

### What's Excellent (KEEP)
- **Circadian algorithm** (`src/lib/circadian/`, 3,584 LOC, 11 modules) — pure functions, peer-reviewed science, 354 tests
- **Calendar-as-interface** — shifts detected from existing calendar, sleep plan exports back. Strong differentiator.
- **Adaptive Brain** (`src/lib/adaptive/`) — 4-factor weighting (circadian 50%, debt 20%, lookahead 20%, recovery 10%). Differentiator from day 1.
- **Autopilot mode** (`src/lib/autopilot/`) — 30-day propose → full autopilot. Builds anticipation and trust.
- **Local-first architecture** — AsyncStorage, no mandatory cloud. Right for health data privacy.
- **Zustand over Redux** — appropriate scale choice
- **Dark theme + warm gold** — right aesthetic for a sleep/night-shift app

### What's Over-Engineered (SIMPLIFY)
- **14 Zustand stores** → consolidate to 8-9. Merge: `prediction + pattern + score` → `insights-store`. Kill `feedback-store` (1 import).
- **27 lib domains** → archive 8-10 that have 0-4 imports
- **16 planned animations + 7 elevate features** → ship with 4 animations max. Add polish post-validation.
- **Night Sky Mode** (7 components) → reduce to 1-2 components for v1
- **25K-line Adaptive Brain spec, 23K-line UI spec** → future specs capped at 2K lines

### What's Premature (ARCHIVE to `src/_archive/`)
- `src/lib/enterprise/` (1,972 LOC, 0 imports) — no enterprise customers
- `src/lib/growth/` (498 LOC, 1 import) — referrals with 0 users
- `src/lib/watch/` (189 LOC, 0 imports) — Apple Watch app, no users yet
- `src/lib/api/` (369 LOC, 0 imports) — unused API client
- `src/lib/intelligence/` (231 LOC, 1 import) — premature ML layer
- `src/lib/prescriptions/` (398 LOC, 2 imports) — premature
- `/api/` Express backend (1,613 LOC) — offline-first app doesn't need a server
- `src/i18n/es.ts` — Spanish translation before English launch
- Premium paywall UI — ship free for TestFlight, validate before monetizing
- Manager dashboard / multi-facility UI — B2B features for B2C launch
- Related stores: `prediction-store`, `feedback-store`. Note: `ai-store` stays if Adaptive Brain imports from it; archive only if fully unwired.

### What's Missing (ADD)
- **Crash reporting** — Sentry or expo-updates error boundary
- **Analytics** — PostHog or Mixpanel free tier (screen views, feature usage, retention)
- **Feedback mechanism** — shake-to-feedback or settings button → simple form
- **Empty state handling** — what does every screen look like before calendar is connected?

---

## Part 2: The Ship Path

### Phase A: Slim Down (1-2 sessions)

**Goal:** Archive non-essential code, consolidate stores, reduce 219 files to ~150.

1. Create `src/_archive/` directory structure mirroring `src/lib/` and `src/store/`
2. Move archived lib domains (enterprise, growth, watch, api, intelligence, prescriptions) to `src/_archive/lib/`
3. Move archived stores (`prediction-store`, `feedback-store`) to `src/_archive/store/`. Check if `ai-store` is imported by Adaptive Brain — archive only if fully unwired.
4. Move `src/i18n/es.ts` to `src/_archive/i18n/`
5. Move `/api/` Express backend to `/_archive/api/`
6. Feature-flag premium paywall (keep code, disable UI gate — all features free for TestFlight)
7. Simplify Night Sky Mode: keep 1-2 core components, archive the rest
8. Disable any "Phase X" UI components that render with no real data behind them
9. Fix all import errors from archiving
10. Move related test files to `tests/_archive/`
11. Run full test suite — ensure remaining tests pass
12. Verify app builds and runs on simulator

**Verification:** `npx expo start` succeeds, remaining tests pass, no broken imports.

### Phase B: Ship Polish (2-3 sessions)

**Goal:** Make remaining features feel complete and reliable. No new features.

1. **Onboarding walkthrough** — test all 8 screens end-to-end on a fresh install
2. **Today screen audit** — verify every card renders with real data AND handles empty state gracefully
3. **Calendar sync smoke test** — connect real Apple/Google calendar, verify shift detection, verify sleep plan generation
4. **Adaptive Brain check** — verify insights surface from circadian + schedule data (doesn't need HealthKit)
5. **Notification test** — verify wind-down, caffeine cutoff, morning brief notifications fire at correct times
6. **Recovery score test** — verify 14-night history displays correctly
7. **Add crash reporting** — integrate Sentry (expo-sentry) or similar
8. **Add minimal analytics** — PostHog React Native SDK, track: screen views, onboarding completion, calendar connected, plan generated, notification opened
9. **Add feedback mechanism** — simple button in Settings → opens email or in-app form
10. **Performance check** — cold start time, memory usage, battery impact from background tasks

**Verification:** Full app walkthrough on physical device. Every screen renders. Notifications fire. Analytics events appear in dashboard. Crash reporting captures a test crash.

### Phase C: TestFlight Prep (1 session, once Apple Dev is active)

**Goal:** Submit to TestFlight and recruit testers.

1. Finalize app icon
2. Generate screenshots (5 screens, iPhone 15 Pro + iPhone SE sizes)
3. Write App Store description + metadata
4. Complete privacy nutrition labels (accurate for what's in the build)
5. Verify medical disclaimers are in-app
6. Submit to TestFlight
7. Recruit 20-50 testers (Sim's network, Reddit r/nursing, r/ems, r/nightshift)

**Verification:** TestFlight build available for download. 20+ testers invited.

---

## Part 3: Feature Reintroduction Timeline (Trigger-Based)

Features earn their way back in based on real signals, not pre-planned phases.

| Archived Feature | Trigger to Reintroduce | Rationale |
|-----------------|----------------------|-----------|
| **Premium paywall** ($6.99/$49.99/$149.99) | 100+ WAU with >30% day-7 retention | Validate people come back before asking them to pay |
| **Spanish i18n** | 500+ active users OR first non-English user request | Don't translate until you have the audience |
| **Growth/referral module** | Paywall live + 50+ paying users | Referrals matter when there's something to convert to |
| **Predictive scheduling** (14-day stress) | 50+ users with 30+ days of HealthKit data | Needs real biometric history to predict |
| **AI coaching** (Claude weekly brief) | Post-paywall, as premium-only feature | Differentiated paid feature, not MVP |
| **Enterprise module** | First inbound inquiry from hospital/agency | Build for a customer, not a hypothetical |
| **Manager dashboard** | Enterprise live + 1 paying org | Dashboard follows the sale |
| **Express API backend** | Multi-device sync requests from 10+ users | Backend is for sync; offline-first covers single device |
| **Watch app** | 200+ users with Apple Watch via HealthKit | Validate HealthKit flow first |
| **Differential privacy / HIPAA** | Enterprise live + legal review | Compliance follows revenue |

---

## Part 4: Post-TestFlight Learning Plan

After 20-50 users for 2+ weeks, measure:

1. **Screen engagement** — which screens get visited, which are ignored?
2. **Notification action rate** — which notifications drive opens vs. dismissals?
3. **Calendar export rate** — do users actually put sleep plans on their calendar?
4. **Adaptive Brain engagement** — do users read/act on insights?
5. **Day-3 and day-7 retention** — do they come back?
6. **Feedback themes** — what do they complain about? What do they ask for?

**This data determines the real v1.1**, not the current 38-phase roadmap.

---

## Part 5: Roadmap Shift

### Old Model (Push-Based)
38 pre-planned phases, v1.0 → v2.0, 18-month acquisition roadmap. Each phase assumed the previous validated.

### New Model (Pull-Based)
- **v1.0 TestFlight:** Core algorithm + calendar + today + recovery + Adaptive Brain + Autopilot (propose mode). Free.
- **v1.x iterations:** Driven by user feedback and analytics data. Each release addresses the top user-reported issue or the biggest drop-off in the funnel.
- **Paywall:** Introduced when retention proves value (trigger: 100+ WAU, >30% d7 retention)
- **Enterprise:** Introduced when demand proves market (trigger: inbound hospital inquiry)

### Spec Process Going Forward
- Major features: 500-2000 line spec max
- Minor features: 100-500 lines
- Bug fixes: conversation + 50 lines
- No more 25K-line specs until the feature has been requested by real users

---

## Critical Files

**To modify:**
- `src/store/` — consolidate stores
- `src/lib/` — archive unused domains
- `src/components/night-sky/` — simplify to 1-2 components
- `src/i18n/es.ts` — archive
- `/api/` — archive entire Express backend
- `app/` — disable/hide unreachable screens
- `package.json` — may remove unused deps after archiving

**To create:**
- `src/_archive/` — archived feature code
- `tests/_archive/` — archived test files
- Analytics integration (PostHog or Mixpanel)
- Crash reporting integration (Sentry)
- Feedback mechanism in Settings

---

## Verification

After full execution:
1. `npx expo start` runs without errors
2. All remaining tests pass
3. Full app walkthrough on simulator — every screen renders
4. Calendar sync works end-to-end (connect → detect shifts → generate plan)
5. Adaptive Brain shows insights from circadian data
6. Notifications schedule correctly
7. Analytics events fire to dashboard
8. Crash reporting captures test error
9. Feedback button in Settings opens submission flow
10. No references to archived code in active codebase (grep for archived module names)
