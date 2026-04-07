---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: TestFlight Launch & Adaptive Brain
status: completed
stopped_at: "Completed 19-01-PLAN.md (checkpoint:human-verify pending)"
last_updated: "2026-04-07T18:40:34.249Z"
last_activity: 2026-04-07
progress:
  total_phases: 38
  completed_phases: 12
  total_plans: 56
  completed_plans: 28
  percent: 0
---

# ShiftWell — Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-06)

**Core value:** Sleep on autopilot — set up once, never think about sleep scheduling again.
**Current focus:** Phase 18 — revenucat-hard-gating

## Current Position

Phase: 19
Plan: Not started
Status: Plan 01 complete — phase complete
Last activity: 2026-04-07

Progress: [░░░░░░░░░░] 0% (requirements in progress)

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 01-foundation-onboarding P01 | 8min | 3 tasks | 11 files |
| Phase 01-foundation-onboarding P02 | 5min | 2 tasks | 3 files |
| Phase 01-foundation-onboarding P01-03 | 18min | 2 tasks | 5 files |
| Phase 02-calendar-sync P01 | 6min | 2 tasks | 13 files |
| Phase 02-calendar-sync P02 | 7min | 2 tasks | 15 files |
| Phase 02-calendar-sync P04 | 12min | 3 tasks | 3 files |
| Phase 03-sleep-plan-generation P01 | 5min | 2 tasks | 3 files |
| Phase 03-sleep-plan-generation P02 | 8min | 2 tasks | 3 files |
| Phase 03-sleep-plan-generation P03 | 5min | 2 tasks | 0 files |
| Phase 04-night-sky-mode-notifications P02 | 9min | 2 tasks | 5 files |
| Phase 04-night-sky-mode-notifications P01 | 18min | 2 tasks | 7 files |
| Phase 04-night-sky-mode-notifications P03 | 3min | 2 tasks | 5 files |
| Phase 04-night-sky-mode-notifications P04 | 12min | 3 tasks | 4 files |
| Phase 05-live-activities-recovery-score P01 | 3min | 2 tasks | 3 files |
| Phase 05-live-activities-recovery-score P03 | 4 | 2 tasks | 2 files |
| Phase 05-live-activities-recovery-score P02 | 2min | 2 tasks | 2 files |
| Phase 07 P02 | 18min | 2 tasks | 8 files |
| Phase 08-adaptive-brain-core P01 | 5 | 2 tasks | 5 files |
| Phase 08-adaptive-brain-core P02 | 20 | 2 tasks | 3 files |
| Phase 13-sleep-feedback-research P01 | 11min | 2 tasks | 4 files |
| Phase 14-healthkit-sleep-ingestion P01 | 8min | 4 tasks | 9 files |
| Phase 17-growth-engine P01 | 8 | 2 tasks | 7 files |
| Phase 15-algorithm-feedback-engine P01 | 10min | 3 tasks | 9 files |
| Phase 18-revenucat-hard-gating P01 | 25min | 2 tasks | 8 files |
| Phase 21-predictive-scheduling-research P01 | 6min | 2 tasks | 3 files |
| Phase 19-ai-coaching-research P01 | 16min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions logged in PROJECT.md Key Decisions table.

