# ShiftWell Expanded Roadmap — Science-First Architecture

**Created:** 2026-04-07
**Status:** Approved
**Author:** Claude (CEO) + Sim (Angel Investor / Founder)
**Approach:** Science-First (Approach A) — deep research sprints before each intelligence layer

## Vision

ShiftWell becomes the category-leading sleep optimization platform for shift workers, built on defensible science IP, AI intelligence, and enterprise outcome data. The roadmap is reverse-engineered from an 18-month acquisition-ready end state.

**End State (Month 18):**
- Closed-loop HealthKit intelligence (learns from real sleep)
- AI coaching via Claude API (weekly briefs, natural language insights)
- Predictive scheduling (calendar lookahead, pre-adaptation protocols)
- Pattern recognition (multi-week trend detection, natural language alerts)
- Enterprise-ready outcome data pipeline (employer dashboards, API)
- Defensible science moat (100+ citations, 8 algorithm specs, published validation)

## Milestone Architecture

| Milestone | Name | Core Deliverable | Acquisition Signal | Timeline |
|-----------|------|------------------|--------------------|----------|
| **v1.1** | TestFlight Launch | App on phones, real users | "They have a working product" | Now - Month 2 |
| **v1.2** | HealthKit Closed Loop | Algorithm learns from real sleep | "Their algorithm adapts" | Month 2-5 |
| **v1.3** | AI Intelligence Layer | Claude coaching + prediction + patterns | "They have an AI moat" | Month 5-9 |
| **v1.4** | Platform & Enterprise | API + employer dashboards + outcome data | "They have B2B revenue and outcome data" | Month 9-13 |
| **v2.0** | Advanced Intelligence | Apple Watch HRV + autopilot + published validation | "They have peer-reviewable methodology" | Month 13-18 |

Each milestone is a fundraising checkpoint AND an acquisition checkpoint.

## Typical App Timeline Comparison

| Stage | Industry Average | ShiftWell |
|-------|-----------------|-----------|
| MVP | 3-6 months | 1 month (complete) |
| App Store | 6-12 months | ~2 months (legal blocking, not code) |
| Traction (1K users) | 12-18 months | ~4-6 months (post-launch) |
| Revenue ($10K MRR) | 18-24 months | ~8-12 months (enterprise + B2C) |
| Acquisition-ready | 24-36 months | ~18 months (science moat accelerates) |

ShiftWell is ahead on code, behind on legal. The expanded roadmap adds ~12 months of intelligence + platform work on top of a shipped product.

---

## Phase Breakdown

### v1.1: TestFlight Launch & Adaptive Brain (Current)

Phases 7-10 complete. Remaining:

| Phase | Name | Type | Deliverable | Deps |
|-------|------|------|-------------|------|
| 11 | App Store Prep | BUILD | Account deletion, medical disclaimer, screenshots, privacy labels, review notes | Phase 10 |
| 12 | ActivityKit Integration | BUILD | Real Dynamic Island transitions via native ActivityKit (replaces notification stub) | Apple Developer enrollment |

**Gate:** LLC + Apple Developer + D-U-N-S -> TestFlight distribution (~5-7 weeks)

**Requirements:** APP-01 through APP-05, LIVE-04, LIVE-05

---

### v1.2: HealthKit Closed Loop

The algorithm stops guessing and starts learning from YOUR actual sleep.

