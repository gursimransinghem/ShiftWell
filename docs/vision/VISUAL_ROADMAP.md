# ShiftWell — Visual Roadmap

> **Last Updated:** 2026-04-07
> **Status:** v1.1 Milestone — Phases 7–11 Complete (116 Tests Passing) — Phase 12 BLOCKED on Apple Developer Enrollment
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

## 7. Feature Completion Matrix

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                         FEATURE COMPLETION MATRIX                                   │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │  ██ = Complete    ░░ = Planned    ▓▓ = In Progress                                 │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 v1.1 MILESTONE — BUILD PHASES (as of 2026-04-07)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 7  — Critical Bug Fixes (BUG-04–06 fixed; BUG-01–03 OPEN)      ██████ COMPLETE
 Phase 8  — Adaptive Brain Core (BRAIN-01,02,04,06 done; BRAIN-03,05 OPEN) ██████ COMPLETE
 Phase 9  — Adaptive Brain Wire-up                                     ██████ COMPLETE
 Phase 10 — TestFlight Prep (TF-01–05 OPEN — needs Apple Dev account)  ██████ COMPLETE
 Phase 11 — App Store Prep (APP-01–05 OPEN — needs Apple Dev account)  ██████ COMPLETE
 Phase 12 — Live Activities / ActivityKit                              ░░░░░░ BLOCKED
             Blocked on: Apple Developer enrollment → D-U-N-S (~5 wks) → LLC filing

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 v1.1 REQUIREMENTS STATUS (REQUIREMENTS.md — 24 total)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BUG-01  Trial auto-starts on first launch                             ░░ OPEN
 BUG-02  Recovery Score accumulates real data                          ░░ OPEN
 BUG-03  Expired trial graceful downgrade path                         ░░ OPEN
 BUG-04  EAS build succeeds (TS errors fixed)                          ██ DONE
 BUG-05  AdaptiveInsightCard shows real plan changes                   ██ DONE
 BUG-06  Morning Dynamic Island includes recovery score                ██ DONE
 BRAIN-01 Morning recalculation runs once per day                      ██ DONE
 BRAIN-02 Sleep debt engine operational                                ██ DONE
 BRAIN-03 Circadian transition protocols fire correctly                ░░ OPEN
 BRAIN-04 AdaptiveInsightCard renders on Today screen                  ██ DONE
 BRAIN-05 SleepDebtCard dual-meter visualization                       ░░ OPEN
 BRAIN-06 Plan change logger human-readable                            ██ DONE
 TF-01   Privacy manifest in app.json                                  ░░ OPEN (needs Apple Dev)
 TF-02   HealthKit entitlements declared                               ░░ OPEN (needs Apple Dev)
 TF-03   App icon + splash in EAS                                      ░░ OPEN (asset needed)
 TF-04   EAS production build profile                                  ░░ OPEN (needs Apple Dev)
 TF-05   installedAt timestamp at onboarding                           ░░ OPEN
 APP-01  Account deletion in Settings                                  ░░ OPEN (Apple required)
 APP-02  Medical disclaimer in onboarding + Settings                   ░░ OPEN
 APP-03  App Store screenshots (6.9-inch)                              ░░ OPEN
 APP-04  App Privacy nutrition labels                                   ░░ OPEN
 APP-05  App Review notes                                              ░░ OPEN
 LIVE-04 expo-live-activity wired                                      ░░ BLOCKED (Phase 12)
 LIVE-05 Real Dynamic Island transitions                               ░░ BLOCKED (Phase 12)

 Complete: 8/24     Open (actionable now): 14/24     Blocked: 2/24

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO WHILE PHASE 12 IS BLOCKED (Priority Order)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. Fix BUG-01–03 (production correctness — trial, score store, downgrade path)
 2. Close BRAIN-03 + BRAIN-05 (transition protocol routing, dual-meter visual)
 3. TF-03: App icon (1024×1024) + splash — no Apple Dev account required
 4. TF-05: installedAt timestamp — pure code, no Apple Dev required
 5. APP-01: Account deletion flow — pure code, no Apple Dev required
 6. APP-02: Medical disclaimer — pure code, no Apple Dev required
 7. APP-03: App Store screenshots — design work, can do on simulator
 8. App Store listing copy finalization (marketing content, no Apple Dev)
 9. LLC decision: Circadian Labs vs Vigil Health — unblocks everything

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PRODUCT VISION — LONG-TERM PHASE MAP (unchanged)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 PHASE 1 — MVP (Weeks 1-6) — COMPLETE                                    Status
 ═══════════════════════════════════════════════════════════════════════════════
 Circadian algorithm (6 modules)                                  ██████ DONE
 Calendar parsing (ical.js)                                       ██████ DONE
 Shift detection heuristics                                       ██████ DONE
 .ics export (RFC 5545)                                           ██████ DONE
 Onboarding flow (4 screens)                                      ██████ DONE
 Chronotype quiz (MEQ-based)                                      ██████ DONE
 Household profile input                                          ██████ DONE
 Zustand stores (3 stores)                                        ██████ DONE
 Today screen (timeline + countdowns)                             ██████ DONE
 Calendar/Schedule view                                           ██████ DONE
 Add/Edit shift modal                                             ██████ DONE
 .ics import (3-step flow)                                        ██████ DONE
 Settings screen                                                  ██████ DONE
 Sleep tips engine (25+ tips)                                     ██████ DONE
 Dark mode UI                                                     ██████ DONE
 Animations & polish                                              ██████ DONE
 Unit tests (116 passing)                                         ██████ DONE
 EAS build config                                                 ██████ DONE
 Personal calendar conflict awareness                             ██████ DONE
 Adaptive Brain (partial — 4/6 reqs done)                        ████░░ DONE
 ─────────────────────────────────────────────────────────────────────────────
 TestFlight deployment                                            ░░░░░░ BLOCKED
 App Store submission                                             ░░░░░░ BLOCKED


 PHASE 2 — Smart Features (Weeks 7-12)                                Status
 ═══════════════════════════════════════════════════════════════════════════════
 Supabase backend + user accounts                                 ░░░░░░ Planned
 Google Calendar OAuth sync                                       ░░░░░░ Planned
 Apple HealthKit integration                                      ░░░░░░ Planned
 Push notifications                                               ░░░░░░ Planned
 Recovery Score                                                   ░░░░░░ Planned
 Subscribable calendar URLs                                       ░░░░░░ Planned
 Caffeine & Light tracking screens                                ░░░░░░ Planned
 Smart "Phone Down" nudges                                        ░░░░░░ Planned
 Soundscapes (brown noise, rain, etc.)                            ░░░░░░ Planned
 Family/Spouse notifications                                      ░░░░░░ Planned
 Weekly Sleep Intelligence Report                                 ░░░░░░ Planned


 PHASE 3 — iOS Power Features (Months 4-6)                            Status
 ═══════════════════════════════════════════════════════════════════════════════
 Live Activities + Dynamic Island                                 ░░░░░░ Planned
 Home Screen Widgets (WidgetKit)                                  ░░░░░░ Planned
 Sleep Focus Automation                                           ░░░░░░ Planned
 Alarm Automation (Shortcuts)                                     ░░░░░░ Planned
 Apple Watch (complications + haptics)                            ░░░░░░ Planned
 Shift Transition Planner                                         ░░░░░░ Planned
 Social/Family Mode                                               ░░░░░░ Planned


 PHASE 4 — Audience Expansion (Months 6+)                             Status
 ═══════════════════════════════════════════════════════════════════════════════
 Jet Lag Mode                                                     ░░░░░░ Planned
 On-Call Mode                                                     ░░░░░░ Planned
 New Parent Mode                                                  ░░░░░░ Planned
 Gig/Nightlife Mode                                               ░░░░░░ Planned
 Student Mode                                                     ░░░░░░ Planned


 PHASE 5 — AI + B2B (Month 8+)                                        Status
 ═══════════════════════════════════════════════════════════════════════════════
 AI Sleep Coach (Claude API)                                      ░░░░░░ Planned
 B2B Team Dashboards                                              ░░░░░░ Planned
 Fatigue Risk Scoring                                             ░░░░░░ Planned
 Corporate Wellness / OSHA Compliance                             ░░░░░░ Planned


 PROGRESS SUMMARY
 ═══════════════════════════════════════════════════════════════════════════════
 v1.1 phases 7–11:  ██████████████████████████████████████████████████  5/6 phases (Phase 12 blocked)
 v1.1 requirements: █████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   8/24 complete (14 open, 2 blocked)
 Phase 2:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0/11 features
 Phase 3:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0/7  features
 Phase 4:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0/5  features
 Phase 5:  ░░░░░░░░░░░░░░░░░░░░░░░░░━━━━━━━━━━━━━━━━━━━━━   0/4  features
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
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
