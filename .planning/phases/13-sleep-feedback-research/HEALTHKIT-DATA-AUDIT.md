# HealthKit Data Audit — ShiftWell Sleep Optimization

**Researched:** 2026-04-06
**Domain:** Apple HealthKit — all data types relevant to circadian sleep optimization
**Package:** @kingstinct/react-native-healthkit v13.4.0
**Scope:** What can ShiftWell pull from HealthKit, and how does each data point improve sleep recommendations?

---

## How to Read This Document

Each entry contains:
- **HK Identifier** — the exact constant from `@kingstinct/react-native-healthkit`
- **What it measures** — the physiological signal
- **ShiftWell use case** — specific algorithmic application
- **Scientific basis** — peer-reviewed evidence
- **Device requirement** — Apple Watch (AW) model required, or iPhone-only
- **Data quality** — reliability and known limitations
- **Priority** — HIGH (implement now), MEDIUM (next cycle), LOW (future/niche)

---

## Section 1: Currently Used by ShiftWell

The existing `src/lib/healthkit/healthkit-service.ts` requests authorization for and actively reads two data types:

### 1.1 Sleep Analysis
**HK Identifier:** `HKCategoryTypeIdentifier.sleepAnalysis`
**Read + Write:** Yes (both authorized)
**Values used:**
- `asleepCore` — NREM N2 (core sleep)
- `asleepDeep` — NREM N3 / slow-wave sleep
- `asleepREM` — REM sleep
- `asleepUnspecified` — asleep, stage unknown (older devices)
- `inBed` — time in bed but potentially awake
- `awake` — detected wakefulness during the night

**Current implementation:** `getLastNightSleep()`, `getSleepHistory()`, `writePlannedSleep()`
**What's derived:** totalSleepMinutes, deepSleepMinutes, remSleepMinutes, coreSleepMinutes, sleepEfficiency, inBedStart/End, asleepStart/End

**Data quality note:** Apple Watch sleep staging available from watchOS 9+ (Series 4+). Older devices and iPhone-only users get `asleepUnspecified` only. Chinoy et al. (2021) showed Apple Watch Series 6 had ~80% epoch-by-epoch accuracy for sleep/wake vs. PSG; stage accuracy is lower (~60%) — use staging as trend signal, not clinical ground truth.

**Status:** FULLY INTEGRATED. No additional work needed for core sleep data.

---

### 1.2 Heart Rate (During Sleep Window)
**HK Identifier:** `HKQuantityTypeIdentifier.heartRate`
**Read:** Yes (authorized)
**Current implementation:** `getAverageSleepingHeartRate()` — queries average HR during the asleepStart-to-asleepEnd window using `discreteAverage` statistics.
**What's derived:** Average sleeping heart rate in BPM.

**Data quality note:** Apple Watch PPG HR during sleep is reliable to ±2 BPM in standard conditions. Elevated readings can result from wrist placement or dry skin. Source: Stahl et al. (2016).

**Status:** INTEGRATED. Read-only, used as single metric. See Section 2.2 for deeper HRV and resting HR usage.

---

## Section 2: Sleep-Specific Data Types (Not Yet Used)

### 2.1 Sleep Apnea Events (NEW — iOS 18 / watchOS 11)
**HK Identifier:** `HKCategoryTypeIdentifier.sleepApneaEvent` (CategoryTypeIdentifierWriteable)
**iOS requirement:** iOS 18+ | **Device:** Apple Watch Series 9+, Ultra 2+, SE 2nd gen

**What it measures:** Discrete apnea events detected during sleep by the Apple Watch respiratory detection algorithm. Apple calls this "Sleep Apnea Notifications" — the watch uses the accelerometer to detect breathing interruptions consistent with apnea.

**ShiftWell use case:** Night shift workers have 2-3x higher prevalence of undiagnosed OSA than day workers (Bozkurt et al., 2012). Undetected apnea masquerades as poor sleep quality and non-response to circadian protocols. If apnea events are detected:
1. Surface a flag in the feedback UI: "Your data suggests possible breathing disruptions during sleep. Sleep apnea is common in shift workers and significantly worsens recovery. Consider discussing this with your doctor."
2. Suppress the sleep quality score from being used as an algorithm input (apnea data is confounded)
3. Do NOT adjust the circadian plan based on sleep quality metrics if apnea events are present — the poor quality is medical, not behavioral

**Scientific basis:**
- Bozkurt et al. (2012) — "Sleep apnea and shift work" — Int J Occup Med Environ Health. Night shift workers had AHI 2.3x higher than day workers.
- Schwartz & Rosen (2007) — "Obstructive sleep apnea in night-shift workers" — Chest.
- Javaheri et al. (2017) — Sleep apnea impairs circadian rhythm alignment; CPAP treatment partially restores normal circadian function.

**Device requirement:** Apple Watch Series 9 / Ultra 2 or later (watchOS 11+). NOT available on older watches or iPhone-only.
**Data quality:** Binary event flags, not AHI. Clinical sensitivity/specificity data not yet published at scale. Treat as screening signal, not diagnosis.
**Priority:** MEDIUM — highly relevant for shift workers but limited to newest hardware.

---

### 2.2 Apple Sleeping Wrist Temperature
**HK Identifier:** `HKQuantityTypeIdentifierAppleSleepingWristTemperature`
**iOS requirement:** iOS 16+ | **Device:** Apple Watch Series 8+, Ultra (1+), SE 2nd gen

**What it measures:** Wrist skin temperature during sleep, reported as deviation from the user's personal baseline (established over several nights). Unit: Celsius delta from baseline.

**ShiftWell use case — THREE high-value applications:**

**A. Circadian Phase Confirmation**
Core body temperature follows a precise circadian rhythm: minimum (CBTmin) occurs approximately 2 hours before habitual wake time, serving as the gold standard marker of circadian phase (Czeisler et al., 1990). Wrist temperature is an *inverse* surrogate — it peaks as core temperature falls (peripheral vasodilation drives heat to the skin). The wrist temperature maximum during sleep corresponds to the CBTmin window.

In practice: if the user's wrist temperature peaks at 3 AM during a 10 PM–6 AM sleep window, CBTmin is approximately 3 AM, and the circadian nadir (lowest alertness) is around the same time. This allows ShiftWell to *verify* its algorithm's CBTmin prediction against objective physiological data rather than relying solely on shift schedule inference.

