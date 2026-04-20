# ShiftWell Algorithm Scientific Audit Report

**Auditor Role:** Chief Science Officer (Chronobiology)
**Date:** 2026-04-18
**Scope:** Complete review of the Sleep Schedule Brain (circadian algorithm + Adaptive Brain)
**Codebase Version:** 1,059 tests passing, 71 suites, pre-TestFlight

---

## Executive Summary

ShiftWell's algorithm is **remarkably well-grounded in sleep science** for an MVP-stage product. The Two-Process Model implementation is correct. The circadian transition protocols reference the right literature and implement reasonable approximations. The closed-loop feedback engine is mathematically sound with provable stability.

However, this audit identifies **7 critical gaps, 11 moderate concerns, and 5 areas of over-engineering** that should be addressed before shipping to real patients. The most urgent: the algorithm lacks a DLMO (Dim Light Melatonin Onset) estimation model, has no alcohol/medication interaction handling, and the recovery score has never been validated against subjective or objective outcomes in shift workers.

**Overall Grade: B+** — Strong scientific foundation, needs targeted hardening before clinical use.

---

## 1. Scientific Audit: Component-by-Component

### 1.1 Two-Process Model (energy-model.ts) — GRADE: A-

**What's implemented:**
- Process S (homeostatic sleep pressure): Exponential approach with tau = 18.2h
- Process C (circadian alertness): Cosine wave with 24.2h period, acrophase at ~16:00
- Secondary 12h harmonic for the post-lunch dip
- Sleep inertia ramp (50% → 100% over first hour post-wake)
- Caffeine pharmacokinetics (exponential decay with configurable half-life)
- Recovery modifier (linear scaling ±0.30)

**Scientific accuracy:**

The core model is faithfully implemented per Borbely (1982) and Daan, Beersma & Borbely (1984). Specific verification:

| Parameter | ShiftWell Value | Literature Value | Verdict |
|-----------|----------------|-----------------|---------|
| Circadian period | 24.2h | 24.18h (Czeisler 1999) | Correct |
| Tau (wake) | 18.2h | 18.2h (Borbely 1982) | Correct |
| Circadian amplitude | 0.35 | 0.3-0.4 (Dijk & Czeisler 1995) | Correct |
| Acrophase | 16:00 (day), +8h post-wake (night) | 15:00-17:00 (Dijk 1995) | Correct |
| Post-lunch dip | 12h harmonic at 14:00, amplitude 0.08 | Real phenomenon (Monk 2005) | Correct approach |
| Caffeine half-life | 5.0h default | 3-7h range (Nehlig 2018) | Correct |
| Sleep inertia duration | 1h linear ramp | 15-60 min (Tassi & Muzet 2000) | Acceptable |

**Issues identified:**

1. **MODERATE — Sleep inertia model is oversimplified.** The code uses a linear 0.5→1.0 ramp over 60 minutes (line 337-339, energy-model.ts). In reality, sleep inertia severity depends on which sleep stage you wake from. Waking from N3 produces 15-30 minutes of severe impairment; waking from N1/REM produces minimal inertia. Since this app targets shift workers who often wake from daytime sleep (which has more N3 in the first cycle), the linear model may underestimate early-wake impairment.

   **Recommendation:** Use a biphasic decay: sharp drop in first 15 min (factor 0.5→0.7), then gradual recovery to 1.0 by 45 min. Add a `wokeFromDeepSleep` boolean that, when true, extends the severe phase. Reference: Jewett et al. (1999) "Time course of sleep inertia dissipation in human performance and alertness." *J Sleep Res.*

2. **MODERATE — Night shift acrophase estimation is static.** The `calculateAcrophase()` function (line 207-215) uses a fixed +8h offset for night shifts vs. +10h for day. But circadian adaptation is progressive: after 1 night, the acrophase barely moves; after 3-4 consecutive nights with proper light exposure, it may shift 3-4 hours. The code doesn't track how many consecutive nights the user has worked.

   **Recommendation:** Accept a `consecutiveNights` parameter and compute: `acrophaseShift = min(consecutiveNights * 1.5, 6)` hours. This aligns with Eastman & Burgess (2009) showing ~1-2h/day phase delay with bright light.

3. **MINOR — Sleep debt modifier uses WHOOP population baseline.** The `sleepNeedBaseline` is hardcoded to 7.63h (line 308). But the user already has a `sleepNeed` in their profile. Using a population average instead of the user's personal need creates a mismatch when the profile says 8.5h but the debt modifier uses 7.63h.

   **Recommendation:** Replace `sleepNeedBaseline` with `input.sleepNeed ?? 7.63` to use the user's configured value.

