# ShiftWell Competitive Response Plan

> **Trigger:** Timeshifter closed $1.8M (total $5.3M) on April 15, 2026 and publicly pivoted into shift work + healthcare.
> **Author:** Claude (Chief of Staff) for Dr. Gursimran Singh, DO
> **Date:** April 21, 2026
> **Classification:** Internal — strategic planning document

---

## Executive Summary

Timeshifter's pivot from jet lag into shift work is a direct collision with ShiftWell. They have $5.3M in funding, Skip Capital (Atlassian co-founder) backing, Harvard science branding, existing B2B contracts in energy/logistics/transportation, and a shipping product on both iOS and Android.

ShiftWell has something they can never buy: a physician who works night shifts and built this from the inside. But that advantage is worthless if the app isn't in testers' hands. The honest assessment: ShiftWell is 6-8 weeks from TestFlight due to LLC → Apple Developer → D-U-N-S gates, with a well-tested codebase (1,059 tests, 71 suites) that's ~70% product-complete.

This plan prioritizes getting a closed beta into hands within 2 weeks of Apple Developer enrollment, while building the competitive narrative now.

---

## 1. The Moat — What Timeshifter CAN'T Do That ShiftWell CAN

### 1.1 Physician-Built, Not Investor-Built

Timeshifter was founded by a circadian scientist and a tech entrepreneur. Their shift work product is an extension of a jet lag app — built from the outside looking in. ShiftWell was built by an emergency medicine physician who rotates between day and night shifts at HCA Florida Trinity Hospital. Every feature maps to a real workflow problem Sim has lived through.

**Why this matters for healthcare buyers:** Hospital systems evaluating circadian tools want clinical credibility. A physician-designed product carries automatic trust that a "Harvard-backed" jet lag app pivoting into healthcare cannot match. Residency program directors especially respond to "one of us built this."

### 1.2 Features Timeshifter Doesn't Have

| ShiftWell Feature | Timeshifter Equivalent | Advantage |
|---|---|---|
| **Circadian Reset (3-Phase)** — Pre-Adapt → Sleep Bank → Reset Protocol that anticipates schedule changes and automates prepare → endure → recover | Manual shift plans, no predictive adaptation | ShiftWell is the ONLY app that anticipates upcoming schedule changes and pre-adapts. Timeshifter's plans are reactive. |
| **Calendar Sync + Auto Sleep Scheduling** — Reads work/life calendar, writes sleep blocks back as events | Manual schedule entry | Nobody else reads AND writes to calendar. This is the killer UX advantage. |
| **Night Sky Mode** — App transforms at bedtime with minimal UI, fireflies, critical info only | Standard dark mode | Zero competitors change the entire UI based on time of day. Reduces screen stimulation when it matters most. |
| **Adaptive Brain (14-night ledger)** — Sleep debt tracking with stress scoring, pre-adaptation warnings, Apple Watch recovery correction | Unknown (likely static recommendations) | ShiftWell's algorithm learns from YOUR data over 14 nights. Timeshifter provides generic circadian advice per shift type. |
| **Household Mode** — "Alex is recovering from nights, keep it quiet until 3pm" partner notifications | Nothing | Zero sleep apps consider the household. Night shift recovery is a household problem. |
| **AM/PM Routine Builder** — Captures shower, breakfast, kids, commute, wind-down to calculate true wake/bed times | Nothing | No sleep app factors in morning logistics. ShiftWell plans around your real life, not an idealized schedule. |
| **Dynamic Rescheduling** — Calendar change → sleep plan auto-updates → user notified why | Static plans | Every Timeshifter plan is generated once. ShiftWell's plans are living documents. |

### 1.3 Scientific Foundation ShiftWell Already Has

The algorithm traces to 15+ published sources: Two-Process Model (Borbély 1982), AASM Guidelines (2015/2023), Eastman & Burgess circadian shifting, Czeisler bright light protocols, Drake SWSD prevalence data, AHA Scientific Statement (2025) on circadian disruption, NIOSH CDC anchor sleep, and more. This isn't "Harvard-backed" as a marketing phrase — it's cited, verifiable science with a scientific audit grading the algorithm B+.