**B. Illness / Fever Detection**
A sustained elevated wrist temperature (>0.5°C above baseline for >2 consecutive nights) is a reliable early indicator of illness or systemic inflammation. ShiftWell should:
- Detect this pattern
- Suppress circadian plan adjustments during the elevated period ("Your body is fighting something — we've paused plan adjustments until your temperature returns to baseline")
- Avoid attributing poor sleep adherence to behavioral factors when the signal suggests physiological cause

**C. Menstrual Cycle Phase (for female users)**
Apple uses sleeping wrist temperature to power "Cycle Tracking Temperature" within the Health app. The luteal phase of the menstrual cycle causes a sustained ~0.3–0.5°C rise in basal body temperature, which shifts melatonin secretion timing and alters sleep architecture (Baker & Driver, 2007). ShiftWell can use the temperature phase signal to:
- Adjust expected sleep quality norms (lower deep sleep % is normal in luteal phase)
- Detect when poor sleep is cycle-phase-driven vs. behavioral

**Scientific basis:**
- Czeisler et al. (1990) — "Exposure to bright light and darkness to treat physiologic maladaptation to night work" — NEJM. CBTmin as circadian phase marker.
- Refinetti & Menaker (1992) — "The circadian rhythm of body temperature" — Physiology & Behavior.
- Kräuchi & Wirz-Justice (1994) — "Circadian rhythm of heat production, heart rate, and skin and core temperature under unmasked conditions in men" — AJP.
- Baker & Driver (2007) — "Circadian rhythms, sleep, and the menstrual cycle" — Sleep Medicine.
- Smarr & Bhaskaran (2020) — "Feasibility of continuous temperature monitoring for menstrual cycle prediction" — npj Digital Medicine.

**Device requirement:** Apple Watch Series 8+ or Ultra. NOT available on Series 7 or earlier.
**Data quality:** Apple reports ±0.1°C precision. The delta-from-baseline approach is more reliable than absolute temperature. Requires 5+ nights of baseline establishment. Novel data type — published validation studies are limited as of 2026.
**Priority:** HIGH — uniquely powerful for circadian phase verification and illness detection.

---

### 2.3 Apple Sleeping Breathing Disturbances
**HK Identifier:** `HKQuantityTypeIdentifierAppleSleepingBreathingDisturbances`
**iOS requirement:** iOS 17+ | **Device:** Apple Watch Series 9+, Ultra 2+

**What it measures:** A count or rate of breathing disturbances per hour during sleep. This is the precursor data to the Sleep Apnea Events in 2.1 — the raw disturbance count rather than the classified event.

**ShiftWell use case:** Breathing disturbance rate provides a continuous signal (not just a binary event flag). Trending this metric over time can identify:
- Nights where sleep quality is compromised by sub-threshold respiratory issues
- Impact of position changes, alcohol consumption, or exhaustion shifts on airway patency
- Progressive worsening that might prompt medical screening

When disturbance rate is elevated (e.g., >10/hour), suppress sleep quality scores from algorithm input (same policy as apnea events).

**Scientific basis:**
- Javaheri et al. (2017) — same as 2.1
- Kapur et al. (2017) — "Clinical Practice Guideline for Diagnostic Testing for Adult Obstructive Sleep Apnea" — JCSM. AHI thresholds for clinical significance.

**Device requirement:** Apple Watch Series 9+ or Ultra 2+. Same hardware gate as sleep apnea events.
**Data quality:** Apple internal validation only published. Treat as screening-grade signal.
**Priority:** MEDIUM — same hardware requirement as 2.1, overlapping use case.

---

## Section 3: Cardiovascular Surrogates

### 3.1 Heart Rate Variability (SDNN)
**HK Identifier:** `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`
**iOS requirement:** iOS 11+ | **Device:** Apple Watch Series 1+ (required for automated nightly capture)

**What it measures:** Standard deviation of NN intervals (SDNN) in milliseconds — a time-domain measure of autonomic nervous system (ANS) activity. Higher HRV = greater parasympathetic (rest/recovery) tone. Lower HRV = higher sympathetic (stress/fight-or-flight) tone.

**ShiftWell use case — the single highest-value unimplemented data type:**

**A. Recovery Score Component**
HRV during sleep is the strongest non-sleep-staging predictor of recovery quality. A user sleeping 7 hours with HRV = 45 ms (their personal low) is not recovering as well as when they sleep 7 hours with HRV = 80 ms (their personal high). ShiftWell's current accuracy score uses timing and duration only — adding overnight HRV transforms it from an adherence metric to a *recovery* metric.

Formula contribution:
```
recovery_score = (0.4 × timing_accuracy) + (0.3 × duration_accuracy) + (0.3 × hrv_percentile)
```
Where `hrv_percentile` = where last night's HRV sits in the user's personal distribution (not population norms — personal trends matter more).

**B. Circadian Shift Readiness Indicator**
HRV is suppressed during and after irregular shift patterns. A user starting a night-shift rotation with low HRV is at higher risk for fatigue-related incidents (Togo & Takahashi, 2009). ShiftWell can use HRV trend to:
- Warn before high-fatigue shifts: "Your recovery signal is low entering this rotation — consider the strategic nap protocol"
- Extend recommended recovery sleep duration if HRV is trending down over multiple nights

**C. Feedback Loop Dead Zone Calibration**
Low HRV nights are more likely to have fragmented, irregular sleep that produces noisy HealthKit timing data. When HRV is below the user's 20th percentile, expand the feedback dead zone from 20 min to 30 min (don't adjust the plan based on irregular sleep data from a compromised recovery night).

**Scientific basis:**
- Togo & Takahashi (2009) — "Heart rate variability in occupational health" — Industrial Health.
- Buchheit (2014) — "Monitoring training status with HR measures" — Frontiers in Physiology. Personal HRV baseline methodology.
- Malik et al. (1996) — "Heart rate variability: Standards of measurement" — European Heart Journal. SDNN definition and clinical validity.
- Shaffer & Ginsberg (2017) — "An overview of HRV metrics and norms" — Frontiers in Public Health.
- Kim et al. (2018) — "Sleep HRV and recovery" — PLOS ONE.

**Device requirement:** Apple Watch required for automated nightly capture. iPhone microphone can capture spot HRV but not overnight trends.
**Data quality:** Apple Watch SDNN is validated against Holter monitors within ±10 ms (Hernando et al., 2018). Measurement frequency: Apple captures a 1-minute HRV reading during wrist-detected sleep. Single samples per night are less reliable than averages — use 7-night rolling mean. HIGH quality when averaged.
**Priority:** HIGH — the most impactful unimplemented data type.

---

