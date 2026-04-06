# ShiftWell Adaptive Brain — Design Spec
**Date:** 2026-04-06  
**Status:** Approved for implementation planning  
**Author:** Brainstorming session — Dr. Gursimran Singh + Claude

---

## Overview

The Adaptive Brain closes the loop between real sleep data (Apple HealthKit) and plan generation. Every morning on app open, it reads the last 14 nights of sleep history, computes four weighted factors, and silently regenerates the plan when meaningful adjustments are warranted. When the plan changes, a brief explanatory card surfaces on the Today screen. After a 30-day learning phase, the system moves to full autopilot with a 24-hour undo window.

**Primary goal:** Reduce the circadian whiplash of schedule transitions — the biggest source of accumulated damage for shift workers — while accounting for sleep debt, recovery quality, and real-world constraints. The system never optimizes for full circadian adaptation (only 3% of night shift workers ever achieve it). It optimizes for minimal disruption and maximal recovery within the user's actual rotation.

---

## Architecture

### Approach: Integrated Adaptive Context

`AdaptiveContext` is assembled each morning from HealthKit + stores, then passed as a new optional parameter into the existing `generateSleepPlan()` function. The algorithm generates once — no post-processing adjustment layer. All four factors are simultaneous inputs, not sequential patches.

The existing `energy-model.ts` already accepts `recoveryScore` as an input — it was designed for this moment.

```
App opens (morning) →
  HealthKit reads last 14 nights →
    Recovery score computed
    Sleep debt / bank balance computed
    Circadian offset computed

  Shifts store + personal calendar →
    Upcoming transition detected
    Circadian protocol selected
    Calendar conflicts identified

  AdaptiveContext assembled →
    Delta vs. prior plan computed →
    If delta > 15 min threshold → regenerate plan →
      ChangeLog produced →
        AdaptiveInsightCard shown if changes are meaningful
        Undo available 24h
```

**15-minute threshold:** Changes smaller than 15 minutes are ignored — too small to surface, prevents flickering on noise.

---

## The Four Factors

| Factor | Weight | Max Adjustment | What It Drives |
|--------|--------|----------------|----------------|
| Circadian alignment | **50%** | ±3 hours | Bedtime/wake shifts for transitions |
| Sleep debt / bank | **20%** | +1.5h / −45min | Window extension, nap insertion, banking protocol |
| Schedule lookahead | **20%** | ±30 min | Conflict avoidance, pattern prep |
| Recovery score | **10%** | ±45 min | Fine-tuning based on last night's actual recovery |

Weights are additive into a single adjustment value, clamped to ±3h. The plan never prescribes physiologically extreme windows.

**Scientific rationale:**
- Circadian at 50%: Primary mechanism behind all shift work health consequences. Every major intervention study targets circadian phase first (Eastman & Burgess 2009, NIOSH protocols, Boivin & Boudreau 2014).
- Debt and lookahead equal at 20% each: Debt looks backward (Van Dongen 2003 — invisible to the sufferer). Lookahead looks forward (NIOSH prophylactic protocols show preparation equals recovery in value). Equal weight is scientifically justified.
- Recovery at 10%: Refinement signal only. Less reliable for shift workers — night shift suppresses HRV, making single-baseline scoring inaccurate.

**Graceful degradation without Apple Watch:** Recovery drops to 0%. Other factors reweight: circadian 57%, debt 23%, schedule 20%.

---

## Factor 1: Circadian Protocol Engine (50%)

### Five Transition Types

The engine scans the next 14 days of shifts, finds the next shift-type boundary, and selects a protocol. When no transition is detected (stable rotation), it enters maintenance mode — optimizes quality within the current baseline, stops shifting.

**Protocol 1 — Day → Night** *(hardest; clock must delay 4–6h)*  
Source: Eastman & Burgess 2009  
Trigger: Night shift detected within 3 days, current schedule is day-oriented

