# ShiftWell — MVP cut + ship plan

> Created 2026-05-05 per unified-ai-stack plan v2 §9 Phase 5.

## TL;DR

- **MVP**: v1.1 minus Phase 12 (ActivityKit / real Dynamic Island transitions). The app already works; the Live Activities animation is a polish upgrade, not a gate.
- **Ship target (TestFlight)**: T+5 weeks from Apple Developer enrollment going through. Realistic = early-to-mid June 2026, contingent on Sim's LLC formation and D-U-N-S processing.
- **Ship target (App Store)**: T+8 weeks. Adds App Review variability (1–7 days, sometimes longer) and any rejection/resubmit cycles.
- **Engineering scope to ship**: ~zero. Code is done. Effort is paperwork + assets + review prep.

## What's actually blocking ship

External (Sim, not Claude):

| Blocker | Owner | Time | Status |
|---|---|---|---|
| LLC formation | Sim | days | in progress |
| D-U-N-S number | Sim | ~5 weeks total path | gated on LLC |
| Apple Developer enrollment | Sim | gated on D-U-N-S | not started |
| Trademark clearance ("ShiftWell") | Sim / counsel | ongoing | $500, in progress |
| Privacy policy hosted at production URL | Sim | hours | drafted in `docs/launch/` |
| App Store screenshots (final, with real data) | Sim | hours | drafted in `docs/launch/` |
| Terms of Service / EULA | Sim | hours | drafted |

Internal (engineering):

| Item | Owner | Status |
|---|---|---|
| 1,059 tests passing | Claude | ✓ green |
| Privacy manifest, entitlements | Claude | ✓ Phase 10 |
| Account deletion, medical disclaimer | Claude | ✓ Phase 11 |
| App icon (final, multiple sizes) | Claude/design | ✓ Phase 10 |
| EAS production profile | Claude | ✓ Phase 10 |
| Differential privacy in dashboard | Claude | ✓ Phase 27 |
| BAA template for enterprise | Claude | ✓ Phase 26 |

## MVP cut (what ships in v1.1 → TestFlight)

**INCLUDED** (v1.0 + v1.1):
- 8-screen onboarding (Phase 1)
- Apple + Google Calendar sync (Phase 2)
- Sleep plan generation from algorithm (Phase 3)
- Night Sky mode + push notifications (Phase 4)
- Adherence / recovery score (Phase 5)
- Adaptive Brain core (sleep debt engine, AdaptiveInsightCard) (Phase 8)
- Circadian transition protocols (Phase 9)
- HealthKit closed loop (Phases 14, 15)
- Claude Weekly Brief (Phase 20)
- Predictive Calendar Engine (Phase 22)
- Pattern Recognition (Phase 23)
- Outcome Dashboard (Phase 25)
- Growth engine + RevenueCat hard-gating (Phases 17, 18)
- i18n skeleton + ASO keywords (Phase 31)

**DEFERRED to v1.2+**:
- Phase 12: ActivityKit real Dynamic Island (needs Apple Dev). Stub remains.
- Phase 16: Feedback Validation Sprint (needs 30 days real user data — by definition cannot ship before launch).
- Phase 24: Intelligence Validation Sprint (needs 90 days AI coaching data).
- Phase 33: Apple Watch HRV (Watch complication needs native build, deferred).
- Phase 34: Autopilot mode (gated on 30-day + 20-score data).
- Phase 35: Observational cohort study (post-launch).

## Unblocking sequence

```
Sim                         Apple                       Claude
─── LLC formation ──────►
                            D-U-N-S issuance
                            Apple Dev enrollment
                                 │
                                 └──► EAS build  ──►  Claude assists with submission prep
                                                       (screenshots, metadata, privacy form)
                                 
TestFlight invite list (ED physician beta panel — Sim's network) ──► Beta feedback batch
                                                                       │
                                                                       └──► Claude triages → fix list → patch builds
```

## Worktree layout (recommendation)

While waiting for Apple Dev, run unblocked work in parallel using git worktrees:

```bash
cd ~/Projects/ShiftWell

# Worktree per parallel workstream
git worktree add ../shiftwell-w-i18n  i18n-spanish-extension
git worktree add ../shiftwell-w-aso   aso-keyword-iteration
git worktree add ../shiftwell-w-rev   revenuecat-hard-gating-polish
```

Each worktree gets its own Cursor window. Parallel agents can run without cross-contamination. Phase 31 (ASO + i18n) is the most unblocked candidate for parallel work.

## STRATEGY.md status

**Decision: not creating a new STRATEGY.md.** ShiftWell already has:
- `docs/business/BUSINESS-PLAN-V2.md` — strategy, market, financials
- `docs/business/MARKETING-PLAN.md` — go-to-market, channels, KPIs
- `docs/business/COMPETITIVE_ANALYSIS.md` — competitor intel
- `docs/vision/MANIFESTO.md` — vision & mission
- `.planning/ROADMAP.md` — 38-phase plan with milestones, blockers
- `scripts/company-ops/departments/strategy.md` — operational strategy

A separate top-level STRATEGY.md would duplicate. Plan v2 said "STRATEGY.md if absent" — it's absent in name only; the substance is well-distributed and current.

## Day-30 review trigger

Re-read this doc on 2026-06-04 (with bg-agents-eval review). Update unblocking-sequence dates based on actual Apple Dev progress. If still blocked, escalate the LLC/D-U-N-S timeline.
