# ShiftWell — Visual Roadmap

> **Last Updated:** 2026-04-07
> **Status:** STRATEGIC PIVOT — Ship Path Adopted (Phase A: Slim Down → Phase B: Polish → Phase C: TestFlight)
> **Active Work:** Phase A Slim Down — archiving premature features, reducing codebase from ~219 to ~160 files
> **Founder:** Emergency Department Physician

---

## 1. App Architecture Diagram

```
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                              DATA SOURCES (Input Layer)                             │
 │                                                                                     │
 │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
 │   │  Shift .ics   │    │   Personal   │    │  Chronotype  │    │   Household &    │  │
 │   │   (QGenda,    │    │   Calendar   │    │  Quiz (MEQ)  │    │   Preferences    │  │
 │   │  Apple, etc.) │    │   Events     │    │              │    │ (sleep, caffeine │  │
 │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    │  kids, commute)  │  │
 │          │                   │                    │            └────────┬─────────┘  │
 └──────────┼───────────────────┼────────────────────┼───────────────────┼──────────────┘
            │                   │                    │                   │
            ▼                   ▼                    ▼                   ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                           ZUSTAND STORES (State Layer)                              │
 │                                                                                     │
 │   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────────┐   │
 │   │   shifts-store    │   │    user-store     │   │         plan-store           │   │
 │   │                  │   │                  │   │                              │   │
 │   │  ● Shift CRUD    │   │  ● UserProfile   │   │  ● SleepPlan (derived)      │   │
 │   │  ● Personal evts │   │  ● Chronotype    │   │  ● Auto-regenerates on      │   │
 │   │  ● Date-aware    │   │  ● Sleep need    │   │    shift or profile change   │   │
 │   │    serialization │   │  ● Household     │   │  ● Stats & insights         │   │
 │   │  ● Auto classify │   │  ● Onboarding   │   │                              │   │
 │   └────────┬─────────┘   └────────┬─────────┘   └──────────────┬───────────────┘   │
 │            │                      │                             ▲                    │
 │            └──────────────────────┼─────────────────────────────┘                    │
 │                                   │          (subscriptions trigger regeneration)    │
 └───────────────────────────────────┼─────────────────────────────────────────────────┘
                                     │
                                     ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                     CIRCADIAN ALGORITHM (Pure TypeScript — Core IP)                 │
 │                                                                                     │
 │   ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌───────┐  ┌───────────┐  │
 │   │ Classify  │─▶│  Sleep   │─▶│  Nap   │─▶│ Caffeine │─▶│ Meals │─▶│   Light   │  │
 │   │  Shifts   │  │ Windows  │  │ Engine │  │ Cutoffs  │  │Timing │  │ Protocol  │  │
 │   │          │  │          │  │        │  │          │  │       │  │           │  │
 │   │ day/night│  │ anchor   │  │ pre-   │  │ onset -  │  │ first │  │ blue-block│  │
 │   │ evening/ │  │ sleep,   │  │ shift, │  │ (half-   │  │ 10h of│  │ bright    │  │
 │   │ extended/│  │ chrono-  │  │ power, │  │ life ×   │  │ wake, │  │ light,    │  │
 │   │ recovery/│  │ type adj,│  │ trans- │  │ 1.67)    │  │ fast   │  │ avoidance │  │
 │   │ off/trans│  │ conflict │  │ ition  │  │          │  │ 3h pre│  │ windows   │  │
 │   └──────────┘  └──────────┘  └────────┘  └──────────┘  └───────┘  └───────────┘  │
 │                                                                                     │
 │                          generateSleepPlan() → SleepPlan                            │
 └───────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
                                             ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                              OUTPUT (Presentation Layer)                            │
 │                                                                                     │
 │   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────────────┐    │
 │   │   Today Screen     │   │   Calendar View    │   │     .ics Export           │    │
 │   │                   │   │                   │   │                           │    │
 │   │  ▶ Timeline       │   │  ▶ Month view     │   │  ▶ RFC 5545 events       │    │
 │   │  ▶ Countdowns     │   │  ▶ Color-coded    │   │  ▶ Share sheet           │    │
 │   │  ▶ Insight banner │   │    dots & blocks  │   │  ▶ Import into Apple/    │    │
 │   │  ▶ Tip of the day │   │  ▶ Day detail     │   │    Google Calendar       │    │
 │   │  ▶ Live status    │   │    panel          │   │  ▶ Alarms & categories   │    │
 │   └───────────────────┘   └───────────────────┘   └───────────────────────────┘    │
 └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Screen Flow Diagram

```
                            ┌──────────────────────────────┐
                            │         APP LAUNCH            │
                            │       index.tsx               │
                            └──────────────┬───────────────┘
                                           │
                            ┌──────────────▼───────────────┐
                            │     Onboarding Complete?      │
                            └──┬───────────────────────┬───┘
                               │ NO                     │ YES
                               ▼                        ▼
               ┌───────────────────────┐    ┌───────────────────────┐
               │  ONBOARDING FLOW      │    │     TAB NAVIGATOR      │
               │                       │    │                       │
               │  ┌─────────────────┐  │    │  ┌─────┬───────┬────┐│
               │  │ 1. Welcome      │  │    │  │Today│Schedule│Set ││
               │  │    Value props  │  │    │  └──┬──┴───┬───┴──┬─┘│
               │  └────────┬────────┘  │    └─────┼──────┼──────┼──┘
               │           ▼           │          │      │      │
               │  ┌─────────────────┐  │          ▼      │      │
               │  │ 2. Chronotype   │  │    ┌──────────┐ │      │
               │  │    MEQ Quiz     │  │    │  TODAY    │ │      │
               │  │    (5 questions)│  │    │ SCREEN   │ │      │
               │  └────────┬────────┘  │    │          │ │      │
               │           ▼           │    │ Timeline │ │      │
               │  ┌─────────────────┐  │    │ Count-   │ │      │
               │  │ 3. Household    │  │    │  downs   │ │      │
               │  │    Kids, pets,  │  │    │ Insights │ │      │
               │  │    size         │  │    │ Tips     │ │      │
               │  └────────┬────────┘  │    └──────────┘ │      │
               │           ▼           │                 │      │
               │  ┌─────────────────┐  │           ┌─────▼────┐ │
               │  │ 4. Preferences  │  │           │ SCHEDULE │ │
               │  │    Sleep hours  │  │           │  SCREEN  │ │
               │  │    Nap pref     │  │           │          │ │
               │  │    Caffeine     │  │           │ MonthView│ │
               │  │    Commute      │──┼──────▶    │ DayDetail│ │
               │  └─────────────────┘  │           │          │ │
               └───────────────────────┘           └────┬─────┘ │
                                                        │       │
                                                        │       ▼
                                                        │  ┌─────────┐
                                              ┌─────────┤  │SETTINGS │
                                              │         │  │ SCREEN  │
                                              ▼         │  │         │
                                       ┌────────────┐   │  │ Profile │
                                       │ ADD SHIFT   │   │  │ Import  │
                                       │  (Modal)    │   │  │ Export  │
                                       │             │   │  │ About   │
                                       │ Start/End   │   │  │ Reset   │
                                       │ Type detect │   │  └────┬────┘
                                       │ Edit/Delete │   │       │
                                       └────────────┘   │       ▼
                                                        │  ┌─────────┐
                                                        │  │ IMPORT  │
                                                        │  │ (Modal) │
                                                        │  │         │
                                                        │  │ 1.Pick  │
                                                        │  │ 2.Review│
                                                        │  │ 3.Confm │
                                                        │  └─────────┘
                                                        │
                                                        ▼
                                                  ┌───────────┐
                                                  │  EXPORT    │
                                                  │ Share Sheet│
                                                  │            │
                                                  │ .ics file  │
                                                  │ → Apple Cal│
                                                  │ → Google   │
                                                  └───────────┘
