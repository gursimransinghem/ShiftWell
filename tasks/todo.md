# Active Tasks

## P0: Visual QA — V6 UI (VERIFIED 2026-04-06)
- [x] Recovery Day state: seed mock data (yesterday shift), clear stale AsyncStorage
- [x] Hero Score ring (78, sparkline, trend) — fixed premium gate + seeded score store
- [x] Header "Good morning / Monday, April 6" — added getGreeting() + dateHeadline to Today screen
- [x] FloatingTabBar: 3 tabs only (Today/Schedule/Profile), gold active icon — fixed route filter
- [x] AsyncStorage mock (in-memory) — zero error toasts
- [x] RevenueCat mock (no-op) — no error toast
- [x] Schedule screen: week strip + calendar + FAB ✅
- [x] Profile screen: avatar + 78 avg score + stats + preferences ✅
- [x] Kitchen Closes cell — H:MM countdown (amber #F59E0B), TRE fallback (sleep−3h), 4-cell row ✅
- [x] Timeline cards: countdown-to-start on right, H:MM format, TODAY'S PLAN label ✅
- [x] Empty state — rocket CTA, 3-tab bar ✅
- [x] Onboarding screens — welcome screen verified (gold title, 3 features, CTA, disclaimer) ✅
- [ ] GradientMeshBackground animation (3 orbs) — needs live device
- [ ] Wind-down state — time-dependent, needs live device at ~9pm
- [ ] Night Sky state — verified in prior session

## P1: Runtime Fixes (DONE)
- [x] AsyncStorage "Native module is null" — in-memory mock in `metro.config.js`
- [x] RevenueCat error toast — no-op mock in `metro.config.js`
- [ ] Revert `app/index.tsx` onboarding bypass + mock data before production

## P2: Phase 6 (Original Roadmap)
- [x] Paywall redesign — $6.99/mo, $49.99/yr, $149.99 lifetime, 14-day trial CTA, feature list ✅
- [x] Premium trial flow — 14-day trial tracking in store (install date → countdown), canAccess checks trial ✅
- [x] Settings screen — sleep need, caffeine half-life, nap, commute steppers + referral + subscription ✅
- [ ] SET-03: DND/Sleep Focus mode — needs entitlements + live device
- [ ] Score store wiring — HealthKit → real scores (needs TestFlight/live device)

## P3: Polish
- [ ] Sound design — source/synthesize 3 audio files for stubs
- [ ] Ultraplan PR — check and merge when remote session completes
- [ ] TestFlight blockers: LLC + Apple Dev + D-U-N-S

## Completed (Recent)
- [x] V6 UI redesign — design spec, 14 mockups, implementation (7 waves, 29 tasks, 8 commits)
- [x] Simulator launch — Xcode installed, native modules mocked, app renders Night Sky + Empty state
- [x] Session report saved to project + attempted Obsidian sync

---
Last Reviewed: 2026-04-06
Last Edited: 2026-04-06
