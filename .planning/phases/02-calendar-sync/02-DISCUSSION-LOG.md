# Phase 2: Calendar Sync - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 02-calendar-sync
**Areas discussed:** Calendar connection UX, Shift detection flow, Sleep block presentation, Change detection

---

## Calendar Connection UX

| Option | Description | Selected |
|--------|-------------|----------|
| End of onboarding | Final onboarding step after routine builder | |
| Standalone settings screen | Skip during onboarding, user finds in Settings | |
| Both — optional in onboarding | Offer during onboarding with "Skip for now", also in Settings | ✓ |

**User's choice:** Both — optional in onboarding
**Notes:** Covers both eager and cautious users.

| Option | Description | Selected |
|--------|-------------|----------|
| Provider cards | Apple + Google as tappable cards with logos, one-tap flow | ✓ |
| Single 'Connect Calendar' button | One button that detects providers | |
| You decide | Claude picks | |

**User's choice:** Provider cards
**Notes:** Clean, familiar pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Calendar list with toggles | Show all calendars with toggles to include/exclude | |
| Auto-scan everything | Read all calendars, heuristics handle it | |
| Ask which calendar has shifts | Simple picker for shift calendar | |

**User's choice:** Auto-scan with option to toggle off certain calendars
**Notes:** Smart default (all on), user adjusts if needed.

| Option | Description | Selected |
|--------|-------------|----------|
| Provider cards with status | Same cards showing "Connected — 3 calendars" with green dot | ✓ |
| Simple list row | Settings row with expand for toggles | |
| You decide | Claude picks | |

**User's choice:** Provider cards with status
**Notes:** Mirrors the connection flow.

---

## Shift Detection Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Review screen | List of detected shifts with checkmarks, user confirms | ✓ |
| Silent auto-detect | Heuristics run, shifts appear automatically | |
| Training mode | Ask "Is this a shift?" for first 5-10 events | |

**User's choice:** Review screen
**Notes:** One-time setup, builds trust.

| Option | Description | Selected |
|--------|-------------|----------|
| No confidence indicators | Just checkmarks, keep it clean | |
| Subtle confidence hints | Pre-checked = high confidence, unchecked = maybe | |
| You decide | Claude picks | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on confidence UX.

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-detect, notify to review | Notification: "2 new shifts detected — tap to confirm" | |
| Fully automatic | Trust heuristics, shifts just appear | ✓ |
| Batch review weekly | Weekly "Here are your upcoming shifts" review | |

**User's choice:** Fully automatic
**Notes:** After initial review establishes trust.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — optional shortcut | Mark calendar as "Work Schedule", all events = shifts | ✓ |
| No — heuristics only | Shift detector handles everything | |

**User's choice:** Yes — optional shortcut
**Notes:** User can mark one calendar as work schedule, but ALL calendars still read for conflict avoidance and planning context.

| Option | Description | Selected |
|--------|-------------|----------|
| Swipe action in schedule view | Long-press or swipe → mark as shift / not a shift | |
| Edit from event detail | Tap event → detail → toggle "This is a work shift" | |
| You decide | Claude picks | ✓ |

**User's choice:** Claude decides — keep it simple but premium
**Notes:** None.

---

## Sleep Block Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated 'ShiftWell' calendar | New calendar for all sleep blocks | |
| User's default calendar | Write to default calendar | |
| Let user choose | Ask which calendar to write to | |

**User's choice:** Both — default to ShiftWell calendar, let user change target in settings
**Notes:** None.

| Option | Description | Selected |
|--------|-------------|----------|
| Clean branded events | "Sleep — 11:00 PM", ShiftWell color, wind-down in description | ✓ |
| Minimal events | "Sleep" or "Nap", no extra detail | |
| Rich detail events | Full routine in description with alerts | |

**User's choice:** Clean branded events
**Notes:** None.

| Option | Description | Selected |
|--------|-------------|----------|
| Sleep blocks only | Only sleep windows and naps in calendar | |
| Full plan in calendar | Everything: sleep, naps, caffeine, wind-down, meals | |
| User configurable | Default to sleep blocks only, opt into more | |

**User's choice:** Two-tier strategy
**Notes:** ShiftWell calendar gets full plan. Native calendar gets sleep blocks only. Both active by default. User can disable native calendar writing.

---

## Change Detection

| Option | Description | Selected |
|--------|-------------|----------|
| Background polling | Poll every 15-30 min in background | ✓ |
| App-open sync only | Only check when user opens app | |
| You decide | Claude picks | |

**User's choice:** Background polling
**Notes:** Also sync on app open.

| Option | Description | Selected |
|--------|-------------|----------|
| Silent update + badge | Auto update, subtle indicator | |
| Push notification | "Your schedule changed — sleep plan updated" | |
| Silent, no notification | Just update, user never knows | |

**User's choice:** Let user decide — configurable in Settings
**Notes:** Default TBD by Claude.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — auto cleanup | Shift gone = sleep blocks gone | |
| Ask before removing | Notify before removing blocks | |
| You decide | Claude picks | |

**User's choice:** Auto — but recalculate, don't just remove
**Notes:** When shift is deleted, algorithm should recalculate optimal sleep plan for the free time, treating it as opportunity to realign toward core circadian rhythm. This is the Circadian Reset behavior.

---

## Claude's Discretion

- Confidence indicator approach on shift review screen
- Event correction interaction pattern (simple + premium)
- Default change notification setting
- Background polling interval within 15-30 min range
- Google Calendar OAuth implementation details
- ShiftWell calendar color

## Deferred Ideas

None — discussion stayed within phase scope.