```
Day -3: Delay bedtime +90 min from chronotype baseline. Avoid bright light before noon.
Day -2: Delay bedtime +180 min from baseline (another 90 min). Blue-blockers after 8 PM.
Day -1: Delay bedtime +270 min from baseline (another 90 min). Melatonin 0.5mg at new target bedtime.
Night 1: Clock is ~4.5h delayed from original baseline — manageable, not catastrophic.
```
Note: Each day's bedtime recommendation is cumulative from the chronotype baseline, not from the previous night's actual sleep.

**Protocol 2 — Night → Day** *(requires split-sleep bridge; clock re-advances slowly)*  
Source: NIOSH anchor sleep protocol + Boivin & Boudreau 2014  
Max advance rate: ~1h per day

```
Morning after last night: 4h anchor recovery nap (not full sleep — preserves next-night drive).
Day +1: Sleep 2h earlier than anchor. Seek outdoor bright light immediately on waking.
Day +2: Sleep 2h earlier again. Full re-entrainment begins.
Day +3: Normal window ± 30 min.
```

**Protocol 3 — Evening → Night** *(moderate; 3–4h delay)*

```
Day -2: Delay bedtime 90 min. Dim home lights after 9 PM.
Day -1: Delay another 90 min + prophylactic nap recommendation.
Night 1: Clock 3h delayed — within tolerable range.
```

**Protocol 4 — Day → Evening** *(easiest; 2–3h delay)*

```
Day -1: Delay bedtime 60 min. Light exposure later in afternoon.
Evening 1: Clock can adapt naturally with one night adjustment.
```

**Protocol 5 — Single Isolated Night Shift** *(do not shift the clock — optimize within)*  
Source: The 3% finding. One isolated night in a day schedule does not warrant circadian shifting.

```
Pre-shift:   90-min prophylactic nap ending 30+ min before shift start
             (Ruggiero & Redeker 2014 — reduces errors by ~50%)
During:      Caffeine front-loaded to first half of shift only
             Bright light first half (>2500 lux), avoid last 2h
Post-shift:  Blue-blockers for commute home
             4–6h anchor sleep, then resume normal schedule
             Do NOT attempt full schedule flip
```

**Maintenance Mode** (stable rotation — no transition detected):  
Stop shifting. Optimize sleep quality within current baseline. Anchor sleep time ±30 min. Adjust only for debt and recovery signals.

### Output

`CircadianProtocol` — a list of dated `{ date, targetBedtime, targetWake, lightGuidance }` objects. These become hard constraints in `sleep-windows.ts`, overriding the base chronotype window during active transitions.

---

## Factor 2: Sleep Debt & Banking Engine (20%)

### Data Source
HealthKit — no date limit on historical queries. Read up to 14 nights. Filter for `asleepCore + asleepDeep + asleepREM` samples only (exclude `inBed` to avoid overestimating).

Apply Apple Watch deep sleep correction: subtract 43 minutes from reported deep sleep (wearable validation research — Apple Watch overestimates N3 by ~43 min on average).

### Debt Ledger

```
nightly_debt = sleepNeed - actual_sleep_hours   (negative = surplus)
rolling_debt = sum of last 14 nights' nightly_debt (capped at +10h)
sleep_bank   = max(0, -rolling_debt) (capped at +2h display — diminishing returns beyond)
```

**Severity tiers (Belenky 2003 dose-response):**

| Severity | Deficit | Response |
|----------|---------|----------|
| None | < 0.5h | No adjustment |
| Mild | 0.5–2h | Insert optional nap recommendation |
| Moderate | 2–5h | Extend next sleep window +45min, add nap |
| Severe | 5h+ | Maximum extension +1.5h, mandatory pre-shift nap, surface explicit warning |

**Recovery rate cap:** Maximum 1h debt repayment per night. The algorithm never prescribes > sleepNeed + 1.5h in a single night.

### Banking Protocol

**Trigger:** Upcoming shift restriction cluster detected **3–7 days away** AND 7-day average sleep < sleepNeed.  
**At < 3 days:** Banking window closed. Switch to prophylactic nap protocol only.

