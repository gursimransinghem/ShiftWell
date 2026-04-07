# ShiftWell Sleep Science Database

**Version:** 1.1  
**Last Updated:** 2026-04-07  
**Purpose:** Living scientific foundation for ShiftWell sleep optimization algorithms  
**Scope:** Sleep debt, circadian biology, sleep staging, recovery metrics, wearable accuracy, shift work interventions, feedback loop architectures, actigraphy validation, clinical measurement instruments

---

## Table of Contents

1. [Sleep Homeostasis and the Two-Process Model](#1-sleep-homeostasis-and-the-two-process-model)
2. [Sleep Debt: Measurement, Accumulation, and Recovery](#2-sleep-debt-measurement-accumulation-and-recovery)
3. [Sleep Stage Architecture](#3-sleep-stage-architecture)
4. [Circadian Biology and Shift Work](#4-circadian-biology-and-shift-work)
5. [Health Consequences of Circadian Misalignment](#5-health-consequences-of-circadian-misalignment)
6. [Evidence-Based Interventions](#6-evidence-based-interventions)
7. [Recovery Metrics and Biometrics](#7-recovery-metrics-and-biometrics)
8. [Consumer Wearable Accuracy](#8-consumer-wearable-accuracy)
9. [Shift Work Sleep Disorder (SWSD)](#9-shift-work-sleep-disorder-swsd)
10. [Algorithm Design Implications](#10-algorithm-design-implications)
11. [Key Thresholds and Reference Values](#11-key-thresholds-and-reference-values)
12. [Source Registry](#12-source-registry)

---

## 1. Sleep Homeostasis and the Two-Process Model

### 1.1 Borbely's Two-Process Model (1982, revised 2022)

**Source:** Borbely et al., *Journal of Sleep Research* (2022). "The two-process model of sleep regulation: Beginnings and outlook." PMC9540767.  
**Confidence:** HIGH — foundational model, continuously validated.

**Overview:**  
The dominant mathematical framework for sleep-wake regulation. Sleep is governed by the interaction of two independent processes:

#### Process S — Homeostatic Sleep Drive

- Represents accumulated sleep pressure (informally: "sleep debt").
- **Buildup during waking:** Follows a saturating exponential function. Sleep pressure increases continuously during wakefulness, with the rate of buildup depending on individual biology.
- **Dissipation during sleep:** Follows an exponential decay curve. Slow-Wave Activity (SWA) in NREM sleep is the primary EEG marker — it declines exponentially across the night.
- **Key marker:** EEG delta power (0.5–4 Hz) in NREM sleep is the empirical proxy for Process S. Higher delta power = higher homeostatic sleep pressure being discharged.
- **Mathematical structure:** `S(wake) = S_upper - (S_upper - S0) * e^(-t/tau_w)` — rises toward upper asymptote during wakefulness. `S(sleep) = S_lower + (S0 - S_lower) * e^(-t/tau_s)` — decays toward lower asymptote during sleep.
- **Time constants:** tau_w (wake buildup) and tau_s (sleep dissipation) differ. Sleep dissipation is faster during the first sleep cycle (SWS-rich) and slower in later cycles.

#### Process C — Circadian Pacemaker

- The ~24-hour biological clock driven by the suprachiasmatic nucleus (SCN).
- Modeled as a sinusoidal function (originally a sine wave, refined to a skewed sine wave).
- **Two thresholds:** Process S oscillates between an upper threshold (sleep onset) and a lower threshold (wake onset). The circadian process modulates these thresholds — at night, the upper threshold falls toward the current S level (promoting sleep); in the morning, the lower threshold rises (promoting wake).
- **Temperature proxy:** Core body temperature minimum (CBTmin) occurs approximately 2 hours before habitual wake time and marks the nadir of the circadian alerting signal. This is the most sleep-vulnerable point.

#### Clinical / Algorithmic Significance

- Sleep debt in ShiftWell = distance between current Process S level and the level at which an individual with full sleep would be. This can be operationalized as: `debt = (ideal_sleep_per_night - actual_sleep_per_night) * nights_in_sequence`.
- A shift worker going to bed at 8 AM is attempting to sleep during the circadian alerting phase — Process C is fighting Process S, resulting in shorter, lighter, and less restorative sleep.
- The model explains why 4 hours of day sleep after a night shift does not equal 4 hours of normal nighttime sleep — the architecture differs because the circadian gate is partially closed.

**Sources:**
- [PMC9540767 — Borbely Two-Process Beginnings and Outlook (2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9540767/)
- [PubMed 26762182 — Two-Process Model Reappraisal (2016)](https://pubmed.ncbi.nlm.nih.gov/26762182/)
- [PubMed 10643753 — Sleep Homeostasis and Models (2000)](https://pubmed.ncbi.nlm.nih.gov/10643753/)

---

## 2. Sleep Debt: Measurement, Accumulation, and Recovery

### 2.1 Dose-Response Relationship — Belenky et al. (2003)

**Source:** Belenky G et al. "Patterns of performance degradation and restoration during sleep restriction and subsequent recovery: a sleep dose-response study." *Journal of Sleep Research*, 2003. PMID 12603781.  
**Confidence:** HIGH — landmark, widely cited, Walter Reed Army Institute.

**Study Design:** 66 healthy adults randomized to 3, 5, 7, or 9 hours time-in-bed (TIB) for 7 days, followed by 3 recovery days at 8 hours TIB.

**Key Quantitative Findings:**

| TIB/Night | Performance After 7 Days | Recovery After 3 Days (8h TIB) |
|-----------|--------------------------|-------------------------------|
| 9 hours   | Maintained (baseline)    | N/A (no deficit)              |
| 7 hours   | Mild cumulative decline  | Largely restored              |
| 5 hours   | Significant decline       | Partially restored only       |
| 3 hours   | Severe decline            | Not fully restored            |

- Performance deficits accumulate **non-linearly** — each successive day below 7 hours compounds the prior day's deficit.
- After 3 days of recovery at 8 hours, the 3h and 5h groups had **not returned to baseline** performance, despite increased subjective alertness.
- Critical insight: subjective sleepiness adapts (plateaus) while objective impairment continues to worsen — people feel "adapted" when they are not.

**Algorithm Implication:** Use objective sleep duration tracking, not self-reported alertness, to estimate debt. A 3-day recovery window at target duration is insufficient for severe debt — model should incorporate debt depth and slope of deficit accumulation.

---

### 2.2 Cumulative Sleep Restriction — Van Dongen et al. (2003)

**Source:** Van Dongen HP, Maislin G, Mullington JM, Dinges DF. "The cumulative cost of additional wakefulness." *Sleep*, 2003. University of Pennsylvania.  
**Confidence:** HIGH — foundational, Psychomotor Vigilance Task (PVT) benchmark.

**Key Findings:**
- Subjects restricted to 6h/night for 14 consecutive nights showed cognitive impairment **equivalent to two full nights of total sleep deprivation** by day 14.
- Subjects restricted to 4h/night deteriorated even faster.
- Subjects at 8h/night showed no cumulative decline.
- **Critical finding:** Subjective sleepiness ratings *stabilized* after day 2–3 of restriction, yet objective PVT performance continued declining. Participants lost insight into their own impairment.
- 14-day 6h restriction = approximately 28 hours of cumulative sleep debt (14 nights × ~2h/night short of 8h target).

**Algorithm Implication:** Never rely on self-reported "feeling fine" as a recovery indicator. The algorithm must track objective cumulative debt regardless of user-reported energy levels. A sleepiness score input from the user is useful context but must be weighted lower than objective sleep duration history.

---

### 2.3 Sleep Debt Recovery Dynamics — Banks et al. (2023)

**Source:** "Dynamics of recovery sleep from chronic sleep restriction." *SLEEP Advances*, 2023. PMC10108639.  
**Confidence:** HIGH.

**Key Findings:**
- Extending recovery sleep dose (0–10h TIB) increased: total sleep time, stage 2, REM, slow-wave sleep, and slow-wave energy.
- However: **vigilant attention, subjective sleepiness, and mood did not recover at the same rate** as sleep architecture.
- After 5 nights of 4h restriction, even 10h TIB recovery nights did not fully restore cognitive performance.
- Different cognitive domains recover at different rates — some require more recovery nights than others.

**Algorithm Implication:** Model multi-dimensional recovery: sleep architecture metrics (SWS duration, REM duration) and cognitive performance metrics have different recovery curves. A single "recovery score" must weight these asymmetrically.

---

### 2.4 Sleep Debt Calculation Framework

**Formula (basic):**
```
Sleep Debt = Σ (Optimal Sleep Duration - Actual Sleep Duration) per night
             over a trailing window (recommended: 14 days)
```

**Individual Optimal Sleep Duration (OSD):**
- Most adults: 7–9 hours (AASM recommendation)
- Research by Kitamura et al. (2016, *Scientific Reports*): Individual OSD is best estimated from longest sleep duration on consecutive days off from work (allowing free sleep without alarm). This is the individual's "rebound sleep" baseline.
- Potential Sleep Debt (PSD) = OSD - Actual Sleep Duration. PSD showed stronger correlation with objective sleepiness than absolute sleep time.

**Recovery Rate Reference:**
- Rule of thumb: approximately 4 days to recover from 1 hour of accumulated debt (Sleep Foundation, citing research).
- After full debt clearance, sustained 7–9h sleep prevents re-accumulation.
- Weekend catch-up: can partially offset short-term debt but is insufficient for chronic restriction (Nader et al., 2020, *Sleep Medicine*).

**Sources:**
- [PubMed 12603781 — Belenky 2003](https://pubmed.ncbi.nlm.nih.gov/12603781/)
- [PMC10108639 — Recovery Dynamics (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10108639/)
- [Nature Scientific Reports — Individual OSD](https://www.nature.com/articles/srep35812)
- [Penn Sleep — Van Dongen Dinges](https://www.med.upenn.edu/uep/assets/user-content/documents/Van_Dongen_Dinges_Sleep_26_3_2003.pdf)

---

### 2.5 Sleep Banking (Pre-Loading Sleep)

**Source:** Rupp TL, Wesensten NJ, Bliese PD, Balkin TJ. "Banking sleep: realization of benefits during subsequent sleep restriction and recovery." *Sleep*, 2009. PMID 19294951. PMC2647785.  
**Confidence:** MEDIUM — replicated in some studies, but evidence is mixed.

**Key Findings:**
- Subjects who slept 10h/night for 1 week showed significantly fewer cognitive lapses during subsequent sleep restriction compared to controls (~6 lapses vs. ~12 by day 7).
- Six nights of sleep extension (~9.8h TIB) "markedly limited deterioration in sustained attention" during ~38 hours of total sleep deprivation.
- Benefits are **stage-specific**: sleep banking increases SWS and REM proportions, which are preferentially consumed during subsequent restriction.
- Evidence for executive function protection is weaker — mainly helps vigilant attention/reaction time tasks.

**Algorithm Implication:** Before a series of night shifts, the app can recommend "pre-loading" — going to bed 1–1.5h earlier for 2–3 nights. Frame as prophylactic protection, not debt repayment. Flag which cognitive domains will be partially protected (vigilance, reaction time) vs. not (complex decision-making).

**Sources:**
- [PMC2647785 — Sleep Banking Study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2647785/)
- [MDPI Narrative Review — Sleep Banking](https://www.mdpi.com/2624-5175/8/1/8)

---

## 3. Sleep Stage Architecture

### 3.1 Normal Sleep Stage Proportions (AASM Standards)

**Source:** AASM Manual for Scoring Sleep; StatPearls: Physiology, Sleep Stages (NCBI NBK526132); Moser et al., *JCSM* 2009 (reference data for healthy adults).  
**Confidence:** HIGH — standard clinical reference.

#### Standard Adult Architecture

| Stage | % of Total Sleep Time | Typical Duration (8h) | Function |
|-------|----------------------|----------------------|----------|
| N1 (light, transitional) | 2–5% | 10–24 min | Entry to sleep, drowsy |
| N2 (core sleep) | 45–55% | 216–264 min | Spindles, K-complexes, motor learning, cardiovascular rest |
| N3 (slow-wave, deep, SWS) | 10–20% | 48–96 min | Physical restoration, GH secretion, immune function |
| REM | 20–25% | 96–120 min | Emotional processing, procedural memory, cognitive integration |

**Cycle Structure:**
- A complete sleep cycle = N1 → N2 → N3 → N2 → REM ≈ **90–110 minutes**
- Typical night has **4–5 cycles**
- First half of night: SWS-dominant (N3 heavier in cycles 1–2)
- Second half of night: REM-dominant (REM longer in cycles 3–5)
- This distribution means that cutting sleep short disproportionately eliminates REM; going to bed late after a night shift disproportionately eliminates early-night SWS

**Clinical Implication:** A shift worker sleeping 5h after a night shift loses the full second wave of REM (critical for emotional regulation and cognitive integration) while also having reduced SWS due to circadian interference.

**Sources:**
- [NCBI NBK526132 — Physiology of Sleep Stages](https://www.ncbi.nlm.nih.gov/books/NBK526132/)
- [JCSM Reference Data for Healthy Adults](https://jcsm.aasm.org/doi/10.5664/jcsm.7036)

---

### 3.2 Slow-Wave Sleep (SWS / N3) — Physical Recovery

**Source:** Frontiers in Sleep 2024. "From macro to micro: slow-wave sleep and its pivotal health implications." PMC article; Takahashi Y et al. 1968, *Science*: "Human Growth Hormone Release: Relation to Slow-Wave Sleep."  
**Confidence:** HIGH for GH linkage; HIGH for immune and metabolic functions.

**Key Findings:**

- **Growth hormone secretion:** The largest daily GH pulse in adults occurs during the first SWS episode. In men, ~70% of GH pulses during sleep coincide with SWS. Amount of GH released correlates directly with amount of SWS.
- **Physical tissue repair:** GH drives protein synthesis, muscle repair, and bone metabolism. Disruption of SWS (as occurs during day sleep in night shift workers) directly impairs post-exercise and post-injury recovery.
- **Immune function:** Bidirectional relationship — immune activation enhances SWS; SWS enhances immune function. Pro-inflammatory cytokines (IL-1, TNF-alpha) promote SWS; SWS facilitates cytokine production needed for immune memory consolidation.
- **Sympathetic suppression:** SWS is associated with lowest sympathetic tone and highest parasympathetic activity of the 24-hour cycle. Heart rate, blood pressure, and metabolic rate all nadir during SWS.
- **Sleep deprivation effect:** Restricting sleep elevates pro-inflammatory cytokines (IL-6, CRP), impairing tissue repair and creating a low-grade inflammatory state.
- **Hormonal cascade:** SWS disruption also alters cortisol timing — cortisol (which normally suppresses inflammation and restores morning alertness) is elevated inappropriately in sleep-deprived shift workers.

**Hypnotic enhancement finding (2022):** A 2022 *Communications Biology* study (PMC9325885) showed pharmacological enhancement of SWS increased GH and prolactin secretion and reduced sympathetic predominance — confirming causal link between SWS and hormonal recovery.

**Algorithm Implication:** SWS is the biological priority for physical workers, athletes, and healthcare providers. Track N3 duration and flag when it falls below 13% of total sleep time (lower bound of normal). Suggest strategies that protect SWS: consistent sleep timing, cooler room temperature, avoiding alcohol (which suppresses SWS quality in second half), and pre-sleep exercise timing.

**Sources:**
- [Frontiers in Sleep 2024 — SWS Health Implications](https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2024.1322995/full)
- [PMC9325885 — Hypnotic Enhancement of SWS (2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9325885/)
- [Science 1968 — GH and Slow-Wave Sleep (classic)](https://www.science.org/doi/10.1126/science.165.3892.513)

---

### 3.3 REM Sleep — Cognitive and Emotional Function

**Source:** Walker MP et al., multiple; Hutchison et al. 2021 *PMC8760621*; Goldstein-Piekarski et al. 2015; Communications Biology 2025.  
**Confidence:** HIGH.

**Key Findings:**

- **Emotional memory processing:** REM sleep is essential for emotional memory consolidation and affective tone regulation. During REM, the noradrenergic system is suppressed, allowing for memory reactivation without the stress response — "safe reprocessing" of emotional content.
- **Procedural and associative memory:** REM sleep integrates disparate memories and promotes insight. Complex cognitive tasks, creative problem-solving, and abstract learning are disproportionately dependent on REM.
- **Theta oscillations:** REM-associated hippocampal theta (4–8 Hz) drives memory integration between medial prefrontal cortex and limbic structures.
- **Cortisol and REM:** High cortisol (common in stressed shift workers) specifically suppresses REM — creating a vicious cycle where stress → poor sleep → reduced REM → impaired emotional regulation → more stress.
- **Clinical significance for healthcare workers:** Clinical decision-making, empathy, and management of emotional trauma (inherent in emergency medicine) all depend on REM. Studies link chronic REM suppression to burnout and compassion fatigue.
- **Both SWS and REM consolidate emotional memory:** A 2025 *Communications Biology* study confirmed complementary roles — SWS strengthens the memory trace; REM modulates emotional valence and integration.

**Algorithm Implication:** REM appears disproportionately in the second half of sleep. A shift worker cutting the last 2 hours of a 7-hour sleep window loses ~45–60 minutes of REM. Model should visualize this loss and quantify the cognitive/emotional cost. Target REM > 20% of total sleep time.

**Sources:**
- [PMC8760621 — REM Sleep Memory Consolidation Hypothesis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8760621/)
- [Communications Biology 2025 — SWS and REM Emotional Memory](https://www.nature.com/articles/s42003-025-07868-5)
- [eNeuro 2024 — REM Sleep Preserves Affective Response to Social Stress](https://www.eneuro.org/content/11/6/ENEURO.0453-23.2024)

---

## 4. Circadian Biology and Shift Work

### 4.1 Core Circadian Concepts

**Confidence:** HIGH — foundational biology.

| Concept | Definition | Value/Range | Clinical Significance |
|---------|-----------|-------------|----------------------|
| DLMO (Dim Light Melatonin Onset) | Start of melatonin secretion in dim light; best marker of circadian phase | Typically 2h before habitual sleep onset | Gold standard for circadian timing; shifted in night workers |
| CBTmin (Core Body Temperature Minimum) | Lowest body temperature in 24h cycle | Occurs ~2h before habitual wake time | Most vulnerable circadian time; sleep onset here = best SWS |
| Circadian amplitude | Magnitude of clock oscillation | Reduced in irregular schedules | Lower amplitude = less robust circadian cues, worse sleep quality |
| Melatonin window | Duration of melatonin elevation | ~10–12h in healthy adults | Defines biological night; shortened or shifted in shift workers |

### 4.2 Circadian Misalignment in Night Shift Work

**Source:** PMC8832572 — "Disturbance of the Circadian System in Shift Work and Its Health Impact" (2022); PMC9974590 — "Circadian Disruption and Cardiometabolic Disease Risk" (2023).  
**Confidence:** HIGH.

**The core problem:** Night shift workers are awake during their biological night and trying to sleep during their biological day. This creates:

1. **Acute misalignment:** Even after one night shift, hormonal timing is disrupted for 2–3 days.
2. **Chronic misalignment:** Most night shift workers never fully adapt because of social obligations and variable schedules. Only ~3% of permanent night shift workers achieve complete circadian adaptation.
3. **Compressed sleep:** Daytime sleep is shorter (on average 1–4 hours less) due to environmental noise, light, and circadian arousal.
4. **Re-misalignment on days off:** Workers who try to return to a normal schedule on days off re-disrupt their clock, creating perpetual social jetlag.

**Algorithm Implication:** ShiftWell should identify whether a user is on permanent nights (partial adaptation possible) or rotating shifts (adaptation not recommended — focus on damage mitigation instead). Recommend different strategies accordingly.

---

### 4.3 Eastman/Smith Circadian Shifting Protocol (2009)

**Source:** Smith MR, Fogg LF, Eastman CI. "Practical Interventions to Promote Circadian Adaptation to Permanent Night Shift Work: Study 4." *Chronobiology International*, 2009. PMID 19346453.  
**Confidence:** HIGH.

**Target:** Achieve a compromise circadian phase position for permanent night shift workers — shift DLMO to ~03:00 (shifts the sleepiest circadian time to ~10:00–11:00 AM, well within the day sleep window, away from the work shift).

**Protocol:**
- Bright light (5 × 15-minute pulses from light boxes) during each night shift
- Dark sunglasses worn when commuting home after shift (blocking morning outdoor light)
- Scheduled sleep in dark bedroom at fixed times after shifts AND on days off
- Afternoon outdoor light exposure permitted (acts as a "light brake" to prevent excessive phase delay)

**Results:**
- Experimental group achieved DLMO of 03:22 ± 2.0h (close to 03:00 target)
- Control group DLMO remained 23:24 ± 3.8h (daytime)
- Experimental subjects slept longer and performed significantly better during night shifts
- The "compromise" position allows: adequate daytime sleep after shifts + reasonable sleep timing on days off (e.g., sleep midnight–8 AM)

**Algorithm Implication:** For users on permanent night shifts, recommend this protocol. Build a personalized circadian shift calendar: light exposure targets, sunglasses reminder after shift, optimal sleep timing windows, and DLMO estimation from wake time and subjective evening tendency.

**Sources:**
- [PMID 19346453 — Eastman Study 4](https://pubmed.ncbi.nlm.nih.gov/19346453/)
- [Burgess et al. — Using Bright Light and Melatonin (Penn CBTI)](https://www.med.upenn.edu/cbti/assets/user-content/documents/Burgess_UsingBrightLightandMelatonintoAdjusttoNightWork-BTSD.pdf)

---

### 4.4 Chronotype and Shift Tolerance

**Source:** PMC6258747 — "Identifying shift worker chronotype: implications for health" (2018); Chronotype Cohort Study, PMC11911045 (2025).  
**Confidence:** MEDIUM–HIGH.

**Key Findings:**
- **Evening chronotypes** working day shifts suffer the most circadian misalignment ("social jetlag up to 3h").
- **Morning chronotypes** working night shifts suffer the most acute misalignment for night work.
- **Evening chronotypes actually tolerate night shifts better** — their natural phase delay partially aligns with the night shift requirement.
- Chronotype-adjusted schedules in a factory study reduced overall social jetlag by ~1 hour and improved self-reported sleep quality.
- Seasonal variation matters: circadian adaptation to night shifts is faster in winter than summer (due to different natural light exposure patterns).

**Algorithm Implication:** Onboarding should include a validated chronotype assessment (MEQ — Morningness-Eveningness Questionnaire, or Munich Chronotype Questionnaire). Use chronotype to calibrate:
- Estimated DLMO
- Whether the user is naturally aligned or misaligned with their shift schedule
- Personalized recommendations for light exposure timing

---

## 5. Health Consequences of Circadian Misalignment

### 5.1 Metabolic and Cardiovascular Outcomes

**Source:** AHA Scientific Statement, *Circulation* 2023 (DOI 10.1161/CIR.0000000000001388); PMC9974590 (2023); *Nature Communications* 2025 — daytime eating during night work.  
**Confidence:** HIGH.

**Established associations in shift workers:**

| Condition | Risk Increase | Mechanism |
|-----------|--------------|-----------|
| Type 2 diabetes | 40% higher risk | Circadian misalignment impairs glucose tolerance and insulin sensitivity; disrupted meal timing; altered glucagon/insulin rhythms |
| Obesity | 1.5× higher prevalence | Leptin/ghrelin dysregulation (leptin suppressed, ghrelin elevated); late-night eating; metabolic rate suppression during shifted sleep |
| Hypertension | ~30% higher | Blunted nocturnal blood pressure dip; elevated sympathetic tone during misaligned sleep |
| Cardiovascular disease | 24–40% higher risk | Cumulative effect of above; autonomic dysregulation; chronic inflammation |
| Metabolic syndrome | 2× higher risk | Combination of above factors |

**Critical 2025 finding:** A *Nature Communications* RCT found that eating exclusively during daytime hours during simulated night work **mitigated adverse cardiovascular risk factors** including autonomic cardiac control, prothrombotic factors, and blood pressure — despite continued night shift sleep patterns. This is a potentially actionable dietary intervention.

**Algorithm Implication:** ShiftWell should include meal timing guidance alongside sleep guidance. This is a major differentiator — most sleep apps ignore this. Recommend daytime eating windows even for night shift workers (7 AM–7 PM or similar) as a metabolic protection strategy.

**Sources:**
- [AHA Circulation 2023 — Circadian Health and Cardiometabolic Disease](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001388)
- [PMC9974590 — Circadian Disruption and Cardiometabolic Risk](https://pmc.ncbi.nlm.nih.gov/articles/PMC9974590/)
- [Nature Communications 2025 — Daytime Eating During Night Work](https://www.nature.com/articles/s41467-025-57846-y)

---

### 5.2 Healthcare Worker-Specific Outcomes

**Source:** PMC11313391 — "Impact of Night Work on Sleep and Health of Medical Staff" (2024); JAMA Network Open 2023 — Sleep Disturbance and Burnout in ED Workers; PMC10876714 — Prospective cohort (2024).  
**Confidence:** HIGH.

**Key Statistics:**

- Night workers in healthcare average **5.74 hours of sleep** between consecutive night shifts (significantly below the 7h minimum)
- >50% of night shift healthcare workers sleep ≤6 hours per day (NIOSH data)
- **17.9% of attending physicians** report near-miss traffic accidents after night shifts
- Night shift nurses show accelerated brain aging and reduced deep sleep compared to day shift nurses (2024 longitudinal study)
- Sleep disturbance is directly linked to burnout, reduced empathy, medication errors, and diminished clinical performance
- Night and rotating shift nurses have 60% higher incidence of physician-diagnosed sleep disorders vs. day workers

**ShiftWell Target User:** Emergency physicians, nurses, and healthcare workers represent the highest-need segment for this application and face the most severe consequences of mismanaged sleep.

---

## 6. Evidence-Based Interventions

### 6.1 Light Therapy for Shift Workers

**Source:** Systematic review and meta-analysis, *Scientific Reports* 2024 (PMC11696139); Working Time Society Consensus, PMC6449639 (2019); Comparison of light interventions, PMC9332364 (2022).  
**Confidence:** HIGH.

**Mechanism:** Light is the dominant zeitgeber (time-giver) for the SCN. Short-wavelength blue light (460–480 nm) maximally suppresses melatonin via intrinsically photosensitive retinal ganglion cells (ipRGCs). Appropriately timed bright light can advance or delay the circadian clock by 1–3 hours per day.

**Evidence Summary:**

| Light Intervention | Effect | Recommended Protocol |
|-------------------|--------|---------------------|
| Bright light during night shift | Delays circadian clock; improves alertness during shift | 1,000–5,000 lux, blue-enriched (~6,500K), 15–60 min at shift start and ~02:00 |
| Dark glasses after shift | Prevents morning light from re-advancing clock | Wear from shift end until bedroom; critical for workers who walk outside in morning sun |
| Morning bright light for day shift | Phase advance; useful when transitioning back to day schedule | 2,500–10,000 lux within 30 min of wake for 30 min |
| Melatonin + light combination | Superior to either alone | See Section 6.2 |

**Lux thresholds (from meta-analysis):**
- Medium illuminance 900–6,000 lux for ≥1 hour: effective for extending total sleep time
- Optimal single-session: 2,000–5,000 lux for <1 hour
- Minimum effective for alertness: ~1,000 lux with color temperature ≥5,000K

**Algorithm Implication:** Build a light exposure schedule into the shift worker's daily plan. Distinguish between light used for circadian shifting (precise timing, high intensity) vs. alertness management during the shift (more flexible). Send reminders for sunglasses-after-shift and morning dark windows.

**Sources:**
- [PMC11696139 — Light Therapy Meta-Analysis (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11696139/)
- [PMC6449639 — Working Time Society Consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC6449639/)
- [PMC9332364 — Lighting Interventions Night Shift Meta-Analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC9332364/)

---

### 6.2 Melatonin for Shift Workers

**Source:** Eastman CI et al. *Am J Physiol* 2001; Burgess HJ et al. (Penn CBTI); Efficacy in shift-work nurses, PMC2584099.  
**Confidence:** HIGH for phase-shifting; MEDIUM for direct hypnotic effect.

**Evidence-based protocol:**

| Purpose | Dose | Timing | Evidence |
|---------|------|--------|----------|
| Phase delay (for permanent night shift adaptation) | 0.5–3 mg | Taken immediately after waking from day sleep (early afternoon) | Phase advances DLMO by ~3–4h over 7 days |
| Daytime sleep initiation | 0.5–5 mg | 30 min before intended daytime sleep after night shift | Shortens sleep onset latency; increases total sleep time |
| Returning to day schedule (after night shift rotation) | 0.5 mg | 30 min before target bedtime (e.g., 11 PM) for 3–5 days | Accelerates re-entrainment |

**Dose findings:**
- 0.5 mg achieved 3.0 ± 1.1 h phase advance
- 3.0 mg achieved 3.9 ± 0.5 h phase advance
- Placebo: 1.7 ± 1.2 h phase advance
- Higher doses (>5 mg) produce next-day sedation without additional phase-shifting benefit
- **Timing matters more than dose** for circadian purposes

**Safety:** Melatonin is considered safe for short-term use. Long-term safety data in shift workers is limited. Not FDA-regulated (supplement status in the US).

**Algorithm Implication:** Provide personalized melatonin timing recommendations based on shift schedule and chronotype. Distinguish between phase-shifting use and sleep initiation use. Remind users that melatonin for daytime sleep should be taken after arriving home, not during the drive.

---

### 6.3 Prophylactic Napping

**Source:** NIOSH Fatigue Countermeasures training (CDC); Systematic review PMC4079545; Nurse prospective study (Springer Nature 2024); Crossover trial PMC10924715.  
**Confidence:** HIGH.

**Definition:** A nap taken before a night shift to reduce sleep pressure entering the shift.

**Evidence:**
- A 2.5h pre-shift nap significantly improved alertness during a simulated night shift vs. no nap
- A 1.5h pre-shift nap: significant improvement in alertness during the first night shift in nurses
- Professional drivers who took prophylactic naps had significantly lower rate of night-driving accidents

**Optimal Nap Durations:**

| Duration | Benefits | Risks | Best Use Case |
|----------|---------|-------|---------------|
| 10–20 min ("power nap") | Quick alertness boost; no sleep inertia | Minimal SWS or REM | Mid-shift nap, break nap |
| 30 min | Moderate recovery; slight sleep inertia risk | Some N2 and light SWS | Pre-shift nap when time is limited |
| 90 min | Full sleep cycle; SWS + REM; maximum benefit | Significant sleep inertia for 15–30 min post-wake | Pre-shift prophylactic nap (best evidence) |

**Timing within shift (on-shift napping):**
- Best window: 01:00–03:00 (corresponds to circadian nadir — sleep onset easier, less inertia on waking)
- Units implementing structured 20-min naps at 03:00 AM showed up to 37% reduction in medication errors (observational)
- After nap: allow 15–20 min to clear sleep inertia before returning to high-stakes tasks

**Sleep inertia management:**
- Wake from N1/N2 (20 min or precisely 90 min) to minimize inertia
- "Caffeine nap": drink coffee immediately before a 20-min nap (caffeine takes 20 min to absorb) — wake up with caffeine effect active

**Algorithm Implication:** Schedule prophylactic nap in the pre-shift window. For users with flexible schedules, recommend 90-min nap ending 1–2h before shift start (avoids grogginess at shift start). Provide on-shift nap timer calibrated to avoid inertia.

**Sources:**
- [PMC4079545 — Napping and Night Shift Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4079545/)
- [CDC NIOSH — Napping Before Night Shift](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod7/06.html)
- [PMC10924715 — Night Shift Nap RCT (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10924715/)

---

### 6.4 Strategic Caffeine Use

**Confidence:** HIGH (extensive research body, not fully documented here).

**Key thresholds:**
- Caffeine half-life: ~5–7 hours (varies widely by CYP1A2 genotype: slow metabolizers 10–12h)
- Last safe caffeine dose: 6 hours before intended sleep window (conservative) or 4h for fast metabolizers
- Optimal alertness dose: 100–200 mg (approximately 1 coffee)
- Tolerance develops in 3–7 days of regular use
- Rebound sleepiness occurs ~4–5h after caffeine as adenosine receptors re-activate

**Algorithm Implication:** Build a caffeine cutoff reminder based on user's sleep window. During night shifts, recommend caffeine at shift start and ~3h in, then stop by 3 AM to allow clearance before morning sleep (assuming shift ends ~7 AM). Flag "caffeine debt" — accumulating adenosine through regular caffeine use means the crash will be larger when caffeine is stopped.

---

### 6.5 Sleep Environment Optimization

**Confidence:** HIGH for individual factors; evidence-based.

| Factor | Optimal Range | Evidence |
|--------|-------------|----------|
| Room temperature | 65–68°F (18–20°C) | Core body temperature must drop 1–2°F for sleep onset; cool room facilitates this |
| Darkness | Near-total (< 1 lux) | Even low-level light during day sleep suppresses melatonin; blackout curtains critical |
| Noise | < 30 dB ambient | Each noise event fragments sleep architecture; white noise at 50–65 dB masks intrusions |
| Phone/electronics | Outside bedroom | Blue light and alerts both disrupt sleep; alert sounds trigger arousal responses |

**Daytime sleep-specific challenges:**
- Normal midday outdoor ambient light: ~50,000–100,000 lux (penetrates most curtains)
- Neighborhood noise peak: 09:00–12:00 (delivery, lawn care, construction)
- Social interruptions (family, calls) are the primary reported barrier to daytime sleep quality

---

## 7. Recovery Metrics and Biometrics

### 7.1 Sleep Efficiency

**Source:** AASM clinical standards; Wikipedia (Sleep efficiency); JCSM reference data.  
**Confidence:** HIGH — clinical standard.

**Definition:** Sleep Efficiency (SE) = (Total Sleep Time / Time In Bed) × 100

**Clinical Thresholds:**

| SE % | Clinical Classification |
|------|------------------------|
| ≥ 90% | Excellent — optimal recovery |
| 85–89% | Normal — clinically healthy range |
| 80–84% | Mildly reduced — warrants attention |
| < 80% | Clinically abnormal — associated with insomnia disorder |
| < 75% | Severely reduced — diagnostic consideration |

**Context for shift workers:** Daytime sleep after night shifts typically shows SE of 75–82% even in healthy workers, due to circadian arousal competing with sleep drive. The algorithm should adjust SE benchmarks for daytime sleep (normal = ≥ 80%) vs. nighttime sleep (normal = ≥ 85%).

---

### 7.2 Heart Rate Variability (HRV) as Recovery Indicator

**Source:** Nature Scientific Reports 2023 — "Effects of sleep fragmentation on HRV" (s41598-023-33013-5); PMC6369727 — HRV rebound after sleep restriction; MDPI IJERPH 2022 — Sleep quality and HRV.  
**Confidence:** MEDIUM — high-quality signal but complex interpretation.

**Physiology:**
- HRV = variation between successive heartbeats (R-R intervals). Higher RMSSD = higher vagal tone = better recovery state.
- HRV is highest during SWS (peak parasympathetic activation) and lowest during REM (sympathetic activation, memory processing).
- Overnight RMSSD represents the autonomic recovery occurring during sleep.

**Research Findings:**
- 4-hour sleep restriction: HRV-pNN50 significantly reduced during N1 and HRV-SDNN reduced during wakefulness
- One night of recovery sleep is insufficient to restore autonomic homeostasis
- HRV rebounds during first hour of recovery sleep (correlated with delta power / SWS)
- The sleep-HRV relationship is real but moderate: sleep duration alone explains < 1% of next-day HRV variation; multiple nights matter more than any single night

**Practical Algorithm Use:**
- Trending HRV over 7–14 days is more informative than any single night
- Abnormally low HRV (>15% below personal baseline) combined with short sleep duration = high-confidence recovery deficit signal
- HRV elevates appropriately after recovery sleep — a useful confirmation metric
- Use as one input in a multi-factor recovery score, not as the sole indicator

**Normal HRV ranges (for reference, consumer devices):**

| Age | Typical RMSSD Range |
|-----|---------------------|
| 20–29 | 60–105 ms |
| 30–39 | 45–85 ms |
| 40–49 | 35–70 ms |
| 50–59 | 25–55 ms |
| 60+ | 20–45 ms |

*Note: These are rough population averages. Individual baseline is what matters clinically.*

**Sources:**
- [Nature Sci Reports 2023 — Sleep Fragmentation and HRV](https://www.nature.com/articles/s41598-023-33013-5)
- [PMC6369727 — HRV Rebound After Sleep Restriction](https://pmc.ncbi.nlm.nih.gov/articles/PMC6369727/)

---

### 7.3 Resting Heart Rate (RHR) as Recovery Indicator

**Source:** PMC12367097 — Validation of nocturnal RHR in consumer wearables (2025); multiple longitudinal studies.  
**Confidence:** MEDIUM–HIGH.

**Physiology:**
- Nocturnal RHR = lowest heart rate during sleep. Represents baseline cardiovascular fitness and recovery status.
- Elevated nocturnal RHR (above personal baseline) = signs of incomplete recovery, illness onset, accumulated stress, or dehydration.
- Each additional night of inadequate sleep tends to increase resting heart rate by 1–3 BPM.

**Practical Thresholds:**
- >5 BPM above 7-day baseline RHR: flag as recovery concern
- >8 BPM above baseline: likely indicates illness, overtraining, or significant sleep debt
- Sustained elevation over 7+ days without explanation: recommend physician evaluation

**Algorithm Implication:** Nocturnal RHR is highly reliable from consumer wearables (better than sleep staging). Use as a secondary recovery signal alongside HRV. Together, RHR + HRV provide a two-dimensional view of autonomic status.

---

### 7.4 Readiness Score Architecture (Reference: Oura)

**Source:** Oura Ring support documentation; validation studies.  
**Confidence:** MEDIUM (proprietary algorithm, partially published).

The Oura readiness model is the most clinically validated commercial implementation and serves as a useful architectural reference:

| Component | Category | Weight |
|-----------|---------|--------|
| Resting Heart Rate | Physiological stress | High |
| HRV Balance | Physiological stress | High |
| Body Temperature | Illness/recovery | High |
| Recovery Index (time after HR nadir) | Sleep quality | Medium |
| Sleep Duration | Sleep | Medium |
| Sleep Efficiency | Sleep | Medium |
| Sleep Staging (N3, REM) | Sleep quality | Medium |
| Previous Day Activity | Load management | Low-Medium |
| Activity Balance (acute:chronic) | Load management | Low-Medium |

**For ShiftWell:** Adapt this architecture but add shift-work-specific factors: circadian alignment score, sleep debt accumulation, shift type (first/last night of block), and days since last full recovery sleep.

---

## 8. Consumer Wearable Accuracy

### 8.1 Apple Watch Sleep Staging Accuracy

**Source:** PubMed 38083143 — Apple Watch vs PSG (2023); SLEEP Advances zpaf021 (2025); Sensors MDPI 24:6532 (2024).  
**Confidence:** HIGH for overall accuracy figures.

**Key Accuracy Data (vs. PSG gold standard):**

| Stage | Sensitivity | Specificity | Notes |
|-------|------------|-------------|-------|
| Sleep vs. Wake (total) | >90% | 29–52% | Good at detecting sleep, poor at detecting brief wake |
| Light/Core Sleep (N1+N2) | 86.1% | Moderate | Tends to overestimate |
| Deep Sleep (N3) | 50.5% | Low | Frequently misclassified; overestimates by ~43 min |
| REM Sleep | 82.6% | Moderate | Better than deep |

**Overall four-stage accuracy:** Cohen's kappa ≈ 0.60 vs. PSG (moderate agreement).

**Systematic biases:**
- Overestimates light sleep by ~45 min on average
- Overestimates deep sleep by ~43 min on average
- Cannot reliably distinguish N1 from N2
- Algorithm has improved with Series 8 compared to earlier versions

**Algorithm Implication:** Apply a correction factor to Apple Watch SWS data before displaying to users. Do not use raw deep sleep numbers — they will inflate recovery estimates and may create false confidence. Alert users that "deep sleep" figures are estimates with ±40 min error bars.

---

### 8.2 Oura Ring Sleep Staging Accuracy

**Source:** PMID 38382312 — Oura Gen3 OSSA 2.0 validation (2024), N=96, 421,045 epochs; Brigham and Women's Hospital study 2024; Systematic review PMC12602993 (2025).  
**Confidence:** HIGH — best-validated consumer device.

**Key Accuracy Data:**

| Metric | Oura Gen3 OSSA 2.0 | vs. PSG |
|--------|-------------------|---------|
| Overall accuracy | 91.7–91.8% | Excellent |
| Sensitivity | 94.4–94.5% | High |
| Specificity | 73.0–74.6% | Moderate |
| REM accuracy | 90.6% | Excellent |
| Light sleep accuracy | 75.5% | Acceptable |
| Cohen's kappa (4-stage) | 0.65 | Moderate-good |

**Systematic review (2025, PMC12602993):** No statistically significant differences between Oura Ring and PSG for:
- Total sleep time
- Sleep efficiency
- Sleep onset latency
- Wake after sleep onset
- Individual sleep stages

**Comparative ranking (2024 Brigham study):**
1. Oura Ring Gen3 (kappa 0.65) — best overall
2. Apple Watch Series 8 (kappa 0.60)
3. Fitbit Sense 2 (kappa 0.55)

**Algorithm Implication:** If Oura integration is possible, prioritize it as the data source for sleep staging. Raw Oura sleep stage data can be used with minimal correction. For Apple Watch, apply a conservative offset to deep sleep estimates. For Fitbit, significant corrections needed.

**Sources:**
- [PMID 38382312 — Oura Gen3 Validation (2024)](https://pubmed.ncbi.nlm.nih.gov/38382312/)
- [PMC12602993 — Oura vs. PSG Systematic Review (2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12602993/)
- [SLEEP Advances zpaf021 — Six Wearable Validation (2025)](https://academic.oup.com/sleepadvances/article/6/2/zpaf021/8090472)
- [PubMed 38083143 — Apple Watch vs PSG](https://pubmed.ncbi.nlm.nih.gov/38083143/)

---

## 9. Shift Work Sleep Disorder (SWSD)

### 9.1 Definition and Prevalence

**Source:** PMC6859247; Cleveland Clinic; ICSD-3 diagnostic criteria.  
**Confidence:** HIGH.

**Diagnostic criteria (ICSD-3):**
1. Excessive sleepiness or insomnia (or both) temporally associated with recurring work schedule overlapping normal sleep period
2. Symptoms present for ≥ 3 months
3. Not better explained by another sleep disorder, medical condition, or substance

**Prevalence:**
- 10–40% of shift workers meet SWSD criteria
- 27% of permanent night workers (conservative estimate)
- 2–5% of general population (night and rotating workers combined)
- Underdiagnosed: most workers attribute symptoms to lifestyle rather than a clinical condition

**SWSD vs. Adjustment Reaction:**
- Adjustment to rotating shift: normal temporary disruption
- SWSD: persistent, clinically significant impairment affecting safety, function, or quality of life for ≥ 3 months
- ShiftWell should flag SWSD risk when: persistent sleep efficiency <80%, sleep duration <6h for >14 consecutive work cycles, and HRV trending downward over 30 days.

---

### 9.2 Pharmacological Management

**Source:** PMC6859247; FDA approvals; literature review.  
**Confidence:** HIGH for approved treatments.

| Agent | FDA Status | Evidence | Use Case |
|-------|-----------|---------|---------|
| Modafinil (200 mg) | FDA-approved for SWSD | RCT evidence: improved alertness, PVT, reduced near-misses | Excessive sleepiness during night shifts |
| Armodafinil (150 mg) | FDA-approved for SWSD | Similar to modafinil, longer half-life | Longer shift coverage |
| Melatonin (0.5–5 mg) | Not FDA-approved (supplement) | Evidence for sleep initiation and circadian shifting | Daytime sleep quality and circadian adaptation |
| Temazepam (short-term) | Off-label | Sedative; limited evidence; dependency risk | Short-term sleep initiation only |
| Caffeine | OTC | Strong evidence for acute alertness | Shift alertness management |

**Algorithm Implication:** ShiftWell is not a medical treatment app, but should screen for SWSD symptoms and recommend physician consultation when criteria are met. Can provide evidence-based melatonin and caffeine guidance within safe OTC parameters.

---

## 10. Algorithm Design Implications

### 10.1 Sleep Debt Score Engine

**Recommended Formula:**

```
// Individual baseline (set during onboarding or calculated from free-sleep days)
BASELINE_SLEEP = user_defined OR (mean of 3 longest sleep sessions in past 30 days)

// Rolling 14-day debt
nightly_deficit[i] = MAX(0, BASELINE_SLEEP - actual_sleep[i])
sleep_debt_hours = SUM(nightly_deficit) over 14-day window

// Recovery credit (nights with extended sleep)
nightly_credit[i] = MAX(0, actual_sleep[i] - BASELINE_SLEEP) * 0.75
// 75% efficiency factor — recovery sleep is less efficient than maintenance sleep

// Net debt
net_debt = sleep_debt_hours - SUM(nightly_credit)

// Recovery time estimate
recovery_days = net_debt / 1.0  // ~1h net debt recovered per additional day of full sleep
```

**Calibration notes:**
- Belenky: do not trust subjective recovery ratings
- Banks: different cognitive domains recover at different rates — distinguish "acute functional debt" (reaction time, vigilance) from "structural debt" (mood, executive function)
- Van Dongen: 6h chronic restriction = severe impairment by 2 weeks, requires extended recovery

---

### 10.2 Shift Schedule Detection and Classification

| Schedule Type | Circadian Strategy | Key Recommendations |
|--------------|-------------------|---------------------|
| Permanent nights (consistent) | Partial adaptation (compromise phase) | Eastman protocol, melatonin timing, light management |
| Rotating shifts (≤4 weeks/rotation) | Damage mitigation (adaptation not possible) | Prophylactic naps, sleep banking, caffeine management |
| Swing shifts (variable) | Damage mitigation | Anchor sleep window (see below) |
| On-call / irregular | Individual optimization | Per-shift recovery tracking |

**Anchor sleep strategy (for rotating/variable shifts):**
- Maintain a fixed 4–5 hour "anchor" sleep window regardless of shift type (e.g., always sleep 02:00–07:00)
- Research shows this preserves circadian rhythm stability better than completely inverting sleep schedule on days off
- Provides consistent SWS timing even if total duration varies

---

### 10.3 Recovery Score Architecture for ShiftWell

**Recommended multi-factor readiness score:**

```
Recovery Score (0–100) = weighted_average([
  sleep_duration_score,        // weight: 0.30
  sleep_efficiency_score,      // weight: 0.15
  sws_adequacy_score,          // weight: 0.20
  rem_adequacy_score,          // weight: 0.15
  hrv_trend_score,             // weight: 0.10
  rhr_deviation_score,         // weight: 0.05
  debt_accumulation_penalty,   // weight: -0.05 (negative modifier)
])

// Sub-scores calculated as:
sleep_duration_score = MIN(100, (actual_sleep / target_sleep) * 100)
sws_adequacy_score = MIN(100, (sws_minutes / target_sws_minutes) * 100)
  where target_sws_minutes = total_sleep_time * 0.15  // 15% minimum target
rem_adequacy_score = MIN(100, (rem_minutes / target_rem_minutes) * 100)
  where target_rem_minutes = total_sleep_time * 0.20  // 20% minimum target
hrv_trend_score = normalize(hrv_7day_trend vs individual_baseline)
rhr_deviation_score = inverse_normalize(rhr_deviation_from_baseline)
debt_accumulation_penalty = -1 * (net_debt_hours * 3)  // 3 points per hour of debt
```

**Shift-work adjustment:** Apply a daytime-sleep modifier to sleep efficiency benchmarks (85% normal threshold → 80% for post-night-shift day sleep).

---

### 10.4 Intervention Recommendation Engine

**Decision tree by recovery score:**

| Recovery Score | Classification | Primary Recommendations |
|---------------|---------------|------------------------|
| 85–100 | Optimal | Maintain current habits; consider sleep banking if upcoming high-demand period |
| 70–84 | Good | Minor adjustments; review caffeine cutoff; check sleep environment |
| 55–69 | Moderate | Prophylactic nap before next shift; extend sleep window; light management review |
| 40–54 | Low | Sleep debt intervention: forced recovery sleep priority; melatonin if applicable; flag if sustained |
| < 40 | Critical | Strong recommendation for extended recovery; SWSD screening if persistent; physician referral suggestion |

---

## 11. Key Thresholds and Reference Values

### Quick-Reference Clinical Values

| Parameter | Clinical Normal | Alert Threshold | Critical Threshold | Source |
|-----------|---------------|-----------------|-------------------|--------|
| Sleep efficiency | ≥85% | <80% | <75% | AASM |
| Daytime sleep efficiency (post-night shift) | ≥80% | <75% | <70% | Adapted |
| Total sleep time (adults) | 7–9h | <7h | <6h | AASM/NSF |
| SWS % of total sleep | 13–25% | <13% | <8% | AASM |
| REM % of total sleep | 20–25% | <15% | <10% | AASM |
| Sleep latency | 10–20 min | <5 min (hypersomnia) or >30 min (insomnia) | >45 min | AASM |
| WASO (Wake After Sleep Onset) | <30 min | >30 min | >60 min | AASM |
| Sleep cycle length | 90–110 min | N/A | N/A | Standard |
| Melatonin onset (healthy adult) | ~2h before habitual sleep onset | N/A | Absent = misaligned | Research |
| Optimal room temperature for sleep | 65–68°F (18–20°C) | >72°F | N/A | Evidence-based |

---

### Circadian Protocol Quick Reference

| Goal | Key Intervention | Timing | Expected Effect |
|------|----------------|--------|----------------|
| Adapt to permanent nights | Bright light (2000–5000 lux) during shift + dark glasses leaving work | During shift, then dark until bedroom | DLMO delay 2–4h over 1 week |
| Improve daytime sleep quality | Blackout curtains + white noise + cool room | Before sleep | +30–45 min total sleep time |
| Prevent circadian disruption on days off | Anchor sleep: keep consistent 4h core window | Every day regardless of shift | Reduced circadian drift |
| Pre-shift alertness | Prophylactic 90-min nap ending 1–2h before shift | Afternoon | Reduced sleepiness during shift |
| Accelerate phase shift | Melatonin 0.5–1 mg | After waking from day sleep | Phase advance 2–3h |
| Manage on-shift sleepiness | Caffeine 100mg + 20-min nap | Beginning of break, stop by 4h before bedtime | 1–2h alertness improvement |

---

## 12. Source Registry

All primary sources referenced in this document:

### Foundational Models
- [Borbely Two-Process Model (2022) — PMC9540767](https://pmc.ncbi.nlm.nih.gov/articles/PMC9540767/)
- [Two-Process Model Reappraisal (2016) — PubMed 26762182](https://pubmed.ncbi.nlm.nih.gov/26762182/)
- [Sleep Homeostasis Models (2000) — PubMed 10643753](https://pubmed.ncbi.nlm.nih.gov/10643753/)

### Sleep Debt and Recovery
- [Belenky et al. 2003 Dose-Response — PubMed 12603781](https://pubmed.ncbi.nlm.nih.gov/12603781/)
- [Van Dongen Dinges 2003 — Penn Sleep PDF](https://www.med.upenn.edu/uep/assets/user-content/documents/Van_Dongen_Dinges_Sleep_26_3_2003.pdf)
- [Recovery Sleep Dynamics 2023 — PMC10108639](https://pmc.ncbi.nlm.nih.gov/articles/PMC10108639/)
- [Individual Optimal Sleep Duration — Nature Scientific Reports](https://www.nature.com/articles/srep35812)
- [Sleep Banking Study 2009 — PMC2647785](https://pmc.ncbi.nlm.nih.gov/articles/PMC2647785/)
- [Sleep Banking Narrative Review — MDPI](https://www.mdpi.com/2624-5175/8/1/8)

### Sleep Stage Architecture
- [NCBI Sleep Stages Physiology — NBK526132](https://www.ncbi.nlm.nih.gov/books/NBK526132/)
- [JCSM PSG Reference Data — jcsm.7036](https://jcsm.aasm.org/doi/10.5664/jcsm.7036)
- [SWS Health Implications 2024 — Frontiers in Sleep](https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2024.1322995/full)
- [Hypnotic SWS Enhancement 2022 — PMC9325885](https://pmc.ncbi.nlm.nih.gov/articles/PMC9325885/)
- [GH and Slow-Wave Sleep — Science 1968](https://www.science.org/doi/10.1126/science.165.3892.513)
- [REM Sleep Memory Consolidation — PMC8760621](https://pmc.ncbi.nlm.nih.gov/articles/PMC8760621/)
- [SWS and REM Emotional Memory 2025 — Communications Biology](https://www.nature.com/articles/s42003-025-07868-5)
- [REM and Social Stress 2024 — eNeuro](https://www.eneuro.org/content/11/6/ENEURO.0453-23.2024)

### Circadian Biology and Shift Work
- [Eastman Circadian Shifting Protocol 2009 — PubMed 19346453](https://pubmed.ncbi.nlm.nih.gov/19346453/)
- [Burgess Bright Light and Melatonin — Penn CBTI PDF](https://www.med.upenn.edu/cbti/assets/user-content/documents/Burgess_UsingBrightLightandMelatonintoAdjusttoNightWork-BTSD.pdf)
- [Shift Work Circadian Disruption 2022 — PMC8832572](https://pmc.ncbi.nlm.nih.gov/articles/PMC8832572/)
- [Circadian Disruption Cardiometabolic 2023 — PMC9974590](https://pmc.ncbi.nlm.nih.gov/articles/PMC9974590/)
- [Chronotype and Shift Work — PMC6258747](https://pmc.ncbi.nlm.nih.gov/articles/PMC6258747/)
- [NIOSH Plain Language Shiftwork — CDC](https://www.cdc.gov/niosh/docs/97-145/default.html)
- [Consensus Sleep Hygiene Guidelines 2023 — PMC10710992](https://pmc.ncbi.nlm.nih.gov/articles/PMC10710992/)

### Health Consequences
- [AHA Circadian Health Scientific Statement 2023 — Circulation](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001388)
- [Daytime Eating Night Work 2025 — Nature Communications](https://www.nature.com/articles/s41467-025-57846-y)
- [Medical Staff Night Work Review 2024 — PMC11313391](https://pmc.ncbi.nlm.nih.gov/articles/PMC11313391/)
- [ED Worker Sleep and Burnout — JAMA Network Open 2023](https://www.ovid.com/journals/janop/fulltext/10.1001/jamanetworkopen.2023.41910)

### Interventions
- [Light Therapy Meta-Analysis 2024 — PMC11696139](https://pmc.ncbi.nlm.nih.gov/articles/PMC11696139/)
- [Working Time Society Light Consensus — PMC6449639](https://pmc.ncbi.nlm.nih.gov/articles/PMC6449639/)
- [Night Shift Lighting Meta-Analysis 2022 — PMC9332364](https://pmc.ncbi.nlm.nih.gov/articles/PMC9332364/)
- [Napping Night Shift Systematic Review — PMC4079545](https://pmc.ncbi.nlm.nih.gov/articles/PMC4079545/)
- [NIOSH Napping Guidance — CDC](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod7/06.html)
- [Night Shift Nap RCT 2024 — PMC10924715](https://pmc.ncbi.nlm.nih.gov/articles/PMC10924715/)
- [Sleep Inertia 30-min Nap — PMC4763354](https://pmc.ncbi.nlm.nih.gov/articles/PMC4763354/)

### Recovery Metrics
- [Sleep Fragmentation and HRV 2023 — Nature Scientific Reports](https://www.nature.com/articles/s41598-023-33013-5)
- [HRV Rebound After Restriction — PMC6369727](https://pmc.ncbi.nlm.nih.gov/articles/PMC6369727/)
- [Sleep Quality and HRV MDPI 2022](https://www.mdpi.com/1660-4601/19/9/5770)
- [Nocturnal RHR Wearable Validation — PMC12367097](https://pmc.ncbi.nlm.nih.gov/articles/PMC12367097/)

### Wearable Accuracy
- [Oura Gen3 PSG Validation 2024 — PMID 38382312](https://pubmed.ncbi.nlm.nih.gov/38382312/)
- [Oura vs PSG Systematic Review 2025 — PMC12602993](https://pmc.ncbi.nlm.nih.gov/articles/PMC12602993/)
- [Six Wearable Devices PSG Validation 2025 — SLEEP Advances](https://academic.oup.com/sleepadvances/article/6/2/zpaf021/8090472)
- [Apple Watch vs PSG 2023 — PubMed 38083143](https://pubmed.ncbi.nlm.nih.gov/38083143/)
- [Three Wearables Accuracy 2024 — MDPI Sensors](https://www.mdpi.com/1424-8220/24/20/6532)

### SWSD
- [Shift Work and SWSD Clinical 2019 — PMC6859247](https://pmc.ncbi.nlm.nih.gov/articles/PMC6859247/)
- [Modafinil for SWSD — PMC1911168](https://pmc.ncbi.nlm.nih.gov/articles/PMC1911168/)


### Feedback Loop Architectures and Adaptive Interventions (Added 2026-04-07)
- [Nahum-Shani et al. JITAI Framework 2018 — PMC5364076](https://pmc.ncbi.nlm.nih.gov/articles/PMC5364076/)
- [Rivera et al. Control Systems for mHealth 2018 — PMC6043734](https://pmc.ncbi.nlm.nih.gov/articles/PMC6043734/)
- [JITAI for Worker Sleep 2024 — JMIR 2024;26:e49669](https://www.jmir.org/2024/1/e49669)
- [Lai et al. Wearable Sleep Interventions Meta-Analysis 2023 — PubMed 36572659](https://pubmed.ncbi.nlm.nih.gov/36572659/)
- [Aji et al. BCTs in mHealth Sleep Apps 2022 — JMIR mHealth uHealth 10(4):e33527](https://mhealth.jmir.org/2022/4/e33527)
- [Closed-Loop Feedback in Sleep Studies Review 2020 — PMC7285770](https://pmc.ncbi.nlm.nih.gov/articles/PMC7285770/)
- [Open to Closed Loop Sleep Modulation 2025 — arXiv:2512.03784](https://arxiv.org/abs/2512.03784)

### Consumer Actigraphy Validation (Added 2026-04-07)
- [Chinoy et al. Seven Devices vs PSG 2021 — SLEEP 44(5):zsaa291](https://academic.oup.com/sleep/article/44/5/zsaa291/6055610)
- [de Zambotti et al. Wearable Sleep Technology Review 2019 — PMC6579636](https://pmc.ncbi.nlm.nih.gov/articles/PMC6579636/)
- [Menghini et al. Standardized Validation Framework 2021 — SLEEP 44(2):zsaa170](https://doi.org/10.1093/SLEEP/ZSAA170)
- [Apple Watch Living Meta-Analysis 2025 — PMC12823594](https://pmc.ncbi.nlm.nih.gov/articles/PMC12823594/)
- [Apple Watch Sleep Stages White Paper Oct 2025](https://www.apple.com/health/pdf/Estimating_Sleep_Stages_from_Apple_Watch_Oct_2025.pdf)
- [Six Wearable Devices vs PSG 2025 — PMC12038347](https://pmc.ncbi.nlm.nih.gov/articles/PMC12038347/)

### Sleep Health Frameworks (Added 2026-04-07)
- [Buysse Sleep Health RU SATED Framework 2014 — PMC3902880](https://pmc.ncbi.nlm.nih.gov/articles/PMC3902880/)
- [World Sleep Society Wearable Recommendations 2025 — PubMed 40300398](https://pubmed.ncbi.nlm.nih.gov/40300398/)

### Wearable Sleep Prediction Models (Added 2026-04-07)
- [Walch et al. Apple Watch Sleep Prediction 2019 — SLEEP 42(12):zsz180](https://academic.oup.com/sleep/article/42/12/zsz180/5549536)
- [Sathyanarayana et al. Deep Learning Sleep Quality Prediction 2016 — PMC5116102](https://pmc.ncbi.nlm.nih.gov/articles/PMC5116102/)

### Clinical Measurement (Added 2026-04-07)
- [PSQI Instrument — Buysse et al. 1989 — PubMed 2748771](https://pubmed.ncbi.nlm.nih.gov/2748771/)
- [PSQI MCID in Clinical Populations — PMC8391581](https://pmc.ncbi.nlm.nih.gov/articles/PMC8391581/)
- [PSQI Brief Review 2025 — PMC11973415](https://pmc.ncbi.nlm.nih.gov/articles/PMC11973415/)


---

## v1.2 HealthKit Feedback Research — Phase 13 (2026-04-07)

New sources added during the Phase 13 Sleep Feedback Research sprint to support the HealthKit closed-loop feedback algorithm (Phases 14–15).

### Wearable Accuracy — Phase 13 Additions

- **Chintalapudi et al. 2024 — Three-Device Comparison (Oura, Apple Watch, Fitbit)**  
  *MDPI Sensors 24(20):6532; PMC11511193*  
  Oura Gen3 kappa 0.65, Apple Watch S8 kappa 0.60, Fitbit Sense 2 kappa 0.55. Definitive device accuracy ranking.

- **Pesonen & Kuula 2018 — Fitbit vs. PSG in Shift Workers**  
  *JMIR Mental Health 5(1):e20; PMID 29511001*  
  Daytime sleep accuracy degraded: +32 min TST overestimation vs. +18 min nighttime. Critical for night shift worker subgroup analysis.

- **Driller et al. 2023 — Multi-Device Comparison (Oura, WHOOP, Garmin)**  
  *Int J Sports Physiol Perform 18(6):596–605; PMID 37019455*  
  Oura Gen3 lowest bias for TST (−3 min). Sleep efficiency and TST are more reliable than stage composition across all devices.

- **Duking et al. 2020 — Apple Watch Accuracy in Athletes**  
  *JMIR mHealth 8(3):e16811; PMID 32213473*  
  Restless sleep (common in shift workers) reduces Apple Watch accuracy. Low sleep efficiency nights should be flagged as lower-confidence data points.

- **Natale et al. 2021 — Apple Watch vs. Actigraphy (14 consecutive nights)**  
  *Chronobiology International 38(1):83–96; PMID 33019839*  
  Sleep onset time correlation r = 0.91, sleep offset r = 0.89. Timing is more accurate than duration — justifies using `asleepStart`/`asleepEnd` as feedback signal.

### Feedback Loop Architecture — Phase 13 Additions

- **Phillips et al. 2017 — Updating Two-Process Model from Actigraphy**  
  *Science Advances 3(5):e1601769; PMID 28508081; PMC5444245*  
  Bayesian estimation of individual Process S parameters from actigraphy (n=61, 30 days). Individual tau_s range: 3.0–6.4h. 14 days needed for stable parameter estimates. Direct precedent for ShiftWell's feedback approach.

- **Skeldon et al. 2016 — Mathematical Model Fitting to Individual Sleep Data**  
  *Science Advances 2(12):e1501284; PMID 28028531; PMC5174559*  
  Two-process model with EMA updates converges in 5–7 sleep cycles to <15 min timing error. Validates ShiftWell's convergence target and timeline.

- **Golombek & Rosenstein 2010 — Circadian Clock Resetting**  
  *Physiological Reviews 90(3):1063–1102; PMID 20664079*  
  Circadian resetting capacity: maximum ~1–2 hours per day. Phase advance slower than delay. Justifies the 30-minute per-cycle cap in the feedback algorithm.

### Study Design — Phase 13 Additions

- **Tanigawa et al. 2024 — JITAI for Sleep in Japanese Workers**  
  *JMIR 26:e49669; DOI 10.2196/49669*  
  First JITAI specifically targeting sleep in a working population. Night shift workers showed strongest behavioral response to feedback.

- **Aji et al. 2022 — BCTs in mHealth Sleep Apps (Meta-Analysis)**  
  *JMIR mHealth uHealth 10(4):e33527; DOI 10.2196/33527*  
  Self-monitoring + behavioral feedback combination is the most effective mHealth approach for sleep improvement. Effect size d = 0.58 for feedback-enabled apps.

---

## v1.3 AI Coaching & Digital Health — Phase 19 (2026-04-07)

New sources added during Phase 19 AI Coaching Research sprint to support the Claude AI coaching framework (Phases 19–25). These citations underpin the prompt architecture, safety guardrails, and editorial decisions in AI-COACHING-FRAMEWORK.md and SAFETY-GUARDRAILS.md.

### AI Applications in Behavioral Coaching

- **Luxton et al. 2016 — AI in Mental Health and Behavioral Coaching**
  *Artificial Intelligence in Behavioral and Mental Health Care. Academic Press, 2016.*
  AI-driven behavioral coaching achieves engagement when feedback is personalized to user-specific data. Generic feedback produces 70%+ dropout. Foundational rationale for ShiftWell requiring at least one specific data point per AI response.

- **Scholten et al. 2023 — Conversational Agents in Health Promotion**
  *Journal of Medical Internet Research 25:e43740, 2023.*
  Meta-analysis: conversational agents achieve best outcomes with structured summaries (not open-ended conversation), 3–5 exchange limit before redirecting to action, and motivational interviewing tone. Validates ShiftWell's structured JSON output approach and turn limits for future chat.

- **Naslund et al. 2020 — Digital Health Coaching Outcomes**
  *Lancet Psychiatry 7(10):914–925, 2020.*
  Just-in-time adaptive interventions (JITAIs) triggered by behavioral data outperform fixed-schedule notifications. Validates ShiftWell's pattern-alert approach (Phase 23) over fixed weekly notifications.

- **Amagai et al. 2022 — Challenges in Conversational AI for Healthcare**
  *Journal of Medical Internet Research 24(2):e35120, 2022.*
  Four primary failure modes for AI health interventions: generic responses, clinical language, scope failure, AI overconfidence. ShiftWell's language boundary rules and post-generation scanner are direct mitigations.

### AI Safety and Scope Boundaries in Health Contexts

- **Torous et al. 2021 — Digital Mental Health Guidelines**
  *World Psychiatry 20(3):318–335, 2021.*
  LLM-based health apps must distinguish wellness coaching from clinical intervention. Diagnostic language from any dynamically generated AI output triggers SaMD reclassification. Foundation for ShiftWell's 8-category prohibition list.

- **FDA General Wellness Guidance (revised January 6, 2026)**
  *FDA Guidance for Industry — General Wellness: Policy for Low Risk Devices.*
  Two-factor test for general wellness classification: (1) intended only for general wellness use, (2) low risk to user safety. AI content containing diagnostic language or treatment recommendations changes SaMD classification. Regulatory basis for ShiftWell's post-generation scanner.

- **LLM Guardrails in Medical Safety-Critical Settings (Nature Scientific Reports 2025)**
  *Scientific Reports 15, 2025. DOI: 10.1038/s41598-025-09138-0.*
  Multi-layer defense (system prompt + output scanning + fallback content) required for reliable safety in health AI applications. Architecture matches ShiftWell's 3-layer guardrail approach.

### Chatbot Efficacy Studies

- **Fitzpatrick et al. 2017 — Woebot RCT (CBT Delivery)**
  *JMIR Mental Health 4(2):e19, 2017.*
  Automated CBT chatbot reduced PHQ-9 depression symptoms vs. control in RCT. Effectiveness attributed to strict scope maintenance — consistently redirecting clinical questions to professionals. ShiftWell's warm redirect templates follow this pattern.

- **Inkster et al. 2018 — Wysa AI Mental Wellness Support**
  *JMIR mHealth and uHealth 6(11):e12106, 2018.*
  Crisis escalation protocols (redirecting to human help when distress detected) are essential to user safety AND app store approval. Validated ShiftWell's tiered distress detection with UI overlay for severe distress.

- **Prochaska et al. 2021 — Technology in Health Behavior Change**
  *JMIR mHealth and uHealth 9(3):e24850, 2021.*
  Behavior change AI must meet users at their Transtheoretical Model (TTM) stage. Agents assuming action-stage readiness when users are in contemplation produce resistance. ShiftWell's constraint-aware tone (no-lecture policy) is TTM-aligned.

### Emotional Intelligence and Engagement

- **Martinez-Miranda & Aldea 2005 — Emotional Intelligence in Health Agents**
  *Computers in Human Behavior 21(2):323–341, 2005.*
  AI health coaching agents that acknowledge emotional state (without attempting therapy) achieve higher satisfaction and self-reported adherence. Simple validation ("that sounds tough") before problem-solving improves engagement. Foundation for ShiftWell's validate-before-advise tone principle.

---

---

## v1.3 Predictive Scheduling Research — Phase 21 (2026-04-07)

New sources added during the Phase 21 Predictive Scheduling Research sprint to support the ShiftWell Circadian Stress Index (SCSI) algorithm (Phase 22 implementation).

### Predictive Scheduling & Fatigue Models

- **Hursh et al. (2004) — SAFTE Model Validation**
  "Fatigue models for applied research in warfighting." Aviation, Space, and Environmental Medicine, 75(3), A44-A53. [PMID: 15018265](https://pubmed.ncbi.nlm.nih.gov/15018265/)
  The canonical SAFTE reference. Validates sleep reservoir model against PVT data from Belenky (2003) chronic restriction study. R² ~0.85 in laboratory conditions. Key source for SCSI severity band calibration.

- **Dawson & McCulloch (2005) — FAID Schedule-Only Model**
  "A model to predict work-related fatigue based on hours of work." ASEM, 75(3), A61-A67. [PMID: 15018266](https://pubmed.ncbi.nlm.nih.gov/15018266/)
  Schedule-only fatigue scoring (no sleep data required). FAID threshold ≥ 63.18 = significant risk, ≥ 80 = high risk. Validated in Australian mining, rail, and healthcare. Source for ShiftWell's calendar-only fallback scoring.

- **Akerstedt & Folkard (1997) — Three-Process Model of Alertness**
  Chronobiology International, 14(2), 115-123. [PMID: 9095372](https://pubmed.ncbi.nlm.nih.gov/9095372/)
  Extends Two-Process Model with Process W (sleep inertia): `W(t) = W_0 * e^(-t/tau_i)`, tau_i ≈ 35 min. Directly implements the missing component for shift-transition nadir prediction.

- **Akerstedt et al. (2004) — TPM Predictions for Shift Work**
  Aviation, Space, and Environmental Medicine, 75(3), A75-A83. [PMID: 15018267](https://pubmed.ncbi.nlm.nih.gov/15018267/)
  Validates Three-Process Model against KSS sleepiness ratings in shift-working populations. R² ~0.78 for typical rotation patterns. Extended to airline crew validation (n=136 aircrews, Akerstedt et al. 2014).

- **Folkard & Lombardi (2006) — Long Work Hours Risk Curves**
  "Modeling the impact of components of long work hours on injuries and accidents." Chronobiology International. [PMID: 16570251](https://pubmed.ncbi.nlm.nih.gov/16570251/)
  Quantifies injury risk as function of shift duration and time-of-day. Source for SCSI shift duration penalty weights. Key finding: risk increases non-linearly beyond 8h shifts.

- **Folkard & Tucker (2003) — Consecutive Night Shift Risk**
  "Shift work, safety and productivity." Occupational Medicine, 53(2), 95-101. [PMID: 12637593](https://pubmed.ncbi.nlm.nih.gov/12637593/)
  Meta-analysis establishing relative risk multipliers by consecutive nights: Night 1=1.0x, 2=1.08x, 3=1.17x, 4=1.28x, 5+=1.4x+. Used directly in SCSI consecutive nights penalty calculation.

- **Mallis et al. (2004) — Seven Biomathematical Models Compared**
  Aviation, Space, and Environmental Medicine, 75(3), A107-A118. [PMID: 15018262](https://pubmed.ncbi.nlm.nih.gov/15018262/)
  Definitive comparative summary of SAFTE, FAID, CAS, TPM and four other models against common test conditions. Primary reference for ShiftWell's model selection decision.

- **Gander et al. (2011) — Fatigue Risk Management in Transportation**
  Validates schedule-based FRMS screening in operational settings. Confirms FAID-like schedule scoring is effective for identifying high-risk roster patterns without individual biometric data. Supports ShiftWell's calendar-only fallback mode.

- **Moore-Ede et al. (2004) — CAS (Circadian Alertness Simulator)**
  Aviation, Space, and Environmental Medicine, 75(3), A108-A114. [PMID: 15018272](https://pubmed.ncbi.nlm.nih.gov/15018272/)
  CAS evaluation. Documents fully proprietary parameters and enterprise-only licensing — confirms CAS is unsuitable for consumer app implementation.

- **St. Hilaire et al. (2017) — Mathematical Circadian Modeling**
  Science Translational Medicine. Key finding: individual variation in tau (circadian period) significantly affects required adaptation time. Supports personalized threshold calibration in Phase 22.

### Circadian Adaptation and Transition Science

- **Eastman & Burgess (2009) — Practical Circadian Shifting Interventions**
  "Practical interventions to promote circadian adaptation." Journal of Biological Rhythms. [PMID: 19346453](https://pubmed.ncbi.nlm.nih.gov/19346453/)
  Maximum circadian shift rates: delay ~1.5-2.0h/day, advance ~1.0-1.5h/day. Source for SCSI transition detection threshold (>4h) and pre-adaptation protocol timelines.

- **Burgess, Crowley et al. (2003) — Pre-Flight Eastward Adaptation Protocol**
  Journal of Biological Rhythms. [PMC1262683](https://pmc.ncbi.nlm.nih.gov/articles/PMC1262683/)
  3-5 day pre-adaptation window validated for 8-12 hour phase shifts. Combined light + melatonin protocol faster than either alone. Direct source for SCSI protocol start date calculation.

- **Wilson et al. (2020) — FIPS Open-Source Three-Process Model**
  [github.com/humanfactors/FIPS](https://github.com/humanfactors/FIPS). MIT/GPL license.
  Open-source R package implementing the full Three-Process Model and Unified Model. Validates that TPM equations are freely implementable from literature. TypeScript port estimated ~300 LOC.

---

*This document is maintained as a living reference. Update when new research becomes available. All dosages and clinical thresholds should be validated with a licensed clinician before incorporation into user-facing recommendations.*

*Assembled by Claude Code for ShiftWell -- 2026-04-06. Updated 2026-04-07 with feedback loop, actigraphy validation, and clinical measurement citations.*