### 1.4 The Emotional Moat

Timeshifter's pitch: "Science-based guidance developed by world-renowned circadian scientists."
ShiftWell's pitch: "Built by a physician who works the same shifts you do."

The second one wins in healthcare every time. Nurses, residents, and attendings trust colleagues over consultants.

---

## 2. Ship-Blocking Issues — Every Blocker Preventing TestFlight Beta

### 2.1 External Gates (Cannot Be Parallelized Away)

| # | Blocker | Effort | Timeline | Status |
|---|---------|--------|----------|--------|
| 1 | **LLC filing** — Must decide: Circadian Labs vs Vigil Health | 1-2 hours to file + $125 | 1-5 business days for FL approval | NOT STARTED |
| 2 | **D-U-N-S number** — Required for Apple Developer enrollment as organization | 0 effort (request after LLC) | ~5 business days after LLC | BLOCKED by #1 |
| 3 | **Apple Developer enrollment** — $99/year, requires LLC + D-U-N-S | 30 min to apply | 24-48 hours after D-U-N-S | BLOCKED by #2 |
| 4 | **EAS credentials** — `appleId`, `ascAppId`, `appleTeamId` in eas.json are empty placeholders | 15 min after enrollment | Immediate after #3 | BLOCKED by #3 |

**Minimum timeline to TestFlight capability: ~2 weeks from today if LLC filed this week.**

### 2.2 Critical Code Blockers (Ship-Killers)

| # | Blocker | File | Effort | Risk |
|---|---------|------|--------|------|
| 5 | **Claude API key exposed in client code** | `src/lib/ai/claude-client.ts:121-123` | 2-4 hours (move to Supabase Edge Function proxy) | CRITICAL — App Store rejection, security vulnerability |
| 6 | **Dev onboarding bypass left in production path** | `app/index.tsx:68-70` | 5 min (remove 3 lines + TODO comment) | CRITICAL — Testers skip onboarding, app appears broken |
| 7 | **Google Sign-In client ID is `PLACEHOLDER_CLIENT_ID`** | `app.json` | Disable Google Sign-In for beta OR get real client ID | HIGH — Crash if user taps Google Sign-In |
| 8 | **Sentry org slug is `YOUR_ORG_SLUG`** | Config | 10 min (create Sentry project, paste slug) | MEDIUM — No crash reporting in beta |
| 9 | **RevenueCat API key is placeholder** | `.env.example` | 15 min (create RevenueCat project, paste key) | HIGH — Premium features won't gate properly |
| 10 | **6 npm vulnerabilities** (1 critical: node-forge) | `package-lock.json` | 15 min (`npm audit fix`) | MEDIUM — App Store review may flag |

### 2.3 Missing User-Facing Features (Beta Tester Friction)

| # | Issue | Effort | Beta Impact |
|---|-------|--------|-------------|
| 11 | **No password reset flow** — No screen, no email link handler | 4-6 hours | HIGH — Any tester who forgets password is locked out |
| 12 | **No email confirmation UI** — After signup, user gets email but no in-app guidance | 1-2 hours | MEDIUM — Confused testers |
| 13 | **Fast-path onboarding not built** — 3-screen version flagged as P0 but screens don't exist | 6-8 hours | LOW for beta (full onboarding works) |
| 14 | **Theme selector not wired** — 4 themes coded but no picker exposed | 2-3 hours | LOW — Midnight theme works fine for beta |
| 15 | **ICS import button not exposed in main UI** — Route exists, no button | 30 min | MEDIUM — Key feature hidden |
| 16 | **Recovery score shows unexplained Apple Watch correction** | 1 hour (add tooltip) | LOW — Cosmetic confusion |

### 2.4 Design/Polish (Can Ship Without)