**Banking recommendation:**
- 3–4 nights: extend sleep 60–90 min above habitual (`sleepNeed + 1–1.5h`)
- Surfaces on Pre-Shift Brief tab as specific action: "Sleep [sleepNeed + 1.5h] tonight, tomorrow, and the night before your first night shift" (personalized to user's configured sleep need)
- Card explains what banking protects: "This protects your reaction time and alertness — but note: you'll still feel tired. That's normal."
- Card explains what it doesn't protect: "Complex decision-making requires sleep, not banking. If your schedule allows, advocate for lighter assignments on night 1."

**Sources:** Rupp et al. 2009 (7 nights × 10h TIB = full 7-day protection), Arnal et al. 2015, Cushman et al. 2023 (resident physicians), Van Dongen 2003.

### Sleep Bank Display

**Update required to SleepDebtCard** (currently single-bar debt-only) — add dual-meter mode:
- Red bar: debt owed
- Green bar: bank credit (surplus) — only visible when `bankHours > 0`
- Label: "+1.4h banked" or "−2.3h deficit"
- Subtext when bank > 0: "Protects vigilance for ~3 days of moderate restriction"
- When debt = 0 and bank = 0: existing "No debt detected — you're on track!" state unchanged

---

## Factor 3: Schedule Lookahead (20%)

### 14-Day Shift Scan

```
upcomingShifts = shifts filtered to next 14 days, sorted ascending
transitionDetected = find first shift-type boundary
calendarConflicts = personalEvents overlapping any computed sleep window
```

### Pattern Alerts (already partially built in PatternAlertCard)

- Night shift ≤ 3 days → activate circadian protocol + banking check
- Consecutive nights ≥ 2 → fatigue protocol (90-min nap between nights)
- Mixed week (day + night) → circadian whiplash warning, anchor sleep guidance
- Calendar conflict with sleep window → shift sleep window around event, flag if impossible

### Output

`ScheduleLookahead` with: `transitionType`, `daysUntilTransition`, `conflicts[]`, `patternAlerts[]`, `bankingWindowOpen: boolean`.

---

## Factor 4: Recovery Score (10%)

### Availability

Requires Apple Watch (Series 4+). Without Watch: factor is 0, other factors reweighted.  
Requires 30-day baseline per shift type before scores are reliable (learning phase).

### Formula

```
Recovery Score (0–100) =
  HRV_z  × 0.40   (RMSSD deviation from personal 60-day baseline, by shift type)
  RHR_z  × 0.25   (resting HR deviation from personal 30-day baseline, by shift type)
  Sleep  × 0.25   (composite sleep quality score)
  Resp_z × 0.10   (respiratory rate deviation — illness/stress flag)

Sleep Score =
  efficiency × 0.30   (target: ≥85% day sleep, ≥80% night sleep)
  deep_pct   × 0.25   (target: 18–23% of TST; apply −43min Apple Watch correction)
  rem_pct    × 0.25   (target: 20–25% of TST)
  duration   × 0.20   (actual / sleepNeed, capped at 1.0)
```

**Critical:** Baselines are split by sleep type (post-night-shift sleep vs. post-day sleep). A single rolling baseline produces inaccurate z-scores for shift workers — night shift systemically suppresses HRV compared to day-off sleep.

### Score Zones (WHOOP-validated thresholds)

| Zone | Score | Meaning |
|------|-------|---------|
| Green | 67–100 | Well-recovered. Full exertion appropriate. |
| Yellow | 34–66 | Moderate recovery. Reduce intensity where possible. |
| Red | 0–33 | Poor recovery. Prioritize rest. Adjust plan aggressively. |

### Plan Impact

- Green (67+): No adjustment from recovery factor
- Yellow (34–66): ±15–30 min fine-tuning of sleep window
- Red (0–33): +45 min extension recommendation, surface explicit recovery card

---

## Context Builder

**New module:** `src/lib/adaptive/context-builder.ts`

Fires on app open via a new `useAdaptivePlan` hook. Assembles:

```typescript
interface AdaptiveContext {
  circadian: {
    protocol: CircadianProtocol | null;
    phaseOffsetMinutes: number;
    maintenanceMode: boolean;
  };
  debt: {
    rollingHours: number;         // negative = surplus (bank)
    bankHours: number;            // min(0, -rollingHours), cap 2h
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  };
  schedule: {
    transitionType: TransitionType | null;
    daysUntilTransition: number;
    calendarConflicts: PersonalEvent[];
    patternAlerts: PatternAlert[];
    bankingWindowOpen: boolean;   // 3–7 days to upcoming restriction cluster
  };
  recovery: {
    score: number | null;         // null if no Watch or insufficient baseline
    zone: 'green' | 'yellow' | 'red' | null;
    baselineMature: boolean;      // true after 30 nights per shift type; recovery weight active only then
  };
  meta: {
    learningPhase: boolean;       // daysTracked < 30 — propose mode, not autopilot
    daysTracked: number;
    lastUpdated: Date;
  };
}
```

**Regeneration trigger:** If any factor produces a bedtime/wake delta > 15 minutes vs. prior plan snapshot → regenerate. Otherwise skip silently.

---

## Change Logger

**New module:** `src/lib/adaptive/change-logger.ts`

Records every plan adjustment for the explanatory card.

```typescript
interface AdaptiveChange {
  type: 'bedtime-shifted' | 'wake-shifted' | 'nap-added' | 'nap-removed' | 'window-extended' | 'banking-triggered';
  factor: 'circadian' | 'debt' | 'schedule' | 'recovery';
  magnitudeMinutes: number;
  humanReadable: string;  // "Bedtime shifted 90 min later"
  reason: string;         // "Night shift starts Friday"
  citation?: string;      // "Eastman & Burgess, 2009"
}
```

**Card copy examples:**
> "Bedtime shifted 90 min later — night shift starts Friday." *(circadian)*  
> "Recovery nap added at 1:30 PM — 2.3h sleep deficit detected." *(debt)*  
> "Wake time extended 45 min — poor recovery score (61/100)." *(recovery)*  
> "Sleep window moved earlier — 9 AM meeting detected." *(schedule)*  
> "Banking protocol active — try for 9h tonight and tomorrow." *(debt/lookahead)*  

---

## Adaptive Insight Card (UI)

Appears at the top of the Today screen when the plan has changed since last open. This is a **separate card from PatternAlertCard** — PatternAlertCard remains for static pattern detection (consecutive nights, mixed week, etc.). AdaptiveInsightCard renders above PatternAlertCard only when the plan was actually recalculated. Both can coexist.

**Design:**
- Dark card, left border color keyed to primary factor (purple=circadian, gold=debt, blue=recovery, green=schedule)
- Title: one-sentence primary change
- Body: reason + citation if space
- Undo button: right-aligned, available 24h
- Auto-dismisses at midnight

**Learning phase variant (days 1–30):**
> "Suggested changes — review and accept to apply." + [Accept] [Dismiss] buttons

**Calibrated phase (day 31+):**
> "Plan updated — [primary change]. Tap to undo." + [Undo] button

---

## Light Protocol UI

### Animated 24-Hour Arc

Lives on the Circadian Health tab. Replaces the text-based light guidance.

**Visual design:**
- Full-width 24h timeline rendered as a horizontal arc or linear bar
- Current time: animated cursor (thin gold line, pulses gently)
- **Seek windows** (bright light recommended): warm gold/amber glow, sun icon
- **Avoid windows** (protect from light): deep blue/indigo, crescent moon icon  
- **Neutral windows**: dim white, no icon
- On tap: bottom sheet expands with science note ("Morning light shifts your clock 1–2h — 30 min outdoors is enough. Source: Czeisler et al., 1990")

**Simplified strip on Today screen:**
- During active transitions only — a compact 3-cell row (similar to CountdownRow)
- Cells: "Light now" / "Protect at [time]" / "Bright at [time]"
- Tapping navigates to full arc on Circadian tab

**Animation:** 
- Windows fade in on mount (stagger 150ms per segment)
- Seek windows have a subtle animated glow pulse (2s repeat)
- Current-time cursor moves in real-time (updates every minute)

---

## Pre-Shift Brief (Coaching Tab)

### Concept

A new tab — "Your Brief" — that activates when a significant schedule transition is approaching (≥1 day away). Named like what a surgeon or pilot receives before a high-stakes period. Not preachy — professional, specific, science-backed.

When no transition is approaching: tab shows a minimal "All clear — your plan is optimized for your current rotation" state with current metrics.

### Five-Part Structure

**1. The Situation**  
Context header: shift type, duration, rotation weight.  
*"4-night stretch starts Friday. This is your heaviest rotation this month."*

**2. Your Personalized Brief**  
Narrative generated deterministically from profile fields. Personalization matrix:

| Profile Field | Narrative Element Added |
|---------------|------------------------|
| `hasYoungChildren: true` | Morning handoff language, school routine, reduce AM noise |
| `hasPets: true` | Dog walking timing (evening shift), morning care handoff |
| `householdSize > 1` | Partner prep, shared responsibility language |
| `commuteDuration >= 30` | Blue-blockers for commute, timing of post-shift arrival |
| `napPreference: true` | Prophylactic nap language included |
| `chronotype: 'late'` | Later optimal banking protocol |

*Example output for: hasYoungChildren=true, hasPets=true, householdSize=2, partnerPresent:*  
> "With young kids and a dog, your morning window is your highest-friction point during night shifts. Getting ahead of this conversation now makes the difference between a manageable week and an exhausting one. Consider sitting down with your partner tonight to divide the next four mornings. A simple swap — you handle dinner and the dog walk in the evenings, they take breakfast and the morning routine — removes the cognitive load during your recovery hours. Prepare it now. Your future self will thank you."

**3. Sleep Schedule**  
The adjusted windows for the transition period, explained simply — not just times, but why.  
*"Tonight: Sleep by 11:30 PM (90 min later than usual — starting the clock shift). Thursday: Sleep by 1 AM. Friday before your shift: 90-min nap ending by 6:30 PM."*

**4. Household Prep Checklist**  
Specific, actionable, dismissible items generated from profile:
- [ ] Talk to [partner/housemate] about morning coverage [date range]
- [ ] Walk the dog in the evenings so mornings are clear
- [ ] Prep or batch-cook [day before] — no dinner decisions during the stretch
- [ ] Put "Do Not Disturb" sign on bedroom door
- [ ] Ask household to use headphones [date range]

**5. The Science Brief**  
One or two sentences, citable.  
*"Shift workers who brief their household before a heavy rotation report significantly lower sleep disruption frequency. Pre-rotation preparation is one of the highest-yield interventions available to shift workers outside of schedule itself. — Boivin & Boudreau, 2014."*

---

## Two-Phase Autopilot

| Phase | Duration | Behavior |
|-------|----------|----------|
| Learning | Days 1–30 | Propose mode. Card: "Suggested changes — accept to apply." Collects HealthKit baseline. |
| Calibrated | Day 31+ | Autopilot. Card: "Plan updated — [change]. Tap to undo." 24h undo window. |

Transition is silent — no announcement. Cards stop asking for confirmation.

During learning phase, recovery score is suppressed (insufficient baseline). Circadian protocol and debt engine are fully active from day 1 (no baseline needed).

---

## Personalization from Onboarding

The following profile fields are already collected and must be consumed by the adaptive system. They are currently underutilized.

| Field | Current Use | New Use |
|-------|-------------|---------|
| `sleepNeed` | Target hours | Debt calculation denominator |
| `caffeineHalfLife` | Caffeine cutoff time | Recovery score caffeine penalty |
| `napPreference` | Nap block display | Enables/disables nap insertions |
| `hasYoungChildren` | Noise tip boost | Pre-Shift Brief morning handoff language |
| `hasPets` | Noise tip boost | Pre-Shift Brief dog-walking logistics |
| `householdSize` | Noise tip boost | Partner prep language trigger |
| `commuteDuration` | Light tip boost | Blue-blocker recommendation timing |
| `chronotype` | Sleep window base | Circadian protocol phase offset |

---

## New Module Map

```
src/lib/adaptive/
├── context-builder.ts       ← Assembles AdaptiveContext from HealthKit + stores
├── circadian-protocols.ts   ← 5 transition protocols + maintenance mode
├── sleep-debt-engine.ts     ← 14-day rolling debt, banking, severity tiers
├── recovery-calculator.ts   ← Composite score, z-scores, shift-type baselines
└── change-logger.ts         ← ChangeLog production for explanatory card

src/hooks/
└── useAdaptivePlan.ts       ← Morning hook; fires context-builder, triggers regeneration

src/components/today/
└── AdaptiveInsightCard.tsx  ← Explanatory card with undo (replaces/extends PatternAlertCard)

src/components/circadian/
├── LightProtocolArc.tsx     ← Animated 24h light guidance arc (Circadian tab)
└── LightProtocolStrip.tsx   ← Compact 3-cell strip (Today screen, transitions only)

app/(tabs)/
└── brief.tsx                ← Pre-Shift Brief coaching tab

Updates to existing files:
├── src/lib/circadian/sleep-windows.ts   ← Consume CircadianProtocol targets as constraints
├── src/lib/circadian/energy-model.ts    ← Populate recoveryScore from HealthKit
├── src/store/plan-store.ts              ← Accept + store AdaptiveContext, plan snapshot for undo
└── src/components/navigation/FloatingTabBar.tsx ← Add "Brief" tab when transition approaching
```

---

## Scientific Foundation

All algorithm decisions trace to published research:

| Decision | Source |
|----------|--------|
| Circadian at 50% weight | Eastman & Burgess 2009; NIOSH shift work protocols; Boivin & Boudreau 2014 |
| 3% adaptation finding → maintenance mode | Circadian Biology Research 2023 |
| Day→Night protocol (90 min/day) | Eastman & Burgess 2009 |
| Night→Day split sleep | NIOSH anchor sleep + Boivin & Boudreau 2014 |
| Banking protects vigilance, not executive function | Rupp et al. 2009; Arnal et al. 2015 |
| Banking trigger: 3–7 days before restriction | Cushman et al. 2023; Rupp 2009 mechanism |
| Debt: invisible to sufferer | Van Dongen et al. 2003 |
| Recovery rate cap: 1h/night | Belenky et al. 2003 |
| Prophylactic nap: 90 min pre-shift | Ruggiero & Redeker 2014 |
| Apple Watch deep sleep correction: −43 min | Wearable validation research 2023–2025 |
| Shift-type separate baselines | PMC11368331: HRV in shift nurses 2024 |
| Daytime eating → CVD reduction | Chellappa et al. 2021 |
| Sleep regularity > duration for mortality | PMC10782501: 2024 prospective cohort |
| Recovery formula weights | de Gruyter 2025 wearable evaluation; Oura readiness architecture |

---

## What This Is Not

- Not an LLM. All coaching text is deterministic template generation keyed to profile fields.
- Not a replacement for medical advice. Legal disclaimer remains on all coaching content.
- Not dependent on Apple Watch. Degrades gracefully to duration + efficiency signals.
- Not a perfect prediction system. The app communicates uncertainty honestly ("This protects your reaction time — you may still feel tired. That's normal.")

---

## Success Criteria

1. Users entering a Day→Night transition receive adjusted sleep windows starting 3 days before the first night shift — with a human-readable explanation of why
2. Sleep debt is computed from real HealthKit data (not adherence scores) within 7 days of first use
3. Banking recommendations appear when the trigger window is open and are absent when it's too late
4. Pre-Shift Brief populates personalized household prep language based on profile — not generic advice
5. Light Protocol UI shows on Circadian tab with animated seek/avoid windows keyed to current transition protocol
6. All 299 existing tests continue to pass (algorithm extensions are additive, not replacements)
7. App functions fully without Apple Watch — graceful degradation, no errors or blank states

---

*Research database: `docs/science/SLEEP-SCIENCE-DATABASE.md`*  
*Recovery algorithm science: `.planning/research/RECOVERY_ALGORITHM_SCIENCE.md`*
