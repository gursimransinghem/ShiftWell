# ShiftWell — Activity Log

> This log is automatically updated during every development session. Newest entries at the top.
> Read this file at the start of every session to orient yourself.

---

## 2026-04-06 — Session: Adaptive Brain + Phase 6 Features

### Completed
- **Features 1–6 (Today screen):** SleepDebtCard, NapCalculatorModal, ScienceInsightCard, On-shift polish (nap window + caffeine cutoff), ScoreBreakdownCard, PatternAlertCard
- **Marketing additions:** "3%" stat block + daytime eating card on welcome screen; "THE RESEARCH" section on paywall
- **Adaptive Brain spec** — full brainstorming session → approved design spec at `docs/superpowers/specs/2026-04-06-adaptive-brain-design.md`
- **Adaptive Brain implementation** — 25 files, 4165 insertions, 354 tests passing (55 new):
  - 4-factor engine: circadian (50%), debt/bank (20%), lookahead (20%), recovery (10%)
  - 5 circadian transition protocols (Day→Night, Night→Day, Evening→Night, Day→Evening, Isolated Night)
  - Apple Watch recovery composite score with −43min deep sleep correction
  - useAdaptivePlan hook (HealthKit 14-night history fetch on app open)
  - AdaptiveInsightCard (learning phase propose/accept + autopilot undo)
  - LightProtocolArc (animated 24h timeline, Circadian tab)
  - Pre-Shift Brief coaching tab (5-part, conditionally visible)
- **Research pipeline** — `docs/research/` consolidated, PostToolUse hook auto-files research docs

### Key Decisions
- Circadian weight at 50% (primary factor) — justified by Eastman & Burgess 2009, NIOSH protocols
- Day→Night protocol: cumulative shifts (+90/+180/+270 min from baseline), not incremental
- Recovery formula: sleep-stages only (v1) — no HRV auth yet; honest fallback to null for iPhone
- AdaptiveInsightCard: learning mode (days 1–30 propose), autopilot after day 31
- Brief tab conditionally shows in FloatingTabBar only when transition ≤7 days away
- Research docs consolidated to `docs/research/` (from `.planning/research/`)

### Tests
- Start: 299 | End: 354 | New: 55 | Regressions: 0

### Next Session
1. Wire LightProtocolStrip into Today screen for transition days
2. Revert `app/index.tsx` onboarding bypass
3. Live device QA (HealthKit real data, GradientMesh, Wind-down state)

---

## 2026-04-02 — Session 10: Post-Phase-3 Research & Decision Gates

### Completed
- **Naming research deep dive** — 25+ candidates across 4 rounds, trademark checks, risk assessment
- **Competitor analysis report** — 38 products benchmarked: pricing models, features, conversion rates, trial lengths, positioning
- **Business model research** — 10 direct competitors analyzed for pricing strategy, trial mechanics, free-to-premium conversion
- **ShiftWell trademark conflict confirmed** — Deep WHOOP analysis shows ShiftWell could conflict
- **Competitive edge log created** — Living document tracking positioning vs 38 competitors
- **Vision alignment session** — Full product vision clarified through deep questioning
- **Project dashboard built** — Interactive HTML 8-section command center for strategic overview
- **Claude recommendations compiled** — 13 high-impact ideas with rationale (referral, pricing, partnerships, grants, etc.)

### Key Decisions
- $6.99/mo or $49.99/yr pricing approved (market sweet spot)
- $149.99 lifetime option added (captures anti-subscription segment)
- 14-day trial approved (balances conversion vs free-user cost)
- Shift Crew viral loop approved for v1.2
- Pre-adaptation alerts approved for v1.0 algorithm
- Nurse-first positioning pending Sim approval
- Hospital partnership beta testing pending Sim approval
- App name still TBD (Sim deciding between Circawell, Circadio, or new direction)

### Status
- **Blockers:** App name decision (gates branding, logo design, legal setup)
- **Next gates:** Plan approval → GSD artifacts (.planning/) → brand rollout