| # | Issue | Effort |
|---|-------|--------|
| 17 | App icon is placeholder — need custom 1024x1024 PNG | 2-4 hours (design + export) |
| 18 | App Store screenshots — 6 needed at 1290×2796 | 2-3 hours |
| 19 | Logo tournament not started (5 design lanes planned) | 4-6 hours |
| 20 | Website has placeholder testimonials + "halluccinates" typo | 1-2 hours |

---

## 3. Two-Week Sprint Plan — Closed Beta in Hands

**Premise:** LLC filed by end of day April 21. Apple Developer enrollment expected ~May 5. This sprint prepares everything so the EAS build ships the day enrollment clears.

### Week 1 (April 21-27): Kill Ship-Blockers

| Day | Task | Owner | Hours |
|-----|------|-------|-------|
| Mon 4/21 | File LLC (recommendation: **Circadian Labs** — cleaner for healthcare B2B, implies science without limiting to one app) | Sim | 1h |
| Mon 4/21 | Remove dev onboarding bypass (`app/index.tsx:68-70`) | Sim/Claude | 5 min |
| Mon 4/21 | Disable Google Sign-In button in UI (keep Apple + Email only for beta) | Sim/Claude | 30 min |
| Tue 4/22 | Move Claude API key to Supabase Edge Function proxy | Claude Code | 3h |
| Tue 4/22 | Run `npm audit fix`, resolve 6 vulnerabilities | Claude Code | 30 min |
| Wed 4/23 | Create Sentry project, wire real org slug | Sim | 15 min |
| Wed 4/23 | Create RevenueCat project, wire real API key (sandbox mode for beta) | Sim | 30 min |
| Wed 4/23 | Build password reset screen + Supabase email link handler | Claude Code | 4h |
| Thu 4/24 | Build email confirmation waiting screen post-signup | Claude Code | 2h |
| Thu 4/24 | Expose ICS import button in Schedule tab header | Claude Code | 30 min |
| Thu 4/24 | Add tooltip explaining Apple Watch recovery correction | Claude Code | 1h |
| Fri 4/25 | Run full test suite — confirm 1,059+ still pass | Claude Code | 30 min |
| Fri 4/25 | Design app icon (leverage Lumi reference, dark theme, circadian motif) | Claude Design | 3h |
| Sat-Sun | Buffer / bug fixes from testing | — | — |

### Week 2 (April 28 - May 4): Polish + Build Prep

| Day | Task | Owner | Hours |
|-----|------|-------|-------|
| Mon 4/28 | Request D-U-N-S number (should be ~5 days post-LLC) | Sim | 15 min |
| Mon 4/28 | Capture 6 App Store screenshots from iOS Simulator with seed data | Claude Code | 2h |
| Tue 4/29 | Sharpen App Store listing copy (physician angle, not generic wellness) | Claude/Sim | 2h |
| Tue 4/29 | Finalize privacy policy + health disclaimers for App Store | Claude | 2h |
| Wed 4/30 | Full device QA on physical iPhone — onboarding flow, plan generation, calendar export, HealthKit read | Sim | 3h |
| Thu 5/1 | Fix any device-specific bugs found in QA | Claude Code | 4h |
| Fri 5/2 | Populate `eas.json` with real credentials (if Apple Developer clears) | Sim | 15 min |
| Fri 5/2 | `eas build --platform ios --profile preview` — first real build | Sim/Claude | 1h |
| Sat-Sun | Internal TestFlight testing (Sim + Jess) | Sim | — |

### Week 2+ (May 5-7): Beta Launch

| Day | Task |
|-----|------|
| Mon 5/5 | Fix any TestFlight build issues |
| Tue 5/6 | Invite 10-15 closed beta testers (ED colleagues, residents, nurses) |
| Wed 5/7 | Post "beta is live" on social channels with physician-built angle |

### What's Explicitly Cut From This Sprint

These are real features that don't make the beta cut:

- Fast-path onboarding (full 6-screen flow works fine)
- Theme selector (Midnight theme is the best one anyway)
- Light mode
- Google Sign-In (Apple + Email is sufficient)
- Logo tournament (use a strong interim icon)
- Website revamp (beta testers get TestFlight link, not website)
- Dynamic Island / Live Activities (requires Apple Developer + more dev)
- Apple Watch app
- Android build
- B2B dashboard