```

---

## 3. Algorithm Pipeline Visual

```
 INPUT                                                                           OUTPUT
 ═════                                                                           ══════

 Shifts:                                                                    Complete
 Mon 19:00-07:00  ─┐                                                        Daily Plan:
 Tue 19:00-07:00   │                                                        ─────────────
 Wed OFF            ├──▶ ┌──────────────────────────────────────────────┐    Mon: Sleep
 Thu 07:00-19:00   │    │           ALGORITHM  PIPELINE                │     08:00-15:00
 Fri 07:00-19:00  ─┘    │                                              │    Nap 18:00-19:00
                        │                                              │    Caffeine cut 02:00
 Profile:               │                                              │    Meal 20:00
 ● Chronotype: Late     │                                              │    Blue-blockers
 ● Sleep need: 7.5h     │                                              │     07:00-08:00
 ● Caffeine: Normal     │                                              │    ...
 ● Kids: 1 (age 3)      │                                              │
                        └──────────────────────────────────────────────┘

                          STEP-BY-STEP BREAKDOWN
                          ══════════════════════

 STEP 1: CLASSIFY SHIFTS
 ┌──────────────────────────────────────────────────────────────────────┐
 │  Mon 19:00-07:00  ──▶  NIGHT    (start 19:00-04:00, ≥6h)           │
 │  Tue 19:00-07:00  ──▶  NIGHT    (consecutive night)                │
 │  Wed     OFF      ──▶  RECOVERY (first day off after nights)       │
 │  Thu 07:00-19:00  ──▶  TRANSITION (night→day, needs phase advance) │
 │  Fri 07:00-19:00  ──▶  DAY      (start 05:00-12:00, ≥6h)          │
 └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
 STEP 2: COMPUTE SLEEP WINDOWS
 ┌──────────────────────────────────────────────────────────────────────┐
 │  NIGHT   ──▶  Anchor sleep 08:00-15:30 (7.5h, post-shift)          │
 │  NIGHT   ──▶  Anchor sleep 08:00-15:30                             │
 │  RECOVERY──▶  Split: 08:00-12:00 + early bed 21:00-06:00           │
 │  TRANS   ──▶  Gradual advance: sleep 01:00-08:30 (2h/day shift)    │
 │  DAY     ──▶  Natural: 23:00-06:30 (chronotype-adjusted for late)  │
 │                                                                      │
 │  ★ Personal events checked — dentist at 10am? Sleep shifts to 11:30 │
 │  ★ Kid age 3 — noise factor applied, earlier wind-down              │
 └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
 STEP 3: PLACE STRATEGIC NAPS
 ┌──────────────────────────────────────────────────────────────────────┐
 │  NIGHT shifts  ──▶  Pre-shift prophylactic nap 18:00-19:30 (90min) │
 │  RECOVERY      ──▶  Power nap 14:00-14:25 (25min, bridge to night) │
 │  TRANSITION    ──▶  Transition nap 15:00-15:25 (circadian dip)     │
 │  DAY shifts    ──▶  None (nap pref: only when needed)              │
 └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
 STEP 4: CAFFEINE CUTOFFS
 ┌──────────────────────────────────────────────────────────────────────┐
 │  Formula: cutoff = sleep_onset − (half_life × 1.67)                 │
 │  Normal sensitivity → half-life = 5h → buffer = 8.35h               │
 │                                                                      │
 │  NIGHT (sleep 08:00) ──▶  Cutoff ~00:00 (midnight)                  │
 │  DAY   (sleep 23:00) ──▶  Cutoff ~14:40 (early afternoon)           │
 │                                                                      │
 │  Based on: Drake et al. 2013 — caffeine 6h before bed               │
 │  still reduces total sleep by 1 hour                                 │
 └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
 STEP 5: MEAL TIMING
 ┌──────────────────────────────────────────────────────────────────────┐
 │  Rule: Eat in first 10h of wake, fast last 3h before sleep          │
 │                                                                      │
 │  NIGHT (wake 15:30) ──▶  Meal 1: 16:00  Meal 2: 20:00              │
 │                          Snack: 23:00   Fast after 05:00            │
 │  DAY   (wake 06:30) ──▶  Meal 1: 07:00  Meal 2: 12:00              │
 │                          Meal 3: 17:00  Fast after 20:00            │
 │                                                                      │
 │  Based on: Manoogian 2022, Chellappa 2021                           │
 └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
 STEP 6: LIGHT EXPOSURE PROTOCOL
 ┌──────────────────────────────────────────────────────────────────────┐
 │  NIGHT post-shift ──▶  Blue-blocking glasses 07:00-08:00 (commute) │
 │  NIGHT pre-shift  ──▶  Bright light exposure 19:00-20:00            │
 │  RECOVERY         ──▶  Bright light AM, avoid evening light         │
 │  TRANSITION       ──▶  Morning bright light to advance phase        │
 │                                                                      │
 │  Based on: Czeisler 1990, Eastman & Burgess 2009                    │
 └──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Product Vision Timeline

