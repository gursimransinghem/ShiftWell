# Fatigue Risk Management System Model Comparison

---
date: 2026-04-07
tags: [fatigue-modeling, biomathematical, FRMS, circadian, prediction, shift-work]
source: primary-literature-review
confidence: HIGH (core model descriptions), MEDIUM (licensing/mobile feasibility)
---

## Executive Summary

This document evaluates five biomathematical fatigue models for potential integration into ShiftWell's predictive circadian scheduling engine. ShiftWell already implements the Borbely Two-Process Model (Process S + Process C) in `energy-model.ts`. The question is: what additional modeling layer do we need to predict circadian stress *before it happens* across multi-day shift transitions?

**Recommendation:** Build a **Modified Three-Process Model (TPM)** natively in TypeScript, extending the existing Two-Process foundation with Process W (sleep inertia) and a multi-day sleep debt accumulator. Do NOT license SAFTE-FAST or FAID. The science is published, the equations are in the public domain, and the open-source FIPS and SAFTEr packages demonstrate that these models can be reimplemented from literature. ShiftWell's unique value is the *predictive lookahead* applied to personal shift calendars -- something no existing FRMS tool does on mobile for individual consumers.

---

## Models Evaluated

### 1. Borbely Two-Process Model (ALREADY IN USE)

**Reference:** Borbely (1982), revised Borbely et al. (2022, PMC9540767)

**What it is:**
The foundational framework. Sleep-wake regulation is governed by two independent processes:
- **Process S (Homeostatic):** Sleep pressure builds exponentially during wakefulness (tau ~18h) and dissipates exponentially during sleep.
- **Process C (Circadian):** ~24.2h sinusoidal oscillation driven by the SCN, with acrophase ~16:00 and nadir ~04:00.

**ShiftWell implementation:** `energy-model.ts` -- fully operational, 116 tests passing. Includes recovery modifier, caffeine decay, sleep debt carry-over, and sleep inertia damping.

**Strengths:**
- Mathematically elegant and well-validated (40+ years of literature)
- Low computational cost (elementary functions: sin, cos, exp)
- Already integrated and tested in the codebase
- Sufficient for single-day energy prediction

**Limitations for predictive scheduling:**
- **No multi-day state propagation.** Current implementation resets daily -- it doesn't carry forward cumulative circadian phase drift across a 14-day calendar scan.
- **No explicit sleep inertia process.** Current code has a linear ramp (0.5 + 0.5 * hoursAwake for t < 1h), but this is not the exponential decay Process W from the Three-Process Model.
- **No shift-transition-specific stress scoring.** It predicts *today's* energy, not *how bad next Tuesday's day-to-night transition will be*.

**Mobile feasibility:** Already running on-device. O(n) where n = hours in prediction window.

**Licensing:** Public domain. No restrictions.

---

### 2. SAFTE (Sleep, Activity, Fatigue, and Task Effectiveness)

**Reference:** Hursh et al. (2004), "Fatigue models for applied research in warfighting." Aviation, Space, and Environmental Medicine, 75(3), A44-A53. PMID: 15018265.

**What it is:**
A three-process biomathematical model originally developed for the US Army (Walter Reed). Predicts cognitive effectiveness (0-100 scale, calibrated to PVT performance) as a function of:

1. **Sleep Reservoir:** A "tank" metaphor -- sleep fills it, wakefulness drains it. Capacity ~8h. Fill rate depends on circadian timing of sleep (daytime sleep fills slower). Drain rate accelerates with extended wakefulness.
2. **Circadian Rhythm:** Sinusoidal oscillation with a 24.1h period. Phase is adjustable based on light exposure history.
3. **Sleep Inertia:** Exponential decay upon waking (time constant ~20 min). Magnitude depends on depth of prior sleep stage.

