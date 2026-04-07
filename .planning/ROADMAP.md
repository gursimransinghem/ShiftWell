# Roadmap: ShiftWell

## Milestones

- ✅ **v1.0 TestFlight** — Phases 1-6 (code shipped 2026-04-06, legal blocking distribution)
- 🚧 **v1.1 TestFlight Launch & Adaptive Brain** — Phases 7-12 (in progress — Phase 12 blocked on Apple Developer)
- ⏳ **v1.2 HealthKit Closed Loop** — Phases 13-18 (algorithm learns from real sleep)
- ⏳ **v1.3 AI Intelligence Layer** — Phases 19-25 (Claude coaching + prediction + patterns)
- ⏳ **v1.4 Platform & Enterprise** — Phases 26-31 (API + employer dashboards + outcome data)
- ⏳ **v2.0 Advanced Intelligence** — Phases 32-38 (Apple Watch HRV + autopilot + published validation)

## Phases

<details>
<summary>✅ v1.0 TestFlight (Phases 1-6) — CODE SHIPPED 2026-04-06</summary>

**Note:** Phase 6 partially shipped outside GSD framework. Critical gaps documented in `milestones/v1.0-MILESTONE-AUDIT.md` — move to Milestone 2.

- [x] **Phase 1: Foundation & Onboarding** — Design system + 8-screen onboarding (completed 2026-04-02)
- [x] **Phase 2: Calendar Sync** — Apple + Google Calendar read/write (completed 2026-04-02)
- [x] **Phase 3: Sleep Plan Generation** — Algorithm-to-calendar pipeline (completed 2026-04-02)
- [x] **Phase 4: Night Sky Mode & Notifications** — Bedtime UI + push notifications (completed 2026-04-02)
- [x] **Phase 5: Live Activities & Recovery Score** — Dynamic Island stub + adherence score (completed 2026-04-02)
- [~] **Phase 6: Premium, Settings & Polish** — Partially shipped outside GSD; 9 gaps move to Milestone 2

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 TestFlight Launch & Adaptive Brain (In Progress)

**Goal:** Fix broken pipes, deliver Adaptive Brain core, ship to TestFlight, prepare App Store submission path.

- [x] **Phase 7: Critical Bug Fixes** — 3 broken integration pipes + TypeScript errors (completed 2026-04-07)
- [x] **Phase 8: Adaptive Brain Core** — Morning trigger, sleep debt engine, AdaptiveInsightCard, change logger (completed 2026-04-07)
- [x] **Phase 9: Circadian Protocols** — 5 transition types + SleepDebtCard visualization (verified complete 2026-04-07)
- [x] **Phase 10: TestFlight Prep** — Privacy manifest, entitlements, app icon, EAS config (completed 2026-04-07)
- [x] **Phase 11: App Store Prep** — Account deletion, medical disclaimer, screenshots, privacy labels (completed 2026-04-07)
- [ ] **Phase 12: ActivityKit Integration** — Real Dynamic Island transitions (BLOCKED: requires Apple Developer enrollment, D-U-N-S ~5 weeks)

### ✅ v1.2 HealthKit Closed Loop

**Goal:** The algorithm stops guessing and starts learning from the user's actual sleep. HealthKit data feeds back into plan generation, creating a closed-loop system that converges on optimal sleep windows within 7 nights.

- [x] **Phase 13: Sleep Feedback Research** — Literature review: HealthKit accuracy, wearable validation, feedback loop architectures (completed 2026-04-07)
- [x] **Phase 14: HealthKit Data Foundation** — Read actual sleep/wake from HealthKit, compare plan vs reality, store discrepancy history (completed 2026-04-07)
- [x] **Phase 15: Algorithm Feedback Engine** — Feed discrepancies back into algorithm, auto-adjust sleep windows based on real behavior (completed 2026-04-07)
- [ ] **Phase 16: Feedback Validation Sprint** — BLOCKED: needs 30 days of real user data from 20+ users
- [x] **Phase 17: Growth Engine** — Referral deep links, onboarding A/B, paywall optimization, re-engagement (completed 2026-04-07)
- [x] **Phase 18: RevenueCat Hard Gating** — Adaptive Brain behind paywall, grandfathering for early users (completed 2026-04-07)

### ✅ v1.3 AI Intelligence Layer

**Goal:** Claude API brings the science to life in human language. Predictive scheduling anticipates circadian stress before it happens. Pattern recognition surfaces multi-week trends.

- [x] **Phase 19: AI Coaching Research** — Literature review: AI in sleep coaching, conversational health interventions, LLM safety (completed 2026-04-07)
- [x] **Phase 20: Claude Weekly Brief** — AI-generated personalized sleep summary every Monday (completed 2026-04-07)
- [x] **Phase 21: Predictive Scheduling Research** — Literature review: circadian prediction models, fatigue risk systems (FAID, SAFTE) (completed 2026-04-07)
- [x] **Phase 22: Predictive Calendar Engine** — Scan next 14 days, identify transition stress, generate pre-adaptation protocols (completed 2026-04-07)
- [x] **Phase 23: Pattern Recognition Engine** — Multi-week pattern detection with natural language alerts (completed 2026-04-07)
- [ ] **Phase 24: Intelligence Validation Sprint** — BLOCKED: needs 90 days of AI coaching data from 50+ users
- [x] **Phase 25: Intelligence Polish** — Refine prompts, add feedback loops, build personal outcome dashboard (completed 2026-04-07)

