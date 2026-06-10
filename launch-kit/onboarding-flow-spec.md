# ShiftWell Onboarding Flow Spec

> **Target user:** Night-shift ER nurse who downloaded at 3am between patients. 90 seconds of patience.
> **Target metric:** D1 retention ≥ 70%, onboarding completion ≥ 80%
> **Screens:** 6 (down from current 8 — consolidated household/preferences and cut addresses)
> **Tone:** Warm, direct, slightly irreverent. We know they're exhausted. We respect their time.

---

## Design Principles

1. **Value before data.** Show them what the app does before asking for anything.
2. **Every question earns its place.** If the algorithm doesn't need it in the first 24 hours, defer it.
3. **Progress feels fast.** 6 screens, visible progress bar, each screen completable in 10-15 seconds.
4. **Skip is always visible.** Power users and repeat shift workers don't want hand-holding.
5. **No permissions on cold screens.** Push notifications and HealthKit come after they've seen value.

---

## Screen-by-Screen Flow

### Screen 1: Welcome — "Your Sleep Fights Back"

**Purpose:** Emotional hook. Establish trust. Show we understand their world.

**Wireframe:**
```
┌──────────────────────────────────┐
│          [ShiftWell logo]        │
│                                  │
│   Your sleep fights back.        │
│                                  │
│   ShiftWell builds a sleep plan  │
│   around your shifts — not the   │
│   other way around.              │
│                                  │
│   Built by an ER doc. Backed by  │
│   circadian science. No fluff.   │
│                                  │
│   ┌────────────────────────────┐ │
│   │      Let's get started     │ │
│   └────────────────────────────┘ │
│                                  │
│       I already know what I'm    │
│       doing → [Skip to app]      │
│                                  │
│   ● ○ ○ ○ ○ ○                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** Your sleep fights back.
- **Body:** ShiftWell builds a sleep plan around your shifts — not the other way around. Built by an ER doc. Backed by circadian science. No fluff.
- **CTA:** Let's get started
- **Skip link:** I already know what I'm doing → Skip to app

**Data collected:** None.
**Time to complete:** 3 seconds (read + tap).

**Notes:**
- "Built by an ER doc" is a trust signal for healthcare workers. They trust peers over brands.
- Logo + dark background. No animation. Fast render — they're on hospital WiFi.

---

### Screen 2: Chronotype — "When Does Your Body Want to Sleep?"

**Purpose:** Collect the single most important algorithm input. Chronotype determines circadian phase offset for every sleep window calculation.

**Wireframe:**
```
┌──────────────────────────────────┐
│  ← Back                  Skip → │
│                                  │
│   When does your body want       │
│   to sleep?                      │
│                                  │
│   Forget your shift schedule     │
│   for a second. If you had       │
│   zero obligations tomorrow,     │
│   when would you fall asleep?    │
│                                  │
│   ┌────────────────────────────┐ │
│   │  🌅  Before 10pm          │ │
│   │      "I'm a morning       │ │
│   │       person, fight me"   │ │
│   └────────────────────────────┘ │
│   ┌────────────────────────────┐ │
│   │  🌙  10pm – midnight      │ │
│   │      "Somewhere in the    │ │
│   │       middle"             │ │
│   └────────────────────────────┘ │
│   ┌────────────────────────────┐ │
│   │  🦉  After midnight       │ │
│   │      "My natural state    │ │
│   │       is nocturnal"       │ │
│   └────────────────────────────┘ │
│                                  │
│   ○ ● ○ ○ ○ ○                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** When does your body want to sleep?
- **Body:** Forget your shift schedule for a second. If you had zero obligations tomorrow, when would you fall asleep?
- **Option A:** Before 10pm — "I'm a morning person, fight me" → maps to `chronotype: 'early'`
- **Option B:** 10pm – midnight — "Somewhere in the middle" → maps to `chronotype: 'intermediate'`
- **Option C:** After midnight — "My natural state is nocturnal" → maps to `chronotype: 'late'`
- **Skip:** Defaults to `chronotype: 'intermediate'`