| Phase | Name | Type | Deliverable | Science Anchor |
|-------|------|------|-------------|----------------|
| **13** | **Sleep Feedback Research** | RESEARCH | Literature review: HealthKit sleep stage accuracy, wearable validation studies, feedback loop architectures in mHealth. Produce LITERATURE-REVIEW.md, ALGORITHM-SPEC.md, VALIDATION-PLAN.md. Update SLEEP-SCIENCE-DATABASE.md. | Chinoy et al. 2021 (Apple Watch accuracy), de Zambotti et al. 2019 (consumer wearable validation), Menghini et al. 2021 (multi-night assessment) |
| 14 | HealthKit Sleep Ingestion | BUILD | Read actual sleep/wake from HealthKit. Compare plan vs reality. Store discrepancy history. Produce nightly sleep quality score from real data. | BRAIN-07 |
| 15 | Algorithm Feedback Engine | BUILD | Feed discrepancies back into the algorithm. If you consistently fall asleep 30 min later than planned, the engine adjusts your sleep window. Convergence target: <15 min discrepancy within 7 nights. | Two-Process Model parameter tuning (Borbely 1982), Process S homeostatic pressure calibration |
| **16** | **Feedback Validation Sprint** | RESEARCH | Analyze first 30 days of real user data. Does the feedback loop converge? Does sleep quality improve? Produce 30-DAY-CONVERGENCE-REPORT.md with statistical analysis. | AASM sleep quality metrics, Pittsburgh Sleep Quality Index (PSQI) methodology |
| 17 | Growth Engine | BUILD | Referral deep links (branch.io or custom), onboarding A/B framework, paywall optimization (pricing experiments), push notification re-engagement sequences | -- |
| 18 | RevenueCat Hard Gating | BUILD | Adaptive Brain behind paywall, grandfathering for users who installed before paywall date. Free tier: basic sleep windows. Premium: adaptive, coaching, patterns. | PREM-03, PREM-04 |

**Research Artifacts:**
- Sleep Feedback Literature Review (Phase 13)
- Wearable Accuracy Assessment (Phase 13)
- Algorithm Feedback Spec with convergence math (Phase 13)
- 30-Day Convergence Report (Phase 16)

**Success Criteria:**
- HealthKit sleep data ingested for 95%+ of nights where Apple Watch is worn
- Algorithm adjustment convergence: <15 min plan-vs-reality discrepancy within 7 nights
- User retention: 60%+ at Day 30 (industry avg: ~25% for health apps)

---

### v1.3: AI Intelligence Layer

Claude API brings the science to life in human language.

| Phase | Name | Type | Deliverable | Science Anchor |
|-------|------|------|-------------|----------------|
| **19** | **AI Coaching Research** | RESEARCH | Literature review: AI in sleep coaching, conversational health interventions, LLM safety in medical contexts. Define prompt architecture for clinical accuracy without medical advice. Produce AI-COACHING-FRAMEWORK.md, SAFETY-GUARDRAILS.md. | Luxton et al. 2016 (AI in behavioral health), FDA digital health guidance (2023), Torous et al. 2021 (digital mental health) |
| 20 | Claude Weekly Brief | BUILD | Every Monday: AI-generated personalized sleep summary analyzing past 7 days. Tone: coach, not doctor. Includes: adherence trends, debt trajectory, upcoming schedule challenges, one actionable recommendation. | AI-01 |
| **21** | **Predictive Scheduling Research** | RESEARCH | Literature review: circadian prediction models, shift schedule optimization algorithms, fatigue risk management systems. Evaluate FAID, SAFTE, and CAS models for mobile implementation. Produce FATIGUE-MODEL-COMPARISON.md, PREDICTION-ALGORITHM-SPEC.md. | Gander et al. 2011 (fatigue risk), Hursh et al. 2004 (SAFTE model), Dawson & McCulloch 2005 (fatigue auditing), Folkard & Lombardi 2006 (modeling accident risk) |
| 22 | Predictive Calendar Engine | BUILD | Scan next 14 days of calendar. Identify transition stress points. Generate pre-adaptation protocols BEFORE the shift change happens. Show "Circadian Forecast" on Today screen. | Eastman & Burgess 2009 (circadian shifting), Crowley et al. 2003 (phase advance protocols) |
| 23 | Pattern Recognition Engine | BUILD | Detect multi-week patterns: consecutive night impacts, recovery debt trends, weekend compensation patterns. Natural language alerts ("Your recovery drops every time you work 3+ consecutive nights"). | AI-02, Drake et al. 2004 (SWSD prevalence patterns), Boivin & Boudreau 2014 (intervention patterns) |
| **24** | **Intelligence Validation Sprint** | RESEARCH | Analyze 90 days of AI coaching data. Do users who follow AI recommendations sleep better? Does predictive scheduling reduce transition recovery time? Produce 90-DAY-INTELLIGENCE-REPORT.md. | Internal outcome study, pre/post methodology |
| 25 | Intelligence Polish | BUILD | Refine prompts based on 90-day data, add thumbs up/down feedback on AI recommendations, build personal outcome tracking dashboard ("Your sleep improved 23% since you started using ShiftWell"). | -- |

