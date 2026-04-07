# ShiftWell Enterprise Pitch Deck Outline

> **Version:** 1.0 | **Date:** April 2026
> **Audience:** Hospital HR/Benefits, Chief Nursing Officers, EMS Agency Medical Directors, Fire Chiefs, Safety Officers
> **Format:** 14 slides, 20-minute presentation + 10-minute Q&A
> **Tone:** Data-driven, compliance-first, ROI-focused — not "wellness app"

---

## Presenter Notes: How to Frame This Conversation

Before slide 1, set context:

> "I want to talk to you about a specific, quantifiable problem you're probably already measuring — and a targeted solution with a ROI I can demonstrate in 20 minutes. This isn't a wellness pitch. This is a fatigue risk management conversation."

That framing separates ShiftWell from every other vendor in the room.

---

## Slide 1: The Cost of Shift Work on Your Organization

**Headline:** "Shift work is costing you more than you think."

**Visual:** Three large numbers stacked vertically

| Metric | Value | Source |
|--------|-------|--------|
| Annual nurse turnover cost | $100K–$150K **per departure** | PMC 2023, SHRM |
| Fatigue-related productivity loss | $1,967 **per employee per year** | Rosekind et al. 2010 |
| Sentinel events attributed to nurse fatigue | **23%** | Joint Commission |

**Speaker note:** Lead with their numbers. Before you mention ShiftWell, make them feel the problem in their budget.

---

## Slide 2: The Root Cause Nobody Is Addressing

**Headline:** "Burnout starts with sleep."

**Visual:** Causal chain diagram

```
Shift Work → Circadian Misalignment → Chronic Sleep Disruption → Fatigue → Burnout → Departure
```

**Supporting data:**
- 27.65% annual nurse turnover nationally (PMC 2023)
- Sleep quality is the most prominent mediator between shift work and burnout (PMC7345885)
- 70% of nurses report experiencing fatigue and burnout (Booker et al. 2024)
- Those with severe sleep disruption are most likely to leave within 2 years

**Speaker note:** "Current retention interventions (pay, scheduling flexibility, recognition programs) address branches, not the root. Sleep disruption is the root."

---

## Slide 3: The Solution — ShiftWell

**Headline:** "ShiftWell optimizes sleep for shift workers using circadian science."

**Visual:** App screenshots showing:
1. Calendar import
2. Generated sleep plan
3. Calendar export with sleep events

**One-sentence product description:**
"ShiftWell imports your employees' shift schedules, generates a personalized circadian sleep plan, and delivers it directly to their phone calendar — so they know exactly when to sleep, nap, avoid caffeine, and manage light exposure around every shift."

**Key differentiators vs. "wellness app" competitors:**
- Deterministic algorithm (not generic advice, not AI hallucination)
- Calendar-integrated (the plan goes where people actually look)
- Built by a practicing ER physician who works rotating shifts

---

## Slide 4: How It Works

**Headline:** "Five steps. Zero IT involvement."

**Visual:** Horizontal flow diagram

```
1. IMPORT          2. ANALYZE         3. GENERATE          4. EXPORT             5. MEASURE
Employee enters    ShiftWell reads    Complete plan:       Sleep events land     Employer dashboard
shift schedule     chronotype +       sleep windows,       in employee's         shows engagement,
(or auto-imports   shift pattern      naps, caffeine,      Apple/Google          adherence, and
from QGenda/ICS)                      meals, light         Calendar              aggregated outcomes
```

**Implementation time:** Employee setup < 5 minutes
**IT requirement:** None (no EMR integration, no SSO required in pilot)
**Privacy model:** Employee data stays on device; employer sees only de-identified aggregate metrics

---

## Slide 5: The Science

**Headline:** "Every recommendation traces to published research."

**Visual:** Split layout — left: app recommendation, right: citation