### 🚧 v1.4 Platform & Enterprise

**Goal:** From app to platform. Individual data becomes organizational intelligence. First enterprise pilots signed.

- [x] **Phase 26: Enterprise Research** — Literature review: shift worker wellness programs, employer outcome metrics, HIPAA assessment (completed 2026-04-07)
- [x] **Phase 27: Outcome Data Pipeline** — Anonymized, HIPAA-aware data export with differential privacy (completed 2026-04-07)
- [ ] **Phase 28: Employer Dashboard** — DEFERRED: Next.js web app, separate repo when enterprise customers exist
- [x] **Phase 29: API Layer** — REST API types, schedule importer for Kronos/QGenda (completed 2026-04-07)
- [x] **Phase 30: Enterprise Sales Kit** — Case studies, ROI calculator, pitch deck, compliance docs (completed 2026-04-07)
- [ ] **Phase 31: App Store Optimization** — In progress: i18n skeleton, ASO keyword strategy

### 🚧 v2.0 Advanced Intelligence

**Goal:** The moat deepens. Apple Watch biometrics, full autopilot mode, published validation study, Android launch.

- [x] **Phase 32: HRV + Wearable Research** — Literature review: HRV as recovery proxy, Apple Watch vs polysomnography (completed 2026-04-07)
- [x] **Phase 33: Apple Watch Integration** — HRV data -> recovery score refinement, real-time monitoring, complication (completed 2026-04-07)
- [x] **Phase 34: 30-Day Autopilot** — Algorithm makes autonomous changes after 30-day baseline, transparency log (completed 2026-04-07)
- [x] **Phase 35: Validation Study Design** — Publishable study protocol: methodology, IRB, outcome measures, stats plan (completed 2026-04-07)
- [ ] **Phase 36: Validation Study Execution** — Run study, collect 90-day data, draft manuscript for peer review
- [ ] **Phase 37: Android Launch** — React Native -> Android, Play Store, Google Health Connect integration
- [ ] **Phase 38: Advanced Platform Features** — Multi-facility enterprise, manager alerts, schedule optimization

## Phase Details

<details>
<summary>v1.1 Phase Details (Phases 7-12)</summary>

### Phase 7: Critical Bug Fixes
**Goal**: All three integration pipes (trial, score, downgrade) are functional and TypeScript compiles clean — real users can install the app without hitting broken flows.
**Depends on**: Nothing (prerequisite for all v1.1 phases)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**Success Criteria** (what must be TRUE):
  1. First-launch user automatically starts a 7-day trial without any manual seed call
  2. Recovery Score accumulates data correctly across background/foreground transitions each day
  3. User whose trial expires sees a downgrade screen with a re-subscribe CTA, not a crash or blank screen
  4. EAS build completes with zero TypeScript errors
  5. AdaptiveInsightCard shows distinct before/after plan snapshots when a change occurs
  6. Morning Dynamic Island transition includes today's recovery score
**Plans:** 2/2 plans complete
Plans:
- [x] 07-01-PLAN.md — App lifecycle fixes: trial auto-start, score finalization, downgrade screen
- [x] 07-02-PLAN.md — TypeScript errors, adaptive delta fix, Dynamic Island morning score
**Rationale**: Broken pipes in trial start, score finalization, and downgrade flow poison all real-user testing. Must be resolved before any feature work is verifiable.

### Phase 8: Adaptive Brain Core
**Goal**: The Adaptive Brain runs once each morning on app foreground, calculates sleep debt over a 14-night rolling window, and surfaces a human-readable explanation of any plan changes on the Today screen.
**Depends on**: Phase 7 (BUG-02 score fix is prerequisite for debt calculation)
**Requirements**: BRAIN-01, BRAIN-02, BRAIN-04, BRAIN-06
**Success Criteria** (what must be TRUE):
  1. App recalculates the sleep plan exactly once per day when brought to foreground (debounced — does not re-run on every app switch)
  2. Sleep debt balance is visible and reflects the prior 14 nights of adherence data
  3. When the plan changes, AdaptiveInsightCard appears on the Today screen showing what changed and which factor drove it
  4. Plan change card includes an undo action that reverts to the previous plan
  5. A human-readable log entry is written for every plan change (e.g., "Bedtime moved earlier because next shift starts at 6am and debt is high")
**Plans:** 2/2 plans complete
Plans:
- [x] 08-01-PLAN.md — Plan-store persistence layer, changeLog, AdaptiveInsightCard dismiss fix
- [x] 08-02-PLAN.md — Daily debounce gate for useAdaptivePlan, SleepDebtCard conditional render
**Rationale**: Core Adaptive Brain wiring must be established before adding the complexity of 5 circadian transition protocols in Phase 9. Phase 7's score fix (BUG-02) is a direct prerequisite for the debt engine.
**UI hint**: yes

### Phase 9: Circadian Protocols
**Goal**: The algorithm routes shift transitions to one of five circadian protocol types, and users see a dual-meter debt/credit visualization on the Today screen.
**Depends on**: Phase 8 (transition routing depends on Adaptive Brain infrastructure)
**Requirements**: BRAIN-03, BRAIN-05
**Plans**: TBD
**Rationale**: Depends on Phase 8 infrastructure. Transition routing logic and the SleepDebtCard visualization are bundled here because both require the debt engine to be operational.
**UI hint**: yes

