# Phase 4: Night Sky Mode & Notifications - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** Auto-generated (autonomous execution mode)

<domain>
## Phase Boundary

Build Night Sky Mode (calming bedtime UI with animations, recharge indicator, minimal info display) and the push notification cadence (wind-down, caffeine cutoff, morning brief). Night Sky Mode activates as bedtime approaches and shows only essential sleep info. Notifications are warm and emoji-based, never clinical.

</domain>

<decisions>
## Implementation Decisions

### Night Sky Mode
- **D-01:** Night Sky Mode activates automatically based on plan's wind-down time (typically 30-60 min before bedtime). Can also be triggered manually.
- **D-02:** UI: deep dark sky gradient background with subtle firefly/star particle animations. Minimal UI — no navigation chrome.
- **D-03:** Shows exactly three things: (1) alarm confirmation with time, (2) latest acceptable wake time, (3) tomorrow morning's schedule summary.
- **D-04:** Recharge animation: a circular fill that shows projected sleep quality. Updates in real-time — staying up past bedtime visibly decreases the fill.
- **D-05:** Quick bedtime tips cycle through: water intake, phone placement, room temperature. Subtle, not intrusive.

### Push Notifications
- **D-06:** Wind-down reminder: 30-60 min before bedtime. Warm tone with emoji. Example: "🌙 Wind-down time — your sleep window opens in 45 minutes"
- **D-07:** Caffeine cutoff reminder: timed to the plan's caffeine cutoff block. Example: "☕ Last call for caffeine — cutoff in 30 minutes"
- **D-08:** Morning brief: delivered at wake time. Shows score + first open block in schedule. Example: "☀️ Good morning! Sleep score: 85. First up: 8am shift"
- **D-09:** All notification timing is customizable in Settings (already have notification preferences from Phase 2's D-15 change notification mode).
- **D-10:** Notifications use expo-notifications. Local notifications scheduled from plan data — no push server needed.

### Claude's Discretion
- Particle animation library choice (react-native-reanimated vs. custom Canvas)
- Recharge animation visual style
- Night Sky Mode transition animation timing
- Notification sound selection
- Bedtime tip content and cycling behavior

</decisions>

<canonical_refs>
## Canonical References

### Sleep Plan Data
- `src/store/plan-store.ts` — Plan state, current blocks, regeneration
- `src/lib/circadian/types.ts` — PlanBlock (type, start, end, priority, description)
- `src/lib/circadian/index.ts` — SleepPlan structure

### Existing Notification Infrastructure
- `src/lib/notifications/` — Notification service (may already exist from v0.1)

### Design System
- `src/theme/colors.ts` — ACCENT.primary '#C8A84B', BACKGROUND tokens

### Phase 2 Settings
- `src/components/calendar/CalendarSettingsSection.tsx` — Notification mode UI pattern to reuse

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `plan-store.ts` — Access current plan blocks, filtered by type (sleep, nap, caffeine, etc.)
- `src/lib/notifications/` — May have existing notification service scaffold
- `react-native-reanimated` — Likely already installed (check package.json)
- Theme tokens — All colors through tokens, never hardcode

### Integration Points
- Today screen transitions to Night Sky Mode when within wind-down window
- Plan blocks provide all timing data for notification scheduling
- Settings screen needs notification timing preferences section

</code_context>

<specifics>
## Specific Ideas

- Night Sky Mode should feel like looking at a calm night sky — not a settings screen with a dark theme.
- The recharge animation is the hero element. It should feel alive, not just a progress bar.
- Notification tone should match brand: warm, encouraging, never nagging. Think "a friend who cares about your sleep."

</specifics>

<deferred>
## Deferred Ideas

None — staying within phase scope.

</deferred>

---

*Phase: 04-night-sky-mode-notifications*
*Context gathered: 2026-04-02*