| ShiftWell Recommendation | Scientific Basis | Authority |
|--------------------------|-----------------|-----------|
| Sleep window timing | Two-Process Model (Borbely 1982) + NIOSH anchor sleep | U.S. Federal/NIOSH |
| Caffeine cutoff | Drake et al. 2013 — 6-hour pharmacokinetic effect | Peer-reviewed |
| Light protocol | Czeisler et al. 1990, Eastman & Burgess 2009 | Peer-reviewed |
| Nap placement | Milner & Cote 2009, Ruggiero & Redeker 2014 | Peer-reviewed |
| Meal timing | Manoogian et al. 2022 (time-restricted eating) | Peer-reviewed |
| Overall framework | AHA Scientific Statement on Circadian Health, 2025 | American Heart Association |

**Key credential:** "The AHA's 2025 Scientific Statement independently endorses every intervention ShiftWell implements. We didn't build an app then look for citations — we built the app from the citations."

**Differentiator from Calm/Headspace:** "Those apps offer meditation and sleep stories. We offer circadian biology. These are fundamentally different categories."

---

## Slide 6: Published Outcomes

**Headline:** "36 of 38 published studies show positive results for sleep interventions in shift workers."

**Visual:** Citation summary table + key quote

**Key published findings (pre-ShiftWell — establishes category efficacy):**

| Study | Finding | Confidence |
|-------|---------|-----------|
| PMC12403384 (2025 meta-analysis) | 36/38 studies show improved sleep outcomes | HIGH (meta-analysis) |
| PerfectFit@Night (2024) | 11% reduction in night-shift insomnia at 3 months; fatigue decreased at 6 months | HIGH |
| Vallières et al. 2024 | Behavioral therapy improves sleep, sleepiness, mental health in shift workers | MEDIUM (pilot RCT) |
| Evening light intervention (2024) | Reduced fatigue AND work-related errors in 33 nurses | MEDIUM (feasibility) |
| PMC9204576 (2022) | Workplace sleep interventions increase sleep duration in shift workers | HIGH |

**Gap we're filling:** "No published study has measured the economic ROI of a digital sleep intervention for shift workers. Our pilot program is designed to generate that data — and we'll publish it with your institution as co-author."

---

## Slide 7: The Employer Dashboard

**Headline:** "You measure what you manage. We give you the data."

**Visual:** Dashboard mockup (anonymized)

**Monthly Engagement Report includes:**

```
ShiftWell Enterprise Report — [Month] [Year]
Organization: [Name] | Enrolled: [N] employees

ENGAGEMENT
- Active users: [N] ([%] of enrolled)
- Plans generated this month: [N]
- Calendar events created: [N]
- Average daily engagement: [N] minutes

SLEEP OUTCOMES (Aggregated, De-identified)
- Average sleep duration: [N] hours (vs. [N] baseline)
- Average sleep quality score: [N]/100
- Plan adherence rate: [N]%
- Sleep debt trend: [↑ improving / ↓ declining]

IMPACT INDICATORS
- Self-reported fatigue score: [N]/10 (vs. [N] baseline)
- Estimated productivity recovery: $[N]
```

**Quarterly additions:** PSQI change from baseline, absenteeism correlation, turnover risk indicators, ROI calculation with confidence interval

**Privacy architecture:** Employee-level data never visible to employer. All reporting is aggregate and de-identified. HIPAA-aware design.

---

## Slide 8: Security & Compliance

**Headline:** "Built for healthcare from the ground up."

**Visual:** Compliance status table

| Area | Status | Details |
|------|--------|---------|
| HIPAA Readiness | In progress | HIPAA-aware architecture; BAA available; v1 stores no PHI on servers |
| SOC 2 Type I | Roadmap Q4 2026 | Self-assessment complete; external audit scoped |
| SOC 2 Type II | Roadmap Q2 2027 | 6-month observation period post-Type I |
| BAA (Business Associate Agreement) | Available | Template provided; executed before enterprise deployment |
| Data Retention Policy | Defined | Employee data deletable on request; 12-month default retention for aggregate reporting |
| Differential Privacy | Implemented | Employer reports use k-anonymity (minimum 10 employees per aggregate metric) |
| Apple HealthKit | Privacy-compliant | HealthKit data never transmitted to server; analyzed locally |

