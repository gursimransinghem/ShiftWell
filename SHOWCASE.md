# ShiftWell — Technical Showcase

**What:** iOS circadian sleep optimization app for shift workers
**Built by:** Dr. Gursimran Singh (ER physician) + Claude AI (architecture, implementation, science)
**Timeline:** ~5 days of development (March 31 - April 7, 2026)
**Stage:** Code complete through v2.0 — awaiting LLC formation for TestFlight distribution

---

## The Numbers

| Metric | Value |
|--------|-------|
| **Source files** | 228 TypeScript/TSX |
| **Lines of code** | 43,562 |
| **Test files** | 58 |
| **Tests passing** | 927 |
| **Git commits** | 319 |
| **Phases completed** | 31 of 38 (7 blocked on external gates) |
| **Requirements tracked** | 95 (across 5 milestones) |
| **Peer-reviewed citations** | 80+ in the science database |
| **Research documents** | 25+ (literature reviews, algorithm specs, validation plans) |

---

## Architecture Overview

```
React Native (Expo SDK 55) / TypeScript 5.9
├── src/lib/                    # Core logic — 20 modules
│   ├── circadian/              # 11 modules — sleep windows, shifts, naps, caffeine, meals, light
│   ├── adaptive/               # 6 modules — context builder, debt engine, change logger, feedback, recovery
│   ├── energy/                 # Borbely Two-Process Model — hourly alertness curve + caffeine model
│   ├── healthkit/              # Sleep ingestion, biometric readers (HRV, RHR, temp, steps)
│   ├── ai/                     # Claude API client, weekly brief generator, safety guardrails
│   ├── patterns/               # Multi-week pattern detection (consecutive nights, debt trends, weekend compensation)
│   ├── predictive/             # 14-day calendar lookahead, circadian stress scoring
│   ├── prescriptions/          # Behavioral Rx (nap protocol, caffeine cutoff, fitness, meals)
│   ├── enterprise/             # HIPAA anonymizer, cohort aggregator, multi-facility, schedule optimizer
│   ├── autopilot/              # 30-day eligibility, bounds checking, transparency log
│   ├── premium/                # RevenueCat gating, grandfathering, entitlements
│   ├── growth/                 # Referral links, A/B testing, re-engagement sequences
│   ├── calendar/               # Apple + Google Calendar sync, ICS import/export
│   └── watch/                  # HRV processor, Apple Watch complication spec
│
├── src/store/                  # 15 Zustand stores (persisted via AsyncStorage)
│   ├── plan-store.ts           # Sleep plan, adaptive context, change log, discrepancy history
│   ├── score-store.ts          # Recovery score, HRV integration, daily history
│   ├── prediction-store.ts     # Circadian forecast, transition predictions
│   ├── pattern-store.ts        # Detected patterns, alerts
│   ├── autopilot-store.ts      # Autopilot state, transparency log
│   ├── ai-store.ts             # Weekly briefs, AI feedback
│   └── ...                     # auth, premium, shifts, user, calendar, etc.
│
├── src/hooks/                  # React hooks
│   ├── useAdaptivePlan.ts      # Morning brain trigger (daily debounce, HealthKit, feedback)
│   ├── usePredictiveSchedule.ts
│   └── useWeeklyBrief.ts
│
├── src/components/today/       # 22 Today screen components
│   ├── AdaptiveInsightCard     # Shows plan changes with undo
│   ├── SleepDebtCard           # Threshold-gated debt/credit visualization
│   ├── CircadianForecastCard   # 14-day transition predictions
│   ├── PatternAlertCard        # Multi-week pattern alerts
│   ├── BehavioralChecklist     # Nap, caffeine, light exposure reminders
│   ├── WellnessCard            # Fitness + meal timing prescriptions
│   ├── HRVCalibrationBanner    # Apple Watch calibration progress
│   └── ...                     # countdown, timeline, score breakdown, etc.
│
├── app/                        # 20+ Expo Router screens
│   ├── (tabs)/                 # Today, Schedule, Profile, Settings, Outcomes
│   ├── (onboarding)/           # 8-screen onboarding flow
│   ├── paywall.tsx             # Premium subscription
│   ├── downgrade.tsx           # Graceful trial expiry
│   └── autopilot-log.tsx       # Transparency log modal
│
├── api/                        # Enterprise REST API (Express)
│   ├── openapi.yaml            # OpenAPI 3.0 spec
│   ├── src/middleware/          # OAuth2 JWT auth, rate limiting
│   └── src/routes/             # Schedule push (Kronos/QGenda), outcome pull
│
├── dashboard/                  # Enterprise web dashboard (Next.js)
│   └── components/             # Multi-facility views, manager alerts
│
├── docs/
│   ├── science/                # SLEEP-SCIENCE-DATABASE.md (80+ citations)
│   ├── research/               # 25+ research documents
│   ├── enterprise/             # Sales kit, compliance, pricing
│   └── superpowers/specs/      # Design specs (adaptive brain, expanded roadmap)
│
└── __tests__/                  # 58 test files, 927 tests
    ├── lib/                    # Unit tests for all core modules
    ├── store/                  # Store mutation + persistence tests
    ├── hooks/                  # Hook integration tests
    └── components/             # Component behavior tests
```

