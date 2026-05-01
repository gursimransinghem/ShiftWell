# ShiftWell Master Brief

> **Purpose:** Single source of truth for incoming research and analysis agents. Read this first. 3-minute orientation. Do not duplicate values found here — point to canonical sources.
>
> **Synthesized by:** Agent A4 from Agent A1 (Business), A2 (Product/Dev), A3 (Research) outputs.
> **Date:** 2026-05-01

---

## 1. ShiftWell at a Glance

- **What it is:** An Expo/React Native circadian sleep optimization app. Imports your work schedule, reads your personal calendar, and generates a science-backed personalized plan for sleep, naps, meals, light exposure, and caffeine timing — then exports that plan back to your calendar.
- **Who it's for:** Shift workers, primarily ICU/ED nurses and ER physicians (age 25-50, iOS-dominant). Secondary: EMS, fire. Tertiary: all shift workers. B2B target: hospital HR/CNOs.
- **What makes it different:** The closed-loop calendar system. No competitor does: Calendar → Algorithm → Sleep Plan → Calendar export → Adaptive feedback. The algorithm is deterministic, citable, and based on published sleep science — not LLM-generated wellness opinions.
- **Where it is:** Phase 1-3 complete. 1,059 tests passing (71 suites). Pre-TestFlight. External blockers: LLC not filed, Apple Developer enrollment pending, D-U-N-S ~5 weeks out.
- **Pricing (canonical — `src/lib/premium/pricing.ts`):** $9.99/mo · $49.99/yr · 30-day free trial. *(Business plan docs may show $6.99 — ignore those; pricing.ts is authoritative.)*

---

## 2. Value Proposition & Positioning

### Core Tagline
> "ShiftWell connects your work calendar to your body clock."

### Founder Positioning
> "Sleep science for shift workers, by a shift worker."

### The Closed-Loop System (Central Differentiator)
```
Work Calendar → Circadian Algorithm → Personalized Sleep/Nap/Meal/Light Plan → Calendar Export → Feedback Loop
```
No competitor has this full loop. Most stop at "here's your sleep score."

### Competitive One-Liners

| Competitor | ShiftWell Response |
|---|---|
| Timeshifter | "Timeshifter helps you recover from a flight. ShiftWell helps you live your whole life on rotation." |
| Rise | "Rise tells you how tired you are. ShiftWell tells you how to never be that tired again." |
| Arcashift | "Same science. Works." |

### Six Competitive Moats
1. **Physician founder trust** — ED physician credibility, practitioner-to-practitioner voice
2. **Deterministic algorithm** — citable, no hallucination risk, auditable
3. **Calendar integration structural moat** — real two-way calendar integration, not just reminders
4. **Published science as marketing** — citations are a feature, not a footnote
5. **Five circadian protocols** — breadth no single competitor matches
6. **Closed-loop feedback data moat** — gets better as user gives feedback; competitors don't learn

### Brand Voice Principles
- Science-first, not wellness-opinion
- Practitioner-to-practitioner (not patient-to-patient)
- Credibility through specificity (cite the study, name the protocol)
- Authentic founder narrative (ED physician who lives the problem)
- Tired-brain-friendly UI (low cognitive load, dark-mode-first)

---

## 3. Target Audience

### Primary
**ICU/ED nurses, age 25-50, iOS-dominant**
- Rotating 12-hour shifts, overnight call, unpredictable schedules
- High clinical trust bar — needs peer-level science credibility
- Acquisition channels: AACN, ENA, ANA partnerships; EM:RAP, EMCrit podcasts; ER network beta seeding

### Secondary
**EMS and fire shift workers**
- Similar schedule structure, high fatigue risk culture
- Less science-credibility-sensitive than nurses, more outcome-focused

### Tertiary
**All shift workers** — manufacturing, hospitality, transportation

### B2B Segment
**Hospital HR / Chief Nursing Officers (CNOs)**
- ROI framing: 500-nurse hospital = $13.8–20.7M in replacement cost savings
- Enterprise layer built but not yet exposed in UI
- Partnership targets: hospital systems, occupational health programs

---

## 4. Product State