**Data collected:** `UserProfile.chronotype` (required by algorithm — drives circadian phase offsets in `sleep-windows.ts` OFFSETS table)
**Time to complete:** 5 seconds.

**Algorithm impact:** This is the highest-impact onboarding question. Chronotype shifts sleep onset by ±1.5 hours in the Two-Process Model. Getting it wrong means every recommendation is off by that margin. The framing ("if you had zero obligations") prevents them from answering based on their shift schedule instead of their biology.

---

### Screen 3: Sleep Need & Naps — "How Much Sleep Do You Actually Need?"

**Purpose:** Collect sleep duration target and nap willingness. Two algorithm inputs, one screen.

**Wireframe:**
```
┌──────────────────────────────────┐
│  ← Back                  Skip → │
│                                  │
│   How much sleep do you          │
│   actually need?                 │
│                                  │
│   Not how much you get.          │
│   How much you need to not       │
│   feel like a zombie.            │
│                                  │
│   ┌──────────────────────────┐   │
│   │   ◄━━━━━━━●━━━━━━━━━►   │   │
│   │       7.5 hours           │   │
│   └──────────────────────────┘   │
│   Range: 5h — 10h, step: 0.5h   │
│                                  │
│   ──────────────────────────     │
│                                  │
│   Are you open to strategic      │
│   naps on long stretches?        │
│                                  │
│   ┌──────────┐  ┌──────────┐    │
│   │ Yes, if   │  │ No, I    │    │
│   │ they fit  │  │ can't nap│    │
│   └──────────┘  └──────────┘    │
│                                  │
│   ┌────────────────────────────┐ │
│   │          Continue          │ │
│   └────────────────────────────┘ │
│                                  │
│   ○ ○ ● ○ ○ ○                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** How much sleep do you actually need?
- **Body:** Not how much you get. How much you need to not feel like a zombie.
- **Slider label:** `{value} hours` (default: 7.5)
- **Nap question:** Are you open to strategic naps on long stretches?
- **Option A:** Yes, if they fit → `napPreference: true`
- **Option B:** No, I can't nap → `napPreference: false`
- **CTA:** Continue
- **Skip:** Defaults to `sleepNeed: 7.5, napPreference: true`

**Data collected:** `UserProfile.sleepNeed`, `UserProfile.napPreference`
**Time to complete:** 8 seconds.

**Algorithm impact:** `sleepNeed` sets the target duration for every sleep window. The algorithm won't generate windows shorter than this unless forced by shift constraints. `napPreference: false` suppresses all nap blocks from the plan — some people physiologically can't nap, and showing them nap recommendations erodes trust.

---

### Screen 4: Household & Routine — "What's Your Reality?"

**Purpose:** Collect environmental factors that constrain sleep. Consolidated from the current 4 separate screens (household, preferences, amRoutine, pmRoutine) into one fast screen with smart defaults.

**Wireframe:**
```
┌──────────────────────────────────┐
│  ← Back                  Skip → │
│                                  │
│   What's your reality?           │
│                                  │
│   We'll factor this into your    │
│   plan. Pick what applies.       │
│                                  │
│   ┌────────────────────────────┐ │
│   │  👶  Kids under 6 at home │ │
│   └────────────────────────────┘ │
│   ┌────────────────────────────┐ │
│   │  🐕  Pets that wake you   │ │
│   └────────────────────────────┘ │
│   ┌────────────────────────────┐ │
│   │  🚗  30+ min commute      │ │
│   └────────────────────────────┘ │
│                                  │
│   None of these? Just tap        │
│   Continue.                      │
│                                  │
│   ┌────────────────────────────┐ │
│   │          Continue          │ │
│   └────────────────────────────┘ │
│                                  │
│   ○ ○ ○ ● ○ ○                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** What's your reality?
- **Body:** We'll factor this into your plan. Pick what applies.
- **Toggle chips (multi-select):**
  - Kids under 6 at home → `hasYoungChildren: true`
  - Pets that wake you → `hasPets: true`
  - 30+ min commute → `commuteDuration: 45` (vs default 30)
