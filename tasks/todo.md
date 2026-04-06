# Active Tasks

## P0: Visual QA — V6 UI NOT YET VERIFIED (NEXT SESSION)
- [ ] V6 code exists (29 tasks, 15 new components, 299 tests pass) but NEVER visually verified against mockups
- [ ] Get Today screen rendering in Recovery Day state (bypass Night Sky, seed shifts)
- [ ] Screenshot each screen, compare against `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html`
- [ ] Fix every visual discrepancy — spacing, colors, sizes, component layout, animations
- [ ] Verify FloatingTabBar renders with blur + gold glow
- [ ] Verify GradientMeshBackground animates (3 orbs drifting)
- [ ] Verify all 5 Today states: Empty, Recovery, On Shift, Wind-down, Night Sky
- [ ] Verify Schedule (week strip + icon cards), Profile (avatar + stats), Onboarding (dots + gradient CTA)

## P1: Runtime Fixes
- [ ] AsyncStorage "Native module is null" errors in Expo Go — add to metro mocks
- [ ] RevenueCat placeholder API key error toast — suppress or use test key
- [ ] Revert `app/index.tsx` onboarding bypass + mock data before production

## P2: Phase 6 (Original Roadmap)
- [ ] Premium trial flow (PREM-01–06)
- [ ] Paywall redesign
- [ ] Settings polish (SET-01–03)
- [ ] Score store wiring (SCORE-01/02/03)

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
