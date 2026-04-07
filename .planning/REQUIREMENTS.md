# Requirements: ShiftWell

**Defined:** 2026-04-06 (v1.1), expanded 2026-04-07 (v1.2-v2.0)
**Core Value:** Sleep on autopilot — set it up once, never think about when to sleep again.
**Design Spec:** `docs/superpowers/specs/2026-04-07-expanded-roadmap-design.md`

---

## v1.1 Requirements — TestFlight Launch & Adaptive Brain

### Critical Bug Fixes (Phase 7)

- [x] **BUG-01**: Trial starts automatically on first launch (completed 2026-04-07)
- [x] **BUG-02**: Recovery Score accumulates real data (completed 2026-04-07)
- [x] **BUG-03**: Expired trial has a graceful path (completed 2026-04-07)
- [x] **BUG-04**: EAS build succeeds — all TypeScript errors fixed (completed 2026-04-07)
- [x] **BUG-05**: AdaptiveInsightCard shows real plan changes (completed 2026-04-07)
- [x] **BUG-06**: Morning Dynamic Island includes recovery score (completed 2026-04-07)

### Adaptive Brain Core (Phase 8)

- [x] **BRAIN-01**: Morning recalculation runs once per day on app foreground (completed 2026-04-07)
- [x] **BRAIN-02**: Sleep debt engine operational — 14-night rolling tracker with banking (completed 2026-04-07)
- [x] **BRAIN-03**: Circadian transition protocols fire correctly — 5 types (completed 2026-04-07)
- [x] **BRAIN-04**: AdaptiveInsightCard renders on Today screen with undo (completed 2026-04-07)
- [x] **BRAIN-05**: SleepDebtCard dual-meter visualization (completed 2026-04-07)
- [x] **BRAIN-06**: Plan change logger — human-readable explanations (completed 2026-04-07)

### TestFlight Prep (Phase 10)

- [x] **TF-01**: Privacy manifest declared (completed 2026-04-07)
- [x] **TF-02**: Both HealthKit entitlements declared (completed 2026-04-07)
- [x] **TF-03**: App icon and splash screen configured (completed 2026-04-07)
- [x] **TF-04**: EAS production build profile configured (completed 2026-04-07)
- [x] **TF-05**: installedAt ISO timestamp at onboarding (completed 2026-04-07)

### App Store Prep (Phase 11)

- [x] **APP-01**: Account deletion in Settings (completed 2026-04-07)
- [x] **APP-02**: Medical disclaimer in onboarding and Settings (completed 2026-04-07)
- [ ] **APP-03**: App Store screenshots — requires App Store Connect (documented)
- [ ] **APP-04**: App Privacy nutrition labels — requires App Store Connect (documented)
- [ ] **APP-05**: App Review notes — requires App Store Connect (documented)

### ActivityKit Integration (Phase 12)

- [ ] **LIVE-04**: expo-live-activity@0.4.2 installed and config plugin wired
- [ ] **LIVE-05**: Real Dynamic Island transitions — wind-down, sleep start, morning

---

## v1.2 Requirements — HealthKit Closed Loop

### Research: Sleep Feedback (Phase 13)

- [x] **RES-01**: Literature review on wearable sleep accuracy (15+ peer-reviewed sources)
- [x] **RES-02**: Algorithm specification for HealthKit feedback loop with convergence formula
- [x] **RES-03**: Validation plan with success metrics for 30-day convergence study

### HealthKit Ingestion (Phase 14)

- [x] **HK-01**: HealthKit sleep samples read for each night (Apple Watch worn)
- [x] **HK-02**: Plan-vs-reality comparison produces nightly discrepancy record
- [x] **HK-03**: Discrepancy history persisted and queryable for last 30 nights

### Biometric Data Foundation (Phase 14)

- [x] **HK-06**: Overnight HRV (SDNN) read from HealthKit — recovery score upgrade from timing-only to physiological recovery
- [x] **HK-07**: Resting Heart Rate read from HealthKit — 5-7 day lagging fatigue signal, pairs with HRV
- [x] **HK-08**: Sleeping Wrist Temperature read from HealthKit (optional, Series 8+) — circadian phase verification, illness detection, menstrual cycle detection
- [x] **HK-09**: Step Count read from HealthKit (iPhone-only, no Watch required) — activity zeitgeber verification
- [x] **HK-10**: Device-tier detection (iPhone-only / Watch S1-7 / Watch S8+) for graceful feature gating

### Algorithm Feedback (Phase 15)

- [x] **HK-04**: Algorithm reads discrepancy history and adjusts sleep window timing
- [x] **HK-05**: Convergence target: average discrepancy < 15 min within 7 nights
- [x] **HK-11**: HRV-calibrated dead zone — when overnight HRV below user's 20th percentile, feedback dead zone expands from 20 to 30 min

