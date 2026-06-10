# ShiftWell — Pricing Strategy & Experimentation Plan

> **Version:** 1.0 | **Date:** April 2026
> **Author:** Dr. Gursimran Singh, DO
> **Status:** Pre-launch — pricing hypotheses to validate before TestFlight
> **Inputs:** CFO audit recommendation ($6.99/mo + B2B), RevenueCat State of Subscription Apps 2025, competitor pricing research, Business of Apps conversion benchmarks

---

## 1. Pricing Tiers

### Tier Overview

| | Free | Pro | Hospital / Enterprise |
|---|---|---|---|
| **Price** | $0 | $6.99/mo · $49.99/yr · $149.99 lifetime | $12/seat/mo (min 50 seats) |
| **Annual effective** | — | $49.99/yr (40% discount vs monthly) | $144/seat/yr |
| **Trial** | — | 7-day premium trial on first install | 90-day pilot (25 seats free) |
| **Target buyer** | Individual shift worker | Power user / night-shift lifer | CNO, VP of Nursing, Safety Officer |

### 1.1 Free Tier — Drive Adoption, Create Upgrade Pressure

The free tier must deliver enough value that users tell coworkers about the app, but create a clear "I need more" moment every session.

**Included (free forever):**

- Shift schedule import from Apple/Google Calendar (read-only)
- Basic sleep window calculation (primary sleep block only — no anchor sleep, no nap placement)
- Chronotype quiz + circadian profile
- Daily sleep score (basic — hours slept vs. target)
- Sleep hygiene tips library (static content)
- 3-day plan preview (shows what the full plan looks like, grayed out beyond 3 days)
- Night Sky Mode UI transformation

**Gated (visible but locked):**

- Calendar export of sleep plan → **this is the #1 upgrade trigger** (paywall on the action, not the information)
- Strategic nap placement and duration
- Caffeine cutoff timing (personalized)
- Meal timing / time-restricted eating protocols
- Light exposure protocols
- Anchor sleep calculation for rotating schedules
- Dynamic rescheduling when calendar changes
- Circadian Reset 3-phase system
- Weekly Sleep Intelligence Report
- AI Weekly Check-in (v1.1)
- Shift Crew social features (v1.2)

**Upgrade pressure mechanics:**

1. **Show, don't hide.** Free users see their full 7-day plan with naps, caffeine cutoffs, and meal timing — but "Export to Calendar" requires Pro. They experience the value before paying.
2. **3-day decay.** The basic sleep window (free) covers 3 days ahead. On day 4, the app says "Upgrade to plan your full week." Shift workers who plan ahead feel this friction immediately.
3. **Post-shift nudge.** After a night shift, the app shows "Your recovery nap window is 2:30–4:00 PM" with a lock icon. The information is visible; acting on it (calendar export + reminder) requires Pro.
4. **Weekly report teaser.** Free users get a simplified "You slept X hours this week" summary. Pro users get the full magazine-style Weekly Sleep Intelligence Report with trends, insights, and personalized recommendations.

### 1.2 Pro Tier — $6.99/mo · $49.99/yr · $149.99 lifetime

**Pricing rationale:** $6.99/mo sits between Sleep Cycle ($2.50/mo effective) and Rise ($5.83/mo effective) while being far below WHOOP ($25–40/mo). The annual plan at $49.99 ($4.17/mo effective) provides a 40% discount — aggressive enough to drive annual commits. Lifetime at $149.99 captures high-intent early adopters and generates upfront cash for bootstrapping.

**Everything in Free, plus:**

- Full 14-day rolling sleep plan with auto-updates
- Calendar export (Apple Calendar, Google Calendar) — color-coded sleep, nap, caffeine, meal, and light events
- Strategic nap placement (duration + timing based on shift pattern and sleep debt)
- Personalized caffeine cutoff (based on half-life model, chronotype, and shift timing)
- Meal timing / time-restricted eating windows
- Light exposure protocols (bright light timing + avoidance windows)
- Anchor sleep optimization for rotating schedules
- Dynamic rescheduling — plan auto-updates when calendar changes, with notification explaining why
- Circadian Reset system (Pre-Adapt → Sleep Bank → Reset Protocol)
- Sleep debt tracking with recovery trajectory
- Weekly Sleep Intelligence Report (full version)
- AM/PM Routine Builder (factors in shower, commute, kids, etc.)
- Commute-aware wake times (traffic-adjusted)
- Priority support