```
 ════════════════════════════════════════════════════════════════════════════════════════
       PHASE 1             PHASE 2            PHASE 3           PHASE 4       PHASE 5
       MVP                 SMART              iOS POWER         EXPAND        AI + B2B
       Weeks 1-6           Weeks 7-12         Months 4-6        Months 6+     Month 8+
 ════════════════════════════════════════════════════════════════════════════════════════

  ██████████████───────────────────────────────────────────────────────────────────────▶
  ████ HERE ████
  ██████████████

  ┌──────────────┐   ┌──────────────────┐   ┌────────────────┐  ┌─────────────┐  ┌──────────┐
  │ ★ CORE LOOP  │   │ ◆ INTELLIGENCE   │   │ ◆ DEEP iOS     │  │ ◆ NEW       │  │ ◆ SCALE  │
  │              │   │                  │   │                │  │  AUDIENCES  │  │          │
  │ ● Onboarding │   │ ● Supabase       │   │ ● Live         │  │             │  │ ● AI     │
  │   w/ MEQ quiz│   │   backend        │   │   Activities   │  │ ● Jet Lag   │  │   Sleep  │
  │ ● Shift .ics │   │ ● Google Cal     │   │ ● Dynamic      │  │   Mode      │  │   Coach  │
  │   import     │   │   OAuth sync     │   │   Island       │  │ ● On-Call   │  │ ● B2B    │
  │ ● Personal   │   │ ● Apple          │   │ ● Home Screen  │  │   Mode      │  │   Dash-  │
  │   calendar   │   │   HealthKit      │   │   Widgets      │  │ ● New       │  │   boards │
  │   awareness  │   │ ● Push           │   │ ● Sleep Focus  │  │   Parent    │  │ ● Fatigue│
  │ ● Circadian  │   │   notifications  │   │   Automation   │  │   Mode      │  │   Risk   │
  │   algorithm  │   │ ● Recovery       │   │ ● Alarm        │  │ ● Gig/      │  │   Score  │
  │ ● Sleep      │   │   Score          │   │   Automation   │  │   Nightlife │  │ ● Corp   │
  │   windows    │   │ ● Soundscapes    │   │ ● Apple Watch  │  │   Mode      │  │   Well-  │
  │ ● Nap, meal, │   │ ● Family/Spouse  │   │ ● Shift Trans  │  │ ● Student   │  │   ness   │
  │   caffeine   │   │   Notifications  │   │   Planner      │  │   Mode      │  │ ● OSHA   │
  │ ● .ics export│   │ ● Weekly Sleep   │   │ ● Social/      │  │             │  │   Compli-│
  │ ● Today view │   │   Intelligence   │   │   Family Mode  │  │ Same core   │  │   ance   │
  │ ● Calendar   │   │   Report         │   │                │  │ algorithm,  │  │          │
  │   view       │   │ ● Smart "Phone   │   │                │  │ different   │  │          │
  │ ● Dark mode  │   │   Down" nudges   │   │                │  │ input modes │  │          │
  │ ● 116 tests  │   │                  │   │                │  │             │  │          │
  └──────────────┘   └──────────────────┘   └────────────────┘  └─────────────┘  └──────────┘

       Revenue:             Revenue:            Revenue:          Revenue:       Revenue:
       Free / TBD           Subscription        Premium tier      Mode add-ons   Enterprise
                            $5-10/mo            $12-15/mo         per-mode       contracts
```

### Revenue Growth Model

```
  Users
  (log)
    │
    │                                                              ╱ B2B contracts
    │                                                           ╱   (hospitals,
    │                                                        ╱      airlines, EMS)
    │                                                     ╱
    │                                                  ╱  New audiences
    │                                               ╱     (travelers,
    │                                          ╱╱╱        parents, etc.)
    │                                     ╱╱╱
    │                               ╱╱╱╱╱    Organic + word-of-mouth
    │                          ╱╱╱╱╱
    │                    ╱╱╱╱╱╱
    │              ╱╱╱╱╱╱
    │        ╱╱╱╱╱╱
    │   ╱╱╱╱╱   TestFlight → App Store → Feature expansion
    │╱╱╱
    └──────────────────────────────────────────────────────────────▶ Time
     Wk4    Wk6      Wk12       Mo6         Mo8         Mo12+
     NOW    Launch   Smart      iOS Power   Expansion   Enterprise
```

---

## 5. User Journey Map