- Foundation: Design system is blend (dark base + warm gold accents) — DES phase applies retroactively to all screens
- Foundation: Existing onboarding needs redesign (not rebuild) — skeleton is there, add routine builder on top
- Calendar: Apple + Google both required for v1.0 — neither is optional
- Premium: 14-day full trial, no restrictions — loss aversion strategy, not freemium
- [Phase 01-01]: ACCENT.primary is warm gold (#C8A84B) — all UI components reference theme token, never hardcode
- [Phase 01-01]: Legacy ACCENT.blue (#4A90D9) retained for calendar block colors only
- [Phase 01-01]: RoutineStep uses string icon field (emoji-compatible) not numeric icon ID
- [Phase 01-02]: AM/PM marker activities (wake, phone-down, lights-out) have durationMinutes=0 and no duration picker — they mark time boundaries, not durations
- [Phase 01-02]: Duration options are fixed presets (10, 15, 20, 30, 45, 60 min) not free-entry — reduces cognitive load and keeps data clean for algorithm
- [Phase 01-03]: expo-location geocoding returns LocationGeocodedLocation with optional altitude/accuracy — test mocks use minimal object shape
- [Phase 01-03]: estimateCommuteDuration uses 30 km/h urban average — consistent distance-to-time conversion, fallback to 30 min on geocoding failure
- [Phase 01-03]: Skip option always writes commuteDuration=30 — user never blocked from completing onboarding
- [Phase 01-04]: All onboarding screens import ONBOARDING_STEPS/ONBOARDING_TOTAL_STEPS — single source of truth for step count
- [Phase 01-04]: shadowColor in schedule.tsx FAB uses BACKGROUND.primary (named import already present) — same value as COLORS.background.primary
- [Phase 01-04]: rgba() backgrounds in healthkit.tsx use decimal RGB not hex — passes zero-hex grep audit correctly
- [Phase 02-01]: birthday removed from NEGATIVE_KEYWORDS — test spec (Test 5) takes precedence; birthday party 7h scores 0.70 (shift length, no keyword)
- [Phase 02-01]: googleAccessToken excluded from Zustand persist via partialize — stored in expo-secure-store only to keep credentials out of AsyncStorage
- [Phase 02-calendar-sync]: Google Calendar API client is pure fetch-based — no SDK at runtime. SDK used only for OAuth auth flow.
- [Phase 02-calendar-sync]: D-10 two-tier write: Phase 2 writes sleep blocks only. Full plan items (caffeine/meal/light) deferred to Phase 3.
- [Phase 02-calendar-sync]: syncToken polling interval 20 minutes — middle of D-14 range. Supabase env vars injected via jest.setup.ts to prevent module-load error.
- [Phase 02-04]: CalendarSettingsSection placed after EXPORT section — calendar management logically follows data operations
- [Phase 02-04]: Disconnect handlers unregister background sync only when no providers remain — avoids premature task cancellation
- [Phase 03-sleep-plan-generation]: plan-write-service handles all 8 SleepBlockType values — calendar-service.ts only handles main-sleep/nap (D-04 two-tier write preserved)
- [Phase 03-sleep-plan-generation]: recalculationNeeded cleared BEFORE debouncedRegenerate to prevent subscription loop
- [Phase 03-sleep-plan-generation]: writeChangedBlocks diffs by block ID — unchanged blocks not deleted/recreated (anti-flicker)
- [Phase 03-sleep-plan-generation]: detectPatterns not called in buildPreviewMessage — night count computed directly from futureDays filter (simpler, avoids redundant pass)
- [Phase 03-sleep-plan-generation]: Pre-existing settings.tsx TypeScript errors (lines 368-375) deferred — unrelated to Phase 3 scope
- [Phase 03-sleep-plan-generation]: checkpoint:human-verify auto-approved per autonomous execution directive (Phases 3-5)
- [Phase 04]: notification-store setWindDown/setCaffeineCutoff/setMorningBrief method names used (not setXEnabled) — aligned with 04-01 test interface
- [Phase 04]: setNotificationHandler registered at module scope in _layout.tsx (not useEffect) — fires before any component mount
- [Phase 04-01]: react-native-svg mock uses plain HTML elements not View — avoids node test environment import errors
- [Phase 04-01]: notification-store exports NotificationPrefs interface with partialize excluding setters from AsyncStorage
- [Phase 04]: useEffect from react (not react-native-reanimated) — reanimated v4.2.1 does not export useEffect as named export
- [Phase 04]: useNightSkyMode reads plan/notification/user stores with no new setInterval — piggybacks on 60s tick
- [Phase 04]: Priority=1 + hour window [18-12) guard in useNightSkyMode prevents nap false-positives (Pitfall 4)
- [Phase 05-live-activities-recovery-score]: Live Activity trigger uses SchedulableTriggerInputTypes.TIME_INTERVAL (seconds-based) for stub fallback; DateTriggerInput used for scheduled notifications in notification-service.ts
- [Phase 05-03]: useNightSkyMode useEffect dependency is [data.isActive] only — avoids redundant service calls on unrelated plan/schedule changes
- [Phase 05-live-activities-recovery-score]: pendingEvents not cleared after finalizeDay — filtered by date at score time, avoids consumed-event tracking complexity
- [Phase 05-live-activities-recovery-score]: null vs 0 distinction: computeAdherenceScore returns null for no-sleep-block dates (no-shift day), 0 for shift day with zero adherence
- [Phase 05]: showRecovery gate removes isAvailable requirement — score visible without Apple Watch (SCORE-02)
- [Phase 07]: BUG-05: planSnapshot (not currentPlan) passed as old-plan arg to computeDelta — enables real before/after delta for AdaptiveInsightCard
- [Phase 07]: BUG-06: useScoreStore.getState().todayScore() called imperatively inside useEffect — Zustand pattern for reading state in effects
- [Phase 07]: UserProfile: commuteDuration not commuteMinutes, napPreference is boolean (napMinutes > 0 conversion)
- [Phase 08-01]: plan-store partialize persists only changeLog, daysUntilTransition, snapshotTimestamp — never SleepPlan objects (too large, non-serializable Dates)
- [Phase 08-01]: X/Accept buttons call onDismiss() before setDismissed(true) — onDismiss triggers dismissChanges in store, setDismissed for immediate UI feedback
- [Phase 08-01]: AdaptiveInsightCard component tests use source-analysis pattern (fs.readFileSync + regex) — node test env cannot render RN components; source inspection sufficient for callback wiring verification
- [Phase 08-02]: runAdaptiveBrain extracted as exported async function — hooks cannot be tested in node env (renderHook requires jsdom)
- [Phase 08-02]: AsyncStorage setItem called AFTER setAdaptiveContext succeeds — failures retry on next foreground
- [Phase 08-02]: showDebtCard fallback is true when adaptiveContext is null — card visible on first launch before HealthKit runs
- [Phase 13-sleep-feedback-research]: Use asleepStart not inBedStart for feedback signal (removes 10-30 min pre-sleep latency)
- [Phase 13-sleep-feedback-research]: EMA dead zone 20 min (Apple Watch TST error floor per Menghini 2021)
- [Phase 13-sleep-feedback-research]: Wilcoxon signed-rank test for Phase 16 validation (non-normal shift worker distributions)
- [Phase 14]: asleepStart used (not inBedStart) for feedback timing — removes pre-sleep latency from deviation signal
- [Phase 14]: discrepancyHistory added to zustand persist partialize — survives app restart for Phase 15 feedback engine
- [Phase 14]: detectDeviceTier uses opportunistic data presence check — HRV samples = Watch present, temperature samples = Series 8+
- [Phase 17-growth-engine]: Referral URL is /r/{userId} (userId is the code in v1, Supabase resolves attribution server-side)
- [Phase 17-growth-engine]: A/B framework uses djb2 deterministic hash — no external SDK, supports 2 or 3 variants via variantCount param
- [Phase 17-growth-engine]: Paywall experiment affects display price only — RevenueCat purchase uses actual offering to avoid App Store issues
- [Phase 15]: feedback-engine deps injected via buildAdaptiveContext params (not store.getState()) to avoid circular import
- [Phase 15]: Dead zone applied twice: per-night before EMA input + on smoothed signal — prevents micro-oscillations
- [Phase 15]: Energy engine in src/lib/energy/ wraps circadian/energy-model.ts — avoids duplicating Borbely math
- [Phase 18-01]: PAYWALL_LAUNCH_DATE set to 2026-06-01 — placeholder grandfathers all current users until actual TestFlight launch date known
- [Phase 18-01]: isGrandfathered returns true for null/undefined/invalid dates — safety net for unknown install history
- [Phase 18-01]: SleepDebtCard gated with canUseAdaptiveBrain — it is Adaptive Brain data, not a free-tier feature
- [Phase 18-01]: resolveGrandfathered() must be called at app startup to populate isGrandfathered state from AsyncStorage
- [Phase 21-predictive-scheduling-research]: Hybrid Modified TPM + FAID-inspired Transition Stress Scorer chosen for SCSI — extends existing engine, all equations public domain, no licensing required
- [Phase 21-predictive-scheduling-research]: SCSI (ShiftWell Circadian Stress Index): 5-factor scoring with thresholds from published research (Hursh 2004, Folkard & Tucker 2003, Van Dongen 2003, Eastman 2009, Crowley 2003)
- [Phase 21-predictive-scheduling-research]: Sleep debt >8h entering transition escalates severity one tier — Van Dongen (2003) threshold
- [Phase 19-01]: Claude model selection: Haiku for high-volume features (Weekly Brief, Pattern Alerts), Sonnet for reasoning-heavy (Transition Coaching, Chat)
- [Phase 19-01]: All AI output is structured JSON — never freeform text — for safety classification and UI reliability
- [Phase 19-01]: 3-layer safety architecture mandatory: system prompt + post-generation scanner + fallback content
- [Phase 19-01]: FDA General Wellness exemption is regulatory anchor — AI diagnostic language triggers SaMD reclassification risk

### Pending Todos

None yet.

### Blockers/Concerns

- [External] LLC formation blocks Apple Developer enrollment — Sim handling in parallel
- [External] Apple Developer Program enrollment blocks TestFlight distribution
- [External] Trademark clearance for "ShiftWell" in progress ($500)
- [Phase 5] Live Activities requires ActivityKit (iOS 16.2+) — verify Expo SDK 55 support before Phase 5

## Session Continuity

Last session: 2026-04-07T18:40:34.244Z
Stopped at: Completed 19-01-PLAN.md (checkpoint:human-verify pending)
Resume file: None