**v1.1 additions (included in Pro):**

- AI Weekly Check-in (Claude-powered)
- AI-generated follow-up questions based on trend detection
- Daily communication cadence (wake → midday → bedtime notifications)
- Morning brain dump prompt
- Screen time awareness integration

**v1.2 additions (included in Pro):**

- Shift Crew (temporary social for coworkers on same rotation)
- Household Mode (partner notifications during recovery sleep)
- Gamification (consistency-based levels and streaks)
- Personalized insights ("You sleep 47 min longer when...")

### 1.3 Hospital / Enterprise Tier — $12/seat/mo

**Pricing rationale:** Fatigue Science Readi charges $15–50/seat/mo for enterprise fatigue management but requires custom hardware integration. ShiftWell at $12/seat/mo undercuts Readi while being pure software — no wearable dependency. A 500-nurse hospital at $12/seat = $72,000 ARR per deal. Even at 10% of the nursing staff (50 seats), that's $7,200 ARR — meaningful for a bootstrapped company.

**Everything in Pro, plus:**

- HIPAA BAA (Business Associate Agreement) execution
- SOC 2 Type II compliance (roadmap item — target Month 9)
- Admin dashboard — department-level sleep health metrics (aggregate, de-identified)
- Fatigue risk scoring by unit/department (aggregate — no individual surveillance)
- Shift pattern analysis — identify rotation patterns correlated with highest fatigue risk
- Compliance reporting — OSHA fatigue management documentation, Joint Commission readiness
- Bulk user provisioning (CSV upload, SSO integration via SAML/OIDC)
- Custom branding (hospital logo, department names)
- Quarterly business reviews with sleep health trend analysis
- Dedicated account manager (for 200+ seat deployments)
- API access for integration with scheduling systems (QGenda, Kronos, ShiftWizard)
- Data residency options (US-only hosting)

**What hospital buyers actually care about (ranked by purchase influence):**

1. **Reducing nurse turnover.** Sleep quality mediates burnout → burnout drives voluntary departure. 500-nurse hospital losing 27.65% annually = $13.8–20.7M replacement cost. Even a 5% reduction in turnover = $690K–1M saved. ShiftWell at $72K/yr is a 10:1 ROI.
2. **Reducing sentinel events.** 23% attributed to nurse fatigue (Joint Commission). Fatigue risk dashboards give CNOs defensible documentation.
3. **Workers' comp reduction.** Night shift workers file 2–3x more claims. Demonstrating a fatigue management program reduces liability exposure.
4. **Recruitment differentiator.** "We provide ShiftWell to all night-shift staff" is a tangible benefit in a nursing shortage market.
5. **OSHA/Joint Commission compliance.** Documented fatigue mitigation program = audit-ready.

**Enterprise sales motion:**

- 90-day pilot: 25 seats free, hospital provides aggregate outcome data (absenteeism, turnover, self-reported sleep quality pre/post)
- Pilot success metric: ≥60% weekly active usage among pilot participants + measurable improvement in at least one outcome metric
- Contract: annual, paid quarterly, with 30-day termination clause in year 1
- Expansion trigger: pilot success → department-wide rollout → hospital-wide

---

## 2. Pricing Experiments

### Overview

All experiments run through RevenueCat's experimentation framework. Users are randomized at first app open (before onboarding). Each test runs independently unless noted. Minimum experiment duration: 4 weeks to capture weekly billing cycles and reduce day-of-week effects.

### 2.1 Test A — Price Point Sensitivity

| Parameter | Detail |
|---|---|
| **Hypothesis** | $6.99/mo maximizes revenue per user. $4.99 will convert more users but generate less total revenue. $9.99 will convert fewer but generate more per subscriber — net effect on total revenue is uncertain. |
| **Variants** | A1: $4.99/mo / A2: $6.99/mo (control) / A3: $9.99/mo |
| **Primary metric** | Revenue per install (RPI) at Day 30 |
| **Secondary metrics** | Trial start rate, trial-to-paid conversion, Day 7 retention, refund rate |
| **Minimum detectable effect (MDE)** | 15% difference in RPI between any two variants |
| **Sample size per variant** | ~1,700 users (5,100 total) — based on α=0.05, β=0.20, baseline RPI $0.44 (health app median), 15% MDE |
| **Duration** | 4–6 weeks depending on install velocity |
| **Decision rule** | Pick the variant with highest RPI. If $4.99 and $6.99 are within 10% RPI, pick $4.99 (higher conversion = larger free-tier viral base). If $9.99 wins on RPI by >15%, consider it — but check Day 30 retention for churn risk. |
| **Guardrails** | If any variant shows refund rate >10% or Day 7 retention <30%, flag for review. |