---

## 2026-03-16 — Session 9: Phase 3 — Wire Infrastructure + Recovery Dashboard

### Completed
- **Auth wired into root layout** — `app/_layout.tsx`
  - `checkSession()` + `initializePremium()` called on cold launch
  - Auth and premium stores initialized before any screen renders
- **Push notifications wired** — `src/store/plan-store.ts`
  - `schedulePlanNotifications()` called automatically after every `regeneratePlan()`
  - Schedules next 24h of sleep reminders, caffeine cutoffs, and wake alarms
- **Premium gating wired** — `app/import.tsx`, `app/(tabs)/settings.tsx`
  - Import screen: checks `canAccess('ics_import')`, redirects to paywall if locked
  - Settings: import + export buttons show lock icons when on free tier
  - Recovery Score gated behind `accuracy_tracking` premium feature
- **HealthKit onboarding screen** — `app/(onboarding)/healthkit.tsx`
  - New step 5 of 5 in onboarding flow (optional Apple Health connection)
  - Auto-skips on non-HealthKit devices (iPad, Android)
  - Two benefit cards: Track Recovery, Auto Sleep Focus
  - Connect + Skip buttons, success/error states
  - Added `healthkitConnected` field + setter to user store
  - Updated `_layout.tsx` to include healthkit screen
  - Updated `preferences.tsx`: step 4/5, "Next" button, navigates to healthkit
- **Recovery Score dashboard** — `src/components/recovery/` (4 files) + `src/hooks/useRecoveryScore.ts`
  - `useRecoveryScore` hook: fetches HealthKit data, compares planned vs actual, weekly accuracy
  - `RecoveryScoreCard`: circular score ring (0-100), color-coded (red/yellow/green), trend arrow, streak badge
  - `SleepComparisonCard`: planned vs actual bedtime/wake/duration with deviation badges
  - `WeeklyTrendChart`: 7-day bar chart of daily adherence scores
  - Wired into Today tab as "RECOVERY" section (between header and countdowns)
- **Settings enhanced** — `app/(tabs)/settings.tsx`
  - ACCOUNT section: sign-in/out, plan badge (Free/Premium), upgrade button, email display
  - SYNC section: last synced time, pending writes, Sync Now button, auto-sync toggle
  - NOTIFICATIONS section: permission status, toggles for sleep/caffeine/wake reminders
  - All premium features show lock icon when on free tier
- **New tests** — 27 new tests (110 total, all passing)
  - `__tests__/accuracy-score.test.ts` (16 tests): comparison scoring, accuracy, trends, streaks, insights
  - `__tests__/sync-engine.test.ts` (11 tests): queue, flush, retry, pending writes, status

### Key Decisions
- Recovery Score lives on Today tab (not a separate tab) — keeps 3-tab navigation simple
- HealthKit onboarding is optional (skip button) — app works fully without it
- Auth is non-blocking — free features work offline without an account
- Premium gating is soft — locked features show paywall, no hard blocks on core functionality

### New Files Created (9 total)
- `app/(onboarding)/healthkit.tsx`, `src/hooks/useRecoveryScore.ts`
- `src/components/recovery/` — RecoveryScoreCard, SleepComparisonCard, WeeklyTrendChart, index
- `__tests__/accuracy-score.test.ts`, `__tests__/sync-engine.test.ts`

### Files Modified (9 total)
- `app/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/settings.tsx`
- `app/(onboarding)/_layout.tsx`, `app/(onboarding)/preferences.tsx`
- `app/import.tsx`, `src/store/plan-store.ts`, `src/store/user-store.ts`

### Next Steps
- [ ] Add WritePlannedSleep call when plan generates (triggers iOS Sleep Focus)
- [ ] Build caffeine & light tracking dedicated screens
- [ ] Add post-sleep debrief ("How did you sleep?") quick log
- [ ] Smart sleep window notifications ("Phone down, head to bed")
- [ ] Begin Phase 3: Live Activities, widgets, Apple Watch