### Energy Prediction (Phase 15)

- [x] **ENERGY-01**: Two-Process Model (Borbely) energy prediction ported from ULOS/Grafana — hourly alertness curve (0-100) with zone labels and caffeine half-life model

### Research: Feedback Validation (Phase 16)

- [ ] **RES-04**: 30-day convergence report analyzing 20+ active users
- [ ] **RES-05**: Statistical significance assessment with recommendations

### Growth Engine (Phase 17)

- [x] **GRO-01**: Referral deep link with credit tracking
- [x] **GRO-02**: Onboarding A/B framework with conversion tracking
- [x] **GRO-03**: Push notification re-engagement sequence (D1, D3, D7)
- [x] **GRO-04**: Paywall pricing experiment framework

### Premium Gating (Phase 18)

- [x] **PREM-03**: RevenueCat hard gating — adaptive brain behind paywall (Phase 18-01)
- [x] **PREM-04**: Grandfathering logic — pre-paywall users retain free access (Phase 18-01)

---

## v1.3 Requirements — AI Intelligence Layer

### Research: AI Coaching (Phase 19)

- [x] **RES-06**: AI coaching framework — prompt architecture, tone, content boundaries
- [x] **RES-07**: Safety guardrails — prohibited outputs (medical advice, diagnosis, drugs)
- [x] **RES-08**: Edge case test suite (50+ prompts with pass/fail outcomes)

### Claude Weekly Brief (Phase 20)

- [x] **AI-01**: AI-generated personalized sleep summary every Monday with one recommendation

### Research: Predictive Scheduling (Phase 21)

- [x] **RES-09**: Fatigue model comparison (FAID, SAFTE, CAS) for mobile implementation
- [x] **RES-10**: Prediction algorithm specification with inputs, outputs, thresholds

### Predictive Calendar Engine (Phase 22)

- [x] **PRED-01**: 14-day calendar lookahead identifies transition stress points
- [x] **PRED-02**: Pre-adaptation protocol generated 3-5 days before high-stress transitions
- [x] **PRED-03**: Circadian Forecast card on Today screen

### Behavioral Prescriptions (Phase 22)

- [x] **BEH-01**: Pre-shift nap protocol — 90-min nap reminder 5h before shift with melatonin timing (0.5-1mg, 30 min before)
- [x] **BEH-02**: Caffeine cutoff UI — auto-calculated cutoff time based on planned sleep time + half-life model
- [x] **BEH-03**: Light exposure recommendations — bright light timing based on shift type and sunrise/sunset times

### Pattern Recognition (Phase 23)

- [x] **AI-02**: Pattern recognition alerts — multi-week trend detection with natural language
- [x] **PAT-01**: Consecutive night shift impact detection and quantification
- [x] **PAT-02**: Recovery debt trend analysis over rolling 4-week window

### Wellness Prescriptions (Phase 23)

- [x] **BEH-04**: Fitness rules by shift type — workout restrictions/suggestions contextualized to shift pattern and recovery state
- [x] **BEH-05**: Meal timing prescriptions — pre-shift meal timing, midnight carb restrictions, meal prep reminders 4-5 days before night blocks

### Research: Intelligence Validation (Phase 24)

- [ ] **RES-11**: 90-day intelligence report analyzing 50+ users
- [ ] **RES-12**: Pre/post comparison of adherence, sleep quality, recovery times

### Intelligence Polish (Phase 25)

- [x] **INT-01**: Thumbs up/down feedback on AI recommendations
- [x] **INT-02**: Personal outcome dashboard ("Your sleep improved 23%")

---

## v1.4 Requirements — Platform & Enterprise

### Research: Enterprise (Phase 26)

- [ ] **RES-13**: Enterprise outcomes framework (absenteeism, error rates, turnover, injuries)
- [ ] **RES-14**: HIPAA compliance assessment for data pipeline
- [ ] **RES-15**: Competitive analysis of enterprise wellness platforms

### Outcome Data Pipeline (Phase 27)

- [ ] **ENT-01**: Anonymized data export with differential privacy (cohorts < 50)
- [ ] **ENT-02**: Aggregate metrics matching enterprise outcomes framework

### Employer Dashboard (Phase 28)

- [ ] **ENT-03**: Web dashboard — cohort trends, schedule impact, ROI calculator
- [ ] **ENT-04**: White-label support (custom logo, colors)

### API Layer (Phase 29)

- [ ] **ENT-05**: OpenAPI 3.0 REST API with OAuth2 auth and rate limiting
- [ ] **ENT-06**: Schedule push endpoint (Kronos, QGenda format) + outcome pull endpoint

### Enterprise Sales Kit (Phase 30)