### 1.2 Light Protocol (light-protocol.ts) — GRADE: A

**Strengths:**
- Correctly implements the Eastman & Burgess (2009) bright light protocol
- Distinguishes between light-seek and light-avoid windows
- Handles the critical commute-home blue-blocking recommendation
- Night shift protocol correctly splits into bright first half / dim second half
- Recovery day protocol correctly uses morning bright light for phase advance

**Issues:**

4. **CRITICAL — No DLMO estimation.** The light protocol generates generic timing based on day classification, but doesn't estimate the user's current DLMO (Dim Light Melatonin Onset). DLMO is the gold-standard marker for circadian phase. Without it, light advice may be mistimed. For example: if a user's DLMO has already shifted to 03:00 after 3 nights of work, telling them to "seek bright light immediately on waking" at 14:00 could actually *delay* their clock further (light after DLMO trough delays; light before advances).

   **Recommendation for MVP:** Estimate DLMO from sleep midpoint: `DLMO ≈ sleepMidpoint - 2h` (Burgess & Eastman 2005). Use this to gate light-seek vs. light-avoid: if current time is within 4h *before* estimated DLMO, light delays the clock; within 4h *after* DLMO, light advances. This is a ~20-line addition that dramatically improves protocol safety.

   **Reference:** Burgess HJ, Eastman CI (2005). "The dim light melatonin onset following fixed and free sleep schedules." *J Sleep Res.* 14(3):229-237.

5. **MINOR — Light intensity thresholds not communicated to user.** The code comments reference >2500 lux but the user-facing descriptions say "bright light" without specifying what counts. Most indoor environments are 100-500 lux. The user needs to know: outdoor sunlight (~10,000-100,000 lux) or a 10,000 lux light therapy box.

   **Recommendation:** Add lux guidance to description strings: "Go outside (10,000+ lux ideal) or use a light therapy lamp rated at 10,000 lux, positioned 12-18 inches from your face."

### 1.3 Circadian Transition Protocols (circadian-protocols.ts) — GRADE: A-