---

## 2026-03-16 — Session 8: Phase 2 Implementation (Cloud + Premium + HealthKit)

### Completed
- **Supabase client layer** — `src/lib/supabase/` (5 files)
  - Client initialization with SecureStore session adapter
  - Full database types matching schema (6 tables with Row/Insert/Update types)
  - Auth module: Apple Sign-In, email/password, session management
- **Auth store + UI** — `src/store/auth-store.ts` + `app/(auth)/` (3 screens)
  - Zustand auth store with sign-in, sign-up, sign-out, session check
  - Sign-in screen (Apple Sign-In + email, dark theme, #6C63FF accent)
  - Sign-up screen (email + password validation)
  - Auth layout (Stack navigator)
- **Sync engine** — `src/lib/sync/` (3 files)
  - Offline-first queue: writes to AsyncStorage first, queues Supabase writes
  - Full bidirectional sync with last-write-wins conflict resolution
  - Data migration: one-time Phase 1 → cloud migration on account creation
- **HealthKit integration** — `src/lib/healthkit/` (4 files + type shim)
  - Sleep data reading (in-bed, core, deep, REM, unspecified stages)
  - Write planned sleep to activate iOS Sleep Focus
  - Sleep comparison: planned vs actual with adherence scoring
  - Weekly accuracy tracking with trend analysis and streak counting
- **Push notifications** — `src/lib/notifications/` (2 files)
  - Schedule sleep reminders (30 min before bedtime), caffeine cutoffs, wake alarms
  - `schedulePlanNotifications()` auto-schedules from PlanBlock array
- **Premium / RevenueCat** — `src/lib/premium/` (3 files) + `src/store/premium-store.ts`
  - RevenueCat SDK integration (initialize, purchase, restore)
  - 14 features mapped to free/premium tiers
  - Premium store with entitlement checks
  - Paywall screen with feature comparison table and pricing cards
- **Database schema** — `supabase/migrations/001_initial_schema.sql`
  - 6 tables: users, shifts, personal_events, sleep_plans, health_data, subscriptions
  - Row-Level Security on all tables
  - Auto-update triggers for updated_at
- **Updated existing stores** — shifts-store now queues cloud sync on mutations
- **app.json updated** — Apple Sign-In, HealthKit, notifications, RevenueCat plugins
- **Environment config** — `.env.example` with Supabase + RevenueCat placeholders
- **All 83 existing tests still passing**, zero TypeScript errors

### Key Decisions
- HealthKit package needs native build (iOS only) — added type declaration shim for compile-time safety
- Sync engine uses `any` cast for Supabase upsert to handle dynamic table routing
- Account creation is optional — free features work fully offline (same as Phase 1)
- Premium tier: $4.99/mo or $39.99/yr (33% discount)

### New Files Created (25 total)
- `src/lib/supabase/` — client.ts, storage-adapter.ts, auth.ts, database.types.ts, index.ts
- `src/lib/sync/` — sync-engine.ts, data-migration.ts, index.ts
- `src/lib/healthkit/` — healthkit-service.ts, sleep-comparison.ts, accuracy-score.ts, index.ts
- `src/lib/notifications/` — notification-service.ts, index.ts
- `src/lib/premium/` — premium-service.ts, entitlements.ts, index.ts
- `src/store/` — auth-store.ts, premium-store.ts
- `src/types/` — healthkit.d.ts
- `app/(auth)/` — _layout.tsx, sign-in.tsx, sign-up.tsx
- `app/paywall.tsx`
- `supabase/migrations/001_initial_schema.sql`
- `.env.example`

### Next Steps
- [ ] Create Supabase project and run migration SQL
- [ ] Set up RevenueCat account + App Store Connect products
- [ ] Wire auth into root layout (conditional routing)
- [ ] Add HealthKit onboarding step (optional, after chronotype quiz)
- [ ] Build recovery score dashboard UI
- [ ] Write tests for sync engine and data migration
- [ ] Test on physical iPhone with `npx expo start`

---

## 2026-03-14 — Session 7: Design Assets Guide

### Completed
- **Design Assets Guide** (`DESIGN_ASSETS_GUIDE.md`) — Comprehensive guide for creating all visual assets using AI tools and free resources
  - Full brand identity: color palette with hex codes, 3 Google Font pairings, brand voice guidelines
  - 5 ready-to-use AI logo prompts (Midjourney, DALL-E, Ideogram) with exact colors and style specs
  - App Store screenshot specs, 5 screen concepts with detailed descriptions, Canva step-by-step
  - Social media templates for Twitter, Instagram, LinkedIn, Product Hunt with exact dimensions and Canva instructions
  - 5 AI marketing image prompts for social content
  - Prioritized quick-start checklist with time estimates (~2h for essentials, ~3.5h for everything)
  - File organization structure for all assets

### Next Steps
- [ ] Create pre-launch landing page (HTML/CSS, email capture)
- [ ] Draft social media launch posts (Reddit, Twitter, Product Hunt)
- [ ] Create beta tester feedback form/survey

---

## 2026-03-14 — Session 6: Pre-Launch Deliverables & Founder Guide

### Completed
- **Privacy Policy** (`PRIVACY_POLICY.md`) — App Store-compliant, GDPR/CCPA-friendly, plain English
- **Health Disclaimers** (`HEALTH_DISCLAIMERS.md`) — In-app, App Store, and legal disclaimers + safe language guide
- **App Icon Guide** (`APP_ICON_GUIDE.md`) — Size specs, 3 design concepts, AI generator prompts
- **App Store Listing** (`APP_STORE_LISTING.md`) — Polished metadata, ASO-optimized keywords, subtitle options
- **Deployment Guide** (`DEPLOYMENT_GUIDE.md`) — Step-by-step TestFlight + App Store submission walkthrough
- **App Store Metadata** (`app-store-metadata.md`) — Additional metadata reference
- **Founder Action Guide** (`FOUNDER_ACTION_GUIDE.md`) — Beginner-friendly step-by-step guide for all personal tasks
- **app.json fix** — Added encryption compliance key (avoids TestFlight warning), disabled tablet support (avoids iPad screenshot requirement)
- All deliverables created using parallel subagents for context efficiency

### Key Decisions
- Disabled iPad/tablet support to simplify App Store submission (no iPad screenshots needed)
- Added `ITSAppUsesNonExemptEncryption: false` since app uses no encryption
- Created comprehensive beginner guide since founder has no coding/business setup experience

### Next Steps (Founder Personal Actions)
- [ ] Form LLC in home state (~30 min, $100-200)
- [ ] Get EIN from IRS (~10 min, free)
- [ ] Enroll in Apple Developer Program ($99/yr)
- [ ] Generate app icon using AI tools (prompts in APP_ICON_GUIDE.md)
- [ ] Test on physical iPhone (`npx expo start`)
- [ ] Recruit 5-10 beta testers from department

### Next Steps (Claude Can Do — Next Session)
- [ ] Build pre-launch landing page (HTML/CSS, email capture)
- [ ] Draft social media launch posts (Reddit, Twitter, Product Hunt)
- [ ] Create beta tester feedback form/survey
- [ ] Begin Phase 2 architecture (Supabase backend, HealthKit)

---

## 2026-03-14 — Session 5: Business Plan & Launch Strategy

### Completed
- **Business plan:** Created comprehensive 12-section BUSINESS_PLAN.md covering:
  - Business entity setup (LLC formation, EIN, Apple Developer Program)
  - Testing strategy with clear "ready to ship" checklist and beta plan
  - App Store submission step-by-step guide with health app compliance notes
  - Monetization strategy: Free → Freemium ($4.99/mo) → B2B
  - Go-to-market strategy leveraging physician credibility
  - Financial plan with 12-month revenue projections
  - Legal & compliance (privacy policy, health disclaimers, FDA/HIPAA analysis)
  - IP strategy (trademark, trade secret, copyright)
  - Marketing timeline (pre-launch through Month 12)
  - Risk assessment with mitigation strategies
  - Key metrics, milestones, and decision gates
- **Visual roadmap:** Created VISUAL_ROADMAP.md with architecture diagrams, screen flows, algorithm pipeline, competitive positioning
- **Cross-audit:** Verified 100% of planned MVP features are built (all 4 weeks complete, 83 tests passing)
- **Documentation:** All project files updated with business planning context

### Key Decisions
- Launch free, introduce premium at Month 3 after validation
- Form single-member LLC before App Store submission
- Target 10-20 beta testers for 2+ weeks before public launch
- Lead with physician credibility in all marketing

### Next Steps (Immediate)
- [ ] Form LLC in home state
- [ ] Enroll in Apple Developer Program ($99/yr)
- [ ] Generate app icon
- [ ] Test on physical iPhone with real shift schedule
- [ ] Recruit 5-10 beta testers from department

---

## 2026-03-14 — Session 4: Weeks 3-4 Complete Build Through to Ship-Ready

### Completed
- **Today screen:** Timeline with color-coded blocks, CountdownCards (live timers), status header, InsightBanner, TipCard, pull-to-refresh, empty states
- **Sleep tips engine:** 25+ evidence-based tips with scientific references, contextual selection by day type, tip of the day rotation
- **.ics import flow:** 3-step (file picker → review detected shifts with checkboxes → confirm import)
- **.ics export:** useExport hook with configurable options, generates ICS → temp file → share sheet
- **Settings screen:** Import/export controls, profile display, about section, science refs, reset/clear data
- **Animations:** AnimatedTransition component, welcome stagger, chronotype transitions, countdown pulse, timeline active states, month transitions
- **Comprehensive test suite:** 83 tests all passing (edge cases, naps, caffeine, meals, ICS parser)
- **EAS config:** eas.json (dev/preview/production), app.json production-ready
- **App Store metadata:** Full listing draft (description, keywords, category)
- **Documentation:** All project docs updated — IMPLEMENTATION_PLAN.md (Weeks 1-4 marked complete), PROJECT_CONTEXT.md (full build inventory), ACTIVITY_LOG.md

### File Count Summary
- Algorithm engine: 8 modules (src/lib/circadian/)
- Calendar system: 3 modules (src/lib/calendar/)
- Tips engine: 2 modules (src/lib/tips/)
- Stores: 4 files (src/store/)
- UI components: 7 files (src/components/ui/)
- Today components: 5 files (src/components/today/)
- Calendar components: 3 files (src/components/calendar/)
- Hooks: 3 files (src/hooks/)
- Theme: 4 files (src/theme/)
- Screens: 11 files (app/)
- Tests: 7 test files, 83 tests
- Config: app.json, eas.json, jest.config.js, tsconfig.json

### Next Steps (to ship)
- [ ] Generate app icon (see assets/icons/README.md)
- [ ] Test on physical iPhone via `npx expo start`
- [ ] Fill in Apple credentials in eas.json
- [ ] Run `eas build --platform ios --profile preview`
- [ ] Submit to TestFlight, distribute to 5-10 beta testers
- [ ] Iterate based on real-world feedback

---

## 2026-03-14 — Session 3: Week 2 Core UI Build

### Completed
- **Theme system:** Dark-mode-first design tokens — colors (block-type palette), typography scale, spacing/radius constants
- **Zustand stores (3):**
  - user-store: profile + onboarding state, AsyncStorage persisted
  - shifts-store: CRUD for shifts/personal events, date-aware serialization, auto shift classification
  - plan-store: derived SleepPlan, auto-regenerates on shift/profile changes via subscriptions
- **UI components (6):** Button (3 variants), Card, ProgressBar, OptionCard, TimeRangePicker, barrel export
- **Onboarding flow (6 files):**
  - Entry router (checks onboarding state, redirects)
  - Welcome screen with value props
  - Chronotype quiz (5-question MEQ, scores to early/intermediate/late)
  - Household profile (size, young children, pets)
  - Sleep preferences (hours, naps, caffeine sensitivity, commute)
- **Calendar & shift entry (6 files):**
  - MonthView with color-coded dots per block type
  - DayDetail panel with chronological event list
  - Schedule tab wired to stores
  - Add/edit shift modal
  - Settings placeholder
- **Tab navigation:** 3 tabs (Today, Schedule, Settings) with icons
- **Algorithm wiring:** Plan store subscribes to shifts + profile, auto-regenerates plan
- All 20 algorithm tests still passing

**Blockers:** None

### Next Steps (Week 3)
- [ ] Today screen: glanceable timeline with countdowns ("Sleep in 3h", "Caffeine cutoff in 1h")
- [ ] .ics import flow (expo-document-picker → parse → confirm shifts)
- [ ] .ics export via share sheet
- [ ] Sleep tips & insights (contextual, evidence-based)
- [ ] Visual polish, animations, professional feel

---

## 2026-03-14 — Session 2: Repository Reorganization

### Completed
- Audited full repository structure and identified 4 issues
- Trimmed IMPLEMENTATION_PLAN.md to remove overlap with PROJECT_CONTEXT.md (clear scoping: Context = why/what, Plan = how/when)
- Fixed project structure in plan to match Expo Router reality (app/ at root, not src/app/)
- Deleted 3 template boilerplate files: two.tsx, modal.tsx, EditScreenInfo.tsx
- Fixed broken imports in app/(tabs)/index.tsx, app/(tabs)/_layout.tsx, app/_layout.tsx
- Expanded root .gitignore (added .DS_Store, .env, logs, IDE files, build artifacts)
- All 20 tests still passing

**Blockers:** None

### Next Steps (Week 2)
- [ ] Onboarding flow: welcome screen, chronotype quiz (MEQ), household profile, preferences
- [ ] Zustand store for shifts and user profile (persisted to AsyncStorage)
- [ ] Calendar month view with color-coded shift/sleep/nap/meal blocks
- [ ] "Add Shift" modal with time pickers
- [ ] Wire algorithm: shifts change → generateSleepPlan() re-runs → UI updates
- [ ] Today screen: glanceable timeline with countdowns

---

## 2026-03-14 — Session 1: Project Genesis + Week 1 Algorithm Build

### End of Session
**Completed:**
- Generated and scored 9 physician side-project ideas (PHYSICIAN_SIDE_PROJECT_IDEAS.md)
- Identified ShiftWell as #1 idea (scored 4.70/5) after competitive analysis
- Completed full competitive landscape research (Timeshifter, Arcashift, SleepSync, Sleep Aid)
- Designed complete implementation plan across 5 phases
- Made key tech decisions: Expo (React Native), TypeScript, deterministic algorithm (not LLM), iOS-first
- Scaffolded Expo project (SDK 55, React 19)
- Built entire circadian algorithm engine (7 modules):
  - types.ts, classify-shifts.ts, sleep-windows.ts, nap-engine.ts
  - caffeine.ts, meals.ts, light-protocol.ts, index.ts
- Built calendar import/export system (3 modules):
  - ics-parser.ts, ics-generator.ts, shift-detector.ts
- Wrote and passed 20 unit tests
- Created IMPLEMENTATION_PLAN.md (full build plan copy)
- Created PROJECT_CONTEXT.md (session synopsis + baseline context)
- Added subagent policy for context window optimization
- Created CLAUDE.md with global instructions
- Created this ACTIVITY_LOG.md

**Key Decisions Made:**
- Deterministic algorithm over LLM (testable, offline, zero cost)
- Expo over Swift (AI coding tool support, cross-platform bonus)
- MVP scope: import shifts → generate plan → export to calendar (no backend v1)
- Personal calendar awareness included in MVP (reads full calendar, not just shifts)
- Household profile in onboarding (kids, noise modeling)

**Blockers:** None

### Next Steps (Week 2)
- [ ] Onboarding flow: welcome screen, chronotype quiz (MEQ), household profile, preferences
- [ ] Zustand store for shifts and user profile (persisted to AsyncStorage)
- [ ] Calendar month view with color-coded shift/sleep/nap/meal blocks
- [ ] "Add Shift" modal with time pickers
- [ ] Wire algorithm: shifts change → generateSleepPlan() re-runs → UI updates
- [ ] Today screen: glanceable timeline with countdowns

---

## Business Document Completion Tracking

From TASK_LOG.md — tracked completion of major deliverables and strategic work:

| Deliverable | Completed | Session | Notes |
|---|---|---|---|
| Core circadian algorithm engine | 2026-03 (Week 1) | S1 | 11 modules, 20+ tests |
| ICS parser + generator + shift detector | 2026-03 (Week 1) | S1 | Calendar import/export pipeline |
| Theme & design system | 2026-03 (Week 2) | S3 | Dark mode, design tokens |
| Zustand stores (user, shifts, plan) | 2026-03 (Week 2) | S3 | AsyncStorage persisted |
| Onboarding flow (6 files) | 2026-03 (Week 2) | S3 | Quiz, household, preferences |
| Calendar & shift entry UI | 2026-03 (Week 2) | S3 | MonthView, DayDetail |
| Today screen | 2026-03 (Week 3) | S4 | Timeline, countdowns, insights |
| Import/export flow | 2026-03 (Week 3) | S4 | 3-step .ics import, share sheet export |
| Sleep tips engine (25+ tips) | 2026-03 (Week 3) | S4 | Evidence-based, contextual |
| Animations | 2026-03 (Week 4) | S4 | Staggered, transitions, pulse, press |
| Test suite (83 tests) | 2026-03 (Week 4) | S4 | Edge cases, full coverage |
| EAS/ship configuration | 2026-03 (Week 4) | S4 | eas.json, app.json, metadata |
| Business plan v1 | 2026-03 (Week 4) | S5 | LLC, monetization, go-to-market |
| Phase 2 infrastructure | 2026-03 | S8 | Supabase, auth, HealthKit, premium, notifications, sync |
| Phase 3 UI wiring | 2026-03 | S9 | Auth routes, recovery score dashboard |
| Borbely two-process energy model | 2026-03-31 | — | Ported from ULOS |
| Landing page redesign | 2026-03 | — | Editorial aesthetic |
| Committee top-10 issues fix | 2026-03 | — | All critical + high priority |
| ICS parser crash safety fix | 2026-03 | — | Plus hasPets algorithm, paywall CTA |
| Project dashboard (HTML) | 2026-04-01 | S10 | Interactive 8-section command center |
| Deep questioning / vision session | 2026-04-01 | S10 | Full product vision aligned |
| Business model research (10 competitors) | 2026-04-01 | S10 | Pricing, trials, conversion data |
| Naming research (25+ candidates) | 2026-04-01/02 | S10 | Trademark checks, risk ratings |
| Competitor analysis (38 products) | 2026-04-02 | S10 | Definitive market intelligence |
| ShiftWell BCEHS deep dive | 2026-04-02 | S10 | Trademark conflict confirmed |
| Competitor log + competitive edge log | 2026-04-02 | S10 | Living tracking docs |

---

Created: 2026-04-05
Last Reviewed: 2026-04-05
Last Edited: 2026-04-05
Review Notes: Consolidated from ACTIVITY_LOG.md and TASK_LOG.md. Organized chronologically newest first, eliminated duplicates, integrated business document completion tracking from TASK_LOG.