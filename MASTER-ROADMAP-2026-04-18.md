# ShiftWell Master Roadmap — April 18, 2026

> 5-phase plan from today to Month 12. Each phase has deliverables, dependencies, estimated hours, and decision gates.
> Critical path items marked with **[CP]**.

---

## Timeline Overview

```
Phase 1: Pre-TestFlight     Weeks 1-2   (Apr 18 – May 2)
Phase 2: Beta               Weeks 3-10  (May 3 – Jun 27)
Phase 3: App Store Launch    Weeks 11-14 (Jun 28 – Jul 25)
Phase 4: Growth              Months 4-6  (Jul 26 – Oct 17)
Phase 5: Scale               Months 7-12 (Oct 18 – Apr 2027)
```

**Critical path:** LLC filing → D-U-N-S (5 wks) → Apple Org enrollment → TestFlight external → App Store submission

---

## Phase 1: Pre-TestFlight (Weeks 1-2)

**Goal:** Remove all blockers, build first TestFlight candidate.

| # | Deliverable | Est. Hours | Dependency | Owner | CP? |
|---|------------|-----------|------------|-------|-----|
| 1.1 | File ShiftWell LLC (Florida) | 0.5 | Company name decision | Sim | **[CP]** |
| 1.2 | Apply for D-U-N-S number | 0.5 | 1.1 | Sim | **[CP]** |
| 1.3 | Enroll Apple Developer (Individual, $99) | 0.25 | None | Sim | **[CP]** |
| 1.4 | Replace app icon (commission or AI-generate) | 4 | Design brief in icon-review.md | Sim + designer | **[CP]** |
| 1.5 | Route Claude API key through Supabase Edge Function | 3 | None | Sim | **[CP]** |
| 1.6 | Set up Google OAuth client ID in app.json | 0.25 | Google Cloud Console access | Sim | |
| 1.7 | Run `npm audit fix` for node-forge + picomatch | 0.25 | None | Sim | |
| 1.8 | Set up CI/CD (GitHub Actions: tsc → jest → expo-doctor) | 5 | GitHub repo access | Sim | |
| 1.9 | Add `maxWorkers: '50%'` to jest.config.js | 0.1 | None | Sim | |
| 1.10 | Deploy Sentry for crash reporting | 3 | None | Sim | |
| 1.11 | Implement onboarding walkthrough (6 screens per spec) | 12 | onboarding-flow-spec.md | Sim | |
| 1.12 | Set up shiftwell.app domain + email (sim@, support@) | 1 | Domain registrar | Sim | |
| 1.13 | Build first TestFlight candidate (EAS Build) | 1 | 1.3, 1.4, 1.5 | Sim | **[CP]** |
| | **Phase 1 Total** | **~31 hrs** | | | |

**Decision Gate (end of Week 2):**
- [ ] LLC filed and D-U-N-S application submitted?
- [ ] TestFlight build installs and runs on device?
- [ ] Icon replaced, API key secured, Sentry reporting?
- [ ] **GO/NO-GO for Phase 0 beta (internal)**

**Resource:** Solo dev. ~15-16 hrs/week. Achievable in 2 weeks.

---

## Phase 2: Beta (Weeks 3-10)

**Goal:** Validate product-market fit with 200 testers across 4 cohorts.

### Phase 2A: Internal + Friends & Family (Weeks 3-5)

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 2.1 | Phase 0: Internal testing (5 people, smoke test) | 2 | TestFlight build | Sim |
| 2.2 | Implement shake-to-report feedback mechanism | 8 | Supabase Edge Function, Resend API | Sim |
| 2.3 | Deploy Day 1 survey (Typeform) | 2 | Survey content ready | Sim |
| 2.4 | Phase 1: F&F rollout (15 EM colleagues) | 3 | 2.1 passes (0 crashes) | Sim |
| 2.5 | Triage Day 1 survey results + fix top friction | 6 | 2.3, 2.4 | Sim |
| 2.6 | Deploy Week 1 survey | 1 | 2.3 | Sim |
| 2.7 | Weekly build cadence begins (Monday AM) | 1/wk | CI/CD from 1.8 | Sim |

### Phase 2B: Healthcare Cohort (Weeks 6-8)

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 2.8 | Phase 2: Recruit 50 nurses/residents/EMS | 6 | Reddit/Facebook posts ready | Sim |
| 2.9 | Monitor crash rate (<0.5%), retention (D7 >50%) | 3/wk | Sentry + Supabase analytics | Sim |
| 2.10 | Fix top-5 bugs from healthcare cohort | 15 | Feedback mechanism | Sim |
| 2.11 | Deploy Week 4 survey (WTP, NPS, retention) | 2 | Survey content ready | Sim |
| 2.12 | Premium paywall A/B test (7-day trial vs freemium) | 8 | RevenueCat configured | Sim |

### Phase 2C: Public Beta (Weeks 9-10)

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 2.13 | Phase 3: Open to 200 testers (broad shift workers) | 4 | Crash rate <0.25% | Sim |
| 2.14 | D-U-N-S received → enroll Apple Developer Org **[CP]** | 0.5 | ~5 weeks from 1.2 | Sim |
| 2.15 | Transfer app to Org account | 1 | 2.14 | Sim |
| 2.16 | 8-week retrospective + go/no-go for App Store | 4 | All surveys compiled | Sim |
| | **Phase 2 Total** | **~75 hrs** | | |

**Kill Criteria (halt beta if any triggered):**
- Crash rate sustained >3%
- D7 retention <20%
- NPS inversion (<0)
- Onboarding completion <50%
- Algorithm distrust >20% ("plans feel wrong")
- Sleep improvement <10% by Week 4
- Any legal/compliance incident

**Success Thresholds (proceed to App Store):**
- Crash rate <0.5% sustained
- Onboarding completion >70%
- D7 retention >60%
- NPS >50
- WTP >40% "definitely" or "probably" at $29.99/yr (or $49.99/yr new pricing)
- >30% report improved sleep after 2+ weeks

**Decision Gate (end of Week 10):**
- [ ] All success thresholds met?
- [ ] Legal docs attorney-reviewed?
- [ ] App icon finalized and polished?
- [ ] **GO/NO-GO for App Store submission**

**Resource:** Solo dev. ~9-10 hrs/week average. Heavier in weeks 6-8 (bug fixes).

---

## Phase 3: App Store Launch (Weeks 11-14)

**Goal:** Ship to the App Store, execute marketing launch, begin PR outreach.

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 3.1 | Capture App Store screenshots (10-frame carousel, 3 sizes) | 6 | Polished app, real data | Sim |
| 3.2 | Record app preview video (28 sec) | 4 | Video script ready | Sim |
| 3.3 | Complete legal doc placeholders ([COMPANY_NAME] etc.) | 1 | LLC name finalized | Sim |
| 3.4 | Upload all assets to App Store Connect | 2 | 3.1, 3.2, 3.3 | Sim |
| 3.5 | Submit for App Review | 1 | 3.4 + all metadata | Sim | 
| 3.6 | Publish 3 SEO landing pages (nurses, first responders, healthcare) | 4 | Domain + hosting | Sim |
| 3.7 | Add analytics to SEO pages (Plausible or Fathom) | 2 | 3.6 | Sim |
| 3.8 | Submit KevinMD guest post | 3 | Press kit, founder bio | Sim |
| 3.9 | Pitch Becker's Hospital Review + Medscape | 2 | Media pitch template | Sim |
| 3.10 | Launch community posts (Reddit, HN, Product Hunt) | 3 | Community posts ready | Sim |
| 3.11 | Activate email sequences (waitlist → beta → launch) | 2 | Email platform + domain | Sim |
| 3.12 | Begin Instagram content calendar (Week 1 of 7-day plan) | 3 | Instagram pack ready | Sim |
| 3.13 | Set up RevenueCat dashboard + subscription group in ASC | 2 | Apple Developer Org | Sim |
| | **Phase 3 Total** | **~35 hrs** | | |

**Decision Gate (end of Week 14):**
- [ ] App approved and live on App Store?
- [ ] SEO pages indexed by Google?
- [ ] At least 1 media placement secured?
- [ ] Day 1 install numbers meet expectations (target: 100+ in first week)?
- [ ] **GO/NO-GO for growth investment**

**Resource:** Solo dev. ~9 hrs/week. Marketing-heavy phase.

---

## Phase 4: Growth (Months 4-6)

**Goal:** Optimize conversion, pilot B2B, begin Android port.

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 4.1 | Pricing experiment A: Price sensitivity ($4.99 vs $6.99 vs $9.99/mo) | 8 | RevenueCat, 500+ MAU | Sim |
| 4.2 | Pricing experiment B: Annual discount depth (25% vs 40% vs 50%) | 4 | 4.1 results | Sim |
| 4.3 | Pricing experiment C: Trial model (7-day vs 14-day vs freemium) | 4 | RevenueCat | Sim |
| 4.4 | Hospital pilot outreach (Tampa Bay: HCA Trinity, TGH, AdventHealth) | 8 | Hospital CNO template | Sim |
| 4.5 | Residency program outreach (EM programs first) | 6 | Residency template | Sim |
| 4.6 | Negotiate 90-day hospital pilot (25 seats free) | 4 | 4.4 response | Sim |
| 4.7 | WHOOP partnership outreach (developer API access) | 4 | Wearable pitch template | Sim |
| 4.8 | Android port Phase 1: Build parity (config, Firebase, Google Sign-In) | 36 | Expo knowledge | Sim |
| 4.9 | Algorithm Module 1: DLMO Estimation | 24 | Algorithm spec | Sim |
| 4.10 | Algorithm Module 2: Compromise Phase Position | 32 | 4.9 (DLMO feeds this) | Sim |
| 4.11 | Implement AI Weekly Check-in (Claude-powered, v1.1 feature) | 12 | Claude API via Edge Function | Sim |
| | **Phase 4 Total** | **~142 hrs** | | |

**Decision Gate (end of Month 6):**
- [ ] Pricing optimized (winning variant identified)?
- [ ] At least 1 hospital pilot signed?
- [ ] Android build running on device?
- [ ] 500+ MAU on iOS?
- [ ] Revenue >$1K/mo?
- [ ] **GO/NO-GO for scaling investment. Assess: hire contractor or stay solo?**

**Resource:** Solo dev is strained at 142 hrs / 12 weeks = ~12 hrs/week. Consider contractor for Android port ($8-10K) if revenue supports it.

---

## Phase 5: Scale (Months 7-12)

**Goal:** Complete algorithm v2, launch Android, activate partnerships, explore enterprise.

| # | Deliverable | Est. Hours | Dependency | Owner |
|---|------------|-----------|------------|-------|
| 5.1 | Algorithm Module 3: Substance Interaction Engine | 28 | Modules 1-2 complete | Sim |
| 5.2 | Algorithm Module 4: Fatigue Alerting System | 20 | Modules 1-2 complete | Sim |
| 5.3 | Algorithm Module 5: Wearable Data Pipeline (WHOOP + HealthKit) | 36 | WHOOP API access | Sim/contractor |
| 5.4 | Android port Phase 2: Health Connect integration | 64 | Android Phase 1 | Sim/contractor |
| 5.5 | Android port Phase 3: Google Play launch | 36 | 5.4 + testing | Sim/contractor |
| 5.6 | Hospital pilot results → case study | 8 | Pilot data (90 days) | Sim |
| 5.7 | Enterprise pricing validation ($12/seat/mo) | 4 | Pilot feedback | Sim |
| 5.8 | Build admin dashboard for enterprise (fatigue risk by unit) | 40 | Enterprise interest validated | Sim/contractor |
| 5.9 | HIPAA BAA + SOC 2 Type II preparation | 20 | Enterprise demand confirmed | Sim + legal |
| 5.10 | Implement Shift Crew social features (v1.2) | 24 | Community demand signal | Sim |
| 5.11 | Household Mode (partner coordination) | 16 | User requests | Sim |
| 5.12 | Expand SEO: travel nurses, factory workers, truck drivers pages | 12 | SEO page performance data | Sim |
| 5.13 | CEO automation loop v2.0 (1x/day + event-driven) | 8 | Current v1 running | Sim |
| | **Phase 5 Total** | **~316 hrs** | | |