**Key equations (from US Patent 6,579,233 and SAFTEr package):**
- Reservoir fill: `R(t) = R_max - (R_max - R_0) * e^(-t/tau_fill)` during sleep
- Reservoir drain: `R(t) = R_0 * e^(-t/tau_drain)` during wake
- Effectiveness: `E(t) = f(R(t)) * C(t) * W(t)` where f is a sigmoid normalization
- Circadian: `C(t) = A * cos(2*pi*(t - phi)/T) + B`

**Accuracy:**
- Validated against PVT data from the Belenky et al. (2003) chronic sleep restriction study (the gold standard).
- FAA-validated for airline fatigue risk management (multiple studies, most recently Boeing 2023).
- Prediction accuracy: R-squared ~0.85 against PVT lapses in controlled laboratory settings. Field validation shows moderate accuracy (R-squared ~0.6-0.7).
- Tends to underpredict impairment at extreme sleep deprivation (>48h awake).

**Computational cost:** Low. Same order as Two-Process -- elementary functions evaluated at each time step. The SAFTEr R package runs a full simulation in milliseconds.

**Data requirements:**
- Minimum: sleep/wake timing (binary: asleep or awake)
- Optimal: sleep/wake timing + light exposure data
- Does NOT require biometric data (HRV, HR, etc.)

**Mobile feasibility:** HIGH. The mathematics are lightweight. The SAFTEr open-source R package (github.com/InstituteBehaviorResources/SAFTEr) demonstrates the model is implementable from patent equations. Could be ported to TypeScript in ~200 lines.

**Licensing:**
- The SAFTE *model equations* are in the public domain (published in peer-reviewed literature + US patent, now expired).
- **SAFTE-FAST** is the commercial SaaS product from Institutes for Behavior Resources. Enterprise pricing (not published, estimated $10K-50K/yr for organizational licenses). No consumer API. No mobile SDK.
- **SAFTEr** (R package) is free and open-source, built from patent equations with collaboration from Hursh himself.
- **Bottom line:** We can implement the published equations. We cannot call ourselves "SAFTE" or use their branding.

---

### 3. FAID (Fatigue Audit InterDyne)

**Reference:** Dawson & McCulloch (2005), Aviation, Space, and Environmental Medicine, 75(3), A61-A67. PMID: 15018266. Also: Fletcher & Dawson, Centre for Sleep Research.

**What it is:**
A **work-hours-only** fatigue scoring model. FAID is unique among FRMS models because it does NOT require sleep data -- it predicts fatigue purely from the work schedule (shift start/end times and breaks).

**How it works:**
- For each hour worked, a "fatigue penalty" is calculated based on:
  - **Time of day** (night hours penalized more heavily)
  - **Duration of shift** (longer shifts accumulate more fatigue)
  - **Time since last break** (diminishing recovery with shorter breaks)
  - **Cumulative work history** (rolling 7-day window)
- Penalties are summed to produce a FAID score (0-150+ scale)
- Threshold: FAID >= 63.18 = "significant fatigue risk"
- Threshold: FAID >= 80 = "high fatigue risk"

**Accuracy:**
- Less precise than SAFTE for predicting individual cognitive performance (no personalization).
- Better suited for *schedule-level screening* -- "is this roster pattern safe?" rather than "how alert is this person right now?"
- Validated in Australian mining, rail, and healthcare (Centre for Sleep Research studies).

**Computational cost:** Trivial. Pure arithmetic on shift schedule data. No differential equations.

**Data requirements:** ONLY work schedule (shift times). No sleep data, no biometrics.

**Mobile feasibility:** VERY HIGH. Essentially a scoring function over calendar events. Could run in <10ms.

**Licensing:**
- **FAID Quantum** is the commercial product from InterDynamics (interdynamics.com). Enterprise-licensed, no consumer access.
- The FAID *algorithm concept* (fatigue penalties by time-of-day and duration) is published in peer-reviewed literature. The exact scoring weights are proprietary.
- **Bottom line:** We can build a FAID-*inspired* schedule scorer from published risk curves (Folkard & Lombardi 2006). We cannot use the exact FAID scoring weights without a license.

---

### 4. CAS (Circadian Alertness Simulator)

