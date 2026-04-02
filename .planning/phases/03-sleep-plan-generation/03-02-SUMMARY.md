---
phase: 03-sleep-plan-generation
plan: "02"
subsystem: SchedulePreview + Today screen
tags: [schedule-preview, today-screen, circadian-reset, forward-looking, react-native]
dependency_graph:
  requires:
    - 03-01 (plan-store with lastResetAt, classify-shifts detectPatterns)
    - src/lib/circadian/classify-shifts (detectPatterns)
    - src/store/plan-store (plan, lastResetAt)
    - src/theme (COLORS, TYPOGRAPHY, SPACING, RADIUS)
  provides:
    - SchedulePreview component (forward-looking shift intelligence)
    - "WHAT'S AHEAD" section in Today screen
  affects:
    - app/(tabs)/index.tsx (new section added)
    - src/components/today/index.ts (new export)
tech_stack:
  added: []
  patterns:
    - Priority-ordered message selection (Circadian Reset > pre-adapt > nights > free days > null)
    - Null-return pattern (component renders nothing when no message applies)
    - All theme tokens — zero hardcoded colors
key_files:
  created:
    - src/components/today/SchedulePreview.tsx
  modified:
    - src/components/today/index.ts
    - app/(tabs)/index.tsx
decisions:
  - buildPreviewMessage exported for testability (pure function, no React)
  - detectPatterns imported but not called in final impl — night count computed directly from futureDays filter (simpler, avoids redundant pass)
  - Section only renders when plan && hasShifts — same guard as InsightBanner
  - WHAT'S AHEAD label uses HTML entity (&apos;) consistent with TODAY'S PLAN label in same file
metrics:
  duration: 8min
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_changed: 3
---

# Phase 03 Plan 02: SchedulePreview Component and Today Screen Wiring Summary

**One-liner:** Built SchedulePreview component with 4-priority contextual messaging (Circadian Reset → pre-adapt nights → night count → free days) and wired it into Today screen as "WHAT'S AHEAD" section.

## What Was Built

### src/components/today/SchedulePreview.tsx (new — 163 lines)

- `buildPreviewMessage(plan, lastResetAt)` — pure function, exported for testability
  - Filters future classified days from `startOfDay(now)` forward
  - Priority a: Circadian Reset — `lastResetAt !== null && differenceInHours ≤ 48` → warm gold accent styling
  - Priority b: Night stretch with pre-adapt day — `nightCount > 0 && transition-to-nights present` → "3 nights ahead — pre-adapt starting Thursday"
  - Priority c: Nights without transition — `nightCount > 0` → "N night shifts in the next 2 weeks"
  - Priority d: All future days off/recovery → "Free days ahead — sleep in opportunity"
  - Priority e: Returns `null` (no render)
- `SchedulePreview` default export — receives `{ plan: SleepPlan; lastResetAt: Date | null }`
  - Returns `null` when message is null (graceful no-render)
  - Circadian Reset variant: `COLORS.background.elevated` bg + `COLORS.accent.primary` border + gold text
  - Other messages: `COLORS.background.surface` bg + `COLORS.border.subtle` border
  - All theme tokens — `COLORS`, `TYPOGRAPHY.bodySmall`, `SPACING`, `RADIUS.md`

### src/components/today/index.ts (modified)

Added one line:
```typescript
export { default as SchedulePreview } from './SchedulePreview';
```

### app/(tabs)/index.tsx (modified)

- Added `SchedulePreview` to import from `@/src/components/today`
- Added `const lastResetAt = usePlanStore((s) => s.lastResetAt)`
- Inserted "WHAT'S AHEAD" section after TODAY'S PLAN block:
  ```tsx
  {plan && hasShifts && (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>WHAT&apos;S AHEAD</Text>
      <SchedulePreview plan={plan} lastResetAt={lastResetAt} />
    </View>
  )}
  ```
  Reuses existing `styles.section` and `styles.sectionLabel` — no new StyleSheet entries.

## Test Results

- 243 tests — all pass (unchanged from 03-01)
- TypeScript: zero new errors (pre-existing settings.tsx errors unrelated to this plan)
- No hardcoded hex colors in SchedulePreview.tsx

## Deviations from Plan

### Minor Implementation Note

**detectPatterns not called in buildPreviewMessage**

The plan listed `detectPatterns` as an import to use, but the message logic only needs `nightCount` and presence of `transition-to-nights` days — both computed with a direct `.filter()` on `futureDays`. Calling `detectPatterns` would add a redundant pass. The function is still available from `classify-shifts.ts` for future use. This is a simplification, not a functional deviation.

## Self-Check: PASSED

- FOUND: src/components/today/SchedulePreview.tsx
- FOUND: src/components/today/index.ts (updated)
- FOUND: app/(tabs)/index.tsx (updated)
- FOUND commit: 2623d8e (feat: SchedulePreview component)
- FOUND commit: c217528 (feat: wire SchedulePreview into Today screen)
- 243 tests pass
- Zero new TypeScript errors
- Zero hardcoded hex colors
