# NightShift — Activity Log

> This log is automatically updated during every development session. Newest entries at the top.
> Read this file at the start of every session to orient yourself.

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
- **Animations:** AnimatedTransition component, welcome stagger, chronotype transitions, countdown pulse, timeline active states, month transitions, button/card press scale
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
- Identified NightShift as #1 idea (scored 4.70/5) after competitive analysis
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

*Log entries below this line are from previous sessions.*