**Reference:** Circadian Technologies (circadian.com). Moore-Ede et al. (2004), Aviation, Space, and Environmental Medicine, 75(3), A108-A114. PMID: 15018272.

**What it is:**
A proprietary biomathematical model with 25+ years of operational use. Produces a fatigue risk score (0-100) from work schedules with a minimum of 7 days of history.

**How it works:**
- Homeostatic process (sleep pressure) + circadian process (24h oscillation)
- Sleep timing estimator (predicts when workers will sleep based on their schedule, rather than requiring actual sleep data)
- Parameters optimized against 10,000+ days of field data from transportation workers
- Incorporates a "cumulative fatigue" component for multi-day effects

**Accuracy:**
- Well-validated in transportation (trucking, rail, aviation) operations.
- Proprietary parameter optimization means it may outperform generic Two-Process implementations on transportation populations.
- Less validated in healthcare shift work specifically.

**Computational cost:** Moderate. Includes a sleep prediction sub-model that adds complexity.

**Data requirements:** Work schedule (7+ days history). Does not require actual sleep data.

**Mobile feasibility:** MODERATE. The model itself is computable on mobile. But the optimized parameters are proprietary.

**Licensing:**
- Fully proprietary. Only available through CIRCADIAN consulting agreements.
- No public equations. No open-source implementation.
- Enterprise pricing ($25K-100K+ per organization per year).
- **Bottom line:** Cannot be implemented independently. Not suitable for a consumer app.

---

### 5. Three-Process Model (TPM) -- Akerstedt & Folkard

**Reference:** Akerstedt & Folkard (1997), Chronobiology International, 14(2), 115-123. PMID: 9095372. Extended: Akerstedt et al. (2004), Aviation, Space, and Environmental Medicine, 75(3), A75-A83.

**What it is:**
An extension of the Two-Process Model that adds **Process W (sleep inertia)** as a third component. This is the model implemented in the FIPS open-source R package.

**Components:**
1. **Process S (Homeostatic):** Identical to Borbely -- exponential rise during wake, exponential decay during sleep.
2. **Process C (Circadian):** Sinusoidal with first and second harmonics (24h + 12h components). Parameters fitted to KSS (Karolinska Sleepiness Scale) data.
3. **Process W (Sleep Inertia):** Exponential decay upon waking. Time constant ~1h. Magnitude depends on sleep depth at awakening.

**Key equation:**
```
Alertness(t) = S(t) + C(t) + W(t)
```

Where:
- `S(t)` during wake: `S_0 * e^(t/tau_w)` (exponential growth toward asymptote)
- `S(t)` during sleep: `S_upper * e^(-t/tau_s)` (exponential decay)
- `C(t) = A * cos(omega*t) + B * cos(2*omega*t) + mean` (two-harmonic circadian)
- `W(t) = W_0 * e^(-t/tau_i)` (inertia decay, tau_i ~35 min)
- Output scale: 1-16 (KSS) or transformed to 0-100

**Accuracy:**
- Validated against KSS and PVT data in multiple shift work studies.
- Extended with jet lag functions for airline operations (Akerstedt et al. 2014, validated on 136 aircrews).
- Comparable accuracy to SAFTE for typical shift patterns. Less accurate for extreme sleep deprivation.

**Computational cost:** Low. Three elementary functions summed per time step.

**Data requirements:**
- Minimum: sleep/wake timing
- Better: actual sleep onset/offset + prior sleep history (7+ days)

**Mobile feasibility:** VERY HIGH. The FIPS R package implements the full model in ~300 lines. TypeScript port would be straightforward.

**Licensing:**
- Model equations published in peer-reviewed literature. Fully in the public domain.
- FIPS (github.com/humanfactors/FIPS) is open-source (MIT/GPL).
- **Bottom line:** Can be implemented freely. This is the most accessible model for extension.

---

### 6. Achermann Two-Process Extension (Unified Model)

**Reference:** Borbely & Achermann (1999), Journal of Biological Rhythms; Ramakrishnan et al. (2016) unified model. Also implemented in FIPS.