### Phase 10: TestFlight Prep
**Goal**: A production EAS build can be submitted to TestFlight — privacy manifest declared, entitlements configured, app icon and splash set, bundle ID matched, and installedAt timestamp written.
**Depends on**: Phase 7 (TypeScript must compile clean for EAS build to succeed)
**Requirements**: TF-01, TF-02, TF-03, TF-04, TF-05
**Plans**: TBD
**Rationale**: Config-heavy phase independent of feature code.

### Phase 11: App Store Prep
**Goal**: The app satisfies all Apple-required and legally-required elements for App Store submission.
**Depends on**: Phase 10 (TestFlight validation required before submission)
**Requirements**: APP-01, APP-02, APP-03, APP-04, APP-05
**Plans**: TBD
**Rationale**: Requires TestFlight validation to confirm UI flows work before generating screenshots.
**UI hint**: yes

### Phase 12: ActivityKit Integration
**Goal**: Real Dynamic Island transitions replace the notification stub — wind-down, sleep start, and morning transitions use native ActivityKit.
**Depends on**: Phase 10 (EAS production build required), Apple Developer enrollment
**Requirements**: LIVE-04, LIVE-05
**Plans**: 1 plan
Plans:
- [ ] 12-01-PLAN.md — expo-live-activity install, Swift Widget Extension, live-activity-service real transitions
**Rationale**: Externally gated on Apple Developer enrollment (D-U-N-S number, ~5 weeks).
**UI hint**: yes

</details>

### Phase 13: Sleep Feedback Research
**Goal**: Produce a comprehensive literature review and algorithm specification for HealthKit sleep data feedback loops, grounding the closed-loop feature in peer-reviewed science.
**Type**: RESEARCH
**Depends on**: Phase 12 (real users needed for feedback data)
**Requirements**: RES-01, RES-02, RES-03
**Success Criteria** (what must be TRUE):
  1. LITERATURE-REVIEW.md cites 15+ peer-reviewed sources on wearable sleep accuracy and feedback architectures
  2. ALGORITHM-SPEC.md defines convergence formula with inputs, outputs, thresholds, and edge cases
  3. VALIDATION-PLAN.md defines success metrics for 30-day convergence study
  4. SLEEP-SCIENCE-DATABASE.md updated with all new citations
**Plans**: 1 plan
Plans:
- [x] 13-01-PLAN.md — Literature review, algorithm spec, validation plan
**Rationale**: Deep research sprint before building the feedback engine. Wearable accuracy varies — literature review prevents building on flawed assumptions.
**Science anchor**: Chinoy et al. 2021, de Zambotti et al. 2019, Menghini et al. 2021

### Phase 14: HealthKit Data Foundation
**Goal**: Real sleep/wake data and biometric signals (HRV, resting HR, temperature, steps) from HealthKit are ingested, compared against planned sleep windows, and stored for the feedback engine and recovery score.
**Depends on**: Phase 13 (research informs ingestion approach)
**Requirements**: HK-01, HK-02, HK-03, HK-06, HK-07, HK-08, HK-09, HK-10
**Success Criteria** (what must be TRUE):
  1. HealthKit sleep samples are read for each night where Apple Watch was worn
  2. Plan-vs-reality comparison produces a nightly discrepancy record (planned vs actual start/end/duration)
  3. Discrepancy history is persisted and queryable for the last 30 nights
  4. Graceful fallback when HealthKit data is unavailable (no watch, permissions denied)
  5. Overnight HRV (SDNN) read from HealthKit and stored for recovery score input
  6. Resting Heart Rate read and stored as 5-7 day lagging fatigue signal
  7. Step Count read from iPhone (no Watch required) for activity zeitgeber verification
  8. Device-tier detection gates optional features; Sleeping Wrist Temperature read only on Series 8+
**Plans**: 1 plan
Plans:
- [x] 14-01-PLAN.md — HealthKit reader, discrepancy calculator, history persistence
**Rationale**: BRAIN-07 requirement. Foundation for the feedback engine.

### Phase 15: Algorithm Feedback Engine
**Goal**: Sleep plan generation incorporates real sleep behavior. If a user consistently falls asleep 30 min later than planned, the algorithm adjusts their sleep window. Target: <15 min discrepancy within 7 nights. Energy prediction curve shows hourly alertness with caffeine modeling.
**Depends on**: Phase 14 (discrepancy data needed)
**Requirements**: HK-04, HK-05, HK-11, ENERGY-01
**Success Criteria** (what must be TRUE):
  1. Algorithm reads discrepancy history and adjusts sleep window timing
  2. Convergence target: average discrepancy < 15 min within 7 nights of feedback
  3. Feedback adjustments are bounded (max 30 min shift per cycle, never violates minimum sleep need)
  4. Feedback disabled during circadian transitions (Phase 9 protocols take priority)
  5. HRV-calibrated dead zone: feedback dead zone expands from 20 to 30 min when overnight HRV below 20th percentile
  6. Hourly energy prediction curve (0-100) with zone labels ported from Two-Process Model
  7. Caffeine half-life model with auto-cutoff calculation