**For regulated industries (aviation, trucking, DOT):** "We are not a medical device and do not generate FAA/DOT compliance documentation. We are a wellness tool. For regulated compliance, consult your legal team."

---

## Slide 9: Integration Capabilities

**Headline:** "Works with the scheduling systems you already use."

**Visual:** Integration diagram

**Current integrations (v1.0):**
- Apple Calendar (iCal) — read and write
- Google Calendar — read and write
- ICS file import — universal calendar format

**Roadmap integrations (v1.4–v2.0):**
- QGenda push API (hospital nurse scheduling)
- Kronos Workforce Central / UKG
- AMiON (physician scheduling)
- PeopleSoft HCM

**Enterprise deployment model:**
1. HR provides employee roster (name + email only)
2. ShiftWell sends enrollment invitations
3. Employees connect their own calendars (no HR system access required)
4. No IT integration needed for pilot

**For schedule push integration:** "When employees use QGenda, we receive their published schedule directly — they don't have to manually enter anything. This eliminates the #1 reason sleep apps fail: friction at setup."

---

## Slide 10: ROI Model

**Headline:** "Conservative estimate: 62x ROI for a 100-person pilot."

**Visual:** ROI calculator output (see ROI-CALCULATOR.md for full model)

**Sample calculation — 100 enrolled shift workers (avg $45/hr, nursing):**

| Cost Category | Conservative Savings | Calculation Basis |
|---------------|---------------------|-----------------|
| Absenteeism reduction (20%) | $81,600/yr | 6% baseline × 20% reduction × 365 days × $45/hr × 8hr |
| Productivity improvement (10%) | $19,670/yr | Rosekind: $1,967/employee × 10% improvement |
| Turnover reduction (2 prevented departures) | $200,000–$300,000/yr | $100K–$150K/hire × 2 prevented |
| Subscription cost | ($4,800)/yr | $48/employee/yr enterprise pricing |
| **Net savings (conservative)** | **$296,470–$396,470/yr** | |
| **ROI** | **62x–83x** | |

**Caveat (important for trust):** "These projections use published per-employee cost benchmarks. Actual results will vary. Our pilot program is designed to measure your actual outcomes — we don't ask you to take our word for it."

---

## Slide 11: Pricing

**Headline:** "Less than a single agency shift nurse."

**Visual:** Pricing tiers + comparison

| Tier | Seats | Price/Seat/Month | Annual Value |
|------|-------|-----------------|-------------|
| Pilot (free) | 50–100 | **$0** | $0 (90 days, measures outcomes) |
| Department | 50–249 | $15/seat | $9K–$44.8K/yr |
| Health System | 250–999 | $10/seat | $30K–$119.9K/yr |
| Enterprise | 1,000+ | $5/seat | $60K+/yr |

**Context:** "A single agency nurse shift at your facility costs $150–$300. Our annual cost for 100 nurses is $4,800. If we prevent one call-out that requires agency coverage, the program pays for itself in that day."

**Pilot terms:**
- 90 days, free
- 50–100 enrolled employees minimum
- Monthly engagement reports
- Pre/post sleep quality survey (PSQI)
- Case study rights (de-identified, institution-named with approval)

---

## Slide 12: The Founder

**Headline:** "Built by someone who works your shifts."

**Visual:** Headshot + credentials

**Dr. Gursimran Singh, DO**
- Board-eligible Emergency Medicine Physician
- HCA Healthcare, Tampa FL
- Works rotating day/night/evening shifts at a Level II trauma center
- Built ShiftWell because he needed it and nothing adequate existed