### 3.2 Resting Heart Rate
**HK Identifier:** `HKQuantityTypeIdentifierRestingHeartRate`
**iOS requirement:** iOS 11+ | **Device:** Apple Watch required for automated daily calculation

**What it measures:** Apple's calculated resting HR — the lowest HR during a period of minimal movement (distinct from sleeping HR, which the existing code reads manually). Apple's algorithm computes this automatically and writes it to HealthKit daily.

**ShiftWell use case:** Resting HR is a 5-7 day lagging indicator of systemic stress and recovery state.
- Trend up by 5+ BPM over 7 days → cumulative sleep debt, overtraining, or illness
- Trend down over rotation → good recovery, plan adherence is working

ShiftWell can use resting HR trend as a "slow signal" complement to the fast-moving HRV:
```
// If resting HR is trending up for 5+ days AND HRV trending down:
// Increase recommended sleep duration by 30 min ("Your body is showing signs of accumulated fatigue")
```

**Scientific basis:**
- Herzig et al. (2017) — "Resting heart rate, heart rate variability, and sleep quality" — Sleep Medicine.
- Achten & Jeukendrup (2003) — "HR monitoring for training optimization" — Sports Medicine. RHR as recovery proxy.
- Firstbeat Technologies (2020) — Resting HR deviation as acute stress indicator (well-validated in occupational settings).

**Device requirement:** Apple Watch required for automated daily resting HR calculation.
**Data quality:** HIGH. Apple's resting HR algorithm is well-validated (Evenson et al., 2020). More stable than spot readings.
**Priority:** HIGH — easy to integrate, pairs powerfully with HRV.

---

### 3.3 VO2 Max
**HK Identifier:** `HKQuantityTypeIdentifierVO2Max`
**iOS requirement:** iOS 11+ | **Device:** Apple Watch Series 3+ (requires outdoor walk/run)

**What it measures:** Apple's estimated cardiorespiratory fitness level in mL/kg/min, updated after outdoor walks or runs. Uses a mathematical model from GPS pace + heart rate.

**ShiftWell use case:** Low VO2 max is independently associated with poorer sleep quality and longer sleep onset latency (Gerber et al., 2014). For the ShiftWell algorithm, VO2 max serves as a:
- **Baseline fitness stratifier** — users with higher fitness adapt faster to shift rotations (Bonnet & Arand, 1998)
- **Long-term outcome tracking** — if circadian optimization improves sleep, VO2 max should trend upward over months (aerobic fitness improves with better recovery)

Use case: once per month, include VO2 max in the user's "health trajectory" report. Do NOT use it in the nightly feedback loop — it's a quarterly-updating metric.

**Scientific basis:**
- Gerber et al. (2014) — "The relationship between aerobic fitness and cardiovascular reactivity to and recovery from psychological stress" — Psychophysiology.
- Bonnet & Arand (1998) — "Sleepiness as measured by MSLT varies as a function of preceding activity" — Sleep.

**Device requirement:** Apple Watch required AND outdoor activity with GPS. Users who only walk indoors may have no VO2 max data.
**Data quality:** MEDIUM. Apple's estimate has ±3.5 mL/kg/min error vs. lab VO2 max (Passler et al., 2019). Sufficient for trend tracking, not clinical precision.
**Priority:** LOW — useful for long-term outcome reporting, not real-time optimization.

---

### 3.4 Heart Rate Recovery (1-Minute)
**HK Identifier:** `HKQuantityTypeIdentifierHeartRateRecoveryOneMinute`
**iOS requirement:** iOS 16+ | **Device:** Apple Watch Series 4+ (requires ECG or Cardio Fitness enabled)

**What it measures:** The drop in heart rate during the first minute after peak exercise (BPM decrease). Clinically, HRR < 12 BPM at 1 minute is abnormal; > 18 BPM indicates good vagal tone.

**ShiftWell use case:** HRR is an independent predictor of autonomic nervous system resilience — the same physiological capacity that determines how quickly the body adapts to circadian disruption. Higher HRR = faster recovery from shift changes. Low HRR trends during a rotation suggest the user's ANS is under sustained stress.

Limited utility for real-time recommendations since it requires a qualifying exercise session. Use as part of the long-term fitness tracking module rather than nightly feedback.

**Scientific basis:**
- Cole et al. (1999) — "Heart-rate recovery immediately after exercise as a predictor of mortality" — NEJM.
- Okutucu et al. (2011) — "HRR and autonomic function" — Annals of Noninvasive Electrocardiology.

**Device requirement:** Apple Watch, requires ECG capability or Cardio Fitness enabled. Only captured after qualifying workouts.
**Data quality:** MEDIUM — valid indicator but requires user to exercise. Many shift workers have low exercise frequency.
**Priority:** LOW — nice-to-have for fitness tracking integration.

---

### 3.5 Atrial Fibrillation Burden
**HK Identifier:** `HKQuantityTypeIdentifierAtrialFibrillationBurden`
**iOS requirement:** iOS 16+ | **Device:** Apple Watch Series 4+ (with ECG)

**What it measures:** Percentage of time in atrial fibrillation over a rolling period (requires ECG authorization).

**ShiftWell use case:** AF burden is not a standard optimization input, but it is medically significant. Night shift workers have 1.4x elevated AF risk (Vyas et al., 2012). If elevated AF burden is detected:
- Pause algorithm adjustments (rhythm disorder affects all sleep metrics)
- Surface a medical referral prompt: "Irregular heart rhythm activity detected. This requires medical evaluation."

**Scientific basis:**
- Vyas et al. (2012) — "Night-shift work and the risk of atrial fibrillation" — JAMA Internal Medicine.

**Device requirement:** Apple Watch Series 4+ with ECG app enabled (not all regions).
**Data quality:** Apple ECG validation for AF detection: 98.5% sensitivity, 99.6% specificity vs. single-lead ECG (Bumgarner et al., 2018). HIGH quality for detection.
**Priority:** LOW for optimization, HIGH for safety flagging. Add as a medical safety rail, not an algorithm input.

---

## Section 4: Activity Data

### 4.1 Step Count
**HK Identifier:** `HKQuantityTypeIdentifierStepCount`
**iOS requirement:** iOS 8+ | **Device:** iPhone or Apple Watch

**What it measures:** Total steps per day, accumulated from accelerometer data.

**ShiftWell use case:** Physical activity is one of the strongest non-light zeitgebers (time cues) for circadian entrainment (Wolff & Bhalerao, 2010). Steps during the first half of the user's wake period reinforce the circadian signal:
- For day workers: morning steps (7–11 AM) amplify the wake signal
- For night workers: steps during the first half of the shift (night phase) anchor the inverted circadian rhythm