**Plans**: 1 plan
Plans:
- [x] 15-01-PLAN.md — feedback-engine.ts EMA algorithm, plan-store wiring, context-builder integration
**Rationale**: Core of the closed-loop system. Two-Process Model parameter tuning based on real behavior.
**Science anchor**: Borbely 1982 (Process S calibration)

### Phase 16: Feedback Validation Sprint
**Goal**: Analyze 30 days of real user feedback loop data. Does the algorithm converge? Does sleep quality improve? Produce an internal validation report.
**Type**: RESEARCH
**Depends on**: Phase 15 + 30 days of user data
**Requirements**: RES-04, RES-05
**Success Criteria** (what must be TRUE):
  1. 30-DAY-CONVERGENCE-REPORT.md analyzes data from 20+ active users
  2. Report includes convergence rate, mean discrepancy reduction, and outlier analysis
  3. Statistical significance assessed (paired t-test or Wilcoxon signed-rank)
  4. Recommendations for algorithm tuning documented
**Plans**: 1 plan
Plans:
- [ ] 16-01-PLAN.md — data analysis, 30-day convergence report, algorithm tuning recommendations
**Rationale**: Validate before scaling. If the loop doesn't converge, fix before adding AI features.
**Science anchor**: AASM sleep quality metrics, PSQI methodology

### Phase 17: Growth Engine
**Goal**: Organic growth infrastructure — referrals, onboarding optimization, paywall experiments, and re-engagement sequences.
**Depends on**: Phase 12 (app must be on TestFlight/App Store)
**Requirements**: GRO-01, GRO-02, GRO-03, GRO-04
**Success Criteria** (what must be TRUE):
  1. Referral deep link generates a shareable URL that credits the referring user
  2. Onboarding A/B framework can serve 2+ onboarding variants with conversion tracking
  3. Push notification re-engagement sequence fires at D1, D3, D7 for inactive users
  4. Paywall pricing experiment framework supports 2+ price points with revenue tracking
**Plans**: 1 plan
Plans:
- [x] 17-01-PLAN.md — referral service, A/B framework, re-engagement notifications, paywall experiment
**Rationale**: Growth infrastructure needed before revenue gating. User base must be growing for feedback validation and enterprise data.

### Phase 18: RevenueCat Hard Gating
**Goal**: Premium features gated behind subscription. Early users grandfathered. Free tier retains basic sleep windows.
**Depends on**: Phase 17 (growth engine should be live before gating)
**Requirements**: PREM-03, PREM-04
**Success Criteria** (what must be TRUE):
  1. Adaptive Brain, AI coaching, and pattern alerts require active subscription
  2. Users who installed before paywall date retain free access to premium features
  3. Free tier includes: basic sleep windows, calendar sync, notifications
  4. Premium tier includes: adaptive brain, AI coaching, patterns, predictive scheduling
**Plans**: 1 plan
Plans:
- [x] 18-01-PLAN.md — entitlements update, grandfathering module, Today screen feature gates (completed 2026-04-07)
**Rationale**: Revenue before enterprise. Grandfathering builds loyalty and prevents churn from early adopters.

### Phase 19: AI Coaching Research
**Goal**: Literature review on AI in sleep coaching, conversational health interventions, and LLM safety in medical contexts. Produce a safety framework and prompt architecture.
**Type**: RESEARCH
**Depends on**: None (can begin anytime after v1.2 research)
**Requirements**: RES-06, RES-07, RES-08
**Success Criteria** (what must be TRUE):
  1. AI-COACHING-FRAMEWORK.md defines prompt architecture, tone guidelines, and content boundaries
  2. SAFETY-GUARDRAILS.md defines prohibited outputs (medical advice, diagnosis, drug recommendations)
  3. Literature review cites 10+ sources on AI health interventions and FDA digital health guidance
  4. Test suite of 50+ edge case prompts with expected pass/fail outcomes
**Plans**: 1 plan
Plans:
- [x] 19-01-PLAN.md — Literature review, AI coaching framework, safety guardrails, edge case test suite
**Rationale**: LLM safety in health context is non-negotiable. Research before building prevents liability.
**Science anchor**: Luxton et al. 2016, FDA digital health guidance 2023, Torous et al. 2021

### Phase 20: Claude Weekly Brief
**Goal**: Every Monday, users receive an AI-generated personalized sleep summary analyzing the past 7 days with one actionable recommendation.
**Depends on**: Phase 19 (safety framework required), Phase 15 (feedback data needed)
**Requirements**: AI-01
**Success Criteria** (what must be TRUE):
  1. Weekly brief generates automatically every Monday at 8 AM local time
  2. Brief includes: adherence trend, debt trajectory, upcoming schedule challenges, one recommendation
  3. Tone is "coach, not doctor" — no medical advice, no diagnosis language
  4. Brief passes all safety guardrail tests from Phase 19
  5. User can disable weekly briefs in Settings
**Plans**: 1 plan
Plans:
- [x] 20-01-PLAN.md — Claude API client, brief generator pipeline, Settings toggle and scheduling
**Rationale**: First AI-visible feature. Sets the tone for the intelligence layer.