---

## What Makes This Interesting (For Engineers)

### 1. Science-Grounded Algorithm

The circadian engine implements the **Borbely Two-Process Model** (1982) — the same model used in clinical sleep research. It's not a heuristic or ML model. Given a shift schedule, it produces a deterministic sleep plan by computing:

- **Process S** (sleep homeostasis): exponential pressure buildup during wake, decay during sleep
- **Process C** (circadian rhythm): sinusoidal with 24h and 12h components, peaks at 10 AM and dip at 2 PM
- **Combined alertness**: scaled 0-100, with caffeine half-life overlay

```typescript
// From src/lib/energy/energy-engine.ts
const TAU_WAKE = 18.2;       // Sleep pressure buildup rate (hours)
const TAU_SLEEP = 4.2;       // Decay rate during sleep
const C_AMPLITUDE_24 = 0.50; // 24h circadian component
const C_AMPLITUDE_12 = 0.15; // 12h component (post-lunch dip)
```

### 2. Closed-Loop HealthKit Feedback

The app doesn't just generate plans — it learns from your actual sleep. HealthKit data feeds back into the algorithm:

```
HealthKit sleep data (30 nights)
    → comparePlannedVsActual() per night
    → discrepancy history (persisted)
    → EMA feedback engine (alpha=0.3, 20-min dead zone)
    → algorithm adjusts sleep windows
    → convergence target: <15 min discrepancy in 7 nights
```

The feedback engine has 7 guard conditions — it pauses during circadian transitions, when data is missing 3+ consecutive nights, or when HRV indicates the user is physiologically compromised (not behaviorally non-adherent).

### 3. Adaptive Brain with Daily Debounce

The "brain" runs once per day on app foreground — not on every app switch:

```typescript
// useAdaptivePlan.ts — single entry point
export async function runAdaptiveBrain(deps: AdaptiveBrainDeps) {
  // Daily debounce via AsyncStorage date key
  const lastRun = await AsyncStorage.getItem(ADAPTIVE_LAST_RUN_KEY);
  if (lastRun === todayISO) return;

  // 14-night HealthKit history → adaptive context
  // 30-night discrepancy history → feedback engine
  // Compute delta (planSnapshot vs current) → insight card
  // Persist run date AFTER success (failures retry next foreground)
}
```

Fires on both cold launch (mount) and background-to-active transitions. The debounce gate prevents re-running.

### 4. Predictive Scheduling

Scans 14 days of calendar ahead and predicts circadian stress before it happens:

```typescript
// ShiftWell Circadian Stress Index (SCSI)
alertness = 100 - (phaseShiftHours * 8) - (sleepDebt * 4)
// Severity: critical (<40), high (40-55), medium (55-70), low (>70)
// Sleep debt >8h escalates severity one tier
// Pre-adaptation protocol: 3-5 days before transition
```

### 5. HIPAA-Compliant Enterprise Pipeline

Differential privacy (Laplace mechanism, epsilon=1.0) for small cohorts:

```typescript
// anonymizer.ts
function laplaceSample(sensitivity: number, epsilon: number): number {
  const b = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}
// Applied to cohorts < 50 users; Safe Harbor de-identification for all
```

### 6. Store Architecture

15 Zustand stores with selective persistence via `partialize`:

```typescript
// plan-store.ts — persist only what survives restart
persist(
  (set, get) => ({ /* full state */ }),
  {
    name: 'adaptive-plan-store',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (s) => ({
      changeLog: s.changeLog,           // Capped at 30
      discrepancyHistory: s.discrepancyHistory, // Capped at 30
      feedbackAdjustment: s.feedbackAdjustment,
      // Excluded: plan, planSnapshot, adaptiveContext (too large, Date serialization)
    }),
  }
)
```

### 7. AI Safety Framework

Claude API weekly briefs go through an 8-category guardrail system:

```typescript
// Categories: medical diagnosis, medication guidance, emergency triage,
// psychological diagnosis, legal/employment advice, supplement dosing,
// sleep disorder diagnosis, lifestyle judgments
function validateGuardrails(text: string): { safe: boolean; violations: string[] }
```

62 edge case tests (including adversarial jailbreak attempts) validate the guardrails. Crisis protocol escalates through 3 tiers with a 72-hour sleep deprivation data trigger.

---

## Testing Philosophy

- **TDD throughout**: failing tests written first, then implementation
- **927 tests** across 58 files in ~6 seconds
- **No mocking HealthKit at the algorithm level**: pure functions tested with synthetic data
- **Store tests verify persistence**: partialize shape, cap limits, Date serialization
- **Component tests verify callbacks**: button presses fire correct store actions

```bash
npx jest --no-coverage  # 927 tests, ~6 seconds
npx tsc --noEmit        # Zero TypeScript errors
```

---

## Development Process

Built using the **GSD (Get Shit Done) Framework** — a structured planning system:

1. **Research phase**: Literature review → algorithm spec → validation plan
2. **Discuss phase**: Capture design decisions (user preferences, not implementation details)
3. **Plan phase**: Create PLAN.md with tasks, acceptance criteria, file lists
4. **Execute phase**: Spawn parallel agents per plan, each in a git worktree
5. **Verify phase**: Goal-backward verification against success criteria

Each phase produces: PLAN.md, SUMMARY.md, VERIFICATION.md, and atomic git commits.

**319 commits** across 38 phases, with full traceability from requirement IDs to code.

---

## Science Foundation

The algorithm traces to published research:

| Paper | Year | What It Informs |
|-------|------|-----------------|
| Borbely (Two-Process Model) | 1982 | Core alertness prediction |
| Czeisler et al. (bright light) | 1990 | Light exposure protocols |
| Eastman & Burgess (circadian shifting) | 2009 | Pre-adaptation protocols |
| Drake et al. (SWSD prevalence) | 2004 | Target population sizing |
| Chinoy et al. (Apple Watch accuracy) | 2021 | HealthKit dead zone calibration |
| Shaffer & Ginsberg (HRV review) | 2017 | Recovery score HRV weights |
| Hursh (SAFTE model) | 2004 | Fatigue risk prediction |
| AHA Scientific Statement | 2025 | Cardiovascular risk from shift work |

Full database: `docs/science/SLEEP-SCIENCE-DATABASE.md` (80+ citations)

---

## What's Left (External Gates Only)

All code is written. The 7 remaining phases are blocked on:

- **LLC formation** → Apple Developer → D-U-N-S → TestFlight (legal, ~5 weeks)
- **30 days of user data** → feedback validation sprint
- **90 days of AI data** → intelligence validation sprint
- **100+ users** → validation study execution
- **iOS revenue** → Android launch

The next line of code that needs to be written is in response to real user data.

---

## How to Explore

```bash
# Clone and install
git clone <repo> && cd shiftwell && npm install

# Run tests
npx jest --no-coverage            # 927 tests in ~6 seconds

# Check TypeScript
npx tsc --noEmit                  # Zero errors

# Browse the algorithm
cat src/lib/circadian/index.ts    # Entry point
cat src/lib/adaptive/types.ts     # Adaptive brain types
cat src/lib/energy/energy-engine.ts  # Borbely model

# Browse the science
cat docs/science/SLEEP-SCIENCE-DATABASE.md  # 80+ citations

# Browse the roadmap
cat .planning/ROADMAP.md          # 38 phases, 5 milestones

# Start the app (requires Expo)
npx expo start
```

---

*Built in Tampa, FL by an ER doctor who works nights and an AI that doesn't sleep.*