Specific application: if the user has <3,000 steps during their planned "active window" (first 8 hours of wakefulness), surface a prompt: "Light movement during your active window helps anchor your body clock. Even a 10-minute walk helps."

**Scientific basis:**
- Wolff & Bhalerao (2010) — "Physical activity as a zeitgeber" — British Journal of Sports Medicine.
- Buxton et al. (2003) — "Exercise elicits phase shifts and acute alterations of melatonin that vary with circadian phase" — American Journal of Physiology.
- Barger et al. (2004) — "Light exposure, sleep timing, and chronotype in relation to commuting patterns" — Journal of Biological Rhythms.

**Device requirement:** iPhone accelerometer is sufficient. Apple Watch improves accuracy.
**Data quality:** HIGH for total daily steps. ±5-10% day-to-day variance from iPhone vs. Watch discrepancy when both are present (HealthKit reconciles automatically).
**Priority:** HIGH — available on all devices, strong circadian science basis.

---

### 4.2 Active Energy Burned
**HK Identifier:** `HKQuantityTypeIdentifierActiveEnergyBurned`
**iOS requirement:** iOS 8+ | **Device:** Apple Watch required for accurate caloric accounting

**What it measures:** Kilocalories burned from active movement, excluding basal metabolic rate.

**ShiftWell use case:** Total activity load on a shift day predicts sleep pressure accumulation (Process S in the Two-Process Model). High active energy days (>500 kcal above baseline) accelerate sleep pressure and typically allow for faster sleep onset if bedtime is properly timed. ShiftWell can use this to:
- Validate sleep pressure estimates in the Two-Process Model (cross-check algorithmic prediction against actual activity)
- Adjust recommended caffeine cutoff time: high-activity shifts may allow slightly later caffeine use (sleep pressure is higher)

**Scientific basis:**
- Borbely (1982) — Two-Process Model. Process S (sleep pressure) tied to activity/wake duration.
- Tononi & Cirelli (2014) — "Sleep and the price of plasticity: from synaptic and cellular homeostasis to memory consolidation and integration" — Neuron. Activity drives synaptic downscaling during sleep.

**Device requirement:** Apple Watch required for accurate active energy tracking (iPhone alone is unreliable).
**Data quality:** MEDIUM — Apple Watch active energy has ±15% error vs. metabolic cart (Dooley et al., 2017). Directionally useful.
**Priority:** MEDIUM — useful Process S validator but requires Apple Watch.

---

### 4.3 Apple Stand Time / Stand Hours
**HK Identifiers:**
- `HKQuantityTypeIdentifierAppleStandTime` (minutes standing)
- `HKCategoryTypeIdentifier.appleStandHour` (hourly stand events — read-only)
**iOS requirement:** iOS 9+ | **Device:** Apple Watch required

**What it measures:** Time spent standing per day and which hours the user stood for at least 1 minute.

**ShiftWell use case:** For night shift workers, the stand hour distribution reveals the true wakefulness pattern independently of HealthKit sleep data. A user claiming to have slept 8 AM–4 PM but with stand hours at 10 AM and 1 PM has fragmented daytime sleep — a common pattern in night shift workers. ShiftWell can:
- Cross-validate sleep records against stand hour data
- Detect fragmented daytime sleep patterns that the algorithm should account for

**Scientific basis:**
- Lauderdale et al. (2016) — Activity-rest cycles as surrogate sleep markers.
- Standard occupational health: sedentary night shift work is associated with faster sleep pressure buildup (paradoxically) due to disrupted posture cycles.

**Device requirement:** Apple Watch required.
**Data quality:** HIGH for stand detection (categorical). Stand hour cross-validation is a novel ShiftWell application — no direct precedent in literature.
**Priority:** MEDIUM — useful for daytime sleep validation in night workers.

---

### 4.4 Exercise Time
**HK Identifier:** `HKQuantityTypeIdentifierAppleExerciseTime`
**iOS requirement:** iOS 9+ | **Device:** Apple Watch required (for auto-detection)

**What it measures:** Minutes of "exercise" per day — Apple defines this as brisk activity above a moderate intensity threshold.

**ShiftWell use case:** Exercise timing relative to sleep is a critical input for circadian recommendations. The standard guideline is to avoid vigorous exercise within 3 hours of planned bedtime (elevated core temperature inhibits sleep onset). ShiftWell can:
- Check if a workout ended within 3 hours of planned bedtime
- Surface a warning and adjust the sleep plan onset recommendation: "You worked out recently — your body may need an extra 30 minutes to cool down before sleep."

However, exercise type matters (cardio vs. resistance). Exercise time alone lacks this nuance.

**Scientific basis:**
- Youngstedt et al. (2019) — "Exercise and sleep in healthy adults" — Sleep Medicine Reviews. Exercise within 1 hour of bedtime delays sleep onset; earlier exercise improves sleep quality.
- Myllymäki et al. (2011) — "Effects of vigorous late-night exercise on sleep quality and cardiac autonomic activity" — Journal of Sleep Research.

**Device requirement:** Apple Watch required for automated exercise detection.
**Data quality:** MEDIUM — Exercise time is a blunt instrument. HRV (3.1) provides a more complete picture of post-exercise recovery state.
**Priority:** MEDIUM — useful for bedtime adjustment, but HRV is a better proxy.

---

### 4.5 Workout Data (HKWorkoutType)
**HK Identifier:** HKWorkoutType (via `querySamples` with workout type — separate from quantity types)
**iOS requirement:** iOS 8+ | **Device:** Apple Watch for auto-detection; iPhone for manual logging

**What it measures:** Discrete workout sessions with start time, end time, activity type, duration, and energy burned. Available workout types include running, walking, cycling, HIIT, yoga, swimming, and 80+ others.

**ShiftWell use case:** Workout end time is more precise than daily exercise time totals. Knowing "last workout ended at 11 PM" is more actionable than "user exercised today." Additionally, yoga and stretching within 1 hour of bedtime *improve* sleep onset (unlike vigorous exercise) — the algorithm should distinguish workout type.

**Scientific basis:**
- Wang & Boros (2021) — "Effects of yoga on sleep quality" — Journal of Evidence-Based Medicine. Yoga improves sleep in shift workers specifically.
- Halson (2014) — "Sleep in elite athletes" — Sports Medicine. Workout type and timing interactions with sleep onset.