- [ ] **ENT-07**: Case studies, ROI calculator, pitch deck, compliance docs
- [ ] **ENT-08**: Pricing model ($5-15/seat/month with volume discounts)

### App Store Optimization (Phase 31)

- [ ] **ASO-01**: Screenshots with real outcome data
- [ ] **ASO-02**: ASO keyword optimization based on search volume
- [ ] **ASO-03**: Spanish localization

---

## v2.0 Requirements — Advanced Intelligence

### Research: HRV + Wearables (Phase 32)

- [ ] **RES-16**: HRV literature review (15+ sources on HRV and recovery)
- [ ] **RES-17**: Wearable accuracy assessment (Apple Watch vs clinical)
- [ ] **RES-18**: Biometric algorithm spec for HRV-modified recovery score

### Apple Watch (Phase 33)

- [ ] **BRAIN-08**: Apple Watch HRV integration — HRV data into recovery score
- [ ] **WATCH-01**: Watch complication for shift countdown
- [ ] **WATCH-02**: Background delivery for overnight data collection
- [ ] **WATCH-03**: Sleep Apnea Events read from HealthKit (iOS 18, Watch S9+) — suppress sleep quality from algorithm input, surface screening flag
- [ ] **WATCH-04**: Breathing Disturbances rate read from HealthKit — continuous trending signal, suppress sleep quality scores when >10/hour

### Autopilot (Phase 34)

- [ ] **BRAIN-09**: 30-day autopilot — autonomous changes after baseline
- [ ] **AUTO-01**: Transparency log for all autonomous decisions

### Research: Validation Study (Phase 35)

- [ ] **RES-19**: Study protocol following CONSORT/STROBE guidelines
- [ ] **RES-20**: Statistical analysis plan with power calculation

### Validation Study (Phase 36)

- [ ] **VAL-01**: 100+ participants enrolled, 90-day data collection
- [ ] **VAL-02**: Manuscript drafted for peer-reviewed journal

### Android (Phase 37)

- [ ] **AND-01**: React Native Android build passing all tests
- [ ] **AND-02**: Google Health Connect integration
- [ ] **AND-03**: Play Store listing with screenshots and privacy policy

### Advanced Platform (Phase 38)

- [ ] **ENT-09**: Multi-facility support with cross-facility comparison
- [ ] **ENT-10**: Manager fatigue alerts when team recovery drops
- [ ] **ENT-11**: Schedule optimization recommendations

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| `expo-background-task` for Adaptive Brain | Can't write to Zustand/React context; AppState trigger is superior |
| `expo-widgets` | Alpha, not production-ready in Expo SDK 55 |
| Sleep Focus / DND trigger | iOS restrictions on Focus mode APIs |
| Social features (Shift Crew) | Deferred beyond v2.0 |
| Gamification | Deferred beyond v2.0 |
| watchOS standalone app | Deferred beyond v2.0; complication first |

---

## Traceability

