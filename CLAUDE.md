---
tags: [config, active, navigator]
purpose: "Project entry point, routing, and compact context for ShiftWell app"
workflows: [all]
---

# ShiftWell

> Extends `~/.claude/CLAUDE.md` (global). This file adds project-specific rules only.

## What This Is
Expo/React Native circadian sleep optimization app for shift workers.
Phases 1-3 complete. ~1,065 tests across 72 suites. Pre-TestFlight stage.
Monetization: freemium + subscription. Canonical pricing and trial length live in `src/lib/premium/pricing.ts` — do not duplicate values elsewhere. (Current: $9.99/mo · $49.99/yr · 30-day trial · paywall enforced from 2026-06-01.)

## The Problem
700 million shift workers globally. 32% of US healthcare workers report short sleep. Shift Work Sleep Disorder affects 10-38% of night shift workers. No existing app combines calendar-aware scheduling with science-backed circadian optimization.

## The Solution
Schedule-aware circadian planning: import or enter shifts, account for real-life constraints (kids, commute, chronotype, personal calendar), generate science-backed sleep/nap/meal/caffeine/light plans, export back to calendar. Deterministic algorithm based on Two-Process Model and NIOSH protocols — not LLM-based.

## Quick Start
```bash
npm test              # Run test suite (jest must be installed: npm install)
npx expo start        # Test on device/simulator
eas build --platform ios  # EAS build for TestFlight
```

> Note: `jest` is a dev dependency. Run `npm install` first if it's not found.

## Project Rules
- Run `npm test` before any commit — all tests must pass
- Expo/React Native stack — `npx expo start` to test on device/simulator
- EAS builds for TestFlight: `eas build --platform ios`
- Bundle ID: `com.shiftwell.app` — keep this in all EAS profiles
- **Algorithm is core IP** — changes to `src/lib/circadian/` must maintain all existing tests
- **Pricing SoT** — never hardcode prices; always import from `src/lib/premium/pricing.ts`
- Dark-mode-first UI (`userInterfaceStyle: "dark"` in app.json), professional quality, science-backed everything
- Founder is an ED physician and beginner coder — explain decisions clearly

