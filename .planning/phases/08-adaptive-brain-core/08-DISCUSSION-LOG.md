# Phase 8: Adaptive Brain Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 08-adaptive-brain-core
**Areas discussed:** Sleep debt visibility, Insight card UX + undo, Change log storage

---

## Sleep Debt Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Threshold-gated | Show only when debt >= 0.5h OR banking credit > 0. Silence at zero debt. | ✓ |
| Always visible | Always show the card, even at zero debt. Constant awareness. | |
| Learning phase then gate | Always show during days 1-30, then threshold-gate. | |

**User's choice:** Threshold-gated (Recommended)
**Notes:** None

---

## Insight Card UX + Undo

### Undo target

| Option | Description | Selected |
|--------|-------------|----------|
| planSnapshot | Reverts to exact pre-regeneration state. Already implemented. Zero new infra. | ✓ |
| Day-start snapshot | Save a separate snapshot at first app open each day. Needs new storage. | |

**User's choice:** planSnapshot (Recommended)

### Dismiss reappearance

| Option | Description | Selected |
|--------|-------------|----------|
| Gone until next morning | Dismissed = done for this cycle. New card appears if change still warranted. | ✓ |
| Re-show on next app open | Persist pendingChanges. Re-shows until accepted. | |

**User's choice:** Gone until next morning (Recommended)
**Notes:** None

---

## Change Log Storage

### Storage location

| Option | Description | Selected |
|--------|-------------|----------|
| AsyncStorage persisted | Persist changeLog (capped 30) in plan-store via Zustand persist. ~200 bytes/entry. | ✓ |
| In-memory only | Keep ephemeral pendingChanges. Lost on restart. | |
| Supabase remote | Cloud persistence. Overkill pre-TestFlight. | |

**User's choice:** AsyncStorage persisted (Recommended)

### Factor display

| Option | Description | Selected |
|--------|-------------|----------|
| Primary driver only | Single most impactful factor shown. All factors stored in log. | ✓ |
| All contributing factors | List all 4 factor weights. More transparent but overwhelming. | |

**User's choice:** Primary driver only (Recommended)
**Notes:** None

---

## Claude's Discretion

- Daily debounce mechanism (BRAIN-01): User deferred to Claude
- Card ordering within Today screen: User deferred to Claude
- Error/empty states for missing HealthKit data: User deferred to Claude

## Deferred Ideas

None -- discussion stayed within phase scope.