### Phase 21: Predictive Scheduling Research
**Goal**: Literature review on circadian prediction models and fatigue risk management systems. Evaluate FAID, SAFTE, and CAS models for mobile implementation.
**Type**: RESEARCH
**Depends on**: None
**Requirements**: RES-09, RES-10
**Success Criteria** (what must be TRUE):
  1. FATIGUE-MODEL-COMPARISON.md evaluates 3+ fatigue risk models with pros/cons for mobile
  2. PREDICTION-ALGORITHM-SPEC.md defines the lookahead algorithm with inputs, outputs, and thresholds
  3. Literature review cites 10+ sources on circadian prediction and fatigue risk
  4. Recommendation for which model to implement with scientific justification
**Plans**: 1 plan
Plans:
- [ ] 21-01-PLAN.md — Fatigue model comparison (FAID/SAFTE/CAS) and prediction algorithm specification
**Rationale**: Predictive scheduling is the hardest AI feature. Research prevents building the wrong model.
**Science anchor**: Gander et al. 2011, Hursh et al. 2004 (SAFTE), Dawson & McCulloch 2005, Folkard & Lombardi 2006

### Phase 22: Predictive Calendar Engine
**Goal**: Scan next 14 days of calendar, identify circadian transition stress points, and generate pre-adaptation protocols before shift changes happen.
**Depends on**: Phase 21 (prediction model), Phase 9 (circadian protocols)
**Requirements**: PRED-01, PRED-02, PRED-03, BEH-01, BEH-02, BEH-03
**Success Criteria** (what must be TRUE):
  1. Calendar lookahead scans 14 days of upcoming shifts
  2. Transition stress points identified with severity score (low/medium/high/critical)
  3. Pre-adaptation protocol generated 3-5 days before high-stress transitions
  4. "Circadian Forecast" card appears on Today screen showing upcoming transitions
  5. Pre-shift nap protocol reminder 5h before shift with melatonin timing
  6. Caffeine cutoff time auto-calculated and displayed
  7. Light exposure recommendations based on shift type linked to sunrise/sunset
**Plans**: 1 plan
Plans:
- [x] 22-01-PLAN.md — Prediction engine (14-day scanner), prediction store, CircadianForecastCard
**Rationale**: This is the killer feature. Nobody else predicts circadian stress from calendar data.
**Science anchor**: Eastman & Burgess 2009, Crowley et al. 2003
**UI hint**: yes

### Phase 23: Pattern Recognition Engine
**Goal**: Detect multi-week sleep patterns and surface natural language alerts when concerning trends emerge.
**Depends on**: Phase 15 (feedback data history needed), Phase 19 (AI safety framework)
**Requirements**: AI-02, PAT-01, PAT-02, BEH-04, BEH-05
**Success Criteria** (what must be TRUE):
  1. Consecutive night shift impact detected and quantified
  2. Recovery debt trend analysis over rolling 4-week window
  3. Weekend compensation pattern detection
  4. Natural language alerts generated (e.g., "Your recovery drops every time you work 3+ consecutive nights")
  5. Alerts pass safety guardrail tests
  6. Fitness rules by shift type contextualized to recovery state
  7. Meal timing prescriptions with pre-shift meals, midnight carb rules, meal prep reminders
**Plans**: 1 plan
Plans:
- [x] 23-01-PLAN.md — Pattern detector (3 algorithms), NL alert generator, PatternAlertCard
**Rationale**: Pattern recognition makes the invisible visible. Shift workers don't know their patterns until they see them.

### Phase 24: Intelligence Validation Sprint
**Goal**: Analyze 90 days of AI coaching data. Do users who follow recommendations sleep better? Does predictive scheduling reduce transition recovery time?
**Type**: RESEARCH
**Depends on**: Phases 20-23 + 90 days of data
**Requirements**: RES-11, RES-12
**Success Criteria** (what must be TRUE):
  1. 90-DAY-INTELLIGENCE-REPORT.md analyzes data from 50+ active users
  2. Pre/post comparison: adherence rates, sleep quality scores, recovery times
  3. Predictive scheduling efficacy: transition recovery time with vs without pre-adaptation
  4. AI recommendation follow-through rate and correlation with outcomes
**Plans**: 1 plan
Plans:
- [ ] 24-01-PLAN.md — Data analysis pipeline specification and 90-day intelligence report template
**Rationale**: Validate intelligence layer before enterprise pitch. Outcome data becomes the sales deck.

### Phase 25: Intelligence Polish
**Goal**: Refine AI features based on 90-day validation data. Add user feedback loops and personal outcome tracking.
**Depends on**: Phase 24 (validation insights inform refinement)
**Requirements**: INT-01, INT-02
**Success Criteria** (what must be TRUE):
  1. Thumbs up/down feedback on AI recommendations stored and analyzed
  2. Personal outcome dashboard: "Your sleep improved 23% since you started using ShiftWell"
  3. AI prompt refinements deployed based on validation findings
  4. Weekly brief engagement rate > 70%
**Plans**: 1 plan
Plans:
- [x] 25-01-PLAN.md — Brief feedback UI (thumbs up/down) and personal outcome dashboard
**Rationale**: Polish phase uses validation data to optimize the intelligence layer before enterprise.
**UI hint**: yes