---

## 4. Competitive Positioning — Messaging That Wins

### 4.1 App Store Listing (Physician-First Angle)

**Title:** ShiftWell — Shift Worker Sleep

**Subtitle:** Built by an ER doctor who works nights

**Description (first 3 lines — visible before "more"):**
> ShiftWell is the only sleep app designed by a physician who actually works rotating shifts. Not another wellness app that added a "night shift" toggle — a purpose-built circadian optimization system grounded in peer-reviewed science.
>
> Your shift schedule drives everything: when to sleep, when to nap, when to stop caffeine, when to seek or avoid light, and how to transition between day and night rotations without wrecking your body.

**Keywords:** shift work sleep, night shift health, circadian rhythm, nurse sleep, doctor sleep schedule, rotating shift, SWSD, shift work disorder, night shift tips, healthcare worker sleep

### 4.2 Landing Page Hero

**Headline:** Stop guessing when to sleep.

**Subheadline:** The first circadian optimization app built by a night-shift ER physician. Science-backed plans that adapt to your actual schedule — not a jet lag app that added shift work as an afterthought.

**Three stat callouts (all cited):**
- 1 in 3 shift workers has Shift Work Sleep Disorder (Drake et al., 2004)
- 23% of sentinel events linked to fatigue (Joint Commission)
- $136.4B annual cost of fatigue in the US workforce (NSC)

### 4.3 Social Media Launch Posts

**LinkedIn (physician network):**
> I'm an ER physician. I work days, nights, and everything in between. Every "sleep app" told me to go to bed at 10pm. None of them understood my life.
>
> So I built one that does.
>
> ShiftWell reads your shift schedule and generates a science-backed circadian plan — sleep windows, nap timing, caffeine cutoffs, light exposure protocols — that adapts when your schedule changes.
>
> Beta launching soon. If you're a healthcare worker who rotates shifts, I'd love your feedback.
>
> #ShiftWork #EmergencyMedicine #CircadianHealth

**Twitter/X (broader reach):**
> Timeshifter just raised $5.3M to pivot from jet lag into shift work.
>
> I'm an ER doctor who's been building a shift work sleep app for months — from the inside.
>
> The difference? They hired scientists. I AM the use case.
>
> Beta soon. DM if you want early access.

### 4.4 Key Differentiator Phrases (Use Everywhere)

- "Built from the inside, not the outside"
- "Physician-designed, not investor-designed"
- "Your schedule drives the plan — not a generic chronotype quiz"
- "The only sleep app that reads AND writes to your calendar"
- "Not a jet lag app that added shift work as a feature"

---

## 5. iOS 26.4 HealthKit Audit — Sleep/Vitals Integration Opportunities

### 5.1 What's New in iOS 26.4

