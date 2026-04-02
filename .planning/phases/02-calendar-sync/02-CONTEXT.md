# Phase 2: Calendar Sync - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect Apple Calendar and Google Calendar natively, auto-detect work shifts from calendar events, and write sleep plan blocks back to the user's real calendars. The calendar becomes the interface — shifts go in, sleep plan comes out.

</domain>

<decisions>
## Implementation Decisions

### Calendar Connection UX
- **D-01:** Calendar connection offered as optional step at end of onboarding ("Skip for now" available). Also accessible from Settings anytime.
- **D-02:** Connection flow shows provider cards (Apple Calendar + Google Calendar) with provider logos. One tap → native permission prompt (Apple) or OAuth (Google).
- **D-03:** After connecting, auto-scan ALL calendars. Show calendar list with toggles so user can exclude specific calendars. Default: all on.
- **D-04:** In Settings, connected providers show as cards with status ("Connected — 3 calendars") and green dot. Tap to manage calendar toggles or disconnect.

### Shift Detection
- **D-05:** After initial scan, present a review screen: "These look like your shifts — confirm or adjust." List of detected shifts with checkmarks. User can uncheck false positives and check missed events.
- **D-06:** After initial setup, ongoing shift detection is fully automatic — no notification or review needed for new shifts.
- **D-07:** User can optionally tag one calendar as "Work Schedule" — all events from that calendar treated as shifts (skip heuristics). But the algorithm still reads ALL connected calendars for conflict avoidance and sleep planning context.
- **D-08:** Existing `shift-detector.ts` heuristics (keyword + duration) are the foundation. Extend as needed for live calendar events vs. ICS imports.

### Sleep Block Presentation
- **D-09:** Auto-create a dedicated "ShiftWell" calendar in the user's calendar app. All plan events write there by default.
- **D-10:** Two-tier calendar writing strategy:
  - **ShiftWell calendar**: Full plan — sleep windows, naps, caffeine cutoff, wind-down, meal timing, light protocols
  - **Native calendar**: Sleep blocks only — sleep windows + naps
- **D-11:** Default: both calendars active and written to. User can disable writing to native calendar in Settings.
- **D-12:** User can change target calendar for sleep blocks in Settings (defaults to auto-created ShiftWell calendar).
- **D-13:** Sleep block events use clean branded format. Title: "Sleep — 11:00 PM" or "Nap — 2:30 PM". ShiftWell brand color. Description includes wind-down time, caffeine cutoff, etc.

### Change Detection & Sync
- **D-14:** Background polling for calendar changes (every 15-30 min when app is backgrounded). Also sync on app open.
- **D-15:** Change notification preference is user-configurable in Settings: silent / badge / push notification. Default TBD by Claude.
- **D-16:** When a shift is deleted or user confirms "not a shift" — do NOT just remove sleep blocks. The algorithm must recalculate the optimal sleep plan for the now-free time, treating it as an opportunity to realign toward the user's core circadian rhythm (Circadian Reset behavior).

### Claude's Discretion
- Confidence indicator approach on the shift review screen: Claude decides based on UX best practices (e.g., pre-checked = high confidence, unchecked = low)
- Event correction interaction pattern: Claude picks (simple and premium-feeling)
- Default change notification setting
- Background polling interval (15-30 min range)
- OAuth flow implementation details for Google Calendar
- ShiftWell calendar color choice

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Calendar Infrastructure
- `src/lib/calendar/shift-detector.ts` — Shift detection heuristics (keyword + duration based)
- `src/lib/calendar/ics-parser.ts` — ICS parser with recurring event expansion (ical.js)
- `src/lib/calendar/ics-generator.ts` — ICS output generation
- `src/lib/circadian/classify-shifts.ts` — Shift type classification (day/night/evening)
- `src/lib/circadian/types.ts` — ShiftEvent and PersonalEvent type definitions

### Sync & Data Layer
- `src/lib/sync/sync-engine.ts` — Offline-first sync with Supabase (shifts, personal_events, sleep_plans tables)
- `src/lib/supabase/` — Supabase client configuration

### Design System
- `src/theme/colors.ts` — Blend design system tokens (dark base + warm gold #C8A84B)

### Competitive Edge
- `COMPETITIVE_EDGE_LOG.md` — Circadian Reset as flagship feature (relevant to D-16)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shift-detector.ts`: `separateShiftsFromPersonal()` and `isLikelyShift()` — foundation for live calendar shift detection
- `ics-parser.ts`: `SHIFT_KEYWORDS` array — reuse for calendar event classification
- `classify-shifts.ts`: `classifyShiftType()` — already classifies day/night/evening shifts
- `sync-engine.ts`: Offline queue pattern — extend for calendar write operations
- `src/hooks/useExport.ts` — existing export hook, may inform write-back patterns

### Established Patterns
- Zustand + AsyncStorage for local-first state management
- Supabase for cloud sync (last-write-wins conflict resolution)
- Expo SDK 55 — use `expo-calendar` for native calendar access
- Theme tokens imported from `src/theme/colors.ts` — never hardcode colors

### Integration Points
- Onboarding flow (`app/(onboarding)/`) — add optional calendar connect step at end
- Settings screen (`app/(tabs)/settings.tsx`) — add calendar management section
- Schedule view (`app/(tabs)/schedule.tsx`) — display synced calendar events
- Algorithm pipeline — feed detected shifts into circadian engine for sleep plan generation

</code_context>

<specifics>
## Specific Ideas

- Circadian Reset: When shifts are removed, the algorithm should optimize sleep schedule to transition back to core circadian rhythm — not just delete sleep blocks. This is a selling feature.
- "Work Schedule" calendar tag: User can mark one calendar where ALL events = shifts. Heuristics bypassed for that calendar. But ALL calendars still read for conflict avoidance.
- Two-tier write strategy ensures the user's native calendar stays clean (sleep only) while ShiftWell calendar has the full detailed plan.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-calendar-sync*
*Context gathered: 2026-04-02*