### 2.2 Test B — Annual Discount Depth

| Parameter | Detail |
|---|---|
| **Hypothesis** | A 40% annual discount ($49.99/yr vs $83.88 monthly equivalent) is the revenue-maximizing discount depth. Shallower discounts (25%) will push more users to monthly (higher LTV risk from churn). Deeper discounts (50%) will cannibalize monthly revenue without enough incremental annual conversions. |
| **Variants** | B1: Monthly only ($6.99/mo, no annual option) / B2: 25% annual discount ($62.99/yr = $5.25/mo) / B3: 40% discount ($49.99/yr = $4.17/mo, control) / B4: 50% discount ($41.99/yr = $3.50/mo) |
| **Primary metric** | Projected 12-month LTV per converting user |
| **Secondary metrics** | Annual vs. monthly mix ratio, Day 90 retention by plan type, total revenue at Day 60 |
| **MDE** | 20% difference in projected 12-month LTV |
| **Sample size per variant** | ~1,200 users (4,800 total) — LTV requires longer observation so we use projected LTV from early retention curves |
| **Duration** | 8 weeks minimum (need to observe at least 1 monthly renewal cycle) |
| **Decision rule** | Maximize projected 12-month LTV. If B3 (40%) and B4 (50%) are within 10% LTV, pick B3 — less discount = more revenue per annual subscriber. Monthly-only (B1) establishes the baseline monthly churn rate. |
| **Key insight to watch** | What % of users choose annual when both options are presented? RevenueCat benchmark: ~35% annual take-rate for health apps. If ShiftWell exceeds 45%, the annual value prop is strong. |

### 2.3 Test C — Onboarding Conversion Model

| Parameter | Detail |
|---|---|
| **Hypothesis** | A 7-day trial converts more users than freemium (no trial) because shift workers experience the calendar export value within 2–3 shifts. A 14-day trial won't meaningfully outperform 7-day because the "aha moment" happens in the first week. |
| **Variants** | C1: Hard paywall with 7-day free trial (control) / C2: Hard paywall with 14-day free trial / C3: Freemium (free tier + upgrade prompts, no trial) |
| **Primary metric** | Day 30 conversion rate (% of installs → paid subscriber) |
| **Secondary metrics** | Trial start rate (C1/C2), Day 7 retention, RPI at Day 30, free-to-paid conversion timing (C3) |
| **MDE** | 25% relative difference in Day 30 conversion rate |
| **Sample size per variant** | ~2,000 users (6,000 total) — freemium conversion rates are low (~2–5%), so we need larger samples |
| **Duration** | 6 weeks (14-day trial needs 2 weeks + 2 weeks observation + buffer) |
| **Decision rule** | If 7-day trial conversion > freemium by >25% relative: use trial model. If freemium Day 60 conversion catches up to within 15% of trial Day 60: consider freemium (larger free user base = more word-of-mouth). 14-day trial must beat 7-day by >10% to justify the longer free window. |
| **Benchmark context** | RevenueCat 2025 data: hard paywall median conversion 12.11%, freemium median 2.18%. Health & fitness trial-to-paid median: 39.9%, P90: 68.3%. ShiftWell's niche focus should push toward P75+. |

### Experiment Sequencing