## Authority Chain
1. **This file (CLAUDE.md)** — routing, project rules, compact context
2. **docs/dev/** — authoritative for all technical decisions
3. **docs/business/** — authoritative for business, financial, competitive decisions
4. **docs/launch/** — authoritative for deployment, App Store, legal
5. **docs/marketing/** — authoritative for content, design, social media
6. **docs/vision/** — authoritative for product roadmap, brand, feature backlog
7. **docs/research/** — authoritative for science, competitor analysis, market data
8. **_archive/** — historical only, never auto-loaded

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 55 (React Native) + Expo Router (file-based) |
| Language | TypeScript ~5.9 |
| State | Zustand 5 + AsyncStorage (persisted offline) |
| Algorithm | Pure TypeScript — offline, deterministic, no API calls |
| Calendar | ical.js for ICS parsing; custom RFC 5545 generator |
| Auth | Supabase (Apple Sign-In + email) |
| Backend | Supabase (Postgres + Edge Functions) |
| HealthKit | @kingstinct/react-native-healthkit (Nitro Modules) |
| Subscriptions | RevenueCat (react-native-purchases) |
| Analytics | PostHog (posthog-react-native) |
| Error monitoring | Sentry (@sentry/react-native) |
| Builds | EAS (cloud iOS builds, TestFlight) |
| Testing | Jest 30 + ts-jest |

## Project Structure

```
ShiftWell/
├── app/                           # Expo Router screens (file-based routing)
│   ├── _layout.tsx                # Root layout — providers, fonts, auth guard
│   ├── index.tsx                  # Entry point → onboarding or tabs
│   ├── (auth)/                    # sign-in.tsx, sign-up.tsx
│   ├── (onboarding)/              # 10-step onboarding flow
│   │   └── welcome, chronotype, shifts, calendar, healthkit, ...
│   ├── (tabs)/                    # Main tab screens
│   │   ├── index.tsx              # Today (core loop, 1,033 lines — needs refactor)
│   │   ├── schedule.tsx           # Calendar month view
│   │   ├── circadian.tsx          # Circadian forecast
│   │   ├── brief.tsx              # AI weekly brief
│   │   ├── outcomes.tsx           # Recovery dashboard
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   ├── add-shift.tsx              # Modal: add/edit shift
│   ├── import.tsx                 # ICS file import flow
│   ├── paywall.tsx                # RevenueCat paywall
│   ├── autopilot-log.tsx          # Adaptive brain transparency log
│   └── downgrade.tsx
├── src/
│   ├── components/
│   │   ├── today/                 # All Today-screen cards (25+ components)
│   │   ├── calendar/              # MonthView, DayDetail, ShiftReviewList
│   │   ├── circadian/             # LightProtocolArc, LightProtocolStrip
│   │   ├── night-sky/             # Animated night-sky overlay (NightSkyOverlay, etc.)
│   │   ├── recovery/              # RecoveryScoreCard, WeeklyTrendChart
│   │   ├── outcomes/              # OutcomeDashboard
│   │   ├── navigation/            # FloatingTabBar
│   │   ├── ui/                    # Button, Card, Text, ProgressBar, SkeletonLoader, etc.
│   │   └── providers/             # AdaptiveColorProvider
│   ├── lib/                       # Business logic (no React)
│   │   ├── circadian/             # CORE ALGORITHM — pure functions, 11 modules
│   │   │   ├── index.ts           # generateSleepPlan() — main entry point
│   │   │   ├── types.ts           # ShiftEvent, UserProfile, SleepPlan, PlanBlock
│   │   │   ├── classify-shifts.ts # Day classification (night, evening, day, recovery)
│   │   │   ├── sleep-windows.ts   # Main sleep block placement
│   │   │   ├── nap-engine.ts      # Strategic nap placement
│   │   │   ├── caffeine.ts        # Caffeine cutoff + window
│   │   │   ├── meals.ts           # Meal timing windows
│   │   │   ├── light-protocol.ts  # Light exposure/avoidance blocks
│   │   │   ├── energy-model.ts    # Borbely Two-Process energy model
│   │   │   ├── fatigue-model.ts   # Fatigue prediction
│   │   │   └── timezone-handler.ts
│   │   ├── adaptive/              # Adaptive Brain — adjusts plan from feedback + HRV
│   │   ├── ai/                    # Claude-powered weekly brief generator
│   │   ├── analytics/             # PostHog events + opt-out
│   │   ├── api/                   # Schedule importer
│   │   ├── autopilot/             # Autopilot eligibility + bounds
│   │   ├── calendar/              # Calendar service, Google Calendar API, ICS
│   │   ├── enterprise/            # Aggregator, anonymizer, export formatter
│   │   ├── feedback/              # Sleep feedback engine + HealthKit reader
│   │   ├── growth/                # A/B testing, referral, re-engagement
│   │   ├── healthkit/             # HRV reader, biometric reader, sleep comparison
│   │   ├── intelligence/          # Outcome calculator, AI feedback
│   │   ├── monitoring/            # Sentry + Zustand middleware
│   │   ├── notifications/         # Expo notifications service
│   │   ├── patterns/              # Pattern detector + alert generator
│   │   ├── predictive/            # Pre-adaptation planner, stress scorer
│   │   ├── premium/               # Feature gate, entitlements, RevenueCat, pricing SoT
│   │   ├── supabase/              # Auth, client, database types, storage adapter
│   │   ├── sync/                  # Sync engine + data migration
│   │   └── watch/                 # Apple Watch complication data
│   ├── store/                     # Zustand stores (all persisted to AsyncStorage)
│   │   ├── user-store.ts          # User profile, chronotype, preferences
│   │   ├── shifts-store.ts        # Shift events
│   │   ├── plan-store.ts          # Generated sleep plan
│   │   ├── auth-store.ts          # Supabase auth state
│   │   ├── premium-store.ts       # Premium/subscription state
│   │   ├── onboarding-store.ts    # Onboarding progress
│   │   ├── brief-store.ts         # AI weekly brief
│   │   ├── feedback-store.ts      # Sleep feedback
│   │   ├── notification-store.ts  # Notification preferences
│   │   ├── score-store.ts         # Recovery scores
│   │   ├── pattern-store.ts       # Detected patterns
│   │   ├── hrv-store.ts           # HRV readings
│   │   ├── autopilot-store.ts     # Autopilot state
│   │   ├── prediction-store.ts    # Predictive scheduling state
│   │   └── ai-store.ts            # AI feedback state
│   ├── hooks/                     # Custom React hooks (useAdaptivePlan, useTodayPlan, etc.)
│   ├── constants/                 # onboarding.ts
│   ├── content/                   # legal.ts (inline privacy/disclaimer summaries)
│   ├── i18n/                      # en.ts, es.ts (Spanish localization)
│   └── screens/                   # TransparencyLogScreen
├── __tests__/                     # Test suites mirroring src/lib structure (~62 files)
├── __mocks__/                     # Jest mocks for native modules
├── docs/
│   ├── dev/
│   │   ├── IMPLEMENTATION_PLAN.md        # Tech spec: stack, phases, structure
│   │   ├── PHASE_2_ARCHITECTURE.md       # Cloud/backend architecture
│   │   └── 2026-04-29-final-ship-sprint-plan.md  # Active ship sprint plan
│   ├── design/
│   │   ├── BRAND-PRINCIPLES.md           # Visual identity rules
│   │   └── 2026-04-05-ui-redesign/       # UI redesign specs + HTML mockups
│   ├── business/                  # Business plan, marketing, competitive analysis
│   ├── launch/                    # App Store listing, privacy policy, disclaimers
│   ├── marketing/                 # Social media guide, design assets
│   ├── research/                  # Science, competitor analysis, algorithm specs
│   ├── enterprise/                # B2B pitch, compliance, pricing model
│   └── science/                   # SLEEP-SCIENCE-DATABASE.md
├── tasks/
│   ├── todo.md                    # Active work items (P0–P4 priority tiers)
│   ├── lessons.md                 # Mistakes and patterns learned
│   └── RESUME-PROMPT.md           # Session resume context
├── logs/
│   └── ACTIVITY_LOG.md            # Dev session history
├── api/                           # Standalone Express API (OpenAPI spec)
├── app.json                       # Expo config — bundle ID, entitlements, permissions
├── CLAUDE.md                      # This file
└── .github/workflows/ci.yml       # CI: install → lint → test → expo export
```

## Core Algorithm: generateSleepPlan()

The main entry point lives in `src/lib/circadian/index.ts`. Pipeline:

1. `classifyDays()` — categorize each day (night shift, evening, day, recovery, off)
2. `computeSleepBlocks()` — place main sleep window (respects adaptive protocol offsets)
3. `generateNaps()` — strategic nap placement in gaps
4. `computeCaffeineCutoff()` + `computeCaffeineWindow()` — caffeine timing
5. `generateMealWindows()` — meal timing relative to sleep
6. `generateLightProtocol()` — light exposure/avoidance blocks
7. `computeStats()` — circadian debt score, avg sleep, transitions
8. `resolveOverlaps()` — dedup and resolve cross-day block conflicts

All modules are **pure functions**. No side effects, no network calls, no React. The algorithm runs fully offline and is the core IP — never break existing tests here.

## Zustand Store Pattern

All stores use Zustand 5 with AsyncStorage persistence. Import from `src/store/index.ts`. Never access stores directly from `src/store/<file>` outside of the store's own file — use the re-exported hooks.

## Premium & Feature Gating

- Canonical pricing: `src/lib/premium/pricing.ts` — import `PRICING`, `TRIAL_DAYS`, `PAYWALL_LAUNCH_DATE`
- Feature gate: `src/lib/premium/feature-gate.ts` — `isPremiumFeature()`, `computeIsGrandfathered()`
- Entitlements: `src/lib/premium/entitlements.ts`
- Paywall screen: `app/paywall.tsx`
- Grandfathered users (installed before `PAYWALL_LAUNCH_DATE = 2026-06-01`) get free access

## File Map

| Path | Purpose | Tags | Workflow |
|------|---------|------|----------|
| docs/dev/IMPLEMENTATION_PLAN.md | Tech spec: stack, structure, phases | rules, active | Code dev |
| docs/dev/PHASE_2_ARCHITECTURE.md | System design decisions | rules, active | Code dev |
| docs/dev/2026-04-29-final-ship-sprint-plan.md | Active ship sprint execution plan | rules, active | Code dev |
| docs/design/BRAND-PRINCIPLES.md | Visual identity, typography, color | rules, active | Design |
| docs/business/BUSINESS-PLAN-V2.md | Business strategy, market, financials | rules, active | Business |
| docs/business/MARKETING-PLAN.md | Go-to-market strategy, channels, KPIs | rules, active | Marketing |
| docs/business/COMPETITIVE_ANALYSIS.md (in research/) | Competitor intel | reference, active | Business |
| docs/business/COMPETITIVE_EDGE_LOG.md | Competitive advantages | reference, active | Business |
| docs/business/FINANCIAL_TRACKER.md | Revenue projections | reference, active | Business |
| docs/launch/LAUNCH_GUIDE.md | Pre-submission checklist | rules, active | Launch |
| docs/launch/APP_STORE_LISTING.md | Store metadata & screenshots | template, active | Launch |
| docs/launch/PRIVACY_POLICY.md | Legal privacy policy | rules, active | Legal |
| docs/launch/HEALTH_DISCLAIMERS.md | Medical disclaimers | rules, active | Legal |
| docs/launch/APP_ICON_GUIDE.md | Icon specifications | reference | Launch |
| docs/marketing/SOCIAL_MEDIA_GUIDE.md | Content & posting strategy | reference, active | Marketing |
| docs/marketing/DESIGN_ASSETS_GUIDE.md | Asset inventory | reference | Marketing |
| docs/science/SLEEP-SCIENCE-DATABASE.md | Sleep science citations | reference | Science |
| docs/research/RECOVERY_ALGORITHM_SCIENCE.md | Algorithm research basis | reference | Science |
| tasks/todo.md | Current work items (P0–P4) | active | All |
| tasks/lessons.md | Mistakes and patterns learned | reference | All |
| tasks/RESUME-PROMPT.md | Session resume context | active | Operations |
| logs/ACTIVITY_LOG.md | Dev session history (last 30 days) | changelog | Operations |

## Workflow Loading Protocol
Load ONLY the files needed for the active workflow. Do NOT load files from other workflows.

**Code development:** CLAUDE.md + docs/dev/IMPLEMENTATION_PLAN.md + docs/dev/PHASE_2_ARCHITECTURE.md + docs/dev/2026-04-29-final-ship-sprint-plan.md + tasks/todo.md + logs/ACTIVITY_LOG.md (last 30 days only)

**Business/strategy:** CLAUDE.md + docs/business/BUSINESS-PLAN-V2.md + docs/research/COMPETITOR_ANALYSIS.md + docs/business/COMPETITIVE_EDGE_LOG.md + docs/business/FINANCIAL_TRACKER.md

**Marketing/GTM:** CLAUDE.md + docs/business/MARKETING-PLAN.md + docs/business/BUSINESS-PLAN-V2.md (exec summary + market analysis) + docs/marketing/MARKETING-PLAN-V2.md

**Launch prep:** CLAUDE.md + docs/launch/LAUNCH_GUIDE.md + docs/launch/APP_STORE_LISTING.md + docs/launch/APP_ICON_GUIDE.md + docs/marketing/SOCIAL_MEDIA_GUIDE.md + docs/marketing/DESIGN_ASSETS_GUIDE.md

**Legal review:** CLAUDE.md + docs/launch/PRIVACY_POLICY.md + docs/launch/HEALTH_DISCLAIMERS.md

**Design planning:** CLAUDE.md + docs/design/BRAND-PRINCIPLES.md + docs/design/2026-04-05-ui-redesign/SPEC.md

**Science/algorithm reference:** CLAUDE.md + docs/research/RECOVERY_ALGORITHM_SCIENCE.md + docs/science/SLEEP-SCIENCE-DATABASE.md

**Operations/resume:** CLAUDE.md + tasks/RESUME-PROMPT.md + tasks/todo.md + tasks/lessons.md + logs/ACTIVITY_LOG.md (last 30 days only)

### NEVER AUTO-LOAD
- `_archive/` — Historical planning phases, old documents, design versions
- `.planning/` — Superseded by docs/ structure, 185K tokens of dead weight
- `logs/_monthly-summaries/` — Compacted activity history

## Active Sprint: Final Ship Sprint (2026-04-29)

Reference: `docs/dev/2026-04-29-final-ship-sprint-plan.md`

**Core loop to ship:** onboard → import/add shifts → generate plan → Today guidance → export/notify → feedback

**P0 Blockers:**
- Local → Remote sync (2026-04-18 audit artifacts, `website/`, `shiftwell-dashboard/`)
- npm audit: 6 vulnerabilities (run `npm audit --omit=dev`)
- Tagline lock: "Circadian Sleep Plans for Shift Workers" (28 chars)

**What NOT to expand until core loop is clean:**
- Backend/cloud sync
- AI weekly coaching (half-baked)
- Full Adaptive Brain as a visible promise
- Outcomes dashboard
- Enterprise surfaces

See `tasks/todo.md` for full P0–P4 breakdown.

## Known Technical Debt
- `app/(tabs)/index.tsx` is 1,033 lines — needs decomposition into composed sections by tier (free vs pro)
- `tsc --noEmit` reports pre-existing errors in API/dashboard/Sentry/i18n/growth surfaces — not a test blocker but should be cleaned before App Store
- `GradientMeshBackground` 3-orb animation stutters in simulator — verify on real device
- Score store uses mock data — needs HealthKit → real adherence score wiring

## Scientific Foundation
Algorithm traces to published research: Two-Process Model (Borbely 1982), AASM Guidelines (2015/2023), Eastman & Burgess (2009) circadian shifting, Czeisler et al. (1990) bright light, Drake et al. (2004) SWSD prevalence, AHA Scientific Statement (2025) circadian disruption, Boivin & Boudreau (2014) shift work interventions, NIOSH CDC anchor sleep, Gander et al. (2011) fatigue risk, St. Hilaire et al. (2017) math modeling, Milner & Cote (2009) napping, Ruggiero & Redeker (2014) nap/shift work, Drake et al. (2013) caffeine timing, Manoogian et al. (2022) time-restricted eating, Chellappa et al. (2021) daytime eating in night work.

## Context Window Management
Always prefer spawning subagents for parallelizable tasks. Keep main thread for decisions, status, errors, and commits. Use subagents for research, file generation, exploration, planning, bulk operations, and documentation updates.

## Market
mHealth market: $82.45B (2025), 22.3% CAGR. Healthcare AI VC: $11.1B (2024). Target: shift workers → travelers, surgeons, new parents, students.

## Blockers
- LLC filing not yet started (top picks: Circadian Labs, Vigil Health)
- Apple Developer enrollment pending LLC
- D-U-N-S number ~5 weeks to TestFlight

## CI
`.github/workflows/ci.yml` runs on push/PR to main: `npm install → lint → npm test → npx expo export`. Lint step is soft-fail (`|| echo`). Tests must pass.

---
Created: 2026-04-05
Last Reviewed: 2026-05-11
Last Edited: 2026-05-11
Review Notes: Full rewrite. Updated structure to reflect actual repo state (72 test suites, new lib modules: autopilot, hrv, energy, patterns, predictive, enterprise, intelligence, adherence, prescriptions, watch). Added tech stack table, project structure tree, algorithm pipeline description, store pattern, premium/gating section, active sprint context, known debt, revised file map (corrected stale paths), updated workflow loading (added design planning workflow, corrected doc paths). Removed SimVault references (personal tool, not in repo). Backed up to CLAUDE.md.bak-2026-04-06.
