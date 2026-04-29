# Active Tasks

## P0: Final Ship Sprint — Core Loop First (2026-04-29)
- [ ] Use `docs/dev/2026-04-29-final-ship-sprint-plan.md` as the active execution plan until TestFlight.
- [ ] Invoke `docs/superpowers/skills/deep-product-ship-review.md` for periodic honest product/ship-readiness reviews.
- [ ] Freeze new feature work unless it directly improves the core loop: onboard → import/add shifts → generate plan → Today guidance → export/notify → feedback.
- [ ] Hide, disable, or de-emphasize half-baked surfaces that do not support the TestFlight core loop.
- [ ] Run a full fresh-install iPhone walkthrough and record every friction point before adding new functionality.

## P0: Adaptive Brain — Wire-up (NEXT SESSION)
- [x] Wire LightProtocolStrip into Today screen for transition-day states (component built at `src/components/circadian/LightProtocolStrip.tsx`, not yet used in `index.tsx`)
- [ ] Revert `app/index.tsx` onboarding bypass before production (currently seeds mock data)
- [ ] Verify AdaptiveInsightCard renders correctly in simulator (seed a mock AdaptiveContext with a Day→Night transition 3 days out)

## P1: Live Device QA (needs iPhone/TestFlight)
- [ ] GradientMeshBackground animation (3 orbs) — verify on live device
- [ ] Wind-down state — time-dependent, test at ~9pm
- [ ] Real HealthKit data flow — getSleepHistory(), computeRecoveryScore() with Apple Watch data
- [ ] Score store wiring — HealthKit → real adherence scores
- [ ] SET-03: DND/Sleep Focus mode — needs entitlements + live device

## P2: External Blockers
- [ ] LLC filing — decide: Circadian Labs vs Vigil Health
- [ ] Apple Developer enrollment (requires LLC + D-U-N-S)
- [ ] D-U-N-S number (~5 business days after LLC)

## P3: Adaptive Brain v2 (Post-Launch)
- [ ] Add HRV RMSSD to HealthKit authorization (`heartRateVariabilitySDNN`)
- [ ] Integrate HRV into recovery formula (currently sleep-stage only)
- [ ] Shift-type baseline separation (post-night vs post-day HRV/RHR baselines)
- [ ] Research pipeline cron — periodic agent → new studies → `docs/science/`
- [ ] 30-day learning phase completion announcement UI

## P4: App Store Prep
- [ ] Sound design — 3 audio files for notification/confirmation stubs
- [ ] App Store listing copy finalize
- [ ] App icon finalization
- [ ] Privacy policy + health disclaimers review
- [ ] TestFlight build via EAS

## Completed (2026-04-06 Session)

### Visual QA — V6 UI (VERIFIED)
- [x] Recovery Day state: seed mock data (yesterday shift), clear stale AsyncStorage
- [x] Hero Score ring (78, sparkline, trend) — fixed premium gate + seeded score store
- [x] Header "Good morning / Monday, April 6" — added getGreeting() + dateHeadline to Today screen
- [x] FloatingTabBar: 3 tabs only (Today/Schedule/Profile), gold active icon — fixed route filter
- [x] AsyncStorage mock (in-memory) — zero error toasts
- [x] RevenueCat mock (no-op) — no error toast
- [x] Schedule screen: week strip + calendar + FAB ✅
- [x] Profile screen: avatar + 78 avg score + stats + preferences ✅
- [x] Kitchen Closes cell — H:MM countdown (amber), TRE fallback, 4-cell row ✅
- [x] Timeline cards: countdown-to-start on right, H:MM format, TODAY'S PLAN label ✅
- [x] Empty state — rocket CTA, 3-tab bar ✅
- [x] Onboarding screens — welcome screen verified ✅

### Phase 6 — Features 1–6
- [x] SleepDebtCard — debt bar meter
- [x] NapCalculatorModal — 5-option nap picker with science
- [x] ScienceInsightCard — daily rotating cited tips
- [x] On-shift polish — mid-shift nap window (40%), caffeine cutoff (50%), H:MM format
- [x] ScoreBreakdownCard — bedtime/wake/caffeine/nap factor breakdown
- [x] PatternAlertCard — night-soon / consecutive / mixed-week alerts

### Paywall + Welcome Marketing
- [x] "3%" stat block on welcome screen
- [x] "Eat with your clock" feature card
- [x] Paywall "THE RESEARCH" section (3 science stat cards)

### Adaptive Brain (COMPLETE — 354 tests passing)
- [x] Design spec (`docs/superpowers/specs/2026-04-06-adaptive-brain-design.md`)
- [x] Sleep debt engine (14-night ledger, bank, Belenky tiers)
- [x] Circadian protocol engine (5 transition types)
- [x] Recovery calculator (Apple Watch composite, −43min correction)
- [x] Context builder (assembles 4-factor AdaptiveContext)
- [x] Change logger (diffs plans, >15min threshold)
- [x] Extended generateSleepPlan() with adaptiveContext param
- [x] Extended computeSleepBlocks() with bedtimeOffsetMinutes
- [x] plan-store: snapshot + undo + setAdaptiveContext
- [x] useAdaptivePlan hook
- [x] AdaptiveInsightCard (learning + autopilot modes)
- [x] LightProtocolArc (animated 24h timeline)
- [x] LightProtocolStrip (compact today strip — built, needs wiring)
- [x] SleepDebtCard dual meter (bank bar)
- [x] Pre-Shift Brief tab (brief.tsx, 5-part coaching)
- [x] FloatingTabBar Brief tab (conditional, ≤7 days)
- [x] Research pipeline (docs/research/ + PostToolUse auto-file hook)

---
Last Reviewed: 2026-04-06
Last Edited: 2026-04-06