### Built and Working
| Area | Status |
|---|---|
| Circadian algorithm (7 modules) | Complete — sleep windows, naps, caffeine, meals, light, energy/fatigue modeling |
| Calendar pipeline | Complete — ICS parse, shift detection, ICS export, Google Calendar API, plan-write-back, background sync |
| Supabase backend + RLS | Complete |
| HealthKit integration | Partial — sleep stages, HRV/RMSSD wired; score-store uses mocks |
| RevenueCat premium gating | Complete |
| PostHog analytics | Complete |
| Claude API weekly brief generator | Complete |
| Adaptive layer | Complete — recovery calculator, sleep debt, feedback, HRV modifier, autopilot |
| Push notifications | Complete — all plan block types |
| Enterprise layer | Built, not exposed in UI |
| Spanish i18n | Complete |
| Live Activities service | Complete |

### Not Built / Gaps
| Gap | Impact |
|---|---|
| Logo not finalized | Blocks App Store submission |
| Real HealthKit data wiring incomplete | Score-store still uses mocks |
| GradientMeshBackground not verified on real device | Visual regression risk |
| DND/Sleep Focus entitlements not tested on device | Feature correctness unknown |
| Website not live | Blocks pre-launch marketing |
| Fast-path onboarding (2-screen) not built | Conversion optimization blocked |
| Today-tab refactor needed (1,033 lines) | Maintainability risk |
| App Store screenshots blocked | Submission blocked |

### Key UX Flows
- **Onboarding:** 12-screen flow → auth → 7-tab main shell
- **Main navigation:** Today, Schedule, Circadian, Brief, Outcomes, Profile, Settings + modals (add-shift, import, paywall, downgrade, autopilot-log)
- **Premium gate:** RevenueCat paywall; 30-day trial before hard gate
- **Today screen:** Central daily plan view — needs refactor (1,033 lines)

---

## 5. Design System & Brand

### Visual Identity
| Token | Value |
|---|---|
| Background (deep space navy) | `#0B0D16` |
| Background mid | `#151A2A` |
| Background surface | `#1C2137` |
| Accent (warm gold) | `#C8A84B` |
| Interactive (purple) | `#7B61FF` |
| Typography | SF Pro |

### Design Philosophy
- **Dark-mode-first** — not an afterthought; optimized for use at 3am in a dark hospital room
- **GradientMeshBackground** — 3 animated orbs, space-like depth
- **Star-field welcome animation** — premium feel at first launch
- **Night Sky Mode** — fireflies + minimal UI at bedtime (reduces cognitive load)
- **AdaptiveColorProvider** — context-aware color shifts
- **Custom components:** FloatingTabBar, RechargeArc, LightProtocolArc visualizations

### Tech Stack (key dependencies)
Expo SDK ~55, React Native, TypeScript, Zustand, Supabase, react-native-reanimated, RevenueCat, PostHog, Sentry, Claude API, date-fns v4.

---

## 6. Existing Competitive Intelligence

Do not re-analyze what's already done. Point to these files:

| File | Coverage |
|---|---|
| `docs/research/RISE_CALM_DEEP_DIVE.md` | Rise Science and Calm: funding, revenue, onboarding, paywall, website, enterprise — deep profiles |
| `docs/business/COMPETITIVE_ANALYSIS.md` | Consolidated intel on 38 products across 5 segments |
| `docs/business/COMPETITIVE_EDGE_LOG.md` | 29 differentiators in 4 tiers; ShiftWell vs. field |
| `docs/research/COMPETITOR_ANALYSIS.md` | Additional competitor profiles |

**Already profiled at medium depth:** Timeshifter, Arcashift, SleepSync, and 8 direct competitors.

**App Store listing finalized** with 30-day trial language: `docs/launch/APP_STORE_LISTING.md`

---

## 7. Science Foundation

The algorithm is deterministic and citable. All claims trace to published research.

### Core Citations Available
| Citation | Relevance |
|---|---|
| Borbely (1982) Two-Process Model | Foundation of sleep pressure modeling |
| AASM Guidelines (2015/2023) | Sleep recommendation standards |
| Eastman & Burgess (2009) | Circadian shifting protocols |
| Czeisler et al. (1990) | Bright light phase shifting |
| Drake et al. (2004) | SWSD prevalence (10-38% night shift workers) |
| AHA Scientific Statement (2025) | Circadian disruption cardiovascular risk |
| NIOSH/CDC | Anchor sleep protocols |
| Gander et al. (2011) | Fatigue risk modeling |
| St. Hilaire et al. (2017) | Mathematical circadian modeling |
| Milner & Cote (2009) | Napping efficacy |
| Ruggiero & Redeker (2014) | Nap/shift work interventions |
| Drake et al. (2013) | Caffeine timing optimization |
| Manoogian et al. (2022) | Time-restricted eating |
| Chellappa et al. (2021) | Daytime eating in night work |