**Why it matters for your organization:**
- "This wasn't built by a tech company that read about shift work. It was built by a physician who works it. Every recommendation in the algorithm is something I've used personally."
- Clinical credibility is a defense against employee skepticism: "The ER doctor who built this works the same shifts we do."
- Direct physician relationship: "I'm not a sales rep. I'm the founder, the developer, and a practicing physician. Questions about the science? I answer them directly."

---

## Slide 13: Vision — From App to Platform to Research

**Headline:** "We're not building a wellness app. We're building the evidence base for shift work health."

**3-year vision:**

| Horizon | Milestone |
|---------|-----------|
| **Now** | Consumer app, first enterprise pilots |
| **Year 1** | 3+ hospital system contracts, monthly outcome reporting |
| **Year 2** | Published study: "Economic ROI of Digital Circadian Optimization" (target: JOEM) |
| **Year 3** | Insurance distribution, OSHA/Joint Commission reference tool, international expansion |

**The publication opportunity:**
"No published study has measured the economic ROI of a digital sleep intervention for shift workers. Our pilots are designed to generate that data. Partner institutions get co-authorship credit. We handle IRB, analysis, and submission."

**The insurance angle:**
"Workers' comp insurers are our next distribution channel. When an insurer can point to a validated sleep intervention that reduces claims, they promote it to every client hospital. That's how we scale without a large salesforce."

---

## Slide 14: The Pilot Proposal

**Headline:** "Let's measure results before you commit."

**Pilot Structure:**

| Element | Details |
|---------|---------|
| Duration | 90 days |
| Enrollment | 50–100 shift workers |
| Cost | **Free** |
| Setup time | <2 hours (HR side) |
| Employee time | <5 min setup, <2 min/day ongoing |
| Measurements | Pre/post PSQI, monthly engagement reports, self-reported fatigue scores |
| Deliverable | 90-day outcome report with ROI estimate |
| Commitment | None beyond providing enrollment data |

**What we ask:**
1. Roster of 50–100 shift workers (name + email only)
2. Agreement to baseline PSQI survey (2-minute self-reported sleep quality score)
3. 30-minute monthly check-in call with pilot coordinator
4. Permission to anonymize and aggregate data for research purposes (optional, signed separately)

**What you get:**
1. Free access to ShiftWell premium for all enrolled employees
2. Monthly engagement reports
3. 90-day outcome report with conservative ROI estimate
4. Negotiated pricing for full deployment if pilot succeeds

**Next step:** "I'd like to propose a pilot at [organization name]. Can we schedule 30 minutes to walk through the setup?"

---

## Appendix: Common Objections

**"We already have a wellness program."**
"Calm and Headspace are mindfulness tools — valuable, but not circadian science. ShiftWell addresses the underlying biology of shift work sleep disruption. They are complements, not substitutes."

**"Our nurses won't use an app."**
"App adoption depends on perceived value. When nurses see their exact schedule in the app with their specific sleep windows, caffeine cutoffs, and nap times — built around their real next 3 shifts — they use it. Our beta testers asked their colleagues to download it unprompted."

**"How do we know this is HIPAA-compliant?"**
"In pilot, employee schedule data stays on device. The employer dashboard shows only de-identified aggregate metrics. We execute a BAA before any enterprise deployment. Full SOC2 Type II is on our 2027 roadmap."

**"This seems too good. What's the catch?"**
"The pilot is free because we need real-world outcome data to publish. We want to prove ROI as much as you want to see it. If the pilot doesn't show results, you owe us nothing and we learn from it."

**"What if an employee doesn't want to use it?"**
"Completely voluntary. We recommend framing it as a benefit, not a requirement. Employees who opt in get free premium access. There is no coercion, no tracking, and no consequence for not using it."

---

*ShiftWell Enterprise Pitch Deck Outline — April 2026*
*Physician-built. Science-backed. ROI-driven.*