**Research Artifacts:**
- AI Coaching Safety Framework (Phase 19)
- LLM Guardrails for Health Context (Phase 19)
- Fatigue Risk Model Comparison (Phase 21)
- Prediction Algorithm Spec (Phase 21)
- 90-Day Intelligence Report (Phase 24)

**Success Criteria:**
- Weekly brief engagement: 70%+ open rate
- Predictive scheduling: users who follow pre-adaptation protocols recover 30%+ faster
- Pattern alerts: 80%+ of detected patterns confirmed by user feedback
- AI safety: zero medical advice violations in audit

---

### v1.4: Platform & Enterprise

From app to platform. Individual data becomes organizational intelligence.

| Phase | Name | Type | Deliverable | Science Anchor |
|-------|------|------|-------------|----------------|
| **26** | **Enterprise Research** | RESEARCH | Analyze shift worker wellness programs (literature + competitor landscape). Define outcome metrics that employers care about (absenteeism, error rates, turnover, injury rates). Design anonymized, HIPAA-aware data pipeline. Produce ENTERPRISE-OUTCOMES-FRAMEWORK.md. | AHA Scientific Statement 2025 (circadian disruption + cardiovascular risk), Caruso et al. 2014 (NIOSH overtime guidelines), Kecklund & Axelsson 2016 (health consequences of shift work) |
| 27 | Outcome Data Pipeline | BUILD | Anonymized, HIPAA-aware data export. Aggregate sleep quality, adherence, recovery trends across cohorts. Differential privacy for cohorts <50 users. | -- |
| 28 | Employer Dashboard | BUILD | Web dashboard (Next.js): cohort sleep quality trends, shift schedule impact analysis, department comparison, ROI calculator. White-label ready. | -- |
| 29 | API Layer | BUILD | REST API for third-party integrations. Push schedules in, pull outcome data out. Documentation (OpenAPI), rate limiting, OAuth2 auth. Enable hospital scheduling systems (Kronos, QGenda) to integrate. | -- |
| 30 | Enterprise Sales Kit | BUILD | Case studies from beta users (anonymized), ROI calculator spreadsheet, pitch deck, compliance documentation (HIPAA readiness, SOC2 roadmap), pricing model (per-seat enterprise). | -- |
| 31 | App Store Optimization | BUILD | Screenshots refresh with real user data, ASO keyword optimization, review solicitation flow, localization (Spanish first -- 18% of US shift workers are Hispanic). | -- |

**Research Artifacts:**
- Enterprise Sleep Wellness Literature Review (Phase 26)
- Outcome Metrics Framework (Phase 26)
- HIPAA Compliance Assessment (Phase 26)

**Success Criteria:**
- 3+ employer pilot agreements signed
- Outcome data shows measurable improvement (sleep duration, adherence, recovery)
- API documentation complete, 1+ integration partner
- Enterprise pricing model validated ($5-15/seat/month range)

---

### v2.0: Advanced Intelligence

The moat deepens. Published science, Apple Watch, full autopilot.

| Phase | Name | Type | Deliverable | Science Anchor |
|-------|------|------|-------------|----------------|
| **32** | **HRV + Wearable Research** | RESEARCH | Deep dive: HRV as recovery proxy, Apple Watch vs clinical polysomnography, real-time biometric feedback architectures. Produce HRV-LITERATURE-REVIEW.md, WEARABLE-ACCURACY-ASSESSMENT.md, BIOMETRIC-ALGORITHM-SPEC.md. | Shaffer & Ginsberg 2017 (HRV review), de Zambotti et al. 2019 (consumer wearables), Natale et al. 2021 (Apple Watch HRV accuracy) |
| 33 | Apple Watch Integration | BUILD | HRV data -> recovery score refinement. Real-time sleep stage monitoring. Watch complication for shift countdown timer. Background delivery for overnight data. | BRAIN-08 |
| 34 | 30-Day Autopilot | BUILD | After 30 days of baseline data, algorithm makes changes without user review. Trust earned through transparency log showing all autonomous decisions. User can exit autopilot anytime. | BRAIN-09 |
| **35** | **Validation Study Design** | RESEARCH | Design a publishable validation study. Methodology: prospective cohort, 100+ participants, 90-day observation. IRB considerations (exempt vs expedited). Outcome measures: PSQI, ESS, actigraphy concordance. Statistical analysis plan. Produce STUDY-PROTOCOL.md. | CONSORT guidelines, STROBE checklist |
| 36 | Validation Study Execution | BUILD | Run the study with consenting users. Collect 90-day outcome data. Analyze results. Draft manuscript for peer-reviewed journal (Journal of Clinical Sleep Medicine or Sleep Health). | -- |
| 37 | Android Launch | BUILD | React Native -> Android build. Play Store listing, device testing matrix (Samsung, Pixel, OnePlus). Google Health Connect integration (Android equivalent of HealthKit). | -- |
| 38 | Advanced Platform Features | BUILD | Multi-facility enterprise support, manager fatigue alerts, schedule optimization recommendations ("Moving Nurse A to Tuesday nights would reduce her circadian disruption score by 40%"), FMLA/ADA compliance documentation tools. | Folkard & Tucker 2003 (shift system design), Costa 2010 (shift work organization) |

**Research Artifacts:**
- HRV Literature Review (Phase 32)
- Wearable Accuracy Assessment (Phase 32)
- Biometric Algorithm Spec (Phase 32)
- Validation Study Protocol (Phase 35)
- Draft Manuscript (Phase 36)

**Success Criteria:**
- Apple Watch data improves recovery score accuracy by 20%+ vs phone-only
- Autopilot mode: 60%+ of eligible users opt in
- Validation study: statistically significant improvement in PSQI scores
- Android launch: 1000+ downloads in first month
- Published manuscript accepted by peer-reviewed journal

---

## Research Phase Structure

Every RESEARCH phase follows a consistent 3-stage structure:

```
Stage 1: Literature Review (2-3 days)
+-- Systematic search of PubMed, Google Scholar, clinical guidelines
+-- Extract findings relevant to ShiftWell's algorithm
+-- Produce LITERATURE-REVIEW.md with citation table
+-- Update SLEEP-SCIENCE-DATABASE.md with new citations

Stage 2: Algorithm Design (1-2 days)
+-- Translate research findings into algorithm specifications
+-- Define inputs, outputs, thresholds, edge cases
+-- Produce ALGORITHM-SPEC.md with mathematical notation
+-- Peer-review against existing ShiftWell architecture

Stage 3: Validation Plan (1 day)
+-- Define how we'll know the feature works
+-- Success metrics, measurement methodology
+-- Produce VALIDATION-PLAN.md
+-- Feeds directly into the BUILD phase's test strategy
```

**Output per research phase:** 3 documents + SLEEP-SCIENCE-DATABASE update

**Science moat compound effect:**
| Milestone | Cumulative Citations | Algorithm Specs | Validation Reports |
|-----------|---------------------|-----------------|-------------------|
| v1.1 | 50+ | 1 (adaptive brain) | 0 |
| v1.2 | 65+ | 3 | 1 (30-day convergence) |
| v1.3 | 85+ | 5 | 2 (+ 90-day intelligence) |
| v1.4 | 95+ | 6 | 3 (+ enterprise outcomes) |
| v2.0 | 110+ | 8 | 5 (+ HRV assessment + published study) |

