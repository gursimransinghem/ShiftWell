# ShiftWell Company Operations

**Last updated:** 2026-04-07
**CEO Loop version:** 1.0
**Cycle count:** 0

## Department Status

| # | Department | Status | Last Run | Trigger State | Notes |
|---|-----------|--------|----------|---------------|-------|
| 1 | Product | Active | -- | Awaiting first cycle | Phase 7 executing in GSD |
| 2 | Engineering | Active | -- | Awaiting first cycle | Phase 7 bug fixes in progress |
| 3 | Marketing | Active | -- | Awaiting first cycle | Pre-launch ASO research needed |
| 4 | Operations | Active | -- | Awaiting first cycle | LLC formation pending |
| 5 | Strategy & Planning | Active | -- | Awaiting first cycle | v1.1 roadmap defined |
| 6 | Design | Dormant | -- | Activates: TestFlight launch | -- |
| 7 | Social Media | Dormant | -- | Activates: TestFlight launch | -- |
| 8 | Customer Success | Dormant | -- | Activates: TestFlight launch | -- |
| 9 | Advertising | Dormant | -- | Activates: App Store launch | -- |
| 10 | Sales | Dormant | -- | Activates: $2.5K MRR | -- |

## Pending Approvals

_None yet._

## Recent Activity

_CEO Loop not yet started._

## Activation Triggers

| Department | Trigger Condition | How to Detect |
|-----------|-------------------|---------------|
| Design | TestFlight build distributed | `eas build:list` shows distributed build |
| Social Media | TestFlight build distributed | Same as Design |
| Customer Success | TestFlight build distributed | Same as Design |
| Advertising | App published on App Store | App Store Connect status = "Ready for Sale" |
| Sales | MRR >= $2,500 | RevenueCat dashboard or FINANCIAL_TRACKER.md |

## Configuration

- **Max parallel subagents:** 3
- **Budget per cycle:** $5 max
- **Approval required for:** Financial spend >$50, external comms, strategic pivots, App Store submissions, hiring, ad campaigns