**Decision Gate (end of Month 12):**
- [ ] Algorithm v2 complete (all 5 modules)?
- [ ] Android live on Google Play?
- [ ] Enterprise pipeline >3 hospitals?
- [ ] ARR trajectory toward $57K target?
- [ ] **DECISION: Raise seed round, bootstrap, or stay side project?**

**Resource:** Solo dev cannot sustain 316 hrs / 26 weeks = ~12 hrs/week on top of clinical shifts. **Hire recommendation:** Android contractor (100 hrs, ~$8-10K) + part-time designer ($2-3K). Total investment: ~$12K.

---

## Resource Summary

| Phase | Hours | Weeks | Hrs/Week | Solo Feasible? |
|-------|-------|-------|----------|---------------|
| 1 — Pre-TestFlight | 31 | 2 | 15.5 | Yes (sprint) |
| 2 — Beta | 75 | 8 | 9.4 | Yes |
| 3 — App Store Launch | 35 | 4 | 8.8 | Yes |
| 4 — Growth | 142 | 12 | 11.8 | Tight — consider Android contractor |
| 5 — Scale | 316 | 26 | 12.2 | No — need contractor help |
| **Total** | **599** | **52** | **11.5 avg** | |

**Monthly cost (all phases):** ~$205 (Supabase $25, domain $12/yr, Sentry free tier, RevenueCat free until revenue)

---

## Critical Path (Visual)

```
Week 1:  LLC filing ──────────────────────────────────────────┐
         Apple Dev Individual ──→ TestFlight build (Week 2)   │
         Icon design ──→ TestFlight build (Week 2)            │
         API key fix ──→ TestFlight build (Week 2)            │
                                                              │
Week 2:  TestFlight build ──→ Phase 0 internal (Week 3)      │
                                                              │
Week 3-5: Phase 0-1 beta (internal + F&F)                    │
                                                              │
Week 5-6: D-U-N-S arrives ◄──────────────────────────────────┘
           ──→ Apple Org enrollment
           ──→ Transfer app to Org
                                                              
Week 6-10: Phase 2-3 beta (healthcare + public)              
                                                              
Week 11:  App Store submission (requires Org account)         
          ──→ App Review (1-3 days)                           
          ──→ LAUNCH                                          
```

**Shortest path to TestFlight:** 2 weeks (blocked only by icon design turnaround)
**Shortest path to App Store:** 11 weeks (gated by D-U-N-S processing + beta validation)

---

## What Can Run in Parallel

These workstreams are independent and can execute simultaneously:

| Workstream A (Engineering) | Workstream B (Business) | Workstream C (Marketing) |
|---------------------------|------------------------|-------------------------|
| Onboarding implementation | LLC filing + D-U-N-S | Domain + email setup |
| API key security fix | Attorney engagement | Instagram scheduling |
| CI/CD setup | Icon commissioning | KevinMD guest post draft |
| Sentry deployment | — | Community post scheduling |
| Feedback mechanism | — | SEO page hosting |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Sourced from 37+ deliverables, war room reports (CTO audit, COO assessment, QA report), algorithm improvement spec, android port roadmap, pricing strategy, beta program plan, and partnership templates.
