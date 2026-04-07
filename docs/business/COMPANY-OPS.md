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

## Launch Pipeline

Three parallel tracks to App Store. Operations department auto-checks each step every cycle.

**Statuses:** `blocked` → `ready` → `waiting-on-sim` → `in-progress` → `done`

### Track 1: Legal (gates TestFlight)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| L1 | LLC filing (FL) | waiting-on-sim | -- | Sim confirms filing receipt | Pick name: ShiftWell recommended |
| L2 | EIN from IRS | blocked | L1 | Sim provides EIN number | Free, instant online after LLC |
| L3 | Business bank account | blocked | L2 | Sim confirms account open | Mercury or local bank |
| L4a | Apple Dev (Individual) | blocked | Apple ID | `eas whoami` shows paid account | Instant, $99 — bridge to TestFlight |
| L4b | Apple Dev (Organization) | blocked | L1+L2+D-U-N-S | `eas whoami` shows org account | 5+ weeks, full brand on App Store |
| L5 | D-U-N-S number | blocked | L1 | Sim confirms D-U-N-S received | 1-5 business days after LLC |
| L6 | Trademark clearance | blocked | L1 | Sim confirms search complete | ~$300-500, 2 weeks, parallelizable |
| L7 | Trademark filing | blocked | L6 | Sim confirms USPTO filed | Class 9 + 44, ~$500-700 |

### Track 2: Code (gates clean build)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| C1 | BUG-01 trial start | in-progress | -- | `grep "startTrial" src/store/premium-store.ts` in initializePremium | Phase 7 |
| C2 | BUG-02 score pipeline | in-progress | -- | `grep "finalizeDay" app/_layout.tsx` in AppState handler | Phase 7 |
| C3 | BUG-03 downgrade screen | in-progress | -- | `test -f app/downgrade.tsx` | Phase 7 |
| C4 | BUG-04 TypeScript errors | done | -- | `npx tsc --noEmit 2>&1 \| grep -c error` = 0 | Fixed in Phase 7 |
| C5 | BUG-05 computeDelta | done | -- | Distinct args in useAdaptivePlan.ts | Fixed in Phase 7 |
| C6 | BUG-06 LIVE-03 score | done | -- | todayScore() in startSleepActivity | Fixed in Phase 7 |
| C7 | Privacy manifest | ready | -- | `grep "privacyManifests" app.json` | TF-01, 15-min config |
| C8 | HealthKit entitlements | ready | -- | `grep "healthkit.background-delivery" app.json` | TF-02 |
| C9 | EAS production profile | ready | -- | `grep '"production"' eas.json` | TF-04 |
| C10 | Google OAuth real ID | ready | -- | No "placeholder" in OAuth config | CEO Cycle 1 finding |
| C11 | npm test script | ready | -- | `grep '"test"' package.json` | CEO Cycle 1 finding |
| C12 | installedAt timestamp | ready | -- | `grep "installedAt" src/` in onboarding completion | TF-05 |

### Track 3: Assets (gates App Store submission)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| A1 | App icon (1024x1024) | ready | -- | `test -f assets/images/icon.png` + not default Expo | TF-03 |
| A2 | Splash screen | ready | -- | Custom splash in app.json, not default | TF-03 |
| A3 | Screenshots (1290x2796) | blocked | C1-C3 | Files exist in docs/launch/screenshots/ | After bug fixes |
| A4 | Privacy policy hosted | ready | -- | URL live and returning 200 | APP-04 |
| A5 | Medical disclaimer | ready | -- | `grep "not a substitute" app/` in onboarding | APP-02 |
| A6 | App Store listing copy | ready | -- | APP_STORE_LISTING.md complete | APP-05 |
| A7 | Account deletion | ready | -- | `test -f app/settings/delete-account.tsx` or equivalent | APP-01 |
| A8 | App Review notes | blocked | A3-A7 | Written in docs/launch/ | Last before submission |

### Pipeline Summary

| Track | Total | Done | In Progress | Ready | Blocked |
|-------|-------|------|-------------|-------|---------|
| Legal | 7 | 0 | 0 | 0 | 7 |
| Code | 12 | 3 | 3 | 6 | 0 |
| Assets | 8 | 0 | 0 | 5 | 3 |
| **Total** | **27** | **3** | **3** | **11** | **10** |

### Critical Path

```
LLC (L1) → EIN (L2) → Apple Dev Individual (L4a) → TestFlight build
                                                      ↑
Bug fixes (C1-C3) + Privacy manifest (C7) + EAS profile (C9) ──┘
```

**Shortest path to TestFlight:** LLC filed → EIN (same day) → Apple Dev Individual ($99, instant) → fix C1-C3 + C7 + C9 → `eas build --platform ios --profile production` → `eas submit` → TestFlight live.

**Estimated time if LLC filed today:** ~1 week to TestFlight (LLC processing + bug fixes in parallel).

## Smart Throttle

Departments only dispatch when their trigger conditions fire. If no triggers are met for a department in a cycle, it is skipped entirely. Silent cycles (where no departments trigger) are expected behavior — not a bug. This keeps API costs proportional to actual work.

## Configuration

- **Max parallel subagents:** 3
- **Budget per cycle:** $5 max
- **Approval required for:** Financial spend >$50, external comms, strategic pivots, App Store submissions, hiring, ad campaigns