Run Test C first — the onboarding model affects everything downstream. Then run Tests A and B in parallel (they're independent: price point and discount depth can be tested simultaneously on whichever onboarding model wins Test C).

| Phase | Test | Timing | Prerequisites |
|---|---|---|---|
| Phase 1 | Test C (onboarding model) | Weeks 1–6 post-launch | 6,000 installs |
| Phase 2 | Tests A + B (parallel) | Weeks 7–14 | Test C winner decided, ~10,000 additional installs |
| Phase 3 | Validate winner | Weeks 15–18 | Confirm winning combo at scale |

**Total installs needed for full experimentation: ~16,000.** At projected Month 3 install rate of 1,000 users/mo, full experimentation takes ~4–5 months post-launch. This is realistic only if organic + paid acquisition hits targets. If install velocity is slower, extend timelines proportionally — never cut sample sizes.

---

## 3. Competitive Pricing Analysis

### 3.1 Competitor Pricing Matrix

| App | Monthly | Annual | Effective $/mo | Lifetime | Model | Primary Audience |
|---|---|---|---|---|---|---|
| **Sleep Cycle** | ~$3.33/mo | $39.99/yr | $3.33 | — | Freemium + premium | General population |
| **Rise Science** | ~$5.83/mo | $69.99/yr | $5.83 | — | Hard paywall (7-day trial) | General population |
| **Timeshifter** | — | $24.99/yr | $2.08 | $149 | Per-trip ($9.99) or annual | Travelers / shift workers |
| **WHOOP** | $25–40/mo | $300–480/yr | $25–40 | — | Hardware + subscription | Athletes / biohackers |
| **Oura** | $5.99/mo | $69.99/yr | $5.83 | — | Hardware + subscription | Health-conscious general |
| **Riseo** | Unknown | Unknown | Unknown | — | New entrant (2025) | Shift workers |
| **Fatigue Science Readi** | $15–50/seat | Custom | $15–50 | — | Enterprise B2B only | Mining, transport, hospitals |
| **ShiftWell** | **$6.99/mo** | **$49.99/yr** | **$4.17** | **$149.99** | **Freemium + trial** | **Shift workers (healthcare)** |

### 3.2 Positioning Analysis

**ShiftWell's pricing sweet spot:**

ShiftWell sits in the "premium niche" zone — more expensive than general sleep trackers (Sleep Cycle, Timeshifter) but far cheaper than hardware-dependent platforms (WHOOP, Oura) and enterprise solutions (Fatigue Science).

**Why this works:**

- **vs. Sleep Cycle ($3.33/mo):** Sleep Cycle is a general sleep tracker. It doesn't know your shift schedule, doesn't plan your sleep, doesn't export to your calendar. ShiftWell solves a specific, painful problem that Sleep Cycle ignores. The 2x price premium is justified by the specificity of value delivered.

- **vs. Rise Science ($5.83/mo):** Rise tracks sleep debt but doesn't plan around shift schedules. It doesn't read your calendar or write back to it. ShiftWell's $0.34/mo premium over Rise (annual-to-annual) is negligible given the shift-specific features. Rise's $69.99/yr annual price actually makes ShiftWell at $49.99/yr look like a bargain.

- **vs. Timeshifter ($2.08/mo):** Timeshifter is the closest competitor in concept (circadian science + schedule-aware plans) but focuses on jet lag with a newer shift work product. At $24.99/yr, Timeshifter is cheaper — but it requires manual shift entry, doesn't integrate with calendars, and has no export. ShiftWell's automation and calendar integration justify the 2x premium.

- **vs. WHOOP ($25–40/mo):** Completely different category. WHOOP requires hardware, tracks biometrics, and serves athletes. ShiftWell is software-only, requires no wearable, and serves shift workers specifically. Not a head-to-head competitor, but important context: shift workers who already pay $30/mo for WHOOP won't blink at $6.99/mo for ShiftWell.

- **vs. Fatigue Science Readi ($15–50/seat):** ShiftWell's B2B tier at $12/seat directly undercuts Readi while offering a consumer-grade UX that individual workers actually want to use (Readi is compliance software; ShiftWell is a personal tool that also has enterprise features).

### 3.3 Competitive Vulnerability Assessment

| Threat | Risk Level | Mitigation |
|---|---|---|
| Sleep Cycle adds shift-worker features | Medium | Calendar read+write is hard to replicate. Our algorithm is deep. Speed to market matters. |
| Timeshifter improves shift work app | High | They have Harvard science credibility + B2B airline relationships. We counter with calendar integration + physician credibility + healthcare vertical focus. |
| Rise adds shift support | Medium | Rise is deep in sleep debt tracking. Pivot to shift work would require major product rework. |
| Riseo gains traction | Medium | New entrant, unclear funding/team. Monitor closely — they target the same niche. |
| WHOOP/Oura add shift features | Low | Hardware-first companies won't build calendar integration. Different product philosophy. |
| Fatigue Science moves downmarket | Low | Enterprise DNA doesn't translate to consumer UX. Different sales motion entirely. |

---

## 4. Revenue Projections

### 4.1 Assumptions

| Parameter | Low | Mid | High |
|---|---|---|---|
| Month 1 installs | 100 | 300 | 500 |
| Monthly install growth | 15% | 25% | 40% |
| Free-to-paid conversion (Day 30) | 4% | 7.8% | 12% |
| Annual plan take-rate | 30% | 40% | 50% |
| Monthly churn | 8% | 5% | 3% |
| Annual churn | 30% | 20% | 12% |
| ARPU (blended monthly/annual) | $5.50 | $5.80 | $6.20 |
| B2B deal close (Year 1) | 0 | 1 | 2 |
| B2B avg seats per deal | — | 50 | 100 |

### 4.2 B2C Revenue — Year 1

**Low scenario (bootstrap, organic only):**

| Month | Cumulative Installs | Paying Subscribers | MRR |
|---|---|---|---|
| 1 | 100 | 4 | $22 |
| 3 | 365 | 15 | $83 |
| 6 | 1,050 | 42 | $231 |
| 9 | 2,200 | 88 | $484 |
| 12 | 4,100 | 164 | $902 |
| **Year 1 total** | | | **~$4,200** |

**Mid scenario (organic + targeted Reddit/social + physician networks):**

| Month | Cumulative Installs | Paying Subscribers | MRR |
|---|---|---|---|
| 1 | 300 | 23 | $133 |
| 3 | 1,200 | 94 | $545 |
| 6 | 4,500 | 351 | $2,036 |
| 9 | 11,500 | 897 | $5,203 |
| 12 | 25,000 | 1,950 | $11,310 |
| **Year 1 total** | | | **~$50,000** |

**High scenario (organic + paid acquisition + press coverage + viral moment):**

| Month | Cumulative Installs | Paying Subscribers | MRR |
|---|---|---|---|
| 1 | 500 | 60 | $372 |
| 3 | 2,500 | 300 | $1,860 |
| 6 | 12,000 | 1,440 | $8,928 |
| 9 | 38,000 | 4,560 | $28,272 |
| 12 | 100,000 | 12,000 | $74,400 |
| **Year 1 total** | | | **~$300,000** |

### 4.3 B2B Revenue — Hospital Deal Economics

**Single hospital deal model:**

| Parameter | Conservative | Moderate |
|---|---|---|
| Seats | 50 | 200 |
| Price/seat/mo | $12 | $12 |
| Monthly revenue | $600 | $2,400 |
| Annual contract value (ACV) | $7,200 | $28,800 |
| Pilot cost (25 free seats, 90 days) | ~$900 in foregone revenue | ~$900 |
| Net Year 1 ARR (post-pilot) | $5,400 | $21,600 |

**B2B pipeline (Year 1 target: 1–2 pilot hospitals):**

| Milestone | Timing | ARR Impact |
|---|---|---|
| Pilot 1 signed (50 seats) | Month 6–8 | +$7,200 ARR |
| Pilot 1 converts to annual contract | Month 9–11 | Confirmed $7,200 ARR |
| Pilot 2 signed (100 seats) | Month 10–12 | +$14,400 ARR |
| Year 1 B2B ARR target | Month 12 | $7,200–$21,600 |

**Total Year 1 revenue (mid scenario):**

| Source | ARR |
|---|---|
| B2C (mid) | ~$50,000 |
| B2B (1 pilot converted) | ~$7,200 |
| **Combined** | **~$57,200** |

### 4.4 Break-Even Analysis

| Cost Category | Monthly (at 5,000 users) |
|---|---|
| Supabase Pro | $25 |
| Claude API (AI check-in, 390 Pro users) | $156 |
| RevenueCat | $0 (free under $2.5K MTR) |
| Apple Developer | $8.25 ($99/yr) |
| Domain + hosting | $15 |
| **Total monthly cost** | **~$205** |
| **Break-even subscribers** | **~30 Pro subscribers** |
| **Apple's 30% cut considered** | **~43 Pro subscribers** |

Break-even at ~43 subscribers is achievable by Month 2 in the mid scenario. Infrastructure costs scale slowly — Supabase and Claude API are the only variable costs, and both have generous free/low tiers.

---

## 5. Monetization Roadmap

### Phase 0: Pre-Launch (Now → TestFlight)

- Ship the app with full Free + Pro tiers implemented
- Calendar export paywall is the primary conversion mechanism
- Implement RevenueCat SDK for subscription management
- Set up 7-day free trial as default (pending Test C results)
- Lifetime tier ($149.99) available from Day 1 — early adopter cash injection
- No B2B features yet

### Phase 1: Launch + Experimentation (Months 1–4)

- Launch on App Store with Free + Pro tiers
- Run Test C (onboarding model) immediately: 7-day trial vs 14-day trial vs freemium
- Goal: 1,000+ installs in first 30 days through organic channels (Reddit r/nursing, r/nightshift, r/shiftwork, physician networks, HCA internal channels)
- Collect qualitative feedback: what features drive upgrades? What's missing?
- Begin Tests A + B in parallel once Test C concludes (~Week 7)
- Monitor: install-to-trial rate, trial-to-paid rate, Day 7/30 retention, RPI

### Phase 2: Optimize + Grow (Months 5–8)

- Lock in winning pricing and onboarding model from experiments
- Introduce v1.1 features (AI Weekly Check-in, daily cadence) — Pro only
- Begin Apple Search Ads ($100–200/mo) targeting "shift work sleep," "night shift app," "nurse sleep"
- Start B2B sales outreach: target 3–5 hospitals for pilot conversations
- Pitch: "90-day free pilot, 25 seats, we measure outcomes together"
- Begin SOC 2 Type II preparation (required for enterprise credibility)

### Phase 3: Enterprise Entry (Months 9–12)

- Launch Hospital/Enterprise tier with admin dashboard, fatigue risk scoring, compliance reporting
- Convert first pilot hospital to paid annual contract
- Introduce HIPAA BAA execution capability
- Begin SSO integration (SAML/OIDC) for enterprise provisioning
- v1.2 features ship: Shift Crew, Household Mode, gamification — Pro only
- Target: 2 signed enterprise pilots by end of Month 12

### Phase 4: Scale (Year 2)

- Enterprise sales team (1 dedicated AE) when B2B pipeline justifies it
- Expand B2B verticals: EMS, fire departments, transportation, manufacturing
- Evaluate annual price increase ($49.99 → $59.99/yr) based on feature depth
- Consider family/household plan ($9.99/mo for up to 3 accounts)
- Explore partnership channel: sell through scheduling platforms (QGenda, Kronos) as an add-on
- Target: 50,000 B2C users, 5 enterprise contracts, $200K+ combined ARR

### Key Pricing Decisions Deferred to Data

| Decision | When to Decide | Data Needed |
|---|---|---|
| Kill or keep lifetime tier | Month 6 | If >20% of revenue is lifetime, it's cannibalizing subscriptions. Phase it out. |
| Raise monthly price | Month 8 | If Test A shows $9.99 wins on RPI, implement post-experimentation. |
| Add family plan | Year 2 | If Household Mode (v1.2) drives demand for multi-account pricing. |
| Adjust enterprise pricing | After Pilot 1 | Hospital feedback on willingness-to-pay and competitive bids. |
| Introduce usage-based AI pricing | v1.1 launch | If Claude API costs per user exceed $0.50/mo, consider AI usage tiers or Pro+ tier. |

---

## Appendix: Key Benchmarks Used

| Metric | Value | Source |
|---|---|---|
| Health app freemium conversion (median) | 2.18% | RevenueCat State of Subscription Apps 2025 |
| Health app hard paywall conversion (median) | 12.11% | RevenueCat 2025 |
| Health app trial-to-paid (median) | 39.9% | RevenueCat 2025 |
| Health app trial-to-paid (P90) | 68.3% | RevenueCat 2025 |
| Health app RPI (median) | $0.44 | Business of Apps 2026 |
| Health app RPI (P90) | $2.97 | Business of Apps 2026 |
| Niche health app conversion benchmark | 7.8% | Flo Health (comparable niche health app) |
| Nurse turnover rate (national) | 27.65% | PMC 2023 |
| Nurse replacement cost | $100K–$150K | Industry benchmark |
| Fatigue-related productivity loss (US) | $136.4B/yr | Rosekind et al. 2010 |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Pricing tiers, 3 A/B experiments, competitive analysis (6 competitors benchmarked), revenue projections (3 scenarios), and 4-phase monetization roadmap. Grounded in RevenueCat 2025 benchmarks and live competitor pricing as of April 2026.