```
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                           USER JOURNEY: FIRST WEEK                                 │
 └─────────────────────────────────────────────────────────────────────────────────────┘

 DAY 1 ─────────────────────────────────────────────────────────────────────────────────

    Download          Onboarding              Add Shifts           View Plan
    ┌─────┐     ┌────┐ ┌────┐ ┌────┐     ┌─────────────┐    ┌──────────────┐
    │     │     │Welc│ │Quiz│ │Pref│     │  Import .ics │    │ "Sleep at    │
    │ App │────▶│ome │▶│    │▶│    │────▶│  from QGenda │───▶│  08:00"      │
    │Store│     │    │ │ 5Q │ │    │     │  OR manual   │    │ "Nap at      │
    │     │     │    │ │    │ │    │     │  entry       │    │  18:00"      │
    └─────┘     └────┘ └────┘ └────┘     └─────────────┘    │ "No coffee   │
                                                             │  after 00:00"│
    Feeling:    Feeling:                  Feeling:           └──────────────┘
    Curious     "This gets me"            "That was easy"    Feeling:
                                                             "Finally, a plan!"

 DAY 2-3 ───────────────────────────────────────────────────────────────────────────────

    Morning Check        Follow Plan          Export to Calendar     Share
    ┌──────────┐     ┌──────────────┐     ┌──────────────────┐    ┌──────┐
    │ Today    │     │ Sleep at     │     │ One-tap export   │    │ Tell │
    │ Screen   │────▶│ recommended  │────▶│ to Apple/Google  │───▶│ col- │
    │ "Sleep   │     │ time         │     │ Calendar         │    │ league│
    │  in 3h"  │     │              │     │                  │    │      │
    └──────────┘     │ Wake feeling │     │ Sleep blocks     │    └──────┘
                     │ more rested  │     │ appear alongside │
    Feeling:         └──────────────┘     │ existing events  │    Feeling:
    "Glanceable,                          └──────────────────┘    "Others need
     actionable"     Feeling:                                      this too"
                     "This works"         Feeling:
                                          "Seamless"

 DAY 4-7 (DAILY RHYTHM) ───────────────────────────────────────────────────────────────

    ┌─────────┐       ┌──────────┐       ┌──────────┐       ┌──────────────┐
    │ Glance  │       │ Follow   │       │ Check    │       │ Adjust for   │
    │ Today   │──────▶│ caffeine │──────▶│ calendar │──────▶│ shift swaps  │
    │ Screen  │       │ cutoffs  │       │ for next │       │ or schedule  │
    │ (10 sec)│       │ & meal   │       │ day plan │       │ changes      │
    └─────────┘       │ timing   │       └──────────┘       └──────────────┘
                      └──────────┘
    Feeling:          Feeling:           Feeling:            Feeling:
    "Habit formed"    "Structure helps"  "Always prepared"   "App adapts to me"


 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                          RETENTION LOOP (Phase 2+)                                 │
 │                                                                                     │
 │   ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌──────────────────────┐   │
 │   │ Weekly     │    │ Recovery   │    │ HealthKit  │    │ Smart notifications  │   │
 │   │ Sleep      │───▶│ Score      │───▶│ adaptation │───▶│ "Phone down. Your    │   │
 │   │ Report     │    │ tracking   │    │ "You slept │    │  body needs this."   │   │
 │   │ (Monday AM)│    │            │    │  poorly —  │    │                      │   │
 │   │            │    │ Streaks &  │    │  extra nap │    │ Family notification: │   │
 │   │ Trends,    │    │ goals      │    │  added"    │    │ "Keep it quiet       │   │
 │   │ risks,     │    │            │    │            │    │  until 3pm"          │   │
 │   │ AI tips    │    │            │    │            │    │                      │   │
 │   └────────────┘    └────────────┘    └────────────┘    └──────────────────────┘   │
 └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Stack Visual

```
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                     │
 │    PRESENTATION       ┌──────────────────────────────────────────────────────┐      │
 │    LAYER              │              Expo Router Screens                     │      │
 │                       │  Today  │  Schedule  │  Settings  │  Modals         │      │
 │                       │  .tsx   │  .tsx      │  .tsx      │  add-shift.tsx  │      │
 │                       │         │            │            │  import.tsx     │      │
 │                       └────────────────────────┬─────────────────────────────┘      │
 │                                                │                                    │
 │    COMPONENT          ┌────────────────────────▼─────────────────────────────┐      │
 │    LAYER              │            React Components + Hooks                  │      │
 │                       │                                                      │      │
 │                       │  UI Components        Custom Hooks                   │      │
 │                       │  ├── Button           ├── useShifts                  │      │
 │                       │  ├── Card             ├── useSleepPlan              │      │
 │                       │  ├── ProgressBar      ├── useTodayPlan             │      │
 │                       │  ├── OptionCard       ├── useExport                │      │
 │                       │  ├── TimeRangePicker  └── useOnboarding            │      │
 │                       │  └── AnimatedTransition                             │      │
 │                       │                                                      │      │
 │                       │  Feature Components                                  │      │
 │                       │  ├── MonthView / DayCell / DayDetail                │      │
 │                       │  ├── TimelineEvent / CountdownCard                   │      │
 │                       │  ├── InsightBanner / TipCard                         │      │
 │                       │  └── ChronotypeQuiz                                 │      │
 │                       └────────────────────────┬─────────────────────────────┘      │
 │                                                │                                    │
 │    STATE              ┌────────────────────────▼─────────────────────────────┐      │
 │    LAYER              │             Zustand + AsyncStorage                    │      │
 │                       │                                                      │      │
 │                       │   user-store     shifts-store      plan-store        │      │
 │                       │   (profile)      (CRUD + events)   (derived plan)    │      │
 │                       │         │              │                 ▲            │      │
 │                       │         └──────────────┼─────────────────┘            │      │
 │                       │                        │    (auto-regenerate)         │      │
 │                       └────────────────────────┬─────────────────────────────┘      │
 │                                                │                                    │
 │    ALGORITHM          ┌────────────────────────▼─────────────────────────────┐      │
 │    LAYER              │         Circadian Engine (Pure TypeScript)            │      │
 │    (Core IP)          │                                                      │      │
 │                       │   classify-shifts  →  sleep-windows  →  nap-engine   │      │
 │                       │   caffeine         →  meals          →  light        │      │
 │                       │                                                      │      │
 │                       │   ★ Zero dependencies on React or UI                 │      │
 │                       │   ★ 116 unit tests                                   │      │
 │                       │   ★ Based on peer-reviewed circadian science         │      │
 │                       └────────────────────────┬─────────────────────────────┘      │
 │                                                │                                    │
 │    CALENDAR           ┌────────────────────────▼─────────────────────────────┐      │
 │    LAYER              │           Calendar I/O (ical.js + RFC 5545)           │      │
 │                       │                                                      │      │
 │                       │   ics-parser.ts       ics-generator.ts               │      │
 │                       │   (import .ics)       (export .ics)                  │      │
 │                       │                                                      │      │
 │                       │   shift-detector.ts                                  │      │
 │                       │   (distinguish shifts from personal events)          │      │
 │                       └──────────────────────────────────────────────────────┘      │
 │                                                                                     │
 │    BUILD              ┌──────────────────────────────────────────────────────┐      │
 │    TOOLING            │  Expo SDK 55  │  EAS Build  │  Jest + ts-jest       │      │
 │                       │  TypeScript   │  TestFlight │  expo-document-picker │      │
 │                       │  date-fns     │  app.json   │  expo-sharing         │      │
 │                       └──────────────────────────────────────────────────────┘      │
 │                                                                                     │
 └─────────────────────────────────────────────────────────────────────────────────────┘


 PHASE 2+ ADDITIONS
 ═══════════════════

 ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐
 │    Supabase       │  │  Apple HealthKit  │  │    WidgetKit     │  │  Claude API    │
 │                  │  │                  │  │                  │  │                │
 │  Auth            │  │  @kingstinct/    │  │  Home Screen     │  │  AI Sleep      │
 │  Postgres        │  │  react-native-   │  │  Widgets         │  │  Coach         │
 │  Edge Functions  │  │  healthkit       │  │  Live Activities │  │  (Phase 5)     │
 │  Storage         │  │                  │  │  Dynamic Island  │  │                │
 │  (Phase 2)       │  │  (Phase 2)       │  │  (Phase 3)       │  │                │
 └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────┘