By v2.0: more science documentation than most funded health startups. This IS the moat.

---

## Phase Summary

| # | Phase | Type | Milestone |
|---|-------|------|-----------|
| 11 | App Store Prep | BUILD | v1.1 |
| 12 | ActivityKit Integration | BUILD | v1.1 |
| **13** | **Sleep Feedback Research** | **RESEARCH** | **v1.2** |
| 14 | HealthKit Sleep Ingestion | BUILD | v1.2 |
| 15 | Algorithm Feedback Engine | BUILD | v1.2 |
| **16** | **Feedback Validation Sprint** | **RESEARCH** | **v1.2** |
| 17 | Growth Engine | BUILD | v1.2 |
| 18 | RevenueCat Hard Gating | BUILD | v1.2 |
| **19** | **AI Coaching Research** | **RESEARCH** | **v1.3** |
| 20 | Claude Weekly Brief | BUILD | v1.3 |
| **21** | **Predictive Scheduling Research** | **RESEARCH** | **v1.3** |
| 22 | Predictive Calendar Engine | BUILD | v1.3 |
| 23 | Pattern Recognition Engine | BUILD | v1.3 |
| **24** | **Intelligence Validation Sprint** | **RESEARCH** | **v1.3** |
| 25 | Intelligence Polish | BUILD | v1.3 |
| **26** | **Enterprise Research** | **RESEARCH** | **v1.4** |
| 27 | Outcome Data Pipeline | BUILD | v1.4 |
| 28 | Employer Dashboard | BUILD | v1.4 |
| 29 | API Layer | BUILD | v1.4 |
| 30 | Enterprise Sales Kit | BUILD | v1.4 |
| 31 | App Store Optimization | BUILD | v1.4 |
| **32** | **HRV + Wearable Research** | **RESEARCH** | **v2.0** |
| 33 | Apple Watch Integration | BUILD | v2.0 |
| 34 | 30-Day Autopilot | BUILD | v2.0 |
| **35** | **Validation Study Design** | **RESEARCH** | **v2.0** |
| 36 | Validation Study Execution | BUILD | v2.0 |
| 37 | Android Launch | BUILD | v2.0 |
| 38 | Advanced Platform Features | BUILD | v2.0 |

**Total: 28 new phases (11 through 38)**
- 8 RESEARCH phases (29%)
- 20 BUILD phases (71%)
- 5 milestones with clear acquisition checkpoints

---

## Key Dependencies & External Gates

| Gate | Blocks | Owner | Timeline |
|------|--------|-------|----------|
| LLC formation | Apple Developer | Sim | ~2 weeks |
| Apple Developer enrollment | TestFlight, ActivityKit | Sim (after LLC) | ~1 week |
| D-U-N-S number | TestFlight distribution | Automatic (after enrollment) | ~5 weeks |
| Apple Watch pairing | HRV integration (Phase 33) | Users | v2.0 |
| 100+ users with 30 days data | Validation studies | Growth (Phase 17) | v1.3+ |
| IRB review (if needed) | Published study | Academic partner | v2.0 |
| HIPAA compliance assessment | Enterprise data pipeline | Legal review | v1.4 |

---

## Budget Impact

| Milestone | New Costs | Cumulative |
|-----------|-----------|------------|
| v1.1 | $0 (legal costs separate) | ~$2,200 |
| v1.2 | Claude API (~$50/mo), Branch.io (free tier) | ~$2,800 |
| v1.3 | Claude API scaling (~$200/mo) | ~$4,600 |
| v1.4 | Vercel (dashboard hosting, ~$20/mo), enterprise tooling | ~$5,500 |
| v2.0 | Journal submission fees (~$500), research tools | ~$7,000 |

Total 18-month budget: ~$7,000 (excluding legal/Apple fees already budgeted)

---

*Spec version: 1.0*
*Approved by: Sim (2026-04-07)*
*Next action: Update ROADMAP.md with v1.2-v2.0 milestones and phases*