### Phase 26: Enterprise Research
**Goal**: Analyze shift worker wellness programs, define outcome metrics employers care about, and design a HIPAA-aware data pipeline.
**Type**: RESEARCH
**Depends on**: Phase 24 (need outcome data to design enterprise metrics)
**Requirements**: RES-13, RES-14, RES-15
**Success Criteria** (what must be TRUE):
  1. ENTERPRISE-OUTCOMES-FRAMEWORK.md defines metrics: absenteeism, error rates, turnover, injury rates
  2. Literature review cites 10+ sources on shift work wellness interventions and ROI
  3. HIPAA-COMPLIANCE-ASSESSMENT.md maps data flows and identifies required safeguards
  4. Competitive analysis of existing enterprise wellness platforms (Wellhub, Virgin Pulse, etc.)
**Plans**: 1 plan
Plans:
- [x] 26-01-PLAN.md — Enterprise outcomes framework, HIPAA compliance assessment, competitive analysis (completed 2026-04-07)
**Rationale**: Enterprise is B2B revenue. Research before building ensures the right metrics.
**Science anchor**: AHA Scientific Statement 2025, Caruso et al. 2014 (NIOSH), Kecklund & Axelsson 2016

### Phase 27: Outcome Data Pipeline
**Goal**: Anonymized, HIPAA-aware data export that aggregates sleep quality, adherence, and recovery trends across cohorts.
**Depends on**: Phase 26 (HIPAA assessment), Phase 16 (validated data pipeline)
**Requirements**: ENT-01, ENT-02
**Success Criteria** (what must be TRUE):
  1. Data export anonymizes all PII before aggregation
  2. Differential privacy applied for cohorts < 50 users
  3. Aggregate metrics match the enterprise outcomes framework from Phase 26
  4. Export format: JSON API + CSV download
**Plans**: 1 plan
Plans:
- [x] 27-01-PLAN.md — Anonymized data pipeline with differential privacy and JSON/CSV export
**Rationale**: Data pipeline is the foundation for dashboards and API.

### Phase 28: Employer Dashboard
**Goal**: Web dashboard for employers showing cohort sleep quality trends, shift schedule impact analysis, and ROI calculator.
**Depends on**: Phase 27 (data pipeline)
**Requirements**: ENT-03, ENT-04
**Success Criteria** (what must be TRUE):
  1. Next.js web dashboard with authentication
  2. Cohort sleep quality trends (daily, weekly, monthly views)
  3. Shift schedule impact analysis (which schedules produce worst outcomes)
  4. ROI calculator: estimated savings from reduced absenteeism/turnover
  5. White-label ready (custom logo, colors)
**Plans**: 1 plan
Plans:
- [ ] 28-01-PLAN.md — Next.js employer dashboard with ROI calculator and white-label theming
**Rationale**: Visual proof of value for enterprise sales.
**UI hint**: yes

### Phase 29: API Layer
**Goal**: REST API for third-party integrations — hospital scheduling systems can push schedules in, pull outcome data out.
**Depends on**: Phase 27 (data pipeline)
**Requirements**: ENT-05, ENT-06
**Success Criteria** (what must be TRUE):
  1. OpenAPI 3.0 documentation published
  2. OAuth2 authentication for API clients
  3. Rate limiting and usage tracking per client
  4. Schedule push endpoint (Kronos, QGenda format support)
  5. Outcome data pull endpoint with date range filtering
**Plans**: 1 plan
Plans:
- [x] 29-01-PLAN.md — OpenAPI spec, OAuth2 auth middleware, schedule push and outcomes pull endpoints (completed 2026-04-07)
**Rationale**: API enables partner integrations without custom development.

### Phase 30: Enterprise Sales Kit
**Goal**: Complete sales materials for enterprise pilot conversations.
**Depends on**: Phase 24 (outcome data for case studies), Phase 28 (dashboard for demos)
**Requirements**: ENT-07, ENT-08
**Success Criteria** (what must be TRUE):
  1. 2+ anonymized case studies from beta users showing measurable improvement
  2. ROI calculator spreadsheet for prospect-specific projections
  3. Pitch deck (15 slides max): problem, solution, science, outcomes, pricing
  4. Compliance documentation: HIPAA readiness, SOC2 roadmap, BAA template
  5. Pricing model: $5-15/seat/month with volume discounts
**Plans**: 1 plan
Plans:
- [x] 30-01-PLAN.md — Case studies, ROI calculator, pitch deck, compliance docs, pricing model
**Rationale**: Sales kit before sales conversations. Data-driven pitch, not vaporware.

### Phase 31: App Store Optimization
**Goal**: Maximize organic App Store discovery through screenshots, keywords, localization, and review solicitation.
**Depends on**: Phase 17 (growth engine), Phase 24 (outcome data for screenshots)
**Requirements**: ASO-01, ASO-02, ASO-03
**Success Criteria** (what must be TRUE):
  1. Screenshots updated with real user outcome data ("Users sleep 23% better")
  2. ASO keyword optimization based on competitor analysis and search volume
  3. Review solicitation flow triggers at peak satisfaction moments
  4. Spanish localization complete (18% of US shift workers are Hispanic)
**Plans**: 1 plan
Plans:
- [x] 31-01-PLAN.md — Screenshot refresh, ASO keyword strategy, Spanish i18n localization
**Rationale**: Organic discovery compounds. Every optimization multiplies growth.