- **Footer:** None of these? Just tap Continue.
- **CTA:** Continue
- **Skip:** All defaults (`hasYoungChildren: false, hasPets: false, commuteDuration: 30`)

**Data collected:** `UserProfile.hasYoungChildren`, `UserProfile.hasPets`, `UserProfile.commuteDuration`
**Time to complete:** 5 seconds.

**Algorithm impact:** Young children add wake-buffer noise to daytime sleep windows (the algorithm shortens confidence on uninterrupted sleep). Pets add a smaller buffer. Commute > 30 min shifts sleep/wake boundaries to account for travel time. These are secondary inputs — important for plan quality but not critical for a first-run plan.

**Design decision — why we consolidated:** The current 8-screen flow has separate screens for household (screen 3), preferences (screen 4), AM routine (screen 5), and PM routine (screen 6). That's four screens of data collection before the user sees any value. AM/PM routines are deferred to post-onboarding settings (see Data Collection Strategy below) — they're nice-to-have detail that doesn't block plan generation.

---

### Screen 5: Add Your Shifts — "Drop in Your Schedule"

**Purpose:** Get shift data into the app. This is the activation gate — without shifts, the algorithm can't run. Offer two paths: calendar import (fast) and manual entry (reliable).

**Wireframe:**
```
┌──────────────────────────────────┐
│  ← Back                  Skip → │
│                                  │
│   Drop in your schedule.         │
│                                  │
│   This is where it gets good.    │
│   We need your shifts to build   │
│   your plan.                     │
│                                  │
│   ┌────────────────────────────┐ │
│   │  📅  Import from Calendar  │ │
│   │      Pulls shifts from     │ │
│   │      Apple/Google Calendar │ │
│   │      (fastest)             │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  ✏️  Enter manually        │ │
│   │      Type your pattern     │ │
│   │      (e.g. 7p-7a, 3 on    │ │
│   │       3 off)               │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  🔜  I'll do this later    │ │
│   │      (explore with demo    │ │
│   │       data)                │ │
│   └────────────────────────────┘ │
│                                  │
│   ○ ○ ○ ○ ● ○                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** Drop in your schedule.
- **Body:** This is where it gets good. We need your shifts to build your plan.
- **Option A:** Import from Calendar — Pulls shifts from Apple/Google Calendar (fastest)
- **Option B:** Enter manually — Type your pattern (e.g. 7p-7a, 3 on 3 off)
- **Option C:** I'll do this later — (explore with demo data)
- **Skip:** Loads a demo 12-hour night shift rotation so the user can see the app in action. Flags in user-store as `demoMode: true`. Persistent banner on home screen: "Using demo data — add your real shifts in Settings."

**Data collected:** Shift schedule (fed into `ShiftEvent[]` array)
**Time to complete:** 15–60 seconds depending on path.

**Algorithm impact:** Without shifts, the algorithm has nothing to optimize around. This is the single required activation step. The "demo data" path is critical for users who are at work and can't do calendar permissions right now — it lets them see the value proposition immediately and come back to personalize later.

**Calendar permission request:** Only triggers when user taps "Import from Calendar." The system dialog appears in context — they just chose to import, so the permission request makes sense. This is the correct time to ask, not earlier.

---

### Screen 6: Your Plan is Ready — "Here's Your First Plan"

**Purpose:** Deliver the first moment of value. Show the generated sleep plan. Request push notifications in context (to remind them about sleep windows).

**Wireframe:**
```
┌──────────────────────────────────┐
│                                  │
│   ✓ Your first plan is ready.    │
│                                  │
│   ┌────────────────────────────┐ │
│   │  Tomorrow                  │ │
│   │                            │ │
│   │  🛏️ Sleep: 8:15a – 3:45p   │ │
│   │  ⏰ Nap:  7:00p – 7:20p   │ │
│   │  ☀️ Light: avoid until 2p  │ │
│   │  🍽️ Meal: eat before 9a    │ │
│   │  ☕ Caffeine: stop by 2a   │ │
│   └────────────────────────────┘ │
│                                  │
│   Want reminders before your     │
│   sleep windows?                 │
│                                  │
│   ┌────────────────────────────┐ │
│   │  🔔  Yes, remind me       │ │
│   └────────────────────────────┘ │
│         Not right now            │
│                                  │
│   ┌────────────────────────────┐ │
│   │     Go to my dashboard     │ │
│   └────────────────────────────┘ │
│                                  │
│   ○ ○ ○ ○ ○ ●                    │
└──────────────────────────────────┘
```

**Copy:**
- **Headline:** Your first plan is ready.
- **Plan preview:** Shows tomorrow's recommendations (sleep window, nap, light, meal, caffeine cutoff) pulled from the generated plan.
- **Notification ask:** Want reminders before your sleep windows?
- **Option A:** Yes, remind me → triggers iOS push notification permission dialog
- **Option B:** Not right now → defers, asks again after 3 days of usage
- **CTA:** Go to my dashboard

**Data collected:** Push notification permission (yes/no).
**Time to complete:** 10 seconds.

**Why notifications are asked here:** The user just saw their personalized plan. "Remind me before my sleep window" is a concrete, valuable promise — not an abstract "allow notifications" request. Conversion on notification permission should be 60%+ at this point vs. the industry average of ~40% for cold asks.

**HealthKit deferral:** The current flow has HealthKit as screen 8. We defer this to a contextual prompt 48 hours after onboarding, when the user has logged 2+ sleep entries manually. The prompt: "Want ShiftWell to read your sleep data automatically? Connect Apple Health." This timing produces higher opt-in rates because the user already understands what the data is for.

---

## Data Collection Strategy

### Collected During Onboarding (Screens 1-6)

| Field | Screen | Required | Algorithm Impact |
|-------|--------|----------|-----------------|
| `chronotype` | 2 | Yes (defaults to 'intermediate' if skipped) | Primary — shifts all sleep windows ±1.5h |
| `sleepNeed` | 3 | Yes (defaults to 7.5h if skipped) | Primary — sets sleep window duration |
| `napPreference` | 3 | Yes (defaults to true if skipped) | Binary — enables/disables nap blocks |
| `hasYoungChildren` | 4 | No | Secondary — adds wake buffer to day sleep |
| `hasPets` | 4 | No | Secondary — adds minor wake buffer |
| `commuteDuration` | 4 | No | Secondary — shifts sleep/wake boundaries |
| Shift schedule | 5 | Yes (demo data if skipped) | Critical — entire plan depends on this |
| Push notification permission | 6 | No | Retention — not algorithm |

### Deferred to Post-Onboarding (In-App Settings or Contextual Prompts)

| Field | When to Ask | Why Deferred |
|-------|-------------|--------------|
| `amRoutine` / `pmRoutine` | Settings, prompted after Day 3 | Nice-to-have detail. Adds routine buffers but doesn't block plan generation. Current 2 screens of routine setup is the #1 dropout risk in the flow. |
| `householdSize` | Settings | Only matters for noise modeling edge cases. Binary "kids under 6" captures the high-impact signal. |
| `workAddress` / `homeAddress` | Settings, prompted when commute > 30min selected | Address entry is high-friction on mobile. Commute duration toggle captures the algorithm input without requiring a full address. |
| `caffeineHalfLife` | In-app prompt after Week 1 | Most users don't know their caffeine sensitivity. Default 5h is population median. Surface after they've used caffeine timing recommendations and can self-report ("Do you still feel wired 6 hours after coffee?"). |
| HealthKit permission | Contextual prompt, Day 2-3 | Cold HealthKit asks convert at ~30%. Contextual asks after manual sleep logging convert at ~55%. |

### Alignment with Beta Surveys (surveys.md)

The Day 1 survey asks about setup ease (Q2), shift pattern (Q3), schedule import method (Q4), and chronotype quiz clarity (Q5). Our onboarding collects the same data points through the flow itself, so the survey validates whether the onboarding UX communicated clearly — it doesn't re-collect data.

The key alignment point: the Day 1 survey Q6 ("What did you think of your first sleep plan recommendation?") maps directly to Screen 6. If users report "unrealistic for my schedule" at high rates, the problem is either the algorithm or the onboarding data we collected — the survey helps us diagnose which.

---

## Personalization Hooks — How Onboarding Feeds the Algorithm

The ShiftWell circadian algorithm (Two-Process Model implementation in `src/lib/circadian/`) is deterministic. Same inputs produce same outputs. Onboarding collects the minimum inputs needed for a high-quality first plan.

### Chronotype → Circadian Phase Offset
`chronotype` maps to the `OFFSETS` table in `sleep-windows.ts`. This shifts the circadian oscillator (Process C) anchor point:
- `early`: natural sleep onset ~21:30, wake ~05:30
- `intermediate`: natural sleep onset ~23:00, wake ~07:00
- `late`: natural sleep onset ~00:30, wake ~08:30

Every sleep window, nap window, and light exposure recommendation cascades from this offset. On night shifts, the algorithm uses it to calculate the optimal circadian shift strategy (Eastman & Burgess 2009).

### Sleep Need → Window Duration
`sleepNeed` (5-10h range) sets the target duration for main sleep blocks. The algorithm guarantees windows ≥ this value on off-days. On work days, if the shift doesn't permit a full sleep block, the algorithm splits into main sleep + nap to approximate the target.

### Nap Preference → Block Generation
`napPreference: false` suppresses all `NapBlock` generation in the fatigue model (`fatigue-model.ts`). This is a hard gate, not a soft preference — if the user says they can't nap, we never show nap recommendations.

### Household Factors → Buffer Adjustments
`hasYoungChildren` adds a 30-minute wake buffer to daytime sleep windows (kids are unpredictable during day sleep after night shifts). `hasPets` adds a 15-minute buffer. These reduce the algorithm's confidence in uninterrupted sleep and may trigger an additional protective nap recommendation.

### Commute → Boundary Shifts
`commuteDuration > 30` shifts sleep window end times earlier (morning) and start times later (evening) to account for travel. A 45-minute commute means the algorithm places "wind down" 45 minutes before the user needs to leave, not 30.

---

## Skip / Fast-Track Option

### Full Skip (Screen 1 → App)
Available from Screen 1 via "I already know what I'm doing" link. Behavior:
- Sets all `UserProfile` fields to defaults (intermediate chronotype, 7.5h sleep, naps enabled, no household factors)
- Lands on the Add Shifts screen (still need schedule data to generate a plan)
- If they skip shifts too → demo mode with sample night rotation
- Persistent settings prompt after 24 hours: "Personalize your plan — it takes 60 seconds"

### Per-Screen Skip
Every screen (2-5) has a "Skip →" in the top-right corner. Skipping applies defaults for that screen only and advances to the next screen. The user can always go back.

### Fast-Track Detection
If a user completes screens 2-4 in under 20 seconds total, they're an experienced app user. After Screen 5 (shifts), skip the plan preview celebration and go straight to dashboard. Don't waste their time on the "wow" moment — they'll find it themselves.

---

## Push Notification Permission Timing

**When:** Screen 6, after the first sleep plan is displayed.

**Why not earlier:**
- Screen 1-4: User has seen zero value from the app. Cold notification ask = low conversion, high annoyance.
- Screen 5: User is in the middle of entering shifts — don't interrupt with a permission dialog.
- Screen 6: User just saw "Sleep: 8:15a – 3:45p" customized to their chronotype and shifts. "Want a reminder before your sleep window?" is a value-proposition-backed ask.

**If declined:**
- No re-prompt for 3 days.
- After 3 days, if user has opened the app 3+ times, show a contextual in-app card: "You have a nap window in 45 minutes. Want notifications so you don't miss these?"
- After that, only re-prompt via Settings nudge (badge on Settings icon).
- Never nag. Maximum 3 lifetime prompts.

**Expected conversion:** 60-65% (industry benchmark for contextual asks is 55-60%; our value-first framing should exceed that).

---

## Success Metrics

### Primary Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| **D1 Retention** | ≥ 70% | Users who open app Day 1 after install / total installs |
| **Onboarding Completion Rate** | ≥ 80% | Users who reach Screen 6 / users who start Screen 1 |
| **Time to First Plan** | ≤ 90 seconds | Time from Screen 1 tap to Screen 6 plan display |
| **Activation Rate** | ≥ 65% | Users who add real shifts (not demo) within 48 hours |

### Secondary Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| **Per-Screen Drop-off** | ≤ 8% per screen | Users who exit on each screen / users who started that screen |
| **Chronotype Completion** | ≥ 90% | Users who select a chronotype vs. skip/default |
| **Calendar Import Success** | ≥ 75% | Successful imports / import attempts |
| **Push Notification Opt-in** | ≥ 60% | Users who allow / users who reach Screen 6 |
| **Demo-to-Real Conversion** | ≥ 50% within 72h | Users who entered demo mode then added real shifts |
| **D7 Retention** | ≥ 45% | Users who open app on Day 7 |
| **Plan Export Rate** | ≥ 40% within 7 days | Users who export plan to calendar / onboarded users |

### Diagnostic Metrics

| Metric | Watch For | Action |
|--------|-----------|--------|
| Screen 2 (chronotype) drop-off > 10% | Question is confusing or feels invasive | A/B test simplified wording |
| Screen 5 (shifts) drop-off > 15% | Calendar import is failing or manual entry is too complex | Prioritize import reliability; add QGenda/Kronos parsers |
| Demo mode usage > 40% | Users can't/won't enter shifts during onboarding | This is fine if demo-to-real conversion stays above 50% |
| D1 retention < 60% | Onboarding isn't delivering enough value | Test adding a "your sleep score" teaser to Screen 6 |
| Notification opt-in < 45% | Ask is too aggressive or poorly timed | Test moving to post-Day-1 contextual ask |

### Funnel Visualization

```
Screen 1 (Welcome)       100%  ████████████████████████████████████
Screen 2 (Chronotype)     95%  ███████████████████████████████████
Screen 3 (Sleep/Naps)     89%  ██████████████████████████████████
Screen 4 (Household)      83%  ███████████████████████████████
Screen 5 (Shifts)         78%  ████████████████████████████
Screen 6 (Plan Ready)     80%  █████████████████████████████  ← target
```

Note: Screen 5→6 may show a slight recovery because users who make it to shift entry are committed. The main drop-off risk is Screen 3→4 (fatigue from consecutive data-collection screens) — hence the consolidation.

---

## Implementation Notes

### Changes from Current 8-Screen Flow

| Current Screen | New Flow | Change |
|---------------|----------|--------|
| 1. Welcome | → Screen 1 (Welcome) | Rewrite copy for emotional hook |
| 2. Chronotype | → Screen 2 (Chronotype) | Simplify to 3 options with personality-driven copy |
| 3. Household | → Screen 4 (merged) | Consolidated into toggle chips |
| 4. Preferences | → Screen 3 (merged) | Sleep need + nap preference combined |
| 5. AM Routine | → Deferred to Settings | Biggest dropout screen; not needed for first plan |
| 6. PM Routine | → Deferred to Settings | Same reasoning |
| 7. Addresses | → Deferred to Settings | High friction on mobile; commute toggle captures signal |
| 8. HealthKit | → Deferred to Day 2-3 | Higher opt-in with contextual ask |

### Constants Update Required
`src/constants/onboarding.ts` needs to be updated:
```typescript
export const ONBOARDING_TOTAL_STEPS = 6;

export const ONBOARDING_STEPS = {
  welcome: 1,
  chronotype: 2,
  sleepAndNaps: 3,
  household: 4,
  shifts: 5,
  planReady: 6,
} as const;
```

### Analytics Events to Instrument
Each screen should fire: `onboarding_screen_viewed`, `onboarding_screen_completed`, `onboarding_screen_skipped` with screen name and time-on-screen. Screen 5 should additionally fire `shift_import_method` (calendar/manual/demo). Screen 6 should fire `notification_permission_response` (granted/denied/deferred).

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation — complete onboarding flow spec. 6-screen flow consolidated from 8. Aligned with beta surveys (surveys.md), existing algorithm types (circadian/types.ts), and current onboarding constants. Ready for design and implementation review.