```

---

## 7. Ship Path Status — Active Roadmap (2026-04-07)

> **Strategic Pivot:** The 38-phase pre-planned development model is replaced by a pull-based ship path.
> The algorithm is the moat. Everything else is premature until validated by real users.
> **Spec:** `docs/superpowers/specs/2026-04-07-ship-path-design.md`

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                           SHIP PATH — 3 PHASES TO TESTFLIGHT                        │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │  ██ = Complete    ▓▓ = In Progress    ░░ = Next    ── = Deferred to post-launch      │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE A — SLIM DOWN  (1-2 sessions)                                       ▓▓ ACTIVE
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Goal: Archive premature code, reduce ~219 files to ~160, make all features free.
 Plan: docs/superpowers/plans/2026-04-07-slim-down.md

 Archive enterprise module (9 files, 0 imports)                    ░░ TODO
 Archive growth/referral module (4 files) + fix paywall.tsx        ░░ TODO
 Archive watch module (1 file, 0 imports)                          ░░ TODO
 Archive intelligence module (2 files, 0 imports)                  ░░ TODO
 Archive prediction-store + CircadianForecastCard                   ░░ TODO
 Archive Express backend /api/ (1,613 LOC, unused)                 ░░ TODO
 Archive Spanish i18n — simplify to English-only                   ░░ TODO
 Archive dead Today screen components (WellnessCard, OutcomeDash)  ░░ TODO
 Unlock all features free for TestFlight (entitlements.ts)         ░░ TODO
 Full test suite pass — verify 0 broken imports                    ░░ TODO

 Verification: npx expo start succeeds, all remaining tests pass, no broken imports.

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE B — SHIP POLISH  (2-3 sessions, starts after Phase A)               ░░ NEXT
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Goal: Make remaining features feel complete. No new features.

 Onboarding walkthrough — all 8 screens on fresh install           ░░ TODO
 Today screen audit — every card renders + handles empty state     ░░ TODO
 Calendar sync smoke test (connect → detect shifts → plan)         ░░ TODO
 Adaptive Brain check — insights surface from real data            ░░ TODO
 Notification test — wind-down, caffeine cutoff, morning brief     ░░ TODO
 Recovery score — 14-night history displays correctly              ░░ TODO
 Add crash reporting (Sentry / expo-sentry)                        ░░ TODO
 Add minimal analytics (PostHog — screen views, onboarding, plans) ░░ TODO
 Add feedback mechanism (Settings → email or in-app form)          ░░ TODO
 Performance check — cold start, memory, battery                   ░░ TODO

 Verification: Full device walkthrough. Every screen renders. Analytics + crash reporting live.

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE C — TESTFLIGHT PREP  (1 session, requires Apple Dev account)        ── BLOCKED
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Blocked on: LLC filing (sunbiz.org, $125) → Apple Developer ($99) → D-U-N-S (~5 wks)

 Finalize app icon (1024×1024)                                     ── BLOCKED
 Screenshots (5 screens, iPhone 15 Pro + iPhone SE sizes)          ── BLOCKED
 App Store description + metadata                                  ── BLOCKED
 Privacy nutrition labels (accurate to build)                      ── BLOCKED
 Medical disclaimers verified in-app                               ── BLOCKED
 Submit to TestFlight                                              ── BLOCKED
 Recruit 20-50 testers (Sim's network, Reddit r/nursing, r/ems)   ── BLOCKED

 Verification: TestFlight build downloadable. 20+ testers invited.

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT'S ARCHIVED — PRESERVED IN src/_archive/, REINTRODUCED BY TRIGGER
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Archived Module                         Reintroduction Trigger
 ──────────────────────────────────────  ──────────────────────────────────────────────
 Premium paywall ($6.99/$49.99/$149.99)  100+ WAU + >30% day-7 retention
 Spanish i18n                            500+ active users OR first non-English request
 Growth/referral module                  Paywall live + 50+ paying users
 Predictive scheduling                   50+ users with 30+ days HealthKit data
 AI coaching (Claude API)                Post-paywall, premium-only feature
 Enterprise module                       First inbound hospital/agency inquiry
 Manager dashboard                       Enterprise live + 1 paying org
 Express API backend                     Multi-device sync requested by 10+ users
 Watch app                               200+ users with Apple Watch + HealthKit
 Differential privacy                    Enterprise live + legal review

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BUILD PHASES COMPLETED (38-phase model — context only, superseded by ship path above)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Phases 01-06   Foundation, calendar sync, sleep plan gen, notifications,
                recovery score, live activities (stub)              ██████ COMPLETE
 Phase 07       Critical bug fixes (BUG-04,05,06 closed)           ██████ COMPLETE
 Phase 08-09    Adaptive Brain core + wire-up                      ██████ COMPLETE
 Phase 10-11    TestFlight prep + App Store prep (needs Apple Dev)  ██████ COMPLETE
 Phase 13-15    Sleep feedback research, HealthKit ingestion,
                algorithm feedback engine                          ██████ COMPLETE
 Phase 17       Growth engine (now archived to src/_archive/)      ██████ COMPLETE
 Phase 18       RevenueCat hard gating (now free for TestFlight)   ██████ COMPLETE
 Phase 19-20    AI coaching research + weekly brief                ██████ COMPLETE
 Phase 21-23    Predictive scheduling research, pattern recognition ██████ COMPLETE
 Phase 25       Intelligence polish                                 ██████ COMPLETE
 Phase 26-27    Enterprise research + outcome data pipeline         ██████ COMPLETE
 Phase 28       Employer dashboard                                  ██████ COMPLETE
 Phase 29-30    API layer + enterprise sales kit                   ██████ COMPLETE
 Phase 31-35    ASO, HRV research, fatigue model, autopilot,
                validation study design                            ██████ COMPLETE
 Phase 38       Advanced platform features (cumulative fatigue,
                multi-transition, DST handler)                     ██████ COMPLETE

 25/38 phases complete. Remaining 13 phases deferred — not needed for TestFlight.

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT SHIPS IN TESTFLIGHT v1.0 (kept, not archived)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Circadian algorithm (src/lib/circadian/, 354 tests)              ██████ CORE IP
 Calendar-as-interface (import shifts, export sleep plan)         ██████ DIFFERENTIATOR
 Adaptive Brain (4-factor: circadian/debt/lookahead/recovery)     ██████ DIFFERENTIATOR
 Autopilot mode (30-day propose → full autopilot)                 ██████ DIFFERENTIATOR
 Today screen (timeline, countdowns, insights)                    ██████ SHIPS
 Recovery score (14-night history)                                ██████ SHIPS
 Push notifications (wind-down, caffeine cutoff, morning brief)   ██████ SHIPS
 Onboarding (8 screens, MEQ chronotype quiz)                      ██████ SHIPS
 Night Sky Mode                                                    ██████ SHIPS
 Local-first / offline architecture                                ██████ NON-NEGOTIABLE
 Dark theme + warm gold                                            ██████ SHIPS

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-TESTFLIGHT — v1.x DRIVEN BY USER DATA (not pre-planned phases)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 After 20-50 testers for 2+ weeks, measure:
 ● Screen engagement — which screens get visited, which are ignored
 ● Notification action rate — which drive opens vs. dismissals
 ● Calendar export rate — do users put sleep plans on their calendar
 ● Adaptive Brain engagement — do users read and act on insights
 ● Day-3 and day-7 retention — do they come back
 ● Feedback themes — what they complain about, what they ask for

 This data determines v1.1 — not any pre-planned phase list.
```