**What it is:**
An enhanced version of the Two-Process Model that introduces:
- Non-linear interaction between Process S and Process C (at high sleep pressure, the circadian rhythm in waking performance vanishes)
- Light-dependent circadian phase shifting (2025 extension adds a light-response sub-model)
- More sophisticated sleep-stage-dependent S dissipation rates

**Accuracy:** Highest theoretical accuracy because it accounts for S-C interaction effects. Validated against laboratory sleep deprivation protocols.

**Computational cost:** Moderate. Requires numerical integration if using the full non-linear interaction model.

**Mobile feasibility:** MODERATE. The non-linear coupling adds complexity but remains computable in real-time.

**Licensing:** Public domain (academic publications).

---

## Comparison Matrix

| Criterion | Two-Process (current) | SAFTE | FAID | CAS | TPM | Achermann |
|-----------|----------------------|-------|------|-----|-----|-----------|
| **Accuracy (single day)** | Good | Very Good | Fair | Good | Very Good | Excellent |
| **Multi-day prediction** | Poor | Good | Good | Good | Good | Good |
| **Sleep data required** | Yes | Yes | No | No | Yes | Yes |
| **Schedule-only mode** | No | No | Yes | Yes | No | No |
| **Sleep inertia** | Basic | Yes | No | Partial | Yes | No |
| **Circadian phase tracking** | Static | Adjustable | No | Estimated | Static | Dynamic |
| **Computational cost** | Very Low | Low | Trivial | Moderate | Low | Moderate |
| **Mobile feasible** | YES | YES | YES | PARTIAL | YES | YES |
| **Open-source impl.** | ShiftWell | SAFTEr (R) | No | No | FIPS (R) | FIPS (R) |
| **Can implement freely** | Already done | Yes | Partial | No | Yes | Yes |
| **Consumer licensing** | N/A | Free | No | No | Free | Free |
| **Healthcare validation** | Yes | Limited | Limited | No | Yes (airline) | Yes (lab) |

---

## Recommendation: Build a Hybrid Model

### What to implement

**A Modified Three-Process Model with FAID-style schedule scoring:**

1. **Extend the existing Two-Process engine** (`energy-model.ts`) with:
   - **Process W (sleep inertia):** Replace the linear ramp with exponential decay (tau = 35 min, magnitude based on predicted sleep stage at awakening time). Equations from Akerstedt & Folkard 1997.
   - **Multi-day state propagation:** Carry forward cumulative sleep debt and circadian phase estimate across a 14-day lookahead window. The existing `sleepDeficit` calculation already does this for single-day; extend to array of days.
   - **Circadian phase drift model:** Track estimated acrophase shift across consecutive night shifts (~1h delay per night of light exposure protocol compliance). This is the key addition for predictive scheduling.

2. **Add a FAID-inspired Transition Stress Scorer** as a separate module:
   - Takes only the shift calendar as input (no sleep data needed)
   - Scores each shift transition using published risk curves from Folkard & Lombardi (2006) and Folkard & Tucker (2003)
   - Factors: direction of rotation, consecutive nights, recovery time between stretches, shift duration
   - Produces a 4-level stress classification: LOW / MEDIUM / HIGH / CRITICAL

3. **Combine both layers** for the predictive output:
   - Schedule scorer runs on calendar import (immediate, no biometrics needed)
   - Three-Process predictor runs with available sleep data for personalized predictions
   - When sleep data is unavailable, fall back to schedule-only scoring

### Why this approach

- **Maximizes existing investment.** The Two-Process engine has 116 tests. We extend, not replace.
- **No licensing dependencies.** All equations are published in peer-reviewed literature.
- **Mobile-native.** All computations are elementary functions (exp, cos, arithmetic). No numerical integration required for the TPM approach.
- **Graceful degradation.** Works with just a calendar (FAID-mode), gets better with sleep data (TPM-mode), gets best with biometrics (full model).
- **Unique competitive advantage.** No consumer app combines predictive multi-day fatigue modeling with personal calendar integration. SAFTE-FAST and FAID Quantum are enterprise tools for fleet managers. ShiftWell would be the first to give this power to individual shift workers.

