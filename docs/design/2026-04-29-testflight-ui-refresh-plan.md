# ShiftWell TestFlight UI Refresh Plan

> **Created:** 2026-04-29  
> **Source:** Parallel design/UI audits for Today, onboarding/import/add-shift, trust/settings/paywall, and design system.  
> **Goal:** Make the TestFlight build feel calm, trustworthy, clear, and action-first without expanding product scope.

---

## North Star

The app should answer one question quickly:

> "What should I do next to protect sleep around my real schedule?"

Anything that competes with that answer moves lower, collapses, or waits until after TestFlight feedback.

---

## Priority 1 — Core Journey UI

### Today Screen

**Problem:** The Today screen has strong data but reads like a dashboard. Recovery/off states stack too many cards before the user's next action.

**Implement first:**

1. Move the core plan story above education/upsell surfaces:
   - status/context
   - next action/countdown
   - Today timeline
   - recovery details
   - education/forecast/science
2. Move `PremiumFeatureGate` below the first actionable plan module.
3. Use consistent section framing for timeline in recovery and on-shift states.
4. Replace generic `Recovery Day` copy with copy derived from actual context:
   - off day
   - before shift
   - after night shift
   - transition week
5. Soften "Kitchen closes" to "Eating window ends" or "Last meal window."

**Files:**
- `app/(tabs)/index.tsx`
- `src/components/today/StatusPill.tsx`
- `src/components/today/CountdownRow.tsx`
- `src/components/today/TimelineEvent.tsx`
- `src/components/today/CollapsedPast.tsx`

### Onboarding / Import / Add Shift

**Problem:** First-run setup is close, but manual shift entry can strand users and visual systems are mixed.

**Implement first:**

1. Make `add-shift.tsx?from=onboarding` return to `plan-ready` after save, or add a Continue button on `shifts.tsx` once a shift exists.
2. Surface demo mode somewhere obvious when demo data is loaded.
3. Tighten welcome trust badges:
   - "Physician-built"
   - "Research-informed"
   - "For shift schedules"
4. Keep `.ics` language honest and do not imply live Apple/Google sync unless that flow is active.

**Files:**
- `app/(onboarding)/welcome.tsx`
- `app/(onboarding)/shifts.tsx`
- `app/(onboarding)/plan-ready.tsx`
- `app/import.tsx`
- `app/add-shift.tsx`
- `src/store/onboarding-store.ts`

---

## Priority 2 — Trust Surfaces

### Settings / Profile / Paywall

**Problem:** The copy is now much more honest, but Settings legal summaries are still basic alerts and some subscription mechanics need more transparent UI.

**Implement next:**

1. Extract a reusable legal modal/sheet and use it in both Paywall and Settings.
2. Show Terms in Settings alongside Privacy and Health Disclaimer.
3. Make trial copy reflect whether the local trial already started.
4. Soften downgrade from a repeated hard gate into a one-time or dismissible explanation if possible.
5. Use one name consistently: `ShiftWell Pro`.
6. Use real app/build version instead of hard-coded `1.0.0`.

**Files:**
- `app/(tabs)/settings.tsx`
- `app/(tabs)/profile.tsx`
- `app/paywall.tsx`
- `app/downgrade.tsx`
- `app/_layout.tsx`
- `src/content/legal.ts`
- `src/store/premium-store.ts`

---

## Priority 3 — Design System Polish

**Problem:** The app has a good dark visual identity, but tokens are duplicated and accessibility labels are inconsistent.

**Implement next:**

1. Tokenize `FloatingTabBar` colors/radius:
   - use theme purple/accent
   - use theme inactive text color
   - use existing tab radius token
2. Add tab accessibility labels in `app/(tabs)/_layout.tsx`.
3. Replace literal `Card` padding/radius with `SPACING.lg` and `RADIUS.lg`.
4. Add accessibility role/value to `ProgressBar`.
5. Document or remove unused `AdaptiveColorProvider` if no surface consumes it.

**Files:**
- `src/components/navigation/FloatingTabBar.tsx`
- `app/(tabs)/_layout.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/ProgressBar.tsx`
- `src/components/providers/AdaptiveColorProvider.tsx`
- `src/theme/*`

---

## Defer Until After TestFlight Feedback

- Full visual redesign.
- Outcomes dashboard prominence.
- AI weekly brief polish unless auth/API path is verified.
- Autopilot log as a visible surface.
- Large Night Sky rewrite.
- Light mode.
- Enterprise/dashboard UI.

---

## Suggested Implementation Slices

### Slice A — First-Run Completion

- Fix manual shift onboarding exit.
- Add demo-data banner.
- Tighten welcome trust copy.
- Verify fresh install -> onboarding -> manual shift -> plan-ready.

### Slice B — Today Action Hierarchy

- Reorder Today state sections.
- Make timeline framing consistent.
- Move premium/education below core plan.
- Improve status and meal-window copy.

### Slice C — Legal/Trust Sheet

- Extract reusable legal sheet.
- Use it in Settings and Paywall.
- Add Terms row to Settings.
- Improve trial/downgrade transparency.

### Slice D — Design-System Low-Risk Polish

- Tokenize tab bar/card styles.
- Add accessibility labels/roles.
- Run small-screen visual QA.

---

## Verification

For each slice:

1. `npm test`
2. Fresh install simulator walkthrough
3. Physical iPhone walkthrough when native flows are involved
4. Screenshot before/after for affected screens
5. Confirm no new feature promises are introduced