---

## 8. Competitive Positioning Map

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                      COMPETITIVE POSITIONING                                       │
 └──────────────────────────────────────────────────────────────────────────────────────┘


                         FEATURE COMPLETENESS
                         (calendar + meals + naps + caffeine + light + export)

                    Low                                           High
                     │                                             │
                     │                                             │
          ┌──────────┼─────────────────────────────────────────────┼──────────┐
     High │          │                                             │          │
          │          │                                    ┌────────┴───────┐  │
          │          │                                    │  SHIFTWELL     │  │
          │          │              ┌──────────┐          │  ★ Calendar    │  │
          │          │              │Timeshifter│          │    import      │  │
  SCIENCE │          │              │           │          │  ★ Full plan   │  │
  RIGOR   │          │              │ Harvard-  │          │    generation  │  │
          │          │              │ backed    │          │  ★ Personal    │  │
  (peer-  │          │              │ circadian │          │    cal aware   │  │
  reviewed│          │              │ science   │          │  ★ .ics export │  │
  research│          │              │ NO cal    │          │  ★ Meals+naps  │  │
  basis)  │          │              │ import    │          │  ★ 116 tests   │  │
          │          │              └──────────┘          │  ★ Offline     │  │
          │          │                                    └────────────────┘  │
          │          │     ┌──────────┐                                       │
          │          │     │ SleepSync │                                      │
          │          │     │ (Monash)  │                                      │
          │          │     │ Research  │                                      │
          │          │     │ Not       │                                      │
          │          │     │ launched  │                                      │
          │          │     └──────────┘                                       │
          │          │                                                        │
          ├──────────┼────────────────────────────────────────────────────────┤
          │          │                                                        │
          │          │                    ┌──────────┐                        │
          │          │                    │ Arcashift │                       │
          │          │                    │           │                       │
          │          │                    │ Has cal   │                       │
     Low  │          │                    │ import    │                       │
          │          │                    │ (buggy)   │                       │
          │          │                    │ No meals  │                       │
          │          │  ┌──────────┐      │ No export │                       │
          │          │  │ Sleep Aid│      └──────────┘                        │
          │          │  │ Basic    │                                          │
          │          │  │ features │                                          │
          │          │  └──────────┘                                          │
          │          │                                                        │
          └──────────┼────────────────────────────────────────────────────────┘
                     │


 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                    FEATURE-BY-FEATURE COMPARISON                                   │
 ├──────────────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────┤
 │ Feature              │Timeshftr │Arcashift │SleepSync │Sleep Aid │  ShiftWell      │
 ├──────────────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────┤
 │ Calendar Import      │    ○     │    ◐     │    ○     │    ●     │      ●          │
 │ Personal Cal Aware   │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Sleep Schedule Gen   │    ●     │    ●     │    ●     │    ◐     │      ●          │
 │ Nap Placement        │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Meal Timing          │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Caffeine Cutoffs     │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Light Protocols      │    ●     │    ○     │    ◐     │    ○     │      ●          │
 │ Calendar Export      │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Apple Health (P2)    │    ○     │    ◐     │    ○     │    ○     │      ○ → ●      │
 │ Offline-First        │    ●     │    ●     │    ○     │    ●     │      ●          │
 │ Household Awareness  │    ○     │    ○     │    ○     │    ○     │      ●          │
 │ Contextual Tips      │    ◐     │    ○     │    ○     │    ○     │      ●          │
 ├──────────────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────┤
 │ Price                │ $10/mo   │ Freemium │   N/A    │  Free    │     TBD         │
 └──────────────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────┘

   ● = Full support    ◐ = Partial/buggy    ○ = Not available    → = Planned