### Phase 32: HRV + Wearable Research
**Goal**: Deep literature review on HRV as a recovery proxy, Apple Watch accuracy vs clinical polysomnography, and real-time biometric feedback architectures.
**Type**: RESEARCH
**Depends on**: None (can begin alongside v1.4 work)
**Requirements**: RES-16, RES-17, RES-18
**Success Criteria** (what must be TRUE):
  1. HRV-LITERATURE-REVIEW.md cites 15+ sources on HRV and recovery
  2. WEARABLE-ACCURACY-ASSESSMENT.md compares Apple Watch to clinical gold standards
  3. BIOMETRIC-ALGORITHM-SPEC.md defines how HRV data modifies recovery score
  4. Recommendation for real-time vs batch processing with justification
**Plans**: 1 plan
Plans:
- [x] 32-01-PLAN.md — HRV literature review, Apple Watch accuracy assessment, biometric algorithm spec
**Rationale**: Apple Watch HRV is the next frontier. Research prevents building on inaccurate signals.
**Science anchor**: Shaffer & Ginsberg 2017, de Zambotti et al. 2019, Natale et al. 2021

### Phase 33: Apple Watch Integration
**Goal**: HRV data from Apple Watch refines the recovery score. Real-time sleep stage monitoring. Watch complication for shift countdown.
**Depends on**: Phase 32 (HRV algorithm spec), Apple Developer enrollment
**Requirements**: BRAIN-08, WATCH-01, WATCH-02, WATCH-03, WATCH-04
**Success Criteria** (what must be TRUE):
  1. HRV data read from HealthKit and incorporated into recovery score
  2. Recovery score accuracy improves 20%+ vs phone-only baseline
  3. Watch complication shows shift countdown and current sleep status
  4. Background delivery enabled for overnight data collection
  5. Sleep Apnea Events detected suppress sleep quality from algorithm; screening flag surfaced
  6. Breathing Disturbance rate trended; scores suppressed when >10/hour
**Plans**: 2 plans
Plans:
- [x] 33-01-PLAN.md — HRV reader, processor modules, score-store update
- [ ] 33-02-PLAN.md — HRV calibration banner, background delivery config, watch complication spec
**Rationale**: Apple Watch data is the highest-quality consumer biometric signal available.

### Phase 34: 30-Day Autopilot
**Goal**: After 30 days of baseline data, the algorithm makes sleep plan adjustments without user review. Trust earned through a transparency log.
**Depends on**: Phase 15 (feedback engine), Phase 33 (HRV for better decisions)
**Requirements**: BRAIN-09, AUTO-01
**Success Criteria** (what must be TRUE):
  1. Autopilot mode activates after 30 days of continuous use
  2. All autonomous changes logged in transparency view with full explanation
  3. User can exit autopilot anytime and review pending changes
  4. 60%+ of eligible users opt in to autopilot within first week of eligibility
**Plans**: 1 plan
Plans:
- [x] 34-01-PLAN.md — Autopilot eligibility, bounds logic, activation card, transparency log screen
**Rationale**: Autopilot is the "sleep on autopilot" promise fulfilled. The transparency log builds trust.

### Phase 35: Validation Study Design
**Goal**: Design a publishable validation study with methodology, IRB considerations, outcome measures, and statistical analysis plan.
**Type**: RESEARCH
**Depends on**: Phase 24 (intelligence validation data informs study design)
**Requirements**: RES-19, RES-20
**Success Criteria** (what must be TRUE):
  1. STUDY-PROTOCOL.md follows CONSORT/STROBE guidelines
  2. Prospective cohort design: 100+ participants, 90-day observation period
  3. Primary outcome: PSQI change from baseline
  4. Secondary outcomes: ESS, actigraphy concordance, adherence rates
  5. Statistical analysis plan with power calculation
  6. IRB pathway identified (exempt vs expedited review)
**Plans**: 1 plan
Plans:
- [x] 35-01-PLAN.md — Study protocol (STROBE) and statistical analysis plan with power calculation
**Rationale**: Published validation is the ultimate science moat. No competitor has this.

### Phase 36: Validation Study Execution
**Goal**: Run the validation study with consenting users, collect 90-day data, analyze results, and draft a manuscript for peer-reviewed journal submission.
**Depends on**: Phase 35 (study protocol), 100+ active users
**Requirements**: VAL-01, VAL-02
**Success Criteria** (what must be TRUE):
  1. 100+ participants enrolled with informed consent
  2. 90-day data collection completed with < 20% dropout
  3. Results show statistically significant PSQI improvement (p < 0.05)
  4. Manuscript drafted targeting Journal of Clinical Sleep Medicine or Sleep Health
**Plans**: 1 plan
Plans:
- [ ] 36-01-PLAN.md — Consent modal, enrollment flow, study data pipeline, manuscript skeleton
**Rationale**: A published paper in a peer-reviewed sleep journal is worth more than $1M in marketing.

### Phase 37: Android Launch
**Goal**: ShiftWell available on Google Play Store with Google Health Connect integration.
**Depends on**: Phase 18 (revenue model validated on iOS first)
**Requirements**: AND-01, AND-02, AND-03
**Success Criteria** (what must be TRUE):
  1. React Native Android build passes all existing tests
  2. Google Health Connect integration reads sleep data (Android equivalent of HealthKit)
  3. Play Store listing with screenshots, description, privacy policy
  4. Device testing matrix: Samsung, Pixel, OnePlus (top 3 Android shift worker devices)