### Competitor Science Benchmark
SleepSync (Monash University RCT): 29 minutes more sleep, 80%+ satisfaction. This is the benchmark for evidence claims in the shift worker app space.

**Detailed science docs:** `docs/research/RECOVERY_ALGORITHM_SCIENCE.md`, `docs/research/SLEEP-SCIENCE-DATABASE.md`

---

## 8. Research Gaps — Questions for the Swarm

Agent A3 identified these as unknown. Phase 2 research agents should target these specifically:

### UX & Design
- [ ] **Science-first app design patterns:** How do Brain.fm, Levels Health, and Oura handle presenting complex science without overwhelming users?
- [ ] **Premium design-forward wellness apps:** What do Superhuman, Ritual, Seed, and Monument do in onboarding and paywall design that ShiftWell should emulate or avoid?
- [ ] **Paywall screen analysis:** Beyond Rise, what paywall patterns convert in wellness/health apps?
- [ ] **Widget strategy:** What widget approaches do sleep/wellness apps use, and what drives engagement?

### Competitive Intelligence
- [ ] **Onboarding flows:** No analysis exists for Timeshifter, Arcashift, or any direct competitor except Rise/Calm. What are their onboarding patterns?
- [ ] **Website analysis:** No analysis of Timeshifter, Arcashift, or direct competitor websites. What do they emphasize, what do they ignore?
- [ ] **ASO keyword rankings:** No actual competitor keyword ranking data. Which terms does Timeshifter rank for? Arcashift? Rise?
- [ ] **Reddit/community sentiment:** What are shift workers saying about existing apps (r/nursing, r/ems, r/firefighting)? What are the recurring complaints?

### Adjacent Spaces
- [ ] **CBT-I apps:** Sleepio, Somryst, Insomnia Coach — how do clinical sleep apps position and price? Any hospital/EAP distribution models worth understanding?
- [ ] **Occupational fatigue tools:** Aviation (FAID, SAFE), trucking (HOS compliance), military (AFRL 2B-Alert) — any UX or distribution patterns applicable to hospital shift work?
- [ ] **Scheduling system integrations:** QGenda, Kronos, UKG are used by hospital systems. What's the API surface? Any apps already integrating? This is the enterprise moat expansion path.

### GTM & Market
- [ ] **Hospital enterprise sales cycle:** What does the actual procurement path look like for a wellness app in a hospital system? Who signs, what do they need (HIPAA BAA, IRB, clinical evidence)?
- [ ] **EAP platform distribution:** Can ShiftWell get into Headspace for Work, Calm for Business, or equivalent EAP platforms? What are their intake criteria?

---

## 9. Key Decisions Pending

| Decision | Status | Impact |
|---|---|---|
| **LLC name** | Undecided (top picks: Circadian Labs, Vigil Health) | Blocks Apple Developer enrollment, App Store submission |
| **Apple Developer enrollment** | Pending LLC | Blocks TestFlight, App Store submission |
| **D-U-N-S number** | ~5 weeks | Blocks Apple Developer (enterprise) |
| **Logo finalization** | Not done | Blocks App Store screenshots, submission |
| **Pricing verification** | pricing.ts is canonical at $9.99/$49.99 — business docs show $6.99 (outdated) | Any new marketing copy must use pricing.ts values |
| **Website direction** | Single conversion-focused landing page planned, not yet live | Blocks pre-launch organic acquisition |
| **Fast-path onboarding** | 2-screen version not built | Conversion optimization blocked until built |
| **HealthKit real data wiring** | Score-store uses mocks | Feature accuracy incomplete for launch |

---

*Last updated: 2026-05-01 by Agent A4 (Master Brief synthesizer)*
*Source agents: A1 (Business Layer), A2 (Product/Dev Layer), A3 (Research Layer)*
*Next: Phase 2 competitive research swarm should load this file + target Section 8 gaps*