```

---

## 9. Market Opportunity

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                         TOTAL ADDRESSABLE MARKET                                   │
 └──────────────────────────────────────────────────────────────────────────────────────┘


                    ┌─────────────────────────────────────────────┐
                   ╱                                               ╲
                  ╱          700M Shift Workers Globally            ╲
                 ╱                (all industries)                   ╲
                ╱                                                     ╲
               ╱    ┌─────────────────────────────────────────┐        ╲
              ╱    ╱                                           ╲        ╲
             ╱    ╱     93M US Workers w/ Non-Standard          ╲        ╲
            ╱    ╱            Schedules                          ╲        ╲
           ╱    ╱                                                 ╲        ╲
          ╱    ╱    ┌─────────────────────────────────────┐        ╲        ╲
         ╱    ╱    ╱                                       ╲        ╲        ╲
        ╱    ╱    ╱    16M US Healthcare Workers             ╲        ╲        ╲
       ╱    ╱    ╱     (32% report short sleep = 5M)          ╲        ╲        ╲
      ╱    ╱    ╱                                               ╲        ╲        ╲
     ╱    ╱    ╱    ┌───────────────────────────────┐             ╲        ╲        ╲
    ╱    ╱    ╱    ╱   BEACHHEAD: ED Physicians      ╲             ╲        ╲        ╲
   ╱    ╱    ╱    ╱    & Nurses (Phase 1 launch)      ╲             ╲        ╲        ╲
  ╱    ╱    ╱    ╱      ~150K in the US                ╲             ╲        ╲        ╲
  ╲    ╲    ╲    ╲                                      ╱             ╱        ╱        ╱
   ╲    ╲    ╲    ╲    Founder IS the user ★           ╱             ╱        ╱        ╱
    ╲    ╲    ╲    ╲                                  ╱             ╱        ╱        ╱
     ╲    ╲    ╲    └───────────────────────────────┘             ╱        ╱        ╱
      ╲    ╲    ╲                                               ╱        ╱        ╱
       ╲    ╲    └─────────────────────────────────────────────┘        ╱        ╱
        ╲    ╲                                                        ╱        ╱
         ╲    └─────────────────────────────────────────────────────┘        ╱
          ╲                                                                ╱
           └──────────────────────────────────────────────────────────────┘


 mHealth Market: $82.45B (2025) — 22.3% CAGR
 Healthcare AI VC: $11.1B invested (2024)
 Shift Work Disorder prevalence: 10-38% of night workers
```

---