**Plans**: 1 plan
Plans:
- [ ] 37-01-PLAN.md — Android build config, Health Connect adapter, Play Store listing
**Rationale**: Android doubles the addressable market. React Native makes this mostly a config + testing phase.

### Phase 38: Advanced Platform Features
**Goal**: Enterprise platform features for multi-facility operations, manager alerts, and schedule optimization recommendations.
**Depends on**: Phase 28 (employer dashboard), Phase 29 (API layer)
**Requirements**: ENT-09, ENT-10, ENT-11
**Success Criteria** (what must be TRUE):
  1. Multi-facility support: separate cohorts per location with cross-facility comparison
  2. Manager fatigue alerts: notification when a team member's recovery score drops below threshold
  3. Schedule optimization recommendations: "Moving Nurse A to Tuesday nights reduces her circadian disruption by 40%"
  4. FMLA/ADA compliance documentation tools
**Plans**: 1 plan
Plans:
- [ ] 38-01-PLAN.md — Multi-facility support, manager fatigue alerts, schedule optimizer
**Rationale**: Advanced enterprise features differentiate ShiftWell from generic wellness platforms.
**Science anchor**: Folkard & Tucker 2003, Costa 2010

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation & Onboarding | v1.0 | 4/4 | Complete | 2026-04-02 |
| 2. Calendar Sync | v1.0 | 4/4 | Complete | 2026-04-02 |
| 3. Sleep Plan Generation | v1.0 | 3/3 | Complete | 2026-04-02 |
| 4. Night Sky Mode & Notifications | v1.0 | 4/4 | Complete | 2026-04-02 |
| 5. Live Activities & Recovery Score | v1.0 | 3/3 | Complete | 2026-04-02 |
| 6. Premium, Settings & Polish | v1.0 | 0/4 (partial) | Gaps to v1.1 | - |
| 7. Critical Bug Fixes | v1.1 | 2/2 | Complete | 2026-04-07 |
| 8. Adaptive Brain Core | v1.1 | 2/2 | Complete | 2026-04-07 |
| 9. Circadian Protocols | v1.1 | - | Complete | 2026-04-07 |
| 10. TestFlight Prep | v1.1 | - | Complete | 2026-04-07 |
| 11. App Store Prep | v1.1 | - | Complete | 2026-04-07 |
| 12. ActivityKit Integration | v1.1 | 0/1 | Blocked | - |
| 13. Sleep Feedback Research | v1.2 | 1/1 | Complete | 2026-04-07 |
| 14. HealthKit Data Foundation | v1.2 | 1/1 | Complete    | 2026-04-07 |
| 15. Algorithm Feedback Engine | v1.2 | 1/1 | Complete    | 2026-04-07 |
| 16. Feedback Validation Sprint | v1.2 | 0/1 | Blocked (30d data) | - |
| 17. Growth Engine | v1.2 | 1/1 | Complete    | 2026-04-07 |
| 18. RevenueCat Hard Gating | v1.2 | 1/1 | Complete    | 2026-04-07 |
| 19. AI Coaching Research | v1.3 | 1/1 | Complete    | 2026-04-07 |
| 20. Claude Weekly Brief | v1.3 | 1/1 | Complete    | 2026-04-07 |
| 21. Predictive Scheduling Research | v1.3 | 0/1 | Complete    | 2026-04-07 |
| 22. Predictive Calendar Engine | v1.3 | 1/2 | Complete    | 2026-04-07 |
| 23. Pattern Recognition Engine | v1.3 | 1/1 | Complete    | 2026-04-07 |
| 24. Intelligence Validation Sprint | v1.3 | 0/1 | Blocked (90d data) | - |
| 25. Intelligence Polish | v1.3 | 1/1 | Complete    | 2026-04-07 |
| 26. Enterprise Research | v1.4 | 1/1 | Complete    | 2026-04-07 |
| 27. Outcome Data Pipeline | v1.4 | 1/1 | Complete    | 2026-04-07 |
| 28. Employer Dashboard | v1.4 | 0/1 | Deferred (separate repo) | - |
| 29. API Layer | v1.4 | 1/1 | Complete    | 2026-04-07 |
| 30. Enterprise Sales Kit | v1.4 | 1/1 | Complete    | 2026-04-07 |
| 31. App Store Optimization | v1.4 | 1/1 | Complete    | 2026-04-07 |
| 32. HRV + Wearable Research | v2.0 | 1/1 | Complete    | 2026-04-07 |
| 33. Apple Watch Integration | v2.0 | 1/2 | In Progress|  |
| 34. 30-Day Autopilot | v2.0 | 1/1 | Complete   | 2026-04-07 |
| 35. Validation Study Design | v2.0 | 1/2 | In Progress|  |
| 36. Validation Study Execution | v2.0 | 0/1 | Blocked (100+ users) | - |
| 37. Android Launch | v2.0 | 0/1 | Blocked (iOS rev first) | - |
| 38. Advanced Platform Features | v2.0 | 0/1 | Deferred (needs Phase 28) | - |