| New Data | HealthKit Type | ShiftWell Relevance |
|----------|---------------|---------------------|
| **Average Bedtime** (2-week rolling) | New metric in Sleep category | HIGH — Direct input to Adaptive Brain. Compare user's actual average bedtime vs. ShiftWell's recommended bedtime to measure plan adherence without manual logging. |
| **Blood Oxygen restored to Vitals graph** | `HKQuantityTypeIdentifierOxygenSaturation` (existing, now re-surfaced) | MEDIUM — SpO2 dips during sleep correlate with sleep apnea. ShiftWell can flag "your blood oxygen dropped below 90% on 3 nights this week — consider discussing with your doctor" as a safety feature. |
| **5-metric Vitals overview** | Heart rate, respiratory rate, wrist temp, blood oxygen, sleep duration — all in one graph | LOW (Apple's own UI) — But ShiftWell can read all 5 and compute a composite "shift recovery readiness" score that's more meaningful than any single metric. |

### 5.2 Integration Recommendations (Priority Order)

1. **Average Bedtime comparison** (P0 for v1.2) — Read the 2-week average bedtime from HealthKit. Display "Your average bedtime: 11:42 PM / ShiftWell recommended: 11:00 PM / Drift: +42 min." This is a sticky feature — users check it daily.

2. **Blood Oxygen flagging** (P1 for v1.2) — Read SpO2 data during sleep windows. If 3+ nights show dips below 90%, surface a non-diagnostic alert: "Your blood oxygen has been lower than typical during sleep. This can happen with shift work fatigue, but if it persists, mention it to your doctor." Physician-built credibility makes this medical-adjacent feature feel trustworthy rather than alarming.

3. **Composite Recovery Score v2** (P2) — Current recovery score uses sleep stages + Apple Watch correction. Adding respiratory rate variability + wrist temperature deviation + SpO2 creates a multi-signal recovery metric that's more robust than any single HealthKit reading. This is the "WHOOP for shift workers" play.

### 5.3 Implementation Notes

ShiftWell already has `@kingstinct/react-native-healthkit` integrated and reading sleep history. The authorization flow requests `HKCategoryTypeIdentifierSleepAnalysis`. To read the new fields:

- Add `HKQuantityTypeIdentifierOxygenSaturation` to the read permissions array in the HealthKit authorization request
- Add `HKQuantityTypeIdentifierRespiratoryRate` and `HKQuantityTypeIdentifierAppleWalkingSteadiness` for future composite score
- Average Bedtime may require reading raw `inBed` samples and computing the 14-night average client-side (Apple's average bedtime calculation isn't directly exposed as a writable HealthKit type yet — verify against iOS 26.4 SDK docs)

**Effort:** 4-6 hours to add SpO2 + respiratory rate reads. 2-3 hours for average bedtime derivation. Not in the 2-week sprint — queue for v1.2.

---

## 6. B2B2C Strategy — Healthcare Distribution Before Timeshifter Locks It Up

### 6.1 Why B2B2C Matters Now

Timeshifter's press release explicitly states they're "being made available by employers across industries, including in healthcare." They're selling to hospital systems. If they lock up 5-10 major health systems with enterprise contracts before ShiftWell launches, the distribution channel narrows significantly.

ShiftWell's advantage: Sim is already inside the healthcare system. He works at HCA Florida Trinity Hospital. He knows the buyers, the pain points, and the politics.

### 6.2 Phase 1: Residency Programs (Months 1-3 Post-Beta)

**Why residencies first:**
- Residents are the most sleep-deprived cohort in medicine (80-hour weeks, rotating schedules)
- Program directors are actively looking for wellness tools (ACGME wellness requirements)
- Small buyer (1 program director makes the decision), fast sales cycle
- Residents become attending physicians who bring the app with them — lifetime customer acquisition
- Perfect case study material for larger hospital sales

**Target list (start local, expand):**
1. HCA Florida Trinity Hospital — Emergency Medicine residency (Sim's home base)
2. USF Morsani College of Medicine — EM, Surgery, OB/GYN residencies (Tampa)
3. Bayfront Health St. Petersburg — EM residency
4. AdventHealth — Multiple FL residency programs
5. HCA national network — 60+ residency programs across the US

**Pitch to program directors:**
> "Your residents rotate between days and nights every 2-4 weeks. ACGME requires you to address wellness. I'm an ER physician who built an app that reads their rotation schedule and generates science-backed sleep plans. I'd like to pilot it with your program — free for 3 months — and measure the impact on reported sleep quality and fatigue scores."

**Pricing for residency programs:**
- Free pilot (3 months, up to 30 residents)
- Institutional license: $15/resident/month after pilot
- Includes anonymized aggregate fatigue dashboard for program director (future B2B feature)

### 6.3 Phase 2: Hospital Systems (Months 3-6)

**Why hospitals buy fatigue management tools:**
- Joint Commission Sentinel Event Alert #48: fatigue as a safety risk
- CMS Conditions of Participation reference staff fatigue
- Malpractice insurers increasingly want fatigue mitigation documentation
- Nurse retention: night shift turnover costs $40-60K per nurse to replace

**Target departments (highest pain, fastest adoption):**
1. Emergency departments (rotating shifts, highest acuity)
2. ICU/Critical care (12-hour shifts, day/night rotation)
3. Labor & Delivery (unpredictable hours + scheduled shifts)
4. OR/Anesthesiology (early mornings + call nights)
5. Hospital medicine/Nocturnists

**Pricing for hospital systems:**
- Department pilot: $10/user/month (minimum 50 users)
- Hospital-wide: $8/user/month (minimum 200 users)
- Health system: $6/user/month (minimum 1,000 users)
- All include: admin dashboard, anonymized fatigue scoring, ACGME/Joint Commission compliance reporting

### 6.4 Phase 3: Non-Healthcare Verticals (Months 6-12)

Once healthcare is proven, expand into:
- Fire/EMS departments (24/48 schedules)
- Law enforcement (rotating shifts)
- Airlines/aviation (already Timeshifter's turf — attack from healthcare credibility angle)
- Manufacturing/energy (Timeshifter is already here — deprioritize)

### 6.5 Timeshifter's B2B Weakness

Timeshifter sells B2B through a generic "employer wellness" pitch. Their healthcare positioning is "shift workers in healthcare" — lumping nurses in with factory workers and truck drivers.

ShiftWell can say: "Built by a physician, for physicians and nurses. We understand 12-hour ED shifts, Q3 call schedules, post-night recovery, and ACGME hour restrictions. This isn't a logistics app adapted for healthcare — it's a healthcare app."

### 6.6 Immediate Actions (This Week)

1. **Draft a 1-page PDF** for residency program directors (problem → solution → pilot offer → physician credibility)
2. **Email Sim's EM residency program director** at Trinity Hospital to propose a pilot
3. **Create a LinkedIn post** announcing the beta with a call for residency program partnerships
4. **Register for ACEP (American College of Emergency Physicians) 2026** — booth or poster submission for the ShiftWell pilot data

---

## 7. Timeline Summary

| Date | Milestone |
|------|-----------|
| April 21 | File LLC (Circadian Labs), remove dev bypass, start sprint |
| April 22-27 | Kill all critical code blockers, build password reset, fix vulnerabilities |
| April 28 | Request D-U-N-S, begin App Store asset prep |
| ~May 2 | D-U-N-S received, apply for Apple Developer enrollment |
| ~May 5 | Apple Developer enrollment clears, populate EAS credentials |
| May 5-6 | First EAS build → TestFlight → internal testing (Sim + Jess) |
| May 7-9 | Closed beta: 10-15 ED colleagues, residents, nurses |
| May 10+ | Collect feedback, iterate, prepare residency program pitch |
| June 2026 | Approach Trinity Hospital EM residency with pilot proposal |
| July 2026 | Expand beta, refine B2B pitch, target 2-3 more residency programs |

---

## 8. Honest Assessment

**Where Timeshifter beats us today:**
- Shipping product (iOS + Android) with real users ("thousands of shift workers")
- $5.3M funding vs $0
- Existing B2B contracts in energy, logistics, transportation
- Harvard science branding (perception matters)
- Full-time team vs solo physician-founder

**Where we beat them:**
- Physician credibility (they can never buy this)
- Healthcare-native positioning (they're pivoting in; we started here)
- Superior algorithm (3-phase Circadian Reset, dynamic rescheduling, calendar read/write — features they don't have)
- 1,059 passing tests (engineering quality is real)
- No VC pressure to chase revenue in the wrong verticals

**The race:** Timeshifter has a head start on shipping. ShiftWell has a head start on healthcare credibility. The next 90 days determine whether ShiftWell gets into healthcare hands before Timeshifter locks up distribution. File the LLC today.

---

Created: 2026-04-21
Last Reviewed: 2026-04-21
Last Edited: 2026-04-21
Review Notes: Initial creation. Synthesized from codebase audit (1,059 tests verified, 71 suites), Timeshifter funding announcement (PR Newswire April 15, 2026), iOS 26.4 HealthKit changes (9to5Mac, MacRumors), existing competitive edge log, and todo.md current state.