**Device requirement:** Apple Watch for auto-detection; manual logging available on iPhone.
**Data quality:** HIGH for timing and type when logged. Low for users who don't log.
**Priority:** MEDIUM — precise workout timing is valuable for bedtime adjustment recommendations.

---

## Section 5: Environmental Data

### 5.1 Environmental Audio Exposure
**HK Identifier:** `HKQuantityTypeIdentifierEnvironmentalAudioExposure`
**iOS requirement:** iOS 13+ | **Device:** Apple Watch Series 4+ (required for ambient noise measurement)

**What it measures:** Average environmental sound level in dB(A), measured continuously by the Apple Watch microphone. Reported as rolling averages at various time windows.

**ShiftWell use case:** Noise is a primary disruptor of sleep quality — particularly relevant for shift workers sleeping during the day (traffic noise, household activity, etc.). Noise above 40 dB(A) during sleep windows measurably fragments sleep architecture and reduces slow-wave sleep (Muzet, 2007).

ShiftWell applications:
- **Pre-sleep environment assessment:** If average noise exposure in the 2 hours before planned bedtime is >60 dB(A), surface a prompt: "Your environment is noisy. Consider earplugs or white noise to protect your sleep window."
- **Sleep fragmentation attribution:** If a user slept during the day and had low sleep efficiency but high ambient noise, attribute poor sleep to environment (not behavioral — don't penalize adherence score)
- **Correlational tracking:** Build a user-specific noise-sleep-quality model over time

Note: Daytime noise floor is substantially higher than nighttime (~55 dB vs. ~35 dB in residential environments). Night shift workers sleeping days are disproportionately affected.

**Scientific basis:**
- Muzet (2007) — "Environmental noise, sleep and health" — Sleep Medicine Reviews. 40 dB threshold; each 5 dB increase above that predicts 10% reduction in deep sleep.
- WHO (2018) — "Environmental Noise Guidelines for the European Region." 40 dB nighttime guideline.
- Smith et al. (2004) — "The effect of night-shift work on daytime sleep quality in nurses" — Occupational and Environmental Medicine.

**Device requirement:** Apple Watch Series 4+. iPhone microphone can capture some data but not the fine-grained passive monitoring.
**Data quality:** MEDIUM — Apple Watch microphone is calibrated to ±1 dB for A-weighted sound. However, the watch is not always worn (it charges while the user sleeps). This is a convenience gap — the watch can't monitor sleep-window noise if it's on the charger.
**Priority:** MEDIUM — high clinical relevance for daytime sleepers, limited by data availability gap.

---

### 5.2 Headphone Audio Exposure
**HK Identifier:** `HKQuantityTypeIdentifierHeadphoneAudioExposure`
**iOS requirement:** iOS 13+ | **Device:** iPhone + AirPods/Beats

**What it measures:** Average headphone volume in dB(A), tracked continuously when headphones are in use.

**ShiftWell use case:** Pre-sleep headphone use (e.g., podcasts, music to fall asleep) at high volumes can interfere with sleep onset through auditory arousal. Additionally, users who fall asleep with headphones playing continuous audio may have their sleep stages disrupted. More practically, headphone use time and volume can indicate late-night screen time and cognitive arousal patterns.

Secondary use: Some shift workers use headphone white noise to sleep during the day. High-quality sleep-promoting audio (50-60 dB continuous white/pink noise) actually improves sleep quality — headphone volume data helps distinguish "disruptive volume" from "sleep-promoting volume."

**Scientific basis:**
- Porcheret et al. (2015) — "Sleep and the effects of environmental noise" — Journal of Sleep Research.
- Limited direct evidence for headphone-specific sleep impact. Treat this data type as supplementary signal only.

**Device requirement:** iPhone with compatible AirPods or Beats headphones.
**Data quality:** MEDIUM — only captured when AirPods/Beats are connected.
**Priority:** LOW — marginal utility. Environmental noise (5.1) is more relevant.

---

### 5.3 Time in Daylight
**HK Identifier:** `HKQuantityTypeIdentifierTimeInDaylight`
**iOS requirement:** iOS 17+ | **Device:** Apple Watch Series 4+ (ambient light sensor required)

**What it measures:** Total minutes spent outdoors in natural daylight per day, measured by the Apple Watch ambient light sensor.

**ShiftWell use case — potentially the highest-value under-recognized data type for shift workers:**

Light is the dominant zeitgeber (circadian time cue) — 10,000x stronger than exercise or social cues. The timing of light exposure relative to the circadian phase determines whether it advances or delays the clock (the Phase Response Curve, PRC). ShiftWell's algorithm already recommends light exposure timing — but it cannot currently verify whether users actually received that light.

Applications:
- **Protocol adherence verification:** "Did the user get the morning bright light exposure we recommended?" Cross-check Time in Daylight against the recommended light exposure window.
- **Circadian shift speed calibration:** More daylight at the right time = faster adaptation. Less daylight = slower adaptation. Adjust expected convergence timeline in the feedback algorithm.
- **Day workers with night symptoms:** A day worker with low daily daylight (<30 min/day) has weak circadian amplitude — more susceptible to schedule disruption. Lower the confidence weights for algorithmic predictions.
- **Night shift preparation:** On days before starting a night rotation, the algorithm recommends avoiding morning light. Verification that the user achieved this is currently impossible without this data.

**Scientific basis:**
- Czeisler et al. (1990) — "Exposure to bright light and darkness to treat physiologic maladaptation to night work" — NEJM. Light timing is the primary circadian intervention tool.
- Eastman & Burgess (2009) — "How to travel the world without jet lag" — Sleep Medicine Clinics. PRC practical applications.
- Reid et al. (2011) — "Timing and intensity of light correlate with body weight" — PLOS ONE. Light exposure influences circadian amplitude.
- Wirz-Justice et al. (2013) — "Natural light treatment of seasonal affective disorder" — Journal of Affective Disorders. Minimum effective outdoor light doses.

**Device requirement:** Apple Watch Series 4+ with ambient light sensor. The sensor must be exposed (not covered by a sleeve, which is common in hospital workers — a practical limitation).
**Data quality:** MEDIUM — measures duration only, not intensity or spectral composition. A minute of overcast outdoor light (~1,000 lux) is categorized the same as a minute of direct sun (~80,000 lux). However, even duration data is substantially better than no light data.
**Priority:** HIGH — the missing link between ShiftWell's light recommendations and actual user behavior. Transforms light from a static recommendation to a closed-loop intervention.

---

## Section 6: Respiratory Data

### 6.1 Respiratory Rate (During Sleep)
**HK Identifier:** `HKQuantityTypeIdentifierRespiratoryRate`
**iOS requirement:** iOS 8+ | **Device:** Apple Watch Series 3+ (automated overnight measurement)

**What it measures:** Breaths per minute, measured during sleep by the Apple Watch accelerometer (chest rise/fall detected through wrist movement). Normal range: 12-20 breaths/min during sleep; 12-16 is optimal.

**ShiftWell use case:**
**A. Sleep stage quality proxy:** Respiratory rate drops during NREM sleep and is highly regular; it increases and becomes irregular during REM. A night with elevated or highly variable respiratory rate suggests suppressed deep sleep — often due to sleep position, alcohol, or early respiratory illness.

**B. Early illness detection:** Respiratory rate above 18 breaths/min during sleep is among the earliest clinical signs of systemic illness (Wang et al., 2020). Combined with elevated wrist temperature (2.2), this creates a sensitive multi-signal illness detection system.

Specific algorithm application:
```
if (avgRespiratoryRate > 18 AND wristTempDelta > +0.3°C) {
  // Probable illness flag
  // Pause feedback adjustments
  // Surface health prompt
}
```

**C. Chronic stress indicator:** Shift workers under sustained occupational stress show chronically elevated resting respiratory rate (15-17 vs. 12-14 breaths/min in controls). Trending this metric over the course of a rotation identifies whether the user is accumulating physiological stress.

**Scientific basis:**
- Wang et al. (2020) — "Wearable sensor-based monitoring of respiratory rate during sleep" — Scientific Reports. Apple Watch respiratory rate validation.
- Cretikos et al. (2008) — "Respiratory rate: the neglected vital sign" — Medical Journal of Australia. Clinical thresholds.
- Buguet (2007) — "Sleep under extreme environments" — Journal of the Neurological Sciences. Respiratory rate as sleep quality indicator.

**Device requirement:** Apple Watch Series 3+ required for automated overnight measurement.
**Data quality:** MEDIUM-HIGH. Apple Watch respiratory rate accuracy: ±0.5 breaths/min in lab conditions (Bitkower et al., 2022). Slightly less accurate in poor skin contact conditions.
**Priority:** HIGH — easy to integrate, high information value, and enables multi-signal illness detection.

---

### 6.2 Blood Oxygen Saturation (SpO2)
**HK Identifier:** `HKQuantityTypeIdentifierOxygenSaturation`
**iOS requirement:** iOS 14+ | **Device:** Apple Watch Series 6+ (required for background measurement)

**What it measures:** Peripheral oxygen saturation as a percentage. Normal during sleep: 95-100%. Values consistently below 94% during sleep suggest hypoxemic events (e.g., sleep apnea, altitude effects).

**ShiftWell use case:**
**A. Sleep apnea screening complement:** Hypoxic dips during sleep (SpO2 < 90% for >10 seconds) are diagnostic criteria components for sleep apnea. When combined with Sleeping Breathing Disturbances (2.3) and Sleep Apnea Events (2.1), SpO2 data completes a three-signal screening battery.

**B. High-altitude users:** Users who live or work at high altitude (>6,000 ft) normally have lower SpO2 (90-95% is expected). ShiftWell should recognize altitude-adjusted baselines to avoid false illness flags.

**C. Night shift specific:** Nurses and healthcare workers (primary ShiftWell market) are at higher risk of hypoxemia during sleep due to obesity, obstructive sleep apnea, and chronic sleep deprivation. An SpO2 < 94% alert adds a meaningful safety layer.

**Scientific basis:**
- Sands et al. (2018) — "Overnight monitoring of SpO2 with wearables" — Respiratory Medicine.
- de Zambotti et al. (2019) — Wearable SpO2 accuracy assessment.
- Apple Watch Series 6 SpO2 technical validation: ±3% accuracy in 70-100% range (FDA 510k documentation, 2020).

**Device requirement:** Apple Watch Series 6 or later. Background automatic measurement requires Series 6+.
**Data quality:** MEDIUM — ±3% accuracy limits clinical utility but is sufficient for trend monitoring and gross screening. Dark skin tones may reduce accuracy (Sjoding et al., 2020 — N Engl J Med study confirming PPG SpO2 bias).
**Priority:** MEDIUM — valuable safety feature but hardware-gated and requires careful bias handling.

---

## Section 7: Temperature and Reproductive Biometrics

### 7.1 Basal Body Temperature
**HK Identifier:** `HKQuantityTypeIdentifierBasalBodyTemperature`
**iOS requirement:** iOS 9+ | **Device:** External BBT thermometer + manual or third-party app logging (NOT automatically captured by Apple Watch)

**What it measures:** Oral/vaginal basal body temperature measured upon waking, before any activity. Manual entry primarily. Captures the luteal phase temperature rise of ~0.3-0.5°C after ovulation.

**ShiftWell use case:** For female users, BBT confirms the menstrual cycle phase that wrist temperature (2.2) estimates. The precision is higher for BBT (±0.1°C from thermometer vs. wrist skin proxy). However, the requirement for manual measurement makes this less practical than the passive wrist temperature approach.

If a user already tracks BBT (via Natural Cycles, Clue, or other apps that write to HealthKit), ShiftWell can read this data to improve menstrual cycle phase detection. Priority: only read, never request as a new behavior.

**Scientific basis:**
- Baker & Driver (2007) — cited in 2.2
- Baird et al. (1999) — "Application of a new method for the analysis of fertility signals" — Fertility & Sterility.

**Device requirement:** External BBT thermometer. Most data originates from third-party apps writing to HealthKit.
**Data quality:** HIGH precision (thermometer reading) but HIGH missingness (requires daily morning measurement discipline). Passive wrist temperature (2.2) is preferred for ShiftWell.
**Priority:** LOW — read-only integration with apps that already capture it, no new user burden.

---

### 7.2 Menstrual Flow / Cycle Data
**HK Identifier:** `HKCategoryTypeIdentifier.menstrualFlow` (deprecated in iOS 18 — use Cycle Tracking data types)
**Related identifiers:**
- `HKCategoryTypeIdentifierIntermenstrualBleeding`
- `HKCategoryTypeIdentifierInfrequentMenstrualCycles` (iOS 16+)
- `HKCategoryTypeIdentifierIrregularMenstrualCycles` (iOS 16+)
- `HKCategoryTypeIdentifierProlongedMenstrualPeriods` (iOS 16+)

**What it measures:** Self-reported menstrual flow data used to infer cycle phase. The derived data types (Infrequent, Irregular, Prolonged cycles) are automatically classified by Apple's algorithm.

**ShiftWell use case:** Night shift work significantly disrupts the menstrual cycle. Labyak et al. (2002) found that 53% of female night shift nurses reported menstrual irregularity vs. 29% of day shift nurses. This is a bidirectional relationship:
- Circadian disruption causes menstrual irregularity
- Menstrual cycle phase modulates sleep architecture (luteal phase = less deep sleep, more REM)

ShiftWell applications:
1. Track whether cycle irregularity worsens with shift transitions (longitudinal correlation)
2. Adjust expected sleep architecture norms for cycle phase: "During your luteal phase, expect slightly less deep sleep — this is normal. Your plan remains on track."
3. Detect patterns where specific shift types (e.g., 7-day night rotation) correlate with cycle disruption onset

**Scientific basis:**
- Labyak et al. (2002) — "Effects of shiftwork on sleep and menstrual function in nurses" — Health Care for Women International.
- Baker et al. (2012) — "Shifting attention to hormonal effects on sleep and circadian rhythms" — Sleep Medicine Reviews.
- Manber & Armitage (1999) — "Sex, steroids, and sleep: A review" — Sleep.

**Note:** `HKCategoryTypeIdentifierMenstrualFlow` is deprecated in iOS 18. Use the newer derived identifiers for iOS 18+ users; maintain compatibility with the old identifier for iOS 16-17 users.

**Device requirement:** iPhone only — user self-reports or third-party app writes to HealthKit.
**Data quality:** VARIABLE — depends entirely on user reporting consistency. Derived irregularity types (Infrequent/Irregular/Prolonged) are computed by Apple and more reliable.
**Priority:** MEDIUM — high scientific relevance but requires user buy-in for cycle tracking. Position as an optional "enhanced insights" feature.

---

### 7.3 Mindful Minutes
**HK Identifier:** `HKCategoryTypeIdentifier.mindfulSession`
**iOS requirement:** iOS 10+ | **Device:** iPhone or Apple Watch

**What it measures:** Duration and recency of mindfulness/meditation sessions logged via the Mindfulness app, Headspace, Calm, or any app writing to HealthKit.

**ShiftWell use case:** Pre-sleep mindfulness practice reduces sleep onset latency and increases HRV (Tang et al., 2015). For shift workers, mindfulness before daytime sleep is particularly effective at overriding the circadian drive for wakefulness.

ShiftWell can:
- Detect if mindfulness practice occurred within 30-60 minutes before planned bedtime
- Correlate mindfulness practice days with sleep onset latency (if available) and HRV as a user-visible reinforcement loop
- Surface mindfulness as a recommendation for nights when HRV is low and rapid sleep onset is needed

**Scientific basis:**
- Tang et al. (2015) — "The neuroscience of mindfulness meditation" — Nature Reviews Neuroscience.
- Black et al. (2015) — "Mindfulness meditation and improvement in sleep quality and daytime impairment among older adults" — JAMA Internal Medicine.
- Heckenberg et al. (2018) — "Do workplace-based mindfulness meditation programs improve physiological indices of stress?" — Journal of Psychosomatic Research.

**Device requirement:** Any device with a HealthKit-writing mindfulness app (no Apple Watch required).
**Data quality:** HIGH for detection (categorical: session logged or not). Duration is reliable when logged.
**Priority:** MEDIUM — easy to read, straightforward recommendation hook.

---

## Section 8: Clinical Safety Signals

These data types are NOT optimization inputs — they are safety rails that should pause or override the algorithm.

### 8.1 Irregular Heart Rhythm Event
**HK Identifier:** `HKCategoryTypeIdentifier.irregularHeartRhythmEvent`
**iOS requirement:** iOS 12+ | **Device:** Apple Watch Series 1+

**What it measures:** Apple Watch detected irregular heart rhythm (possible AF) via PPG pattern analysis. This is the lower-sensitivity precursor to the ECG-based AF detection.

**ShiftWell action:** If this event is detected, pause all plan adjustments and surface a medical referral prompt. Do not use sleep data from the flagged period as algorithm input.

**Priority:** SAFETY RAIL only. Not an optimization input.

---

### 8.2 High/Low Heart Rate Events
**HK Identifiers:**
- `HKCategoryTypeIdentifier.highHeartRateEvent`
- `HKCategoryTypeIdentifier.lowHeartRateEvent`
**iOS requirement:** iOS 12+ | **Device:** Apple Watch

**What it measures:** Episodes where resting HR exceeded the user-set high threshold (default 120 BPM) or dropped below the low threshold (default 40 BPM) during non-exercise periods.

**ShiftWell action:** High HR events during sleep strongly suggest arousal from apnea, nightmare/PTSD, or fever. Low HR events during sleep may indicate high vagal tone (excellent recovery) or rarely bradyarrhythmia. Do not adjust the plan based on nights with flagged HR events — the sleep data is confounded.

**Priority:** SAFETY RAIL. Inform the feedback algorithm's data quality gating.

---

### 8.3 Sleep Apnea Events (repeated for clarity)
See Section 2.1. Classified here as both a sleep-specific data type AND a safety rail.

---

## Section 9: Priority Matrix and Implementation Roadmap

### Tier 1 — HIGH PRIORITY (implement in Phase 14/15)

| Data Type | HK Identifier | Key Benefit | Device Gate |
|-----------|--------------|-------------|-------------|
| HRV (SDNN) | `heartRateVariabilitySDNN` | Recovery score upgrade; feedback dead-zone calibration | Apple Watch |
| Resting Heart Rate | `restingHeartRate` | Slow fatigue signal; 7-day trend | Apple Watch |
| Sleeping Wrist Temp | `appleSleepingWristTemperature` | Circadian phase verification; illness detection | Watch S8+ |
| Time in Daylight | `timeInDaylight` | Light protocol compliance verification | Watch S4+ |
| Respiratory Rate | `respiratoryRate` | Illness detection; sleep quality proxy | Watch S3+ |
| Step Count | `stepCount` | Activity zeitgeber reinforcement | iPhone/Watch |

### Tier 2 — MEDIUM PRIORITY (Phase 33 — Apple Watch Integration)

| Data Type | HK Identifier | Key Benefit | Device Gate |
|-----------|--------------|-------------|-------------|
| Blood Oxygen | `oxygenSaturation` | Apnea screening complement | Watch S6+ |
| Sleeping Breathing Disturbances | `appleSleepingBreathingDisturbances` | Apnea screening | Watch S9+ |
| Sleep Apnea Events | `sleepApneaEvent` | Safety flag; suppress confounded data | Watch S9+ |
| Active Energy | `activeEnergyBurned` | Process S validation | Apple Watch |
| Stand Hours | `appleStandHour` | Daytime sleep validation for night workers | Apple Watch |
| Environmental Noise | `environmentalAudioExposure` | Daytime sleep disruption attribution | Watch S4+ |
| Menstrual Cycle | (multiple identifiers) | Cycle-phase sleep norm adjustment | iPhone |
| Mindful Minutes | `mindfulSession` | Pre-sleep practice tracking | iPhone/Watch |
| Exercise Time | `appleExerciseTime` | Bedtime adjustment for late workouts | Apple Watch |

### Tier 3 — LOW PRIORITY (Phase 35+ or never)

| Data Type | HK Identifier | Reason for Deferral |
|-----------|--------------|---------------------|
| VO2 Max | `vo2Max` | Quarterly metric, not real-time |
| HRR | `heartRateRecoveryOneMinute` | Requires exercise session |
| BBT | `basalBodyTemperature` | Passive wrist temp supersedes it |
| AF Burden | `atrialFibrillationBurden` | Safety rail only, no optimization value |
| Headphone Audio | `headphoneAudioExposure` | Marginal utility |
| Blood Pressure | `bloodPressureSystolic/Diastolic` | No wearable auto-capture; manual only |
| Blood Glucose | `bloodGlucose` | Manual CGM only; no passive Apple Watch data |

---

## Section 10: Authorization Expansion Needed

Current `requestAuthorization()` in `healthkit-service.ts` requests:
- Read: `sleepAnalysis`, `heartRate`
- Write: `sleepAnalysis`

To support Tier 1 data types, expand to:
```typescript
// NEW read permissions needed for Tier 1
const readPermissions = [
  HKCategoryTypeIdentifier.sleepAnalysis,
  HKQuantityTypeIdentifier.heartRate,
  HKQuantityTypeIdentifier.heartRateVariabilitySDNN,     // HRV
  HKQuantityTypeIdentifier.restingHeartRate,              // RHR
  HKQuantityTypeIdentifier.appleSleepingWristTemperature, // Wrist temp
  HKQuantityTypeIdentifier.timeInDaylight,                // Daylight
  HKQuantityTypeIdentifier.respiratoryRate,               // Respiratory rate
  HKQuantityTypeIdentifier.stepCount,                     // Steps
];
```

Privacy note: each new permission requires an `NSHealthShareUsageDescription` entry in `Info.plist` with a specific, user-facing justification. Apple App Review will reject apps with vague justifications. Example descriptions are required in the implementation plan.

---

## Section 11: Data Gaps and Limitations

### Gap 1: Apple Watch Wear Compliance
All Watch-dependent data types (HRV, wrist temp, respiratory rate, etc.) require the user to wear the Apple Watch to bed — with sufficient battery. Apple Watch charges overnight for many users; sleeping wear requires behavior change. ShiftWell must implement a graceful "no Apple Watch" mode where iPhone-only data (steps, sleep from third-party apps) still provides value.

**Recommendation:** Design the feedback system as additive layers:
- Level 1: iPhone only (sleep from third-party apps, steps)
- Level 2: + Apple Watch (HRV, HR, respiratory rate, wrist temp)
- Level 3: + Watch S8+ (wrist temperature)
- Level 4: + Watch S9+ (breathing disturbances, apnea events)

### Gap 2: Daytime Sleep Validation
All Apple Watch sleep accuracy studies validate nighttime sleep (10 PM – 8 AM). Night shift workers sleep during the day (8 AM – 4 PM). Chinoy et al. (2021) did not test daytime sleep windows. There is a known confound: the ambient light sensor may interfere with PPG-based sleep staging during daytime sleep.

**Recommendation:** Apply a larger feedback dead zone for daytime sleep records (30 min vs. 20 min for nighttime) until daytime-specific validation data is available.

### Gap 3: Third-Party Sleep Data
If a user doesn't own an Apple Watch, sleep data in HealthKit may come from Oura Ring, Fitbit, or other apps. These write `asleepUnspecified` or custom category values. ShiftWell should handle multi-source sleep data gracefully — the existing `source` field in `SleepRecord` tracks this, but no differential accuracy weighting is applied.

**Recommendation:** When `source` is not "Apple Watch" and staging is unavailable, rely solely on timing feedback (not quality feedback), and expand the dead zone to 25 min.

---

## Sources

### High Confidence (official documentation)
- @kingstinct/react-native-healthkit v13.4.0 source — `/node_modules/@kingstinct/react-native-healthkit/src/types/` — complete identifier enumeration
- Apple HealthKit HKQuantityTypeIdentifier docs — https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier
- Apple HealthKit HKCategoryTypeIdentifier docs — https://developer.apple.com/documentation/healthkit/hkcategorytypeidentifier

### High Confidence (peer-reviewed)
- Chinoy et al. (2021) — Consumer sleep tracking vs. PSG — Sleep, 44(5)
- Czeisler et al. (1990) — Bright light and night work adaptation — NEJM
- Eastman & Burgess (2009) — Circadian adaptation strategies — Sleep Medicine Clinics
- Malik et al. (1996) — HRV standards — European Heart Journal
- Borbely (1982) — Two-Process Model — Pflügers Archiv
- Muzet (2007) — Environmental noise and sleep — Sleep Medicine Reviews
- Baker & Driver (2007) — Sex hormones and sleep — Sleep Medicine

### Medium Confidence (validated wearable studies)
- de Zambotti et al. (2019) — Wearable sleep technology — Medicine & Science in Sports & Exercise
- Hernando et al. (2018) — Apple Watch HRV validation
- Sjoding et al. (2020) — PPG SpO2 bias in dark skin tones — NEJM
- Vyas et al. (2012) — Night shift and AF risk — JAMA Internal Medicine
- Labyak et al. (2002) — Shift work and menstrual function — Health Care for Women International
- Bozkurt et al. (2012) — Sleep apnea and shift work — Int J Occup Med
- Togo & Takahashi (2009) — HRV in occupational health — Industrial Health

### Medium Confidence (device specifications)
- Apple Watch Series 8 temperature sensor — Apple press materials and developer documentation
- Apple Sleep Apnea Notification — watchOS 11 release notes
- FDA 510k clearance documentation for Apple Watch SpO2 (2020)

---

**Audit completed:** 2026-04-06
**Next step:** Use this audit to expand `requestAuthorization()` and implement Tier 1 data type ingestion in Phase 14.