**Strengths:**
- Six protocol types cover the major transition patterns
- Chronotype modifier (±15%) is appropriately conservative
- Isolated night shift protocol correctly avoids clock shifting
- Day-to-night uses 90 min/day delay over 3 days (within Eastman's 1-2h/day capability)
- Night-to-day correctly uses split-sleep bridge + 1h/day advance
- Melatonin dose recommendation (0.5mg) is correct (Lewy et al. 2006 showed 0.5mg is as effective as higher doses for phase shifting)

**Issues:**

6. **MODERATE — Day-to-night protocol only activates within 3 days.** Line 298: `if (daysUntil <= 3)`. But the PREDICTION-ALGORITHM-SPEC.md describes pre-adaptation windows of 3-5 days. For a large phase delay (day→night = 8-12h shift), 3 days at 90min/day only achieves ~4.5h shift. The user arrives at their first night shift with their clock still partially day-oriented.

   **Recommendation:** Extend to 4-5 day pre-adaptation window for day→night. Use daysUntil <= 5 and add Day -5 (+45 min) and Day -4 (+90 min) targets. Total achievable shift: ~7.5h over 5 days, which is much closer to the required 8-12h.

7. **MODERATE — Night-to-day advance rate may be too aggressive.** The protocol targets -120, -240, -360 min over 3 days (2h/day advance). Eastman & Burgess (2009) show that phase *advance* is harder than delay, with maximum reliable advance of 1.0-1.5h/day. The 2h/day target exceeds the evidence-based maximum.

   **Recommendation:** Reduce to -90, -180, -270 over 3 days (1.5h/day advance), or extend to 4 days at -90min/day for a total of -360. Add a note that early chronotypes may achieve 2h/day while late chronotypes should use the conservative schedule.

8. **MINOR — No protocol for night→evening or evening→day transitions.** The `detectTransition()` function only maps 4 transition pairs (day→night, night→day, evening→night, day→evening). Missing: night→evening, evening→day. These are less common but occur in rotating schedules.

### 1.4 Sleep Debt Engine (sleep-debt-engine.ts) — GRADE: A-

**Strengths:**
- 14-night rolling window is well-justified (Van Dongen 2003)
- Debt cap at 10h prevents runaway accumulation
- Banking protocol trigger logic is sophisticated (3-7 day window, shift-type boundary detection, 7-day average check)
- Severity tiers align with literature (mild 0.5-2h, moderate 2-5h, severe 5h+)

**Issues:**

9. **MODERATE — Debt recovery rate is not modeled.** The engine tracks debt accumulation but doesn't model the asymmetric recovery dynamics. Belenky et al. (2003) showed that recovery from sleep restriction is not linear: the first recovery night recovers more than subsequent ones, and chronic debt (>5 days) requires disproportionately more recovery time. The current engine treats a 10h debt the same whether accumulated over 3 days or 14 days.

   **Recommendation:** Add a `debtAge` factor: debt accumulated in the last 3 nights recovers at 1.5h/night; debt older than 7 nights recovers at 0.5h/night. This matches the Banks & Dinges (2007) finding that chronic restriction requires extended recovery.

10. **MINOR — Banking surplus cap of 2h is low.** Arnal et al. (2015) showed that 6-7 nights of 9.8h TIB (extending ~2-2.5h/night above need) provided meaningful protection. The MAX_BANK_HOURS = 2 cap means the display never shows more than 2h banked, but the actual protection from 6 nights of banking would be ~12-15h of extra sleep. Consider raising to 4-6h to better reflect actual banked benefit.

### 1.5 Nap Engine (nap-engine.ts) — GRADE: A

**Strengths:**
- Three-tier nap duration system (20/30/90 min) correctly aligns with sleep architecture
- Sleep inertia buffers per tier (5/10/15 min) are evidence-based
- Pre-shift prophylactic nap at 90 min is the #1 intervention per Ruggiero & Redeker (2014)
- Force-to-power when <3h before shift prevents inertia at shift start
- Post-lunch dip nap window (14:00-16:00) correctly targets the circadian trough

**Issues:**

11. **MINOR — No nap timing relative to DLMO.** A nap that occurs 2-3h before DLMO will contain more N3 (deep sleep) and produce worse inertia. A nap during the circadian rise contains more REM and is easier to wake from. This matters for the transition-to-nights nap placed at 15:00 — if the user's DLMO is at 21:00, this nap is 6h before DLMO (fine). But if they've already shifted and DLMO is at 17:00, this nap is only 2h before DLMO and will be deep-sleep-heavy.

### 1.6 Feedback Engine (feedback-engine.ts) — GRADE: A

**Strengths:**
- EMA with α=0.3 provides appropriate smoothing (7-night effective window)
- Dead zone of ±20 min correctly accounts for Apple Watch measurement error (Menghini 2021)
- HRV-expanded dead zone to ±30 min on low-recovery nights is a novel and well-reasoned safety feature
- Proportional gain K_P=0.5 with MAX_DELTA=30 min/cycle is conservative
- Stability proof: closed-loop gain = 0.15 < 1.0 (guaranteed convergence)
- Circadian gate correctly pauses feedback during active protocols
- Stall detection after 14 nights catches non-adherent users

**This is the most rigorously specified component in the system.** The control theory is sound, the edge cases are handled, and the convergence simulations are documented.

**Issues:**

12. **MINOR — No weekend/off-day compensation.** The EMA treats all nights equally, but shift workers often sleep dramatically differently on off days vs. work days. A bedtime deviation of +2h on a day off is normal behavior (social jetlag), not a signal to shift the plan. Consider weighting work-night deviations higher than off-night deviations, or maintaining separate EMA tracks per day classification.

### 1.7 Recovery Calculator (recovery-calculator.ts) — GRADE: B

**Strengths:**
- Apple Watch deep sleep correction (-43 min) per Chinoy et al. (2021) is critical and correctly applied
- Weights (efficiency 35%, deep 30%, REM 25%, duration 10%) are reasonable
- Correctly returns null for non-Apple-Watch sources
- HRV modifier is additive and bounded (±20 points)

**Issues:**

13. **CRITICAL — Recovery score is unvalidated.** No published study has validated a composite sleep score (of this specific formula) against next-day cognitive performance, reaction time, or self-reported alertness in shift workers. The weights (35/30/25/10) are the team's best guess based on literature review, not empirically derived. This is the component most likely to mislead users.

   **Recommendation:** For MVP, consider simplifying to a single validated metric: sleep efficiency + duration. These two metrics have the strongest evidence base. The deep/REM percentages add complexity without proven benefit when sourced from consumer wearables (which have kappa 0.55-0.65 for staging, barely above chance for distinguishing N2 from N3).

   **Better yet:** Use the PSQI (Pittsburgh Sleep Quality Index) components as a template — it's been validated in shift workers (Buysse et al. 1989) and maps to: subjective quality, latency, duration, efficiency, disturbances, daytime dysfunction. Apple Watch can approximate 4 of these 7 components.

14. **MODERATE — Zone thresholds are arbitrary.** The scoreToZone function uses green ≥67, yellow 34-66, red <34. These cutoffs have no published basis. WHOOP uses green ≥67, yellow 34-66, red <34 as well — but WHOOP's thresholds were calibrated against their proprietary dataset of millions of users. ShiftWell's formula is different, so the same thresholds may not be appropriate.

   **Recommendation:** Start with wider zones (green ≥60, yellow 30-59, red <30) and calibrate against user-reported fatigue in the first 1,000 users. The 30-day learning phase is the perfect opportunity to collect this calibration data.

### 1.8 Prediction Engine (prediction-engine.ts / SCSI) — GRADE: B+

**Strengths:**
- 14-day lookahead is appropriate for shift workers
- Five-factor stress scorer covers the major dimensions
- Direction penalty (advances harder than delays) is correct
- Consecutive night multipliers match Folkard & Tucker (2003)
- Pre-adaptation protocol generation is a differentiating feature

**Issues:**

15. **MODERATE — The SCSI composite score has no validation.** The five-factor weights (rotation 30, recovery 25, consecutive 20, debt 15, duration 10) are design choices, not evidence-derived. The additive model assumes these factors are independent, but they're strongly correlated (e.g., consecutive nights increases debt, which worsens recovery time, which amplifies rotation penalty).

   **Recommendation:** For MVP, present the individual factors rather than a single score. A radar chart showing 5 dimensions gives the user more actionable information than a single number that may be miscalibrated. The composite can come later after field validation.

---

## 2. Battle Test: Five Clinical Scenarios

### Scenario A: EM Doc Working 7p-7a Tonight, Switch to Day Schedule Tomorrow

**Input:** Night shift 19:00-07:00 today, off tomorrow, day schedule in 2 days.

**Algorithm would recommend:**
- Day classification: work-night (today), recovery (tomorrow)
- Pre-shift nap: 90-min full cycle ending ~17:30 (30 min + buffer before leave time)
- During shift: bright light first half (19:00-01:00), dim second half (01:00-07:00)
- Post-shift: blue-blockers on commute, 4-6h anchor sleep (07:30-11:30 or 13:30)
- Recovery day: bright light on waking, normal bedtime -120 min from current delayed position
- Light seek: immediately on waking from recovery nap

**Sleep medicine assessment:** Mostly correct. The key question is whether this is an isolated night or end of a block. If isolated: DON'T shift the clock. The algorithm's `isolated-night` detection would handle this correctly if there's a non-night shift on both sides. The protocol recommendation of no bedtime adjustment + prophylactic nap + strategic light + commute blue-blockers is textbook. Recovery day light-seeking on wake is correct to re-advance.

**Gap identified:** The algorithm doesn't explicitly tell the user the *rationale* — "We're NOT shifting your clock because this is a single night. You'll power through it and snap back." That metacognitive framing matters for compliance.

### Scenario B: Nurse Rotating: 3 Nights On, 4 Days Off, Back to 3 Nights

**Input:** Night 1-3 (19:00-07:00), Off 4-7, Night 8-10 (19:00-07:00).

**Algorithm would recommend:**
- Nights 1-3: Progressive clock delay via day-to-night protocol (if detected early enough)
- Off day 4: Recovery with 4h anchor nap + bright morning light
- Off days 5-6: Advancing back toward day schedule (-120, -240 min per day)
- Off day 7: Transition-to-nights protocol begins (+90 min delay)
- Nights 8-10: Repeat

**Sleep medicine assessment:** This is the **classic 2-on-2-off rapid rotation problem** and the algorithm's approach has a fundamental issue. Re-advancing the clock over 4 off days only to re-delay it immediately is metabolically expensive and produces constant circadian disruption. The PREDICTION-ALGORITHM-SPEC.md explicitly acknowledges this: "2-on-2-off rapid rotations: do NOT attempt full adaptation, maintain compromise position."

**Gap identified:** The circadian-protocols.ts code doesn't implement the "compromise position" strategy described in the spec. It would generate a night-to-day protocol on day 4, then a day-to-night protocol on day 7 — the exact whiplash the spec warns against. The algorithm needs a **pattern detector** that identifies rapid rotations and routes to a maintenance protocol (anchor sleep at a fixed time, no clock shifting, strategic napping only).

**What a sleep medicine physician would actually recommend:** Maintain a compromise circadian position. Sleep from ~03:00-11:00 on off days (splitting the difference between night and day). This preserves partial adaptation to nights without fully inverting. On night shifts, supplement with a prophylactic nap. This is the Eastman & Burgess "compromise" protocol and is significantly better than full re-entrainment cycling.

### Scenario C: Severe Sleep Debt (Chronic <5h/night for a Week)

**Input:** 7 consecutive nights of 4.5h sleep, sleepNeed = 7.5h.

**Algorithm would recommend:**
- Debt ledger: rolling debt = 7 × (7.5 - 4.5) = 21h → capped at 10h → severity: severe
- Recommendations from fatigue-model.ts: critical risk level, recovery days needed
- Extended sleep windows on off days
- Banking protocol: not applicable (this is payback, not banking)

**Sleep medicine assessment:** The debt calculation is correct. The cap at 10h is reasonable — Van Dongen (2003) showed that after ~10h cumulative debt, cognitive performance is equivalent to 24h total sleep deprivation, so further accounting provides no additional clinical value.

**Gap identified:** The algorithm doesn't model **recovery trajectory.** Belenky et al. (2003) showed that after 7 days of 5h/night, 3 recovery nights of 8h only restored reaction time to ~80% of baseline. Full recovery required 5-7 nights. The algorithm should estimate `recoveryDaysNeeded` more accurately: for severe debt, recommend 5-7 days of ≥8h sleep, not just "extended windows."

**What a sleep medicine physician would add:** Screen for SWSD (Shift Work Sleep Disorder). Chronic <5h despite opportunity to sleep suggests either poor sleep hygiene, environmental factors, or a clinical sleep disorder. The algorithm should flag: "Your sleep has been significantly below your need for 7+ nights. If you're unable to sleep despite having time, consider discussing with your physician."

### Scenario D: Night Shifts to Vacation Schedule

**Input:** Last night shift tonight (19:00-07:00), then 7 days vacation starting tomorrow.

**Algorithm would recommend:**
- Night-to-day protocol: anchor nap post-shift, progressive advance over 3 days
- Light seeking on waking each day
- Day 4+: normal schedule

**Sleep medicine assessment:** This is the ideal scenario for the algorithm — plenty of recovery time, strong motivation, and no competing shift demands. The protocol is appropriate.

**Gap identified:** The algorithm doesn't account for **travel across time zones.** If the vacation involves flying from Tampa (EST) to, say, California (PST, -3h), the timezone change compounds or opposes the circadian re-advance. The timezone-handler.ts exists but isn't integrated with the protocol engine. For MVP this is acceptable — timezone handling for vacation is a nice-to-have.

### Scenario E: Split Shifts (7a-11a, then 7p-11p)

**Input:** Day shift 07:00-11:00, gap, evening shift 19:00-23:00. Same day.

**Algorithm would classify this as:** The classify-shifts system would see two shifts on the same day. The first (07:00-11:00) classifies as 'day', the second (19:00-23:00) classifies as 'evening'. Since they're on the same calendar day, this creates ambiguity.

**Sleep medicine assessment:** Split shifts are among the most chronobiologically challenging patterns because they fragment both sleep and wakefulness. The optimal approach is:

1. Main sleep: 23:30-06:00 (6.5h, anchored to the natural night)
2. Nap: 12:00-13:30 (90-min cycle in the midday gap)
3. Caffeine: only before 15:00 (to protect evening sleep after second shift)

**Gap identified:** The algorithm has **no explicit split-shift handling.** The day classifier would likely struggle — it's designed for one shift per calendar day. This is a meaningful gap for healthcare workers, who occasionally have split clinical + administrative blocks. However, true split shifts (two clinical shifts in one day) are rare in EM, so this is lower priority for your specific use case.

---

## 3. War Room: Devil's Advocate Challenges

### Challenge 1: Why this algorithm and not a simpler heuristic?

**Devil's advocate position:** A lookup table with 6 rules (night shift → sleep 08:00-16:00; day shift → sleep 22:00-06:00; etc.) would cover 80% of use cases without 3,500 lines of code.

**Counterargument:** The lookup table breaks at transitions and edge cases — the exact moments when shift workers need help most. The value proposition isn't "what time should I sleep on a stable night shift" (anyone can figure that out). It's "how do I navigate the transition from 3 nights to 4 days off without feeling destroyed?" That requires the transition protocols, progressive scheduling, and light guidance that a lookup table can't provide.

**Verdict:** The algorithm complexity is justified for the transition use case. However, the *steady-state* recommendations (stable night shift, stable day shift) could be simplified. Consider: if no transition is detected within 14 days, fall back to a simple rule-based engine. Reserve the full Borbely model for transition periods.

### Challenge 2: Is ML/AI actually needed for v1?

**Current state:** The algorithm is entirely deterministic and rule-based. The "AI" is in the marketing, not the code. The feedback engine uses EMA (a simple statistical smoother), not machine learning.

**Verdict:** This is the **correct approach for v1.** Rule-based systems are:
- Explainable (critical for a health app — users need to understand *why*)
- Testable (1,059 tests prove it)
- Predictable (no model drift)
- Regulatory-safe (an ML model generating health recommendations could trigger FDA device classification)

ML should be reserved for v2+ features: personalized chronotype detection from behavioral data, optimal nap duration learning, or caffeine sensitivity estimation. The deterministic foundation is a feature, not a limitation.

### Challenge 3: What happens when the algorithm is wrong?

**Current safeguards:**
- 30-day learning phase (propose mode) — user reviews changes before they're applied
- 24-hour undo window in autopilot mode
- 15-minute change threshold prevents micro-adjustments
- Feedback engine pauses during active protocols
- HRV dead zone expansion on noisy nights

**Gaps:**

16. **CRITICAL — No "I feel terrible" override.** If the algorithm says "your recovery is green" but the user feels exhausted, there's no mechanism to report this mismatch. The algorithm will continue recommending the same schedule. Sleep is subjective — objective metrics don't capture everything (pain, stress, illness onset, medication effects).

   **Recommendation:** Add a simple post-wake check-in: "How do you feel? [Great / OK / Rough / Terrible]". If the user reports "Terrible" and the algorithm says "green," flag a discrepancy and extend the next sleep window by 30-60 min as a safety measure. This takes the recovery score weight from 10% to 0% for that day and uses subjective report instead.

17. **CRITICAL — No medication/substance interaction handling.** The algorithm accounts for caffeine but ignores:
   - **Melatonin:** Recommended in the protocol text (0.5mg at new bedtime) but not modeled in the energy model. Exogenous melatonin shifts the PRC — the algorithm should adjust the DLMO estimate when the user takes it.
   - **Alcohol:** Suppresses REM sleep, fragments sleep architecture, and makes the recovery score unreliable. If the user drinks 2+ drinks within 3h of sleep, the recovery score should be flagged as unreliable.
   - **Beta-blockers:** Suppress melatonin secretion (Stoschitzky et al. 1999). The BIOMETRIC-ALGORITHM-SPEC mentions excluding HRV for beta-blocker users but the code doesn't implement this check.
   - **Antihistamines (diphenhydramine, etc.):** Common OTC sleep aids that suppress REM and alter sleep architecture.

   **Recommendation for MVP:** Add a simple substance log (melatonin Y/N, alcohol 0/1/2+ drinks, took sleep aid Y/N) to the nightly check-in. When alcohol ≥2 or sleep aid = Y, mark the recovery score as "unreliable" and suppress feedback engine adjustments for that night (same logic as the HRV dead zone expansion).

### Challenge 4: Could bad recommendations harm health?

**Risk analysis:**

| Failure Mode | Severity | Likelihood | Mitigation |
|-------------|----------|------------|------------|
| Algorithm recommends driving when user is severely fatigued | HIGH | LOW | Energy model shows VERY_LOW with explicit warning. But no active alert/push notification. |
| Light protocol times bright light wrong, worsening misalignment | MODERATE | MODERATE | No DLMO estimation (Issue #4 above) |
| Recovery score says "green" when user is impaired | MODERATE | MODERATE | Unvalidated formula (Issue #13) |
| Algorithm recommends skipping sleep for banking | LOW | LOW | Banking only extends sleep, never reduces it |
| Caffeine cutoff is too late, causing insomnia | LOW | MODERATE | Uses individual half-life but defaults to 5h. CYP1A2 slow metabolizers have 8-10h half-life |
| Nap recommendation causes sleep inertia during clinical work | MODERATE | LOW | Inertia buffers implemented, force-to-power near shift time |

**Most dangerous scenario:** A user in severe sleep debt (fatigue model: critical) with a recovery score showing "yellow" (moderate) drives to work for a night shift. The app shows energy predictions but doesn't actively warn: "You are impaired. Consider calling in or having someone else drive."

18. **CRITICAL — No active fatigue alerting.** When the energy model predicts VERY_LOW (<30) during a shift or commute window, the app should push a notification, not just display it passively on a chart. For an MVP targeting healthcare workers, this is a patient safety issue.

   **Recommendation:** When energy prediction < 30 during any shift block or within 30 min before/after a shift (commute window), generate an active alert: "Your predicted alertness is very low during your upcoming shift. Consider: a strategic nap before leaving, or discussing workload with your charge nurse."

### Challenge 5: WHOOP/HealthKit data — used well or just for show?

**Assessment:** Used well, with appropriate skepticism. The algorithm:
- Applies the Chinoy et al. (2021) correction for Apple Watch deep sleep overestimation
- Returns null when non-Apple-Watch sources are detected
- Maintains separate baselines for night-shift vs. day-off sleep
- Uses z-score normalization against personal baseline (not population norms)
- Expands dead zones on noisy data nights

**However:** The system is designed around Apple Watch. WHOOP, Oura, Fitbit, and other devices have different biases. The RECOVERY_ALGORITHM_SCIENCE.md references WHOOP's weighting (40% HRV, 20-30% RHR, etc.) but the code only handles Apple Watch. For MVP with HealthKit, this is fine — but the architecture should abstract the device-specific corrections behind an interface.

### Challenge 6: Edge cases — people on melatonin, caffeine tracking, alcohol

Covered in Challenge 3 / Issue #17 above. This is the single biggest gap in the v1 algorithm.

---

## 4. What's Missing (Ranked by Impact)

### Critical (Must-fix before shipping)

1. **DLMO estimation model** — Without this, light protocol recommendations can backfire. ~20 lines of code based on sleep midpoint.

2. **Subjective "how do I feel" check-in** — Objective metrics miss too much. One question, four options, overrides recovery score when mismatch detected.

3. **Active fatigue alerting** — Push notification when energy < 30 during shift/commute. Patient safety issue.

4. **Substance interaction flags** — Alcohol, melatonin, and OTC sleep aids invalidate recovery scoring. Simple daily log.

### High Priority (Should fix before or shortly after launch)

5. **Rapid rotation pattern detector** — Identify 2-on-2-off, 3-on-4-off patterns and route to compromise protocol instead of whiplash re-entrainment.

6. **Consecutive-night-aware acrophase** — Track nights worked and adjust Process C peak progressively.

7. **Extend day-to-night pre-adaptation to 5 days** — Current 3-day window insufficient for 8-12h phase shift.

8. **Conservative night-to-day advance rate** — Reduce from 2h/day to 1.5h/day to stay within evidence-based limits.

### Medium Priority (Post-launch)

9. **Recovery trajectory modeling** — Don't just track debt, model the non-linear recovery curve.
10. **Calibrate recovery score zones** — Collect user-reported fatigue during learning phase, calibrate thresholds empirically.
11. **Split-shift handling** — Explicit support for fragmented work days.
12. **Weekend/off-day separate EMA tracking** — Prevent social jetlag from biasing feedback.

---

## 5. What's Over-Engineered (Simplify for MVP)

1. **Recovery score formula complexity.** Four weighted components with Apple Watch correction, HRV modifier, and zone mapping — when the underlying data (consumer wearable sleep staging) has kappa 0.55-0.65. For MVP: use sleep duration + sleep efficiency only. These two metrics are reliably measured by all wearables. Add deep/REM when staging accuracy improves.

2. **SCSI composite score.** Five-factor additive model with unvalidated weights. For MVP: show a simple "transition incoming in X days" with a difficulty label (easy/moderate/hard) based on direction only (advance = hard, delay = moderate, isolated = easy). The radar chart of individual factors is more honest than a single number.

3. **Transparency log / change attribution system.** Tracking every change with factor attribution (circadian/debt/schedule/recovery) and human-readable reasons is impressive engineering but premature for MVP. Users won't read it. Simplify to: "Your plan changed because [one sentence]."

4. **Banking protocol trigger conditions.** Four simultaneous conditions (shift boundary, 3-7 day window, type match, 7-day average below need) is over-constrained. For MVP: if upcoming nights detected within 7 days AND recent sleep below need → suggest extended sleep. Done.

5. **Dual-meter debt/credit visualization.** Users don't need to see both debt and credit simultaneously. Show one: "You're X hours behind" OR "You're well-rested." The bank concept is confusing for non-scientists.

---

## 6. Key Research Papers to Inform the Algorithm

### Already Referenced (Correctly)
- Borbely (1982) — Two-Process Model foundation
- Eastman & Burgess (2009) — Phase shifting protocols
- Czeisler et al. (1990) — Bright light phase response
- Van Dongen et al. (2003) — Cumulative sleep debt
- Folkard & Tucker (2003) — Night shift accident risk
- Ruggiero & Redeker (2014) — Prophylactic napping
- Chinoy et al. (2021) — Apple Watch deep sleep correction

### Should Be Added

| Paper | Why It Matters |
|-------|---------------|
| Burgess & Eastman (2005) J Sleep Res — DLMO from sleep midpoint | Enables DLMO estimation without saliva assays |
| Jewett et al. (1999) J Sleep Res — Sleep inertia time course | Improves inertia modeling from linear to biphasic |
| Banks & Dinges (2007) Sleep — Recovery from chronic restriction | Non-linear recovery trajectory |
| Kecklund & Axelsson (2016) BMJ — Health consequences of shift work | Comprehensive risk framework |
| Vetter et al. (2018) Curr Biol — Social jetlag and health | Separate off-day feedback tracking |
| Postnova et al. (2018) Sci Rep — Three-process model with light | Better than two-process for shift workers |
| St. Hilaire et al. (2022) PNAS — Unified model of sleep-wake | Next-gen model if you outgrow Borbely |
| Stoschitzky et al. (1999) Lancet — Beta-blockers suppress melatonin | Drug interaction handling |

---

## 7. Proposed v1 Algorithm Specification (Simplified)

For launch, I recommend the algorithm operate at two complexity tiers:

**Tier 1: Stable Schedule (no transition within 14 days)**
- Rule-based sleep window placement (lookup table by shift type + chronotype)
- Standard light protocol (morning seek / pre-bed avoid)
- Caffeine cutoff (6h before sleep, adjusted for user half-life)
- Simple nap placement (pre-shift prophylactic, post-lunch dip)
- Debt tracking (14-night rolling sum, severity label)
- Recovery score: sleep efficiency + duration only (skip staging)

**Tier 2: Transition Detected (within 14 days)**
- Full Borbely energy model activated
- Circadian protocol engine (6 types, chronotype-modified)
- DLMO-aware light timing (estimated from sleep midpoint)
- Extended pre-adaptation window (up to 5 days)
- Pattern detection (rapid rotation → compromise protocol)
- Active fatigue alerting (energy < 30 → push notification)

This two-tier approach saves battery, reduces complexity for the 70% of days that are routine, and focuses algorithmic sophistication on the 30% of days where it matters most.

---

## Conclusion

ShiftWell's algorithm represents one of the most scientifically rigorous consumer sleep optimization systems I've reviewed. The research documentation is exceptional — 45+ primary sources, explicit confidence levels, and honest acknowledgment of validation gaps. The code faithfully implements the specifications.

The gaps I've identified are addressable. The most impactful changes (DLMO estimation, subjective check-in, fatigue alerting, substance logging) are collectively <200 lines of code. The over-engineering concerns are about presentation, not safety.

**My strongest recommendation:** Before TestFlight, implement the "how do I feel?" morning check-in and the fatigue alert. These two features cost almost nothing to build but dramatically reduce the risk of the algorithm silently failing for a user who happens to have an atypical response.

The algorithm is ready for a controlled beta with the caveats above. It is not ready for marketing claims like "AI-optimized" or "clinically validated." It should be positioned as "evidence-informed" until field validation data exists.

---

*This audit was conducted by reviewing 3,500+ lines of algorithm source code, 2,000+ lines of tests, 6 research specification documents, and the complete scientific citation database. All code references are to the current main branch as of 2026-04-18.*

---
Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial scientific audit. Full review of energy-model.ts, light-protocol.ts, circadian-protocols.ts, sleep-debt-engine.ts, nap-engine.ts, feedback-engine.ts, recovery-calculator.ts, and all adaptive brain modules. Cross-referenced against 6 spec documents and SLEEP-SCIENCE-DATABASE.md.
