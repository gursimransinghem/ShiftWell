# ShiftWell Company Operations

**Last updated:** 2026-04-07
**CEO Loop version:** 1.0
**Cycle count:** 1

## Department Status

| # | Department | Status | Last Run | Trigger State | Notes |
|---|-----------|--------|----------|---------------|-------|
| 1 | Product | Active | 2026-04-07 | Next: phase completion or feedback | Updated VISUAL_ROADMAP.md — phases 7-11 complete, Phase 12 blocked |
| 2 | Engineering | Active | 2026-04-07 | Next: STATE.md change or test failure | 383 tests passing, 0 TS errors; npm test script missing |
| 3 | Marketing | Active | -- | First cycle skipped (cost); trigger at next cycle | WebSearch deferred; no urgent competitive intel |
| 4 | Operations | Active | 2026-04-07 | Next: financial change or LLC filed | All 5 legal gates pending; Expo SDK 5 patches behind |
| 5 | Strategy & Planning | Active | 2026-04-07 | Next: phase completion or monthly | Updated BUSINESS_PLAN.md pricing; Individual dev enrollment flagged |
| 6 | Design | Dormant | -- | Activates: TestFlight launch | -- |
| 7 | Social Media | Dormant | -- | Activates: TestFlight launch | -- |
| 8 | Customer Success | Dormant | -- | Activates: TestFlight launch | -- |
| 9 | Advertising | Dormant | -- | Activates: App Store launch | -- |
| 10 | Sales | Dormant | -- | Activates: $2.5K MRR | -- |

## Pending Approvals

| # | Item | Department | Priority | Decision Needed |
|---|------|-----------|----------|-----------------|
| 1 | LLC company name: Circadian Labs vs Vigil Health vs ShiftWell | Strategy/Ops | CRITICAL | Name decision starts 5-week Apple Dev clock |
| 2 | Individual vs Organization Apple Developer enrollment | Strategy | HIGH | Individual = instant TestFlight; Org = full brand but 5+ weeks |
| 3 | Trademark clearance search + filing | Operations | HIGH | Can parallelize with LLC; protect name before marketing spend |
| 4 | Add `"test": "jest"` to package.json scripts | Engineering | LOW | One-line fix; unblocks CEO Loop test checks |
| 5 | Commit and push Phase 10/11 staged changes | Engineering | MEDIUM | 11 modified files + 1 new test; should be committed before TestFlight build |

## Recent Activity

### Cycle 1 — 2026-04-07 (Morning)
**Departments dispatched:** Engineering, Product, Operations, Strategy & Planning
**Marketing:** Skipped (WebSearch cost; no urgent intel)

**Key findings:**
- `npm test` broken — no script in package.json; actual command is `npx jest` (383 tests pass)
- CLAUDE.md documents "116 tests" — outdated (383 actual)
- STATE.md progress counters stale (shows 2 phases; ROADMAP shows 5 complete)
- 11 files with uncommitted Phase 10/11 changes; branch 165 commits ahead, never pushed
- BUSINESS_PLAN.md had wrong pricing ($4.99/mo) — corrected to $6.99/mo
- Google OAuth uses placeholder client ID — must replace before any user testing
- Expo SDK 55.0.6 is 5 patches behind (55.0.11 available)

**Artifacts committed:** VISUAL_ROADMAP.md, BUSINESS_PLAN.md

## Activation Triggers

| Department | Trigger Condition | How to Detect |
|-----------|-------------------|---------------|
| Design | TestFlight build distributed | `eas build:list` shows distributed build |
| Social Media | TestFlight build distributed | Same as Design |
| Customer Success | TestFlight build distributed | Same as Design |
| Advertising | App published on App Store | App Store Connect status = "Ready for Sale" |
| Sales | MRR >= $2,500 | RevenueCat dashboard or FINANCIAL_TRACKER.md |

## Smart Throttle

Departments only dispatch when their trigger conditions fire. If no triggers are met for a department in a cycle, it is skipped entirely. Silent cycles (where no departments trigger) are expected behavior — not a bug. This keeps API costs proportional to actual work.

## Configuration

- **Max parallel subagents:** 3
- **Budget per cycle:** $5 max
- **Approval required for:** Financial spend >$50, external comms, strategic pivots, App Store submissions, hiring, ad campaigns
