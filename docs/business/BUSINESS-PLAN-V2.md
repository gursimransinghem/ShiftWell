# ShiftWell — Business Plan v2.0

> **Version:** 2.0 | **Date:** April 2026
> **Founder:** Dr. Gursimran Singh, DO — Emergency Medicine Physician
> **Product:** AI-powered circadian sleep optimization for shift workers
> **Stage:** MVP feature-complete, pre-launch (TestFlight pending)
> **Status:** 618+ tests passing, 28K+ LOC, App Store submission in preparation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Market Analysis](#4-market-analysis)
5. [Product](#5-product)
6. [Competitive Moat](#6-competitive-moat)
7. [Revenue Model](#7-revenue-model)
8. [Go-to-Market Strategy](#8-go-to-market-strategy)
9. [Financial Projections](#9-financial-projections)
10. [Team & Advisory](#10-team--advisory)
11. [Funding Roadmap](#11-funding-roadmap)
12. [Key Risks](#12-key-risks)
13. [Milestones & KPIs](#13-milestones--kpis)

---

## 1. Executive Summary

**The Problem:** 700 million shift workers globally experience chronic circadian misalignment — the biological disruption of working against their body clock. In the United States, 32% of healthcare workers report short sleep (NIOSH 2014), shift workers have 50% higher absenteeism than day workers (BLS), and nurse fatigue is a root cause in 23% of sentinel events (Joint Commission). The annual employer cost of fatigue-related productivity loss is $136.4 billion (Rosekind et al. 2010).

**The Solution:** ShiftWell is an iOS app that imports a shift worker's schedule from their calendar, generates a science-backed circadian optimization plan — covering sleep windows, strategic naps, caffeine cutoffs, meal timing, and light protocols — and exports that plan directly back to the user's calendar. The algorithm is based on the Two-Process Model (Borbely 1982) and NIOSH-validated circadian protocols. No guesswork. No LLM hallucinations. Deterministic science, personalized to the individual's schedule and chronotype.

**Traction:** Feature-complete MVP with 618+ automated tests passing. Built by an ED physician who lives the problem daily. Pre-TestFlight stage.

**Market:** The global mHealth market is $82.45B (2025) growing at 22.3% CAGR. The addressable shift worker market is 22M in the US and 700M globally.

**Revenue Model:**
- B2C: $6.99/month, $49.99/year, $149.99 lifetime (14-day premium trial)
- B2B: $5–$15/seat/month for enterprise licensing (hospitals, EMS, fire departments)

**The Ask:** Pre-seed funding of $300K–$500K to fund enterprise pilot programs, regulatory compliance (SOC2 Type II), and 12 months of product and distribution build-out. Alternatively, bootstrap through B2C revenue to the first B2B pilot, then raise on enterprise traction.

---

## 2. The Problem

### 2.1 Scale of the Problem

Shift work is not a niche. It is the largest occupational health crisis in the developed world that nobody talks about:

- **700 million** shift workers globally (ILO)
- **22 million** shift workers in the United States
- **16 million** US healthcare workers, 60% working rotating or night shifts
- **32%** of US healthcare workers report short sleep (NIOSH)
- **10–38%** of night shift workers develop Shift Work Sleep Disorder (Drake et al. 2004)

The biological mechanism is well understood. Human circadian clocks evolved over millennia for a solar day — sleep at night, wake at dawn. Night shift work forces the body to function in direct opposition to this evolved rhythm. Unlike jet lag (a temporary disruption), shift work is chronic and recurring. Most shift workers never fully adapt. They exist in a permanent state of circadian misalignment.

### 2.2 The Health Consequences

Peer-reviewed evidence links chronic shift work to severe health outcomes:

| Outcome | Relative Risk | Source |
|---------|--------------|--------|
| Type 2 Diabetes | RR 1.09–1.40 | Kecklund & Axelsson (BMJ 2016) |
| Coronary Heart Disease | RR 1.23 | Kecklund & Axelsson (BMJ 2016) |
| Stroke | RR 1.05 | Kecklund & Axelsson (BMJ 2016) |
| Cancer | RR 1.01–1.32 | Kecklund & Axelsson (BMJ 2016) |
| Cardiovascular events | Elevated | AHA Scientific Statement (2025) |
| Fatigue-related work errors | 30% higher on nights | OSHA |

The American Heart Association's 2025 Scientific Statement on Circadian Health explicitly endorses circadian-aligned interventions — timed sleep, light protocols, meal timing — as countermeasures to cardiometabolic risk. ShiftWell's algorithm implements every intervention the AHA recommends.

### 2.3 The Employer Cost

Poor shift worker sleep is not just a personal health problem. It is a quantified financial liability for employers:

- **$136.4 billion** in annual fatigue-related productivity loss (Rosekind et al. 2010)
- **$4,080/employee/year** in unplanned absence costs (Sedgwick/CDC)
- **$100,000–$150,000** cost to replace one nurse (recruitment + onboarding + training)
- **27.65%** annual nurse turnover rate nationally (PMC 2023)
- **23%** of sentinel events in hospitals are attributed to nurse fatigue (Joint Commission)
- Night shift workers file **2–3x more workers' compensation claims** than day shift workers (NSC)

A 500-nurse hospital losing 27.65% annually = 138 nurse departures. At $100,000–$150,000 each = $13.8M–$20.7M in replacement costs annually. Sleep quality is the most prominent mediator between shift work and burnout (PMC7345885) — and burnout is the leading driver of voluntary departure.

### 2.4 The Technology Gap

Despite the problem's scale and the evidence base for solutions, no existing product delivers what shift workers actually need:

- **Calendar integration is missing.** No app reads your actual work calendar and builds your sleep plan around real upcoming shifts.
- **Personal schedule awareness is missing.** No app knows you have a 7 AM dentist appointment after a night shift and adjusts your sleep window accordingly.
- **Science-backed personalization is missing.** Existing apps offer generic sleep hygiene tips, not personalized circadian protocols based on your chronotype and shift pattern.
- **Calendar export is missing.** No competitor puts your sleep plan directly into your calendar as real, schedulable events.

This is the gap ShiftWell fills.

---

## 3. The Solution

### 3.1 What ShiftWell Does

ShiftWell connects your work calendar to your body clock. The app:

1. **Imports** your shift schedule from Apple Calendar, Google Calendar, or QGenda
2. **Reads** your personal calendar for upcoming obligations that affect sleep timing
3. **Analyzes** your chronotype, shift pattern, and schedule context
4. **Generates** a complete circadian optimization plan:
   - Sleep windows (primary and anchor sleep)
   - Strategic nap placement and duration
   - Caffeine cutoff times (based on pharmacokinetics)
   - Meal timing (time-restricted eating protocols)
   - Light exposure recommendations (bright light vs. avoidance)
5. **Exports** the plan to your calendar as real, color-coded events
6. **Adapts** when your schedule changes

### 3.2 The Core Innovation

The key technical innovation is the closed-loop calendar system:

```
Calendar (input) → Circadian Algorithm → Sleep Plan → Calendar (output) → Feedback → Algorithm improvement
```

No competitor does this. Timeshifter requires manual shift entry. Rise doesn't export. Sleep Cycle tracks but doesn't plan. ShiftWell reads real schedules and writes real plans back to the place people already live — their calendar.

### 3.3 The Scientific Foundation

The algorithm is not built on LLM inference or wellness opinions. Every recommendation traces to peer-reviewed publications:

| Recommendation | Scientific Basis |
|---------------|-----------------|
| Sleep window timing | Two-Process Model (Borbely 1982), NIOSH anchor sleep protocol |
| Nap placement | Milner & Cote (2009), Ruggiero & Redeker (2014) |
| Caffeine cutoff | Drake et al. (2013) — 6-hour pharmacokinetic effect |
| Meal timing | Manoogian et al. (2022), Chellappa et al. (2021) |
| Light protocols | Czeisler et al. (1990), Eastman & Burgess (2009) |
| Sleep debt calculation | St. Hilaire et al. (2017) mathematical model |
| Circadian adaptation | Boivin & Boudreau (2014, 2022) |

15+ peer-reviewed studies underpin the algorithm. The AHA's 2025 Scientific Statement independently validates ShiftWell's core approach.

---

## 4. Market Analysis

### 4.1 Total Addressable Market

| Market | Size | Source |
|--------|------|--------|
| Global mHealth Market | $82.45B (2025) | Market research 2025 |
| mHealth CAGR | 22.3% | Industry reports |
| Healthcare AI VC Investment | $11.1B (2024) | CB Insights |
| US Shift Workers | 22M people | BLS |
| Global Shift Workers | 700M people | ILO |
| US Healthcare Workers | 16M people (60% on rotating shifts) | BLS |

### 4.2 Serviceable Addressable Market (SAM)

Targeting US shift workers with smartphones willing to pay for health apps:

- **22M US shift workers** × **60% iPhone penetration** (healthcare-skewing demographic) = **13.2M potential iOS users**
- At **7.8% premium conversion** (Flo Health niche benchmark) = **1.03M potential subscribers**
- At **$49.99/year average** = **$51.5M ARR potential** in US market alone

### 4.3 Serviceable Obtainable Market (SOM) — 5-Year Target

**Conservative:** 50,000 subscribers by Year 5 = $2.5M ARR
**Moderate:** 200,000 subscribers by Year 5 = $10M ARR
**Aggressive:** 500,000 subscribers + enterprise = $35M ARR

### 4.4 Market Dynamics

**Why now:**
- AHA 2025 Scientific Statement elevates circadian health to mainstream awareness
- Post-COVID healthcare worker burnout crisis creates acute demand for fatigue solutions
- iOS calendar API maturity enables ShiftWell's core calendar integration
- mHealth investment at all-time highs with institutional buyer willingness to pay
- "Physician-built" apps are having a cultural moment (ZocDoc, Doximity, Doxi)

**Market tailwinds:**
- 24/7 economy continues to expand (gig economy, always-on services)
- Growing body of published research creates credibility infrastructure
- Enterprise buyers (hospitals, EMS, fire) are actively seeking OSHA/Joint Commission compliance tools
- Apple HealthKit ecosystem enables seamless sleep data integration

### 4.5 Target Personas

| Persona | Description | Size | Willingness to Pay |
|---------|-------------|------|-------------------|
| **ICU/ED Nurse** | 3-shift rotation, high income, iPhone-primary | 4M in US | High ($6.99/mo = 1 coffee) |
| **Paramedic/EMT** | 24-on/48-off patterns, physically demanding | 280K in US | Medium-High |
| **Firefighter** | 24-hour shifts, union benefits, dept-sponsored | 370K in US | Medium (dept-paid) |
| **Hospital Physician** | Residents especially, irregular rotations | 1M in US | High |
| **Airline Crew** | FAA fatigue rules, highly motivated to comply | 99K pilots, 94K FAs | High |
| **Factory/Manufacturing** | Rotating day/night, lower income, volume play | 6M in US | Low-Medium |

**Beachhead market:** ICU and ED nurses. iPhone-dominant, highest income among shift workers, tight professional communities (viral coefficient), and the most acutely familiar with the consequences of fatigue.

---

## 5. Product

### 5.1 Core Features (v1.0 — Launch)

| Feature | Description |
|---------|-------------|
| **Schedule Import** | iCal/ICS file import, QGenda sync, manual entry |
| **Calendar Awareness** | Reads personal calendar events to protect sleep windows |
| **Sleep Plan Generation** | Primary sleep windows, anchor sleep protocol |
| **Nap Planning** | Strategic nap placement based on shift timing and sleep pressure |
| **Caffeine Protocol** | Personalized cutoff times based on chronotype and shift |
| **Meal Timing** | Time-restricted eating guidance for circadian alignment |
| **Light Protocol** | Morning/evening light exposure recommendations |
| **Calendar Export** | One-tap export of full plan to Apple/Google Calendar as events |
| **Today Screen** | At-a-glance countdown to next sleep, caffeine cutoff, shift |
| **Sleep Tips Library** | 25+ science-backed tips organized by protocol |

### 5.2 Premium Features (v1.2 — Paywall Activation)

| Feature | Tier |
|---------|------|
| Manual shift entry | Free |
| Basic sleep windows | Free (7-day trial) |
| Full plan (naps, caffeine, meals, light) | Premium |
| Calendar import (unlimited) | Premium |
| Calendar export | Premium |
| Full Today screen | Premium |
| HealthKit integration | Premium |
| Widgets | Premium |

**Pricing:**
- Monthly: $6.99/month
- Annual: $49.99/year (~40% discount)
- Lifetime: $149.99 (one-time)
- Free trial: 14 days full access

### 5.3 Product Roadmap

| Version | Timeline | Key Features |
|---------|----------|-------------|
| **v1.0** | Month 1 | Core plan generation, calendar export, free launch |
| **v1.1** | Month 3 | AI weekly check-in (Claude API), paywall activation |
| **v1.2** | Month 4 | HealthKit integration, sleep tracking correlation |
| **v1.3** | Month 6 | Widgets, Live Activities, lock screen presence |
| **v1.4** | Month 9 | Employer dashboard, B2B pilot readiness |
| **v2.0** | Month 12–15 | Kronos/QGenda push API, team features, enterprise compliance suite |

### 5.4 Technical Architecture

- **Stack:** React Native (Expo), TypeScript, on-device computation
- **No backend in v1:** All data stored locally on device — no servers, no PHI exposure
- **Algorithm:** Deterministic (not LLM-based) — predictable, auditable, explainable
- **Tests:** 618+ automated tests across algorithm correctness, edge cases, ICS parsing
- **Privacy:** HIPAA-agnostic in v1 (no server, no PHI); HIPAA-aware architecture in v1.4
- **Payments:** StoreKit 2 + RevenueCat for subscription management

---

## 6. Competitive Moat

### 6.1 Competitive Landscape

| Competitor | Strength | Weakness vs. ShiftWell |
|------------|----------|----------------------|
| **Timeshifter** | Strong circadian science, NASA heritage | Manual shift entry only, no calendar sync, no export, $69.99/yr |
| **Rise Science** | Sleep debt tracking, elegant UI | No schedule planning, no circadian protocols, no export |
| **Sleep Cycle** | Sleep tracking, smart alarm | Tracking only, no schedule optimization |
| **Calm / Headspace** | Brand recognition | Generic sleep content, no circadian science, no scheduling |
| **FAID** | Enterprise fatigue compliance | Compliance tool only, no consumer UX, not individual-wellness |

**The white space ShiftWell occupies:** No competitor combines calendar-aware scheduling + science-backed circadian algorithms + full plan generation + calendar export in a single product. This is not a feature gap — it is a category gap.

### 6.2 Defensible Advantages

**1. Physician Founder — Unmatched Credibility**
Dr. Singh is an active ED physician who built ShiftWell because he needed it. This creates:
- Instant trust from healthcare workers ("one of us built this")
- Clinical accuracy that non-physician competitors cannot match
- Direct access to the beachhead market (hospital staff, residents, nurses)
- Compelling media and podcast angle

**2. Deterministic Algorithm — Not an LLM**
ShiftWell's algorithm produces the same output for the same inputs, every time. This is a feature, not a limitation:
- Auditable and explainable (important for enterprise buyers)
- No hallucination risk
- Traceable to published research (each recommendation cites its source)
- Differentiates from "AI-washing" competitors

**3. Calendar Integration — Structural Moat**
Reading from and writing to the user's actual calendar creates structural lock-in:
- The more shifts a user imports, the more the plan improves
- The plan is in the calendar — removing the app doesn't remove the plan
- Network effects when teams share calendars (enterprise play)

**4. Published Science as Marketing**
15+ cited peer-reviewed papers are not just credibility — they are marketing assets that competitors cannot easily replicate:
- Every paper citation is a SEO keyword
- Every study is a press angle
- The algorithm's scientific basis is a defensible claim in a sea of wellness opinion

**5. Five Circadian Protocols**
ShiftWell implements 5 distinct evidence-based protocols tailored to different shift types:
- Fixed night shift
- Rotating shifts (clockwise/counterclockwise)
- 12-hour shifts
- Early morning shifts
- Irregular/variable schedules

No competitor matches this breadth of protocol coverage.

**6. Closed-Loop Feedback**
As users accumulate shift data and adherence history, the algorithm improves recommendations. This creates a data moat that compounds over time — the longer a user uses ShiftWell, the better it works for them.

---

## 7. Revenue Model

### 7.1 B2C Subscription (Primary)

**Pricing Tiers:**

| Tier | Price | Description |
|------|-------|-------------|
| Free | $0 | Manual entry, basic sleep windows, 14-day premium trial |
| Monthly | $6.99/mo | Full features, cancel anytime |
| Annual | $49.99/yr | Full features, ~40% discount ($4.16/mo effective) |
| Lifetime | $149.99 | Full features, one-time purchase |

**Positioning:** $6.99/month is above Sleep Cycle ($2.99), below Timeshifter ($9.99+). Premium perception without requiring justification for a healthcare professional making $60K–$200K+.

**Unit Economics (Conservative):**
- Blended ARPU: $5.50/month (mix of monthly, annual, lifetime)
- Gross margin: ~70% after Apple's 30% cut
- LTV at 18-month average retention: ~$99
- CAC target: <$10 organic, <$25 paid

### 7.2 B2B Enterprise Licensing (Phase 3)

**Target Customers:** Hospital systems, EMS agencies, fire departments, airline carriers, manufacturing companies with rotating shifts

**Pricing Model:**

| Tier | Seats | Price/Seat/Month | Annual Value |
|------|-------|-----------------|-------------|
| Pilot (free) | 50–100 | $0 | $0 (90-day pilot) |
| Small Team | 50–249 | $15/seat | $9,000–$44,820/yr |
| Mid-Market | 250–999 | $10/seat | $30,000–$119,880/yr |
| Enterprise | 1,000+ | $5/seat | $60,000+/yr |

**Minimum contract:** 50 seats, 12-month term

**Value proposition vs. consumer pricing:** Enterprise pricing represents a 75–85% discount to the consumer annual plan, justified by volume and the employer benefit framing (employers pay, not individual workers).

**ACV Range:** $9,000–$500,000+ depending on organization size

### 7.3 Revenue Mix Projection

| Year | B2C MRR | B2B ARR | Total ARR |
|------|---------|---------|----------|
| Year 1 | $2,500 | $0 | $30,000 |
| Year 2 | $12,000 | $50,000 | $194,000 |
| Year 3 | $50,000 | $300,000 | $900,000 |
| Year 4 | $150,000 | $800,000 | $2.6M |
| Year 5 | $350,000 | $1.8M | $6M |

*Moderate scenario. Conservative scenario applies 50% haircut.*

---

## 8. Go-to-Market Strategy

### 8.1 Phase 1: Beachhead — Healthcare Workers (Months 1–6)

**Goal:** Establish undeniable product-market fit with nurses and ED physicians before spending on acquisition.

**Channels:**
- Personal network (ED colleagues, nurses, residents at TGH/HCA Tampa)
- Reddit: r/nursing, r/residency, r/medicine, r/nightshift, r/ems
- Medical podcasts: EM:RAP, EMCrit, Taming the SRU, Nursing Uncharted
- Product Hunt launch (Tuesday–Thursday for max visibility)
- App Store SEO optimization ("shift work sleep," "circadian schedule," "nurse sleep app")

**Tactics:**
- "Doctor who built this for himself" — genuine founder story, not manufactured marketing
- Share real sleep plans generated from real nurse schedules (with consent)
- Respond to every App Store review for the first 6 months
- Guest post in Minority Nurse, NurseJournal, American Journal of Nursing

**Metrics:**
- 1,000 downloads by Month 3
- 4.5+ App Store rating
- 200+ active users
- 60+ organic 5-star reviews

### 8.2 Phase 2: Expand — All Shift Workers (Months 6–12)

**Goal:** Expand from healthcare to all shift worker verticals.

**Channels:**
- TikTok/Reels: "Night shift nurse tries the app her doctor built" format
- Instagram: before/after sleep data screenshots, circadian fact posts
- Facebook groups: Night Shift Nurses (300K+), Shift Work Life, EMS communities
- Google UAC (Universal App Campaigns)
- Apple Search Ads

**Expansion verticals in priority order:**
1. Paramedics / EMS
2. Firefighters (union channel — 1 corporate sale reaches entire department)
3. Airline crew (FAA compliance angle)
4. Factory / manufacturing (union contract channel)

### 8.3 Phase 3: Enterprise (Months 9–18)

**Goal:** Land first 3 paid enterprise contracts with measurable outcome data.

**Sales approach:**
- Start at Sim's own ED — pitch to the medical director, nursing director, and quality officer
- Use first pilot data as the case study for all subsequent sales
- Target: hospital HR/benefits directors and Chief Nursing Officers
- Angle: not "wellness app" (optional, cuttable) but "fatigue risk management" (regulatory, non-negotiable)

**Enterprise sales channels:**
- Direct outreach to hospital HR/Benefits directors at HCA, Tenet, Community Health Systems
- Worker's comp insurance broker channel (insurers reduce premiums = self-sell)
- EMS/Fire chief conferences (NAEMSP, NAEMS, IAFF)
- Hospital quality conference presentations (ASHP, ANA, AONE)

### 8.4 Why the "Physician-Founder" Story Closes Deals

In consumer health, "doctor-built" is a marketing claim. For shift workers, it is a verification signal:

- A nurse who sees an ED physician built this knows the algorithm is clinically grounded
- A hospital administrator who sees a physician-founder feels protected from liability claims about bad advice
- A medical journalist who covers the story gets a compelling "doctor who codes" angle
- An institutional investor recognizes physician-founders have intrinsic domain credibility competitors cannot buy

The story: "I work night shifts in an emergency department. I spent years Googling when to sleep. The science existed. Nobody connected it to my calendar. So I built ShiftWell." This is not a marketing pitch — it is a true story that happens to be the best possible marketing.

---

## 9. Financial Projections

### 9.1 Startup Costs (Year 1)

| Category | Cost |
|----------|------|
| LLC Formation (FL) | $125 |
| EIN | $0 |
| Apple Developer Program | $99/yr |
| Domain + hosting | $50/yr |
| Trademark (Class 9 + 44) | $500–$700 |
| RevenueCat | $0 (free to $2.5K MTR) |
| Supabase (v1.1+) | $0–$25/mo |
| **Total Year 1 costs** | **~$800–$1,100** |

### 9.2 Monthly Operating Costs

| Item | v1 (No Backend) | v1.4 (Backend) | Funded |
|------|-----------------|----------------|--------|
| Apple Developer | $8/mo | $8/mo | $8/mo |
| Domain + email | $4/mo | $4/mo | $4/mo |
| Supabase | $0 | $0–$25/mo | $25/mo |
| RevenueCat | $0 | $0 | $0 |
| Claude API (AI features) | $0 | ~$0.40/user/mo | Scales |
| **Total** | **$12/mo** | **$12–$37/mo** | **$40+/mo** |

### 9.3 Revenue Projections — 5-Year Model

#### Conservative Scenario
*Assumes slower organic growth, no paid acquisition, no B2B in Year 1*

| Year | Active Users | Premium Subscribers | Conversion | MRR | B2B ARR | Total ARR |
|------|-------------|---------------------|-----------|-----|---------|----------|
| 1 | 3,000 | 234 | 7.8% | $1,300 | $0 | $15,600 |
| 2 | 10,000 | 780 | 7.8% | $4,300 | $20,000 | $71,600 |
| 3 | 25,000 | 1,950 | 7.8% | $10,700 | $100,000 | $228,400 |
| 4 | 60,000 | 4,680 | 7.8% | $25,700 | $300,000 | $608,400 |
| 5 | 120,000 | 9,360 | 7.8% | $51,500 | $700,000 | $1.32M |

#### Moderate Scenario
*Assumes modest paid acquisition ($2K/mo from Month 6), 1 enterprise deal in Year 2*

| Year | Active Users | Premium Subscribers | Conversion | MRR | B2B ARR | Total ARR |
|------|-------------|---------------------|-----------|-----|---------|----------|
| 1 | 8,000 | 624 | 7.8% | $3,430 | $0 | $41,160 |
| 2 | 30,000 | 2,340 | 7.8% | $12,870 | $50,000 | $204,440 |
| 3 | 75,000 | 5,850 | 7.8% | $32,175 | $250,000 | $636,100 |
| 4 | 180,000 | 14,040 | 7.8% | $77,220 | $800,000 | $1.73M |
| 5 | 400,000 | 31,200 | 7.8% | $171,600 | $1.8M | $3.86M |

#### Aggressive Scenario
*Assumes $20K–$50K/mo paid acquisition from Month 9, 3+ enterprise deals Year 2, strategic partnership*

| Year | Active Users | Premium | MRR | B2B ARR | Total ARR |
|------|-------------|---------|-----|---------|----------|
| 1 | 20,000 | 1,560 | $8,580 | $0 | $103K |
| 2 | 100,000 | 7,800 | $42,900 | $200K | $715K |
| 3 | 300,000 | 23,400 | $128,700 | $1M | $2.54M |
| 4 | 750,000 | 58,500 | $321,750 | $3M | $6.86M |
| 5 | 1,500,000 | 117,000 | $643,500 | $8M | $15.7M |

### 9.4 Break-Even Analysis

- Monthly costs (v1): ~$12/mo
- Break-even: **2 premium subscribers** at $6.99/mo
- Profitable at launch with minimal user base

### 9.5 Unit Economics

| Metric | Conservative | Moderate |
|--------|-------------|---------|
| CAC (organic) | $0 | $0 |
| CAC (paid, Apple Search Ads) | $8–$12 | $8–$12 |
| CAC (paid, Facebook/TikTok) | $15–$25 | $15–$25 |
| Blended ARPU/month | $5.50 | $5.50 |
| Gross margin (post-Apple cut) | 70% | 70% |
| LTV (18-month retention assumption) | ~$99 | ~$99 |
| LTV/CAC ratio (paid) | 4–12x | 4–12x |

---

## 10. Team & Advisory

### 10.1 Founder

**Dr. Gursimran Singh, DO** — Founder, CEO, Lead Developer
- Emergency Medicine Physician, HCA Healthcare, Tampa FL
- Solo technical founder: React Native, TypeScript, iOS
- Uniquely positioned as both domain expert (works rotating shifts) and product builder
- Lived experience of the exact problem ShiftWell solves

**Why the solo technical founder is an advantage here:**
- Zero miscommunication between clinical insight and technical execution
- Complete ownership of the algorithm and its scientific basis
- No equity dilution before product-market fit
- Physician income provides runway without external funding dependency

### 10.2 Advisory Board Needs

To scale into enterprise and institutional channels, the following advisors are needed:

| Role | Purpose | Target Profile |
|------|---------|---------------|
| **Chief Nursing Officer (retired/emeritus)** | Enterprise hospital sales credibility | Former CNO at HCA, Tenet, or regional health system |
| **Occupational Health Physician** | Clinical credibility for OSHA/compliance positioning | Academic or occupational med faculty |
| **Healthcare Technology Attorney** | HIPAA, SOC2, BAA structuring, trademark | Healthcare-focused IP/tech counsel |
| **mHealth Investor** | Fundraising networks, term sheet guidance | Partner-level at a16z bio, Rock Health, or similar |
| **B2B Healthcare Sales (enterprise)** | Cold outreach playbook, hospital purchasing process | Former VP Sales at athenahealth, Epic, or similar |

### 10.3 Hiring Plan (Funded Scenario)

| Hire | Timing | Role | Budget |
|------|--------|------|--------|
| Part-time React Native developer | $5K MRR | HealthKit, widgets, enterprise dashboard | $3K–$5K/mo |
| Part-time designer | $3K MRR | UI polish, marketing assets | $2K–$3K/mo |
| Part-time marketing contractor | $5K MRR | Content, social, App Store ASO | $2K–$3K/mo |
| First FTE (enterprise sales) | Seed round | Hospital/EMS outreach, pilot coordination | $80K–$100K/yr |

---

## 11. Funding Roadmap

### 11.1 Stage 0: Bootstrap (Current)

**Status:** Self-funded by founder
**Milestone to exit this stage:** App Store live, 500+ active users, first revenue ($500+ MRR)
**Cost:** ~$1,100 Year 1 operating expenses
**Funded by:** Physician income; no external capital needed at this stage

### 11.2 Stage 1: Pre-Seed ($300K–$500K)

**Trigger:** 1,000+ active users, strong App Store reviews, or first enterprise inbound
**Use of funds:**
- 12 months founder compensation (if transitioning to part-time clinical work)
- Enterprise pilot infrastructure (employer dashboard, compliance docs, SOC2 Type I)
- Paid user acquisition testing ($5K–$10K/mo)
- Part-time developer for enterprise features
- Advisory equity

**Investor targets:** Rock Health, a16z bio, First Round Capital, angel physicians/nurses with exit experience

**Valuation basis:** $2M–$4M pre-money, based on team quality, market size, and early traction

### 11.3 Stage 2: Seed ($1.5M–$3M)

**Trigger:** $10K+ MRR B2C, 2+ enterprise contracts, pilot outcome data
**Use of funds:**
- Full-time founding team (CTO or senior developer, VP Enterprise Sales)
- Aggressive B2C paid acquisition ($20K–$50K/mo)
- SOC2 Type II certification (~$30K–$50K)
- Partnership infrastructure (Kronos, QGenda API integrations)
- Publication of first enterprise outcome study

**Investor targets:** Rock Health, Andreessen Horowitz Bio, UCSF/hospital-system strategic investors, health insurance company venture arms

### 11.4 Alternative: Stay Bootstrapped

Given physician income as backstop and minimal operating costs, ShiftWell can operate profitably as a bootstrapped business at any revenue level above $200/mo. The B2B play requires dedicated sales resources that benefit from funding, but a well-executed bootstrap path reaching $10K+ MRR is achievable within 18–24 months without dilution.

**Bootstrap decision gate:** If Year 1 ends with >$5K MRR purely organically, the bootstrap path to $50K+ MRR is highly viable.

---

## 12. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Low adoption** | Medium | High | Free launch, physician-founder story, beachhead in personal network |
| **Algorithm gives poor recommendations** | Low | High | 618+ tests, beta testing with real shift workers, conservative defaults, clear disclaimers |
| **Timeshifter adds calendar sync** | Low | High | Ship fast, build community, differentiate on breadth (5 protocols, HealthKit, enterprise) |
| **Apple dependency risk** | Medium | High | v1 is App Store only; mitigate by building web presence and email list early |
| **App Store rejection** | Low | Medium | Follow health app guidelines, no medical claims, test on device |
| **Low premium conversion** | Medium | Medium | Break-even at 2 subscribers; $12/mo costs are trivially low |
| **Regulatory creep (FDA)** | Low | High | Stay in "general wellness" category; avoid diagnostic or treatment claims |
| **HIPAA scope expansion** | Low | Medium | v1 stores nothing server-side; Phase 3 builds HIPAA-aware architecture with counsel |
| **Burnout (solo physician-founder)** | Medium | High | Cap app time at 10hrs/week; physician income backstop; hire at $5K MRR |
| **Enterprise sales cycle too long** | Medium | Medium | Bootstrap B2C first; enterprise is Phase 3 upside, not Phase 1 dependency |
| **Privacy incident** | Very Low | High | v1 all-local, no PHI; design v1.4 backend for HIPAA-awareness from day one |

---

## 13. Milestones & KPIs

### 13.1 Launch Milestones

| Milestone | Target | Success Criteria |
|-----------|--------|-----------------|
| TestFlight beta | Month 0 | 20+ testers, core loop works without crashes |
| App Store launch | Month 1 | Live on store, <1% crash rate |
| 500 downloads | Month 2 | Organic, personal network, Reddit |
| 4.5+ App Store rating | Month 3 | 20+ reviews, mostly 5-star |
| 1,000 active users | Month 3 | 30-day retention >30% |
| $500 MRR | Month 6–8 | ~100 premium subscribers |
| First media mention | Month 4–6 | Podcast, medical publication, or press |
| $2,500 MRR | Month 12 | ~500 premium subscribers |
| First enterprise conversation | Month 8–10 | Warm intro to HR/benefits or CNO |
| First enterprise pilot | Month 12–15 | 50+ seat 90-day free pilot with outcome tracking |
| $10K MRR | Month 18–24 | Evaluate full-time transition |

### 13.2 Weekly KPIs

- Downloads (App Store Connect)
- Active users (7-day and 30-day)
- Retention (Day 1, Day 7, Day 30)
- Plan generation rate (% of users who generate a sleep plan)
- Export rate (% of users who export to calendar)
- Crash-free rate (EAS/Sentry)

### 13.3 Monthly KPIs

- MRR and MoM growth rate
- Free-to-premium conversion rate (target: >7%)
- Churn rate (target: <5%/mo)
- App Store rating (target: 4.5+)
- LTV/CAC ratio
- Net Promoter Score (NPS)

### 13.4 Decision Gates

| Question | Signal | Action |
|----------|--------|--------|
| Add a backend? | >500 users requesting sync | Build Supabase auth/sync (Phase 2) |
| Start paid acquisition? | Organic growth plateaus, retention strong | Apple Search Ads $200–$500/mo |
| Pursue enterprise? | 3+ inbound inquiries from organizations | Build employer dashboard (v1.4) |
| Raise pre-seed? | 1,000+ active users, compelling story | Begin investor conversations |
| Hire first FTE? | $10K+ MRR, 3+ months sustained | Part-time developer or enterprise sales |
| Go full-time? | $10K+ MRR for 3 consecutive months | Evaluate against clinical income |
| Raise seed? | $20K+ MRR + enterprise traction | Engage Rock Health, a16z bio |

---

## Immediate Next Actions

1. [ ] Form LLC in Florida via Sunbiz.org ($125)
2. [ ] Get EIN via irs.gov (free, 10 minutes)
3. [ ] Apply for D-U-N-S number (free, 5 business days)
4. [ ] Enroll in Apple Developer Program ($99, requires D-U-N-S)
5. [ ] Generate app icon and screenshots
6. [ ] Recruit 10–20 TestFlight beta testers from ED network
7. [ ] Register domain (shiftwell.app or getshiftwell.com)
8. [ ] Set up landing page with email waitlist capture

---

*ShiftWell Business Plan v2.0 — April 2026*
*Built by an ED physician. Validated by 618+ tests. Backed by 15+ peer-reviewed publications.*