### What NOT to do

- **Do NOT license SAFTE-FAST or CAS.** They are enterprise products ($10K-100K/yr) designed for fleet-level scheduling. Their value proposition (compliance reporting, roster optimization) doesn't apply to a consumer app.
- **Do NOT try to implement CAS.** Parameters are proprietary and unpublished.
- **Do NOT implement the full Achermann non-linear coupling.** The added accuracy is marginal for our use case (predicting transition stress across days, not modeling 72h sleep deprivation protocols). The computational cost and code complexity are not justified.

---

## Implementation Sizing

| Component | Estimated LOC (TypeScript) | Complexity | Dependencies |
|-----------|---------------------------|------------|--------------|
| Process W (sleep inertia) | ~40 lines | Low | energy-model.ts |
| Multi-day state propagation | ~120 lines | Medium | energy-model.ts, classify-shifts.ts |
| Circadian phase drift tracker | ~80 lines | Medium | light-protocol.ts |
| Transition Stress Scorer | ~150 lines | Medium | classify-shifts.ts |
| Lookahead orchestrator (14-day) | ~200 lines | Medium-High | All above |
| **Total** | **~590 lines** | **Medium** | Existing modules |

---

## Sources

### Primary Literature
- Borbely (1982). "A two process model of sleep regulation." Human Neurobiology, 1, 195-204.
- Borbely et al. (2022). "The two-process model of sleep regulation: Beginnings and outlook." Journal of Sleep Research. [PMC9540767](https://pmc.ncbi.nlm.nih.gov/articles/PMC9540767/)
- [Hursh et al. (2004). "Fatigue models for applied research in warfighting." ASEM, 75(3), A44-A53.](https://pubmed.ncbi.nlm.nih.gov/15018265/)
- [Dawson & McCulloch (2005). "A model to predict work-related fatigue based on hours of work." ASEM, 75(3), A61-A67.](https://pubmed.ncbi.nlm.nih.gov/15018266/)
- [Akerstedt & Folkard (1997). "The three-process model of alertness." Chronobiology International, 14(2), 115-123.](https://pubmed.ncbi.nlm.nih.gov/9095372/)
- [Akerstedt et al. (2004). "Predictions from the three-process model of alertness." ASEM, 75(3), A75-A83.](https://pubmed.ncbi.nlm.nih.gov/15018267/)
- [Mallis et al. (2004). "Summary of key features of seven biomathematical models." ASEM, 75(3), A107-A118.](https://pubmed.ncbi.nlm.nih.gov/15018262/)
- [Folkard & Lombardi (2006). "Modeling the impact of components of long work hours on injuries and accidents."](https://pubmed.ncbi.nlm.nih.gov/16570251/)
- [Folkard & Tucker (2003). "Shift work, safety and productivity." Occupational Medicine, 53(2), 95-101.](https://pubmed.ncbi.nlm.nih.gov/12637593/)
- [Moore-Ede et al. (2004). "CAS for fatigue risk assessment in transportation." ASEM, 75(3), A108-A114.](https://pubmed.ncbi.nlm.nih.gov/15018272/)

### Open-Source Implementations
- [FIPS R Package (Wilson et al., 2020)](https://github.com/humanfactors/FIPS) -- Three-Process Model and Unified Model
- [SAFTEr R Package](https://github.com/InstituteBehaviorResources/SAFTEr) -- SAFTE model from patent equations
- [SAFTEr SLEEP abstract (2024)](https://academic.oup.com/sleep/article/47/Supplement_1/A124/7654067)

### Commercial Products (not recommended for ShiftWell)
- [SAFTE-FAST](https://www.saftefast.com/overview) -- Enterprise FRMS platform
- [FAID Quantum](https://www.interdynamics.com/fatigue-risk-management-solutions/) -- Enterprise schedule assessment
- [CAS](https://circadian.com/software/cas) -- Proprietary circadian modeling