## 10. Scientific Foundation Map

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                  EVIDENCE BASE — Every Feature Traces to Research                   │
 └──────────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   Two-Process     │
                              │   Model           │
                              │   (Borbely, 1982) │
                              │                  │
                              │   FOUNDATIONAL   │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┬┴┬──────────────────┐
                    │                  │  │                  │
                    ▼                  ▼  ▼                  ▼
        ┌───────────────────┐  ┌──────────────┐  ┌───────────────────┐
        │ Sleep Windows     │  │ Light Proto- │  │ Shift Classifi-   │
        │                   │  │ cols         │  │ cation            │
        │ ● AASM Guidelines │  │              │  │                   │
        │   (2015, 2023)    │  │ ● Czeisler   │  │ ● NIOSH/CDC      │
        │ ● NIOSH/CDC       │  │   (1990)     │  │   Training for   │
        │   Anchor Sleep    │  │ ● Eastman &  │  │   Nurses         │
        │ ● Eastman &       │  │   Burgess    │  │ ● Gander (2011)  │
        │   Burgess (2009)  │  │   (2009)     │  │   Fatigue Risk   │
        │ ● St. Hilaire     │  │              │  │   Management     │
        │   (2017)          │  │              │  │                   │
        └───────────────────┘  └──────────────┘  └───────────────────┘

        ┌───────────────────┐  ┌──────────────┐  ┌───────────────────┐
        │ Nap Strategy      │  │ Caffeine     │  │ Meal Timing       │
        │                   │  │ Science      │  │                   │
        │ ● Milner & Cote   │  │              │  │ ● Manoogian       │
        │   (2009)          │  │ ● Drake et   │  │   (2022) TRE for │
        │ ● Ruggiero &      │  │   al. (2013) │  │   shift workers  │
        │   Redeker (2014)  │  │   6h before  │  │ ● Chellappa       │
        │                   │  │   bed = -1h  │  │   (2021) Daytime │
        │   90-min cycles   │  │   sleep      │  │   eating prevents│
        │   for nights,     │  │              │  │   mood vulner-   │
        │   25-min power    │  │   Cutoff =   │  │   ability        │
        │   naps for days   │  │   onset -    │  │                   │
        │                   │  │   (t½ × 1.67)│  │   10h eating     │
        └───────────────────┘  └──────────────┘  │   window, 3h     │
                                                  │   pre-sleep fast │
        ┌──────────────────────────────────┐      └───────────────────┘
        │ Health Impact Context            │
        │                                  │
        │ ● AHA Scientific Statement (2025)│
        │   Circadian disruption linked to │
        │   CVD, obesity, diabetes         │
        │ ● Drake et al. (2004) SWSD       │
        │   prevalence                     │
        │ ● Boivin & Boudreau (2014)       │
        │   Interventions review           │
        └──────────────────────────────────┘

 ═══════════════════════════════════════════════════════════════════════════════════════
  15 peer-reviewed papers  │  CDC/NIOSH guidelines  │  AHA scientific statements
  Deterministic algorithm  │  Fully testable         │  116 unit tests validating output
 ═══════════════════════════════════════════════════════════════════════════════════════
```

---

## 11. Key Metrics & Success Indicators

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                         SUCCESS METRICS BY PHASE                                   │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 Phase 1 (MVP)                    Phase 2 (Smart)                Phase 3+ (Growth)
 ─────────────────                ─────────────────              ─────────────────
 ● TestFlight beta testers: 10   ● Monthly active users: 500    ● MAU: 10,000+
 ● App Store approval             ● D7 retention: >40%           ● Paid conversion: >5%
 ● 5-star initial reviews         ● Avg session/day: 2+          ● App Store rating: 4.7+
 ● Algorithm accuracy: >90%       ● .ics exports/user: 3+/mo    ● Revenue: $10K MRR
   (validated by peer MDs)        ● Push opt-in: >60%            ● Featured by Apple
 ● Zero crashes on TestFlight    ● HealthKit opt-in: >50%       ● Press coverage
                                  ● NPS: >50                     ● B2B pilot contracts


 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                           THE MOAT (Defensibility)                                 │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                     │
 │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐│
 │  │  CLINICAL     │  │  ALGORITHM    │  │  DATA        │  │  NETWORK                ││
 │  │  CREDIBILITY  │  │  DEPTH        │  │  FLYWHEEL    │  │  EFFECTS                ││
 │  │              │  │              │  │              │  │                          ││
 │  │  Founded by  │  │  6-module    │  │  HealthKit + │  │  Family/spouse           ││
 │  │  a physician │  │  pipeline    │  │  usage data  │  │  notifications           ││
 │  │  who lives   │  │  covering    │  │  improves    │  │  bring in non-           ││
 │  │  the problem │  │  sleep, naps,│  │  predictions │  │  shift-workers           ││
 │  │  every week  │  │  caffeine,   │  │  over time   │  │                          ││
 │  │              │  │  meals, light│  │              │  │  B2B creates             ││
 │  │  Trust with  │  │              │  │  Compounding │  │  institutional           ││
 │  │  healthcare  │  │  116 tests,  │  │  advantage   │  │  lock-in                 ││
 │  │  community   │  │  15 papers   │  │              │  │                          ││
 │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────────┘│
 │                                                                                     │
 └──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. What Makes ShiftWell Different — At a Glance

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                     │
 │                      "Import your chaos. Export your plan."                         │
 │                                                                                     │
 │   ┌─────────────┐        ┌──────────────────┐        ┌─────────────────────────┐   │
 │   │             │        │                  │        │                         │   │
 │   │  Your messy │  ────▶ │  ShiftWell       │ ────▶  │  A complete, science-   │   │
 │   │  shift      │        │  Circadian       │        │  backed daily plan in   │   │
 │   │  schedule   │        │  Engine          │        │  your calendar          │   │
 │   │             │        │                  │        │                         │   │
 │   │  + personal │        │  15 papers       │        │  Sleep windows          │   │
 │   │  calendar   │        │  116 tests       │        │  Strategic naps         │   │
 │   │  + family   │        │  6 modules       │        │  Caffeine cutoffs       │   │
 │   │  + kids     │        │  0 API calls     │        │  Meal timing            │   │
 │   │             │        │  100% offline    │        │  Light protocols        │   │
 │   │             │        │                  │        │  Contextual tips        │   │
 │   └─────────────┘        └──────────────────┘        └─────────────────────────┘   │
 │                                                                                     │
 │         10 seconds                 instant                  one tap to export       │
 │         to import                  processing               to any calendar         │
 │                                                                                     │
 └──────────────────────────────────────────────────────────────────────────────────────┘

                    Built by an ED physician. For shift workers.
                    Science-backed. Offline-first. Privacy-first.
```

---

> **Document Purpose:** This visual roadmap provides a comprehensive overview of the ShiftWell app's architecture, product vision, competitive positioning, and development trajectory. Designed for sharing with potential investors, collaborators, and advisors.
>
> **Companion Documents:**
> - [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — Detailed technical build plan
> - [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — Full project background, science, and decisions

---
Created: 2026-03-24
Last Reviewed: 2026-04-07
Last Edited: 2026-04-07
Review Notes: Strategic pivot — Section 7 replaced with Ship Path (Phase A/B/C) replacing 38-phase development model. Phase 28 (Employer Dashboard) marked complete. Archive trigger table added.