| Requirement | Phase | Milestone | Status |
|-------------|-------|-----------|--------|
| BUG-01 | 7 | v1.1 | Complete |
| BUG-02 | 7 | v1.1 | Complete |
| BUG-03 | 7 | v1.1 | Complete |
| BUG-04 | 7 | v1.1 | Complete |
| BUG-05 | 7 | v1.1 | Complete |
| BUG-06 | 7 | v1.1 | Complete |
| BRAIN-01 | 8 | v1.1 | Complete |
| BRAIN-02 | 8 | v1.1 | Complete |
| BRAIN-03 | 9 | v1.1 | Complete |
| BRAIN-04 | 8 | v1.1 | Complete |
| BRAIN-05 | 9 | v1.1 | Complete |
| BRAIN-06 | 8 | v1.1 | Complete |
| TF-01 | 10 | v1.1 | Complete |
| TF-02 | 10 | v1.1 | Complete |
| TF-03 | 10 | v1.1 | Complete |
| TF-04 | 10 | v1.1 | Complete |
| TF-05 | 10 | v1.1 | Complete |
| APP-01 | 11 | v1.1 | Complete |
| APP-02 | 11 | v1.1 | Complete |
| APP-03 | 11 | v1.1 | Pending (App Store Connect) |
| APP-04 | 11 | v1.1 | Pending (App Store Connect) |
| APP-05 | 11 | v1.1 | Pending (App Store Connect) |
| LIVE-04 | 12 | v1.1 | Pending (Apple Developer) |
| LIVE-05 | 12 | v1.1 | Pending (Apple Developer) |
| RES-01 | 13 | v1.2 | Pending |
| RES-02 | 13 | v1.2 | Pending |
| RES-03 | 13 | v1.2 | Pending |
| HK-01 | 14 | v1.2 | Pending |
| HK-02 | 14 | v1.2 | Pending |
| HK-03 | 14 | v1.2 | Pending |
| HK-06 | 14 | v1.2 | Pending |
| HK-07 | 14 | v1.2 | Pending |
| HK-08 | 14 | v1.2 | Pending |
| HK-09 | 14 | v1.2 | Pending |
| HK-10 | 14 | v1.2 | Pending |
| HK-04 | 15 | v1.2 | Pending |
| HK-05 | 15 | v1.2 | Pending |
| HK-11 | 15 | v1.2 | Pending |
| ENERGY-01 | 15 | v1.2 | Pending |
| RES-04 | 16 | v1.2 | Pending |
| RES-05 | 16 | v1.2 | Pending |
| GRO-01 | 17 | v1.2 | Pending |
| GRO-02 | 17 | v1.2 | Pending |
| GRO-03 | 17 | v1.2 | Pending |
| GRO-04 | 17 | v1.2 | Pending |
| PREM-03 | 18 | v1.2 | Complete |
| PREM-04 | 18 | v1.2 | Complete |
| RES-06 | 19 | v1.3 | Pending |
| RES-07 | 19 | v1.3 | Pending |
| RES-08 | 19 | v1.3 | Pending |
| AI-01 | 20 | v1.3 | Pending |
| RES-09 | 21 | v1.3 | Pending |
| RES-10 | 21 | v1.3 | Pending |
| PRED-01 | 22 | v1.3 | Pending |
| PRED-02 | 22 | v1.3 | Pending |
| PRED-03 | 22 | v1.3 | Pending |
| BEH-01 | 22 | v1.3 | Pending |
| BEH-02 | 22 | v1.3 | Pending |
| BEH-03 | 22 | v1.3 | Pending |
| AI-02 | 23 | v1.3 | Pending |
| PAT-01 | 23 | v1.3 | Pending |
| PAT-02 | 23 | v1.3 | Pending |
| BEH-04 | 23 | v1.3 | Pending |
| BEH-05 | 23 | v1.3 | Pending |
| RES-11 | 24 | v1.3 | Pending |
| RES-12 | 24 | v1.3 | Pending |
| INT-01 | 25 | v1.3 | Pending |
| INT-02 | 25 | v1.3 | Pending |
| RES-13 | 26 | v1.4 | Pending |
| RES-14 | 26 | v1.4 | Pending |
| RES-15 | 26 | v1.4 | Pending |
| ENT-01 | 27 | v1.4 | Pending |
| ENT-02 | 27 | v1.4 | Pending |
| ENT-03 | 28 | v1.4 | Pending |
| ENT-04 | 28 | v1.4 | Pending |
| ENT-05 | 29 | v1.4 | Pending |
| ENT-06 | 29 | v1.4 | Pending |
| ENT-07 | 30 | v1.4 | Pending |
| ENT-08 | 30 | v1.4 | Pending |
| ASO-01 | 31 | v1.4 | Pending |
| ASO-02 | 31 | v1.4 | Pending |
| ASO-03 | 31 | v1.4 | Pending |
| RES-16 | 32 | v2.0 | Pending |
| RES-17 | 32 | v2.0 | Pending |
| RES-18 | 32 | v2.0 | Pending |
| BRAIN-08 | 33 | v2.0 | Pending |
| WATCH-01 | 33 | v2.0 | Pending |
| WATCH-02 | 33 | v2.0 | Pending |
| WATCH-03 | 33 | v2.0 | Pending |
| WATCH-04 | 33 | v2.0 | Pending |
| BRAIN-09 | 34 | v2.0 | Pending |
| AUTO-01 | 34 | v2.0 | Pending |
| RES-19 | 35 | v2.0 | Pending |
| RES-20 | 35 | v2.0 | Pending |
| VAL-01 | 36 | v2.0 | Pending |
| VAL-02 | 36 | v2.0 | Pending |
| AND-01 | 37 | v2.0 | Pending |
| AND-02 | 37 | v2.0 | Pending |
| AND-03 | 37 | v2.0 | Pending |
| ENT-09 | 38 | v2.0 | Pending |
| ENT-10 | 38 | v2.0 | Pending |
| ENT-11 | 38 | v2.0 | Pending |

**Coverage:**
- v1.1 requirements: 24 total (19 complete, 5 pending external gates)
- v1.2 requirements: 21 total (0 complete)
- v1.3 requirements: 19 total (0 complete)
- v1.4 requirements: 13 total (0 complete)
- v2.0 requirements: 18 total (0 complete)
- **Grand total: 95 requirements across 38 phases and 5 milestones**

---
*Requirements defined: 2026-04-06 (v1.1)*
*Expanded: 2026-04-07 (v1.2-v2.0 from approved roadmap design)*
*Last updated: 2026-04-07*
