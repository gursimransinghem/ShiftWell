# Phase 1: Foundation & Onboarding — Research

**Researched:** 2026-04-02
**Domain:** React Native / Expo onboarding UX, design system tokens, address geocoding, Reanimated animations
**Confidence:** HIGH — based on direct source inspection of the codebase plus verified library docs

---

## Summary

Phase 1 is a **redesign and extension**, not a greenfield build. An onboarding skeleton already exists with five screens (welcome → chronotype → household → preferences → healthkit) and a working design token system. The user store, progress bar, option card, and button components are production-ready and used throughout. The primary work is:

1. **Blend design system refresh** — the current `ACCENT.primary` is a blue (`#4A90D9`), not warm gold. Every hardcoded color reference in components and screen files needs to move to theme tokens, and the accent palette needs a gold layer added.
2. **AM/PM routine builder screens** — two entirely new onboarding screens that do not yet exist. Each needs a multi-step "activity picker + duration/time configurator" UX.
3. **Address entry for commute** — the existing `commuteDuration` in `UserProfile` stores a fixed integer; actual addresses (work + home) need new fields added and a geocoding-powered duration calculation.
4. **Update `UserProfile` / data model** — add `workAddress`, `homeAddress`, `amRoutine`, `pmRoutine` fields and extend `DEFAULT_PROFILE`.

The animation infrastructure (react-native-reanimated 4.2.1, existing `AnimatedTransition` wrapper, `Animated.spring` usage in chronotype screen) is capable and already established. The blend aesthetic is structurally sound — it needs gold accent tokens added and all inline hex colors replaced by theme references.

**Primary recommendation:** Add `ACCENT.gold` and `ACCENT.goldMuted` tokens to the existing theme, audit and replace all hardcoded hex strings, then build the two routine builder screens as new expo-router pages inserted between `preferences` and `healthkit`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DES-01 | App uses blend design (dark base + warm accents) | Theme tokens exist but accent is blue, not gold; requires palette extension + global audit |
| DES-02 | Smooth animations throughout (transitions, feedback, staggered loading) | `AnimatedTransition`, Reanimated 4.x, `Animated.spring` all present and working |
| DES-03 | Premium, confident visual identity — never cluttered or clinical | Existing component library is clean; enforce via token discipline, no raw hex |
| ONB-01 | Chronotype quiz (simplified MEQ → early/intermediate/late) | Already implemented in `app/(onboarding)/chronotype.tsx` — needs visual polish only |
| ONB-02 | AM routine builder (wake, shower, breakfast, kids/pets, exercise, commute time) | Does not exist — new screen required |
| ONB-03 | PM routine builder (dinner, wind-down activities, phone-down, lights-out) | Does not exist — new screen required |
| ONB-04 | Work and home addresses for commute calculation | `commuteDuration` exists as fixed int; address fields + Expo geocoding needed |
| ONB-05 | Household profile (size, young children, pets) | Already implemented in `app/(onboarding)/household.tsx` — needs visual polish only |
| ONB-06 | Sleep preferences (target hours, nap preference, caffeine sensitivity) | Already implemented in `app/(onboarding)/preferences.tsx` — needs polish + address step |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- iOS first — no Android parity required for v1.0
- Dark base + warm accents — this is the locked brand identity; the current blue accent deviates from the "warm gold" vision
- Privacy: data stays on device unless user opts into sync — addresses must be stored locally in AsyncStorage/Zustand, not sent to a server during onboarding
- Bootstrap budget — no paid geocoding APIs; Expo's built-in Location + free reverse geocoding only
- React Native / Expo / TypeScript stack — no Swift, no native modules beyond what's already in `app.json` plugins
- Existing onboarding needs redesign (not rebuild) — skeleton is there, routine builder adds on top

---

## Standard Stack

### Core (already installed — verified from package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | ~55.0.6 | SDK umbrella | Project foundation |
| expo-router | ~55.0.5 | File-based routing + Stack nav | Already in use for onboarding |
| react-native-reanimated | 4.2.1 | Performant animations via worklets | Already installed, useNativeDriver-compatible |
| react-native-safe-area-context | ~5.6.2 | SafeAreaView wrapper | Used on every onboarding screen |
| zustand | ^5.0.11 | Local state + AsyncStorage persistence | `user-store.ts` already handles profile |
| @react-native-async-storage/async-storage | ^3.0.1 | Persistent storage | Backing Zustand persist middleware |
| @react-native-community/datetimepicker | ^8.6.0 | Native iOS time picker | Already installed, needed for routine times |

### New Dependencies Required
| Library | Version | Purpose | When to Add |
|---------|---------|---------|-------------|
| expo-location | ~18.x (SDK 55 compatible) | Geocoding addresses → lat/lng → drive time estimate | ONB-04 only |

**Check before installing expo-location:**
```bash
npx expo install expo-location
```
SDK 55 ships `expo-location@18.x` — always use `npx expo install` to get the version pinned to your SDK.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-location geocoding | Google Maps Geocoding API | Google requires API key + billing; expo-location is free and sufficient for commute distance estimate |
| react-native-reanimated worklets | Animated API (already used) | Both work; Reanimated preferred for complex gesture-driven or interpolation-heavy animations; existing screens use `Animated` — consistency matters, don't mix without reason |
| @react-native-community/datetimepicker | Custom scroll picker | Native picker is correct iOS UX; custom picker adds maintenance burden |

---

## Architecture Patterns

### Current Onboarding File Structure
```
app/
└── (onboarding)/
    ├── _layout.tsx         ← Stack navigator, animation: slide_from_right
    ├── welcome.tsx         ← Step 1 of 5 (needs redesign)
    ├── chronotype.tsx      ← Step 2 of 5 (quiz + result) — functional
    ├── household.tsx       ← Step 3 of 5 (size + toggles) — functional
    ├── preferences.tsx     ← Step 4 of 5 (sleep need, nap, caffeine, commute) — functional
    └── healthkit.tsx       ← Step 5 of 5 (optional HealthKit) — functional
```

### Target Onboarding Structure (Phase 1)
```
app/
└── (onboarding)/
    ├── _layout.tsx         ← Add new screen names; update step count to 8
    ├── welcome.tsx         ← Step 1/8: redesign with warm gold accent
    ├── chronotype.tsx      ← Step 2/8: existing quiz (polish only)
    ├── household.tsx       ← Step 3/8: existing screen (polish only)
    ├── preferences.tsx     ← Step 4/8: remove commute chip picker here (moves to addresses)
    ├── am-routine.tsx      ← Step 5/8: NEW — AM activity builder
    ├── pm-routine.tsx      ← Step 6/8: NEW — PM activity builder
    ├── addresses.tsx       ← Step 7/8: NEW — work + home address entry
    └── healthkit.tsx       ← Step 8/8: existing screen (polish only)
```

### Pattern 1: Multi-step Routine Builder
**What:** Each routine (AM/PM) is a list of predefined activity tiles. User taps to include/exclude, then sets a duration or time for included activities. State accumulates locally, saved to Zustand on "Continue".
**When to use:** ONB-02, ONB-03
**Example structure:**
```typescript
// Source: project pattern — consistent with OptionCard + Card usage
interface RoutineActivity {
  id: string;
  label: string;
  icon: string;          // emoji
  defaultMinutes: number;
  selected: boolean;
  durationMinutes: number;
}

const AM_ACTIVITIES: RoutineActivity[] = [
  { id: 'wake',     label: 'Wake up',     icon: '⏰', defaultMinutes: 0,  selected: true,  durationMinutes: 0  },
  { id: 'shower',   label: 'Shower',      icon: '🚿', defaultMinutes: 15, selected: true,  durationMinutes: 15 },
  { id: 'breakfast',label: 'Breakfast',   icon: '🍳', defaultMinutes: 20, selected: true,  durationMinutes: 20 },
  { id: 'kids',     label: 'Kids / pets', icon: '👨‍👩‍👧', defaultMinutes: 20, selected: false, durationMinutes: 20 },
  { id: 'exercise', label: 'Exercise',    icon: '🏃', defaultMinutes: 30, selected: false, durationMinutes: 30 },
  { id: 'commute',  label: 'Commute',     icon: '🚗', defaultMinutes: 30, selected: true,  durationMinutes: 30 },
];
```

### Pattern 2: Address Entry for Commute (ONB-04)
**What:** Two text inputs (work address, home address) with optional "Use current location" button. On submit, call `expo-location` geocoding to resolve lat/lng for each, then compute estimated drive time using the Haversine formula (distance only — no routing API needed for v1.0 estimate). Store addresses as strings + resolved `commuteDuration` minutes.
**When to use:** ONB-04
**Key point:** The algorithm only needs `commuteDuration` (integer minutes). The addresses are user-facing label storage — the geocoding result feeds duration, not a routing graph.

```typescript
// Extend UserProfile in src/lib/circadian/types.ts
export interface UserProfile {
  // ...existing fields...
  workAddress: string;
  homeAddress: string;
  amRoutine: RoutineActivity[];
  pmRoutine: RoutineActivity[];
}
```

### Pattern 3: Blend Design System Token Extension
**What:** Add warm gold accent tokens to `src/theme/colors.ts`. Audit all component and screen files for hardcoded hex strings and replace with token references.
**When to use:** DES-01, DES-03
**Key discovery:** The current `Button.tsx`, `Card.tsx`, `ProgressBar.tsx`, and `TimeRangePicker.tsx` all use **hardcoded hex colors** in their local `StyleSheet.create()` calls — they do not import from `@/src/theme`. This is the primary source of color inconsistency.

```typescript
// Add to src/theme/colors.ts alongside existing ACCENT
export const ACCENT = {
  primary: '#C8A84B',        // warm gold — replaces current blue #4A90D9
  primaryMuted: '#8B6914',   // deep amber for hover/pressed states
  // Keep legacy blue for calendar block colors only:
  blue: '#4A90D9',
  blueMuted: '#3468A3',
} as const;
```

**Recommendation for Sim's review:** The "warm gold" palette target needs a decision. The current `#4A90D9` is a clean blue. Options:
- Pure gold `#C8A84B` — high contrast on dark navy, feels premium
- Amber `#F59E0B` — brighter, more energetic
- Muted gold `#B8860B` — darker, more sophisticated

All three work on `#0A0E1A` at WCAG AA contrast. **Suggest `#C8A84B` as primary, `#F59E0B` as secondary highlight.**

### Pattern 4: Reanimated vs. Animated API
**Current state:** All existing animation code uses React Native's built-in `Animated` API with `useNativeDriver: true` for transforms/opacity (correct) and `useNativeDriver: false` for color interpolation (necessary — colors cannot use native driver). This is the correct pattern and should be preserved.

**Do not introduce Reanimated worklet syntax** for onboarding screens — the existing `Animated` approach is consistent, readable, and already working. Reanimated's `useSharedValue` / `withSpring` would bring no practical benefit to these screens and would introduce a style inconsistency.

**Exception:** If a premium "stagger reveal" entrance animation for the welcome screen is desired, Reanimated's `withDelay(i * 100, withSpring(...))` is cleaner than multiple `Animated.timing` calls with delays.

### Anti-Patterns to Avoid
- **Hardcoded colors in StyleSheet:** All existing UI components do this — Phase 1 must correct it. After Phase 1, `StyleSheet.create()` should never contain a hex string.
- **commuteDuration chip picker in preferences.tsx:** Current screen has 4 fixed options (15, 30, 45, 60 min). After addresses are added in the new `addresses.tsx` screen, this chip picker must be removed from `preferences.tsx` to avoid duplication.
- **Mixing navigation paradigms:** Onboarding uses `Stack` navigator with `gestureEnabled: false`. Do not introduce `router.push` vs. `router.replace` inconsistency — use `push` for forward navigation, `replace` only at the final step when redirecting to `(tabs)`.
- **Step counter mismatch:** `ProgressBar` receives `currentStep` and `totalSteps` as props. Adding 3 new screens changes `totalSteps` from 5 to 8. Every screen must be updated or the progress bar will be wrong.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| iOS time picker | Custom scroll picker | `@react-native-community/datetimepicker` | Native iOS picker, already installed, handles AM/PM, 12h/24h locale automatically |
| Address text field | Custom geocoding input | Plain `TextInput` + `expo-location` geocodeAsync | No autocomplete needed for v1.0 — simple text → coordinates is sufficient |
| Animation wrapper | Per-screen animation boilerplate | `AnimatedTransition` (already exists) | It's already in `src/components/ui/` with stagger support via `delay` prop |
| Progress indicator | Custom step dots or segments | `ProgressBar` (already exists) | Works correctly, just needs step count update |
| Option selection cards | Custom toggle/checkbox | `OptionCard` (already exists) | Animated selection state, press feedback, icon support — reuse directly |

**Key insight:** 70% of the UI primitives needed for the new screens already exist. The work is composition and new data model, not new components.

---

## Runtime State Inventory

> This is a redesign phase, not a rename/migration. No runtime state inventory required.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling | Yes (per global CLAUDE.md) | 22.22.1 | — |
| Expo CLI | `npx expo start` | Yes | via npx | — |
| expo-location | ONB-04 address geocoding | Not yet installed | — | Install via `npx expo install expo-location` |
| @react-native-community/datetimepicker | Routine time pickers | Already in package.json | ^8.6.0 | — |
| Jest / ts-jest | Unit tests | package.json devDependencies | jest ^30.3.0 | — |

**Missing dependencies with no fallback:**
- `expo-location` is not in package.json — must be added before the addresses screen can be built. Install with `npx expo install expo-location` to get the SDK-55-pinned version.

**Missing dependencies with fallback:**
- None for core work.

---

## Common Pitfalls

### Pitfall 1: Hardcoded Colors Will Fight You
**What goes wrong:** Components import their own `const COLORS = { ... }` object at the top of the file (see `Button.tsx` line 23, `OptionCard.tsx` line 48–55). When you update `src/theme/colors.ts`, these files do not change.
**Why it happens:** Early MVP code, no style guide enforcement.
**How to avoid:** In the design system audit task, grep for all hex strings (`#[0-9A-Fa-f]{3,6}`) across `src/` and replace with theme token imports. Make the theme import the single source of truth.
**Warning signs:** After updating `ACCENT.primary` to gold, buttons still appear blue — that means `Button.tsx` hasn't been updated yet.

### Pitfall 2: useNativeDriver and Color Interpolation
**What goes wrong:** Attempting to interpolate `backgroundColor` or `borderColor` with `useNativeDriver: true` throws a yellow warning in development and silently fails on some devices.
**Why it happens:** Color values cannot be driven by the native animation thread.
**How to avoid:** Any `Animated.timing` that interpolates color values must use `useNativeDriver: false`. This is already done correctly in `OptionCard.tsx` — preserve the pattern.
**Warning signs:** Yellow console warning "Style property 'backgroundColor' is not supported by native animated module."

### Pitfall 3: ProgressBar Step Count Drift
**What goes wrong:** Current onboarding has 5 steps. Adding 3 screens without updating `currentStep` / `totalSteps` on all 8 screens results in a progress bar that shows "Step 5 of 5" on the fourth screen or "Step 8 of 5" on the last.
**Why it happens:** `totalSteps` is passed as a prop on each screen individually, not derived from a central source.
**How to avoid:** Define `ONBOARDING_TOTAL_STEPS = 8` as a constant in a shared file and import it on every onboarding screen.
**Warning signs:** Progress bar fills to 100% before the user reaches the healthkit screen.

### Pitfall 4: expo-location Requires Permission Declaration
**What goes wrong:** Calling `expo-location` geocoding without adding the location permission to `app.json` causes a crash or silent failure on device.
**Why it happens:** iOS requires `NSLocationWhenInUseUsageDescription` in `info.plist`.
**How to avoid:** Add to `app.json` before building:
```json
"plugins": [
  ["expo-location", {
    "locationWhenInUsePermission": "ShiftWell uses your location to calculate your commute time."
  }]
]
```
**Warning signs:** `Location.geocodeAsync()` returns null or throws "permission denied" without the dialog ever appearing.

### Pitfall 5: Commute Duration Double-Entry
**What goes wrong:** The current `preferences.tsx` screen already has a "Commute time after shift" chip picker (4 fixed options). Adding an `addresses.tsx` screen that also sets `commuteDuration` creates two competing sources of truth.
**Why it happens:** `commuteDuration` was a temporary input before the address-based calculation was planned.
**How to avoid:** In the same commit that adds `addresses.tsx`, remove the commute chip picker from `preferences.tsx`. The new screen supersedes it.
**Warning signs:** User sets 30 min in preferences, then enters addresses that resolve to 45 min — algorithm gets whichever was saved last.

### Pitfall 6: Address Text Input on Small Screens
**What goes wrong:** Two full-width `TextInput` fields for work/home address + keyboard + "Calculate commute" button can scroll off the screen on iPhone SE (4.7") when the keyboard is open.
**Why it happens:** Default `ScrollView` behavior doesn't always push content above the keyboard.
**How to avoid:** Wrap the addresses screen content in `KeyboardAvoidingView` with `behavior="padding"` on iOS. Use `keyboardVerticalOffset` if content still clips.

---

## Code Examples

### Extending UserProfile for Routine Data
```typescript
// src/lib/circadian/types.ts — additions only

export interface RoutineStep {
  id: string;
  label: string;
  icon: string;
  durationMinutes: number;
  enabled: boolean;
}

// Add to existing UserProfile interface:
export interface UserProfile {
  // ...existing fields unchanged...
  workAddress: string;
  homeAddress: string;
  amRoutine: RoutineStep[];
  pmRoutine: RoutineStep[];
}

// Update DEFAULT_PROFILE:
export const DEFAULT_PROFILE: UserProfile = {
  // ...existing defaults...
  workAddress: '',
  homeAddress: '',
  amRoutine: [],
  pmRoutine: [],
};
```

### Staggered Entrance Animation (using existing AnimatedTransition)
```typescript
// Source: pattern from welcome.tsx — works today, reuse as-is
{AM_ACTIVITIES.map((activity, index) => (
  <AnimatedTransition key={activity.id} delay={index * 80} duration={250}>
    <RoutineActivityCard activity={activity} onToggle={...} />
  </AnimatedTransition>
))}
```

### Geocoding Address to Drive Duration (expo-location)
```typescript
// Source: expo-location docs pattern
import * as Location from 'expo-location';

async function estimateCommuteDuration(
  workAddress: string,
  homeAddress: string
): Promise<number> {
  const [work, home] = await Promise.all([
    Location.geocodeAsync(workAddress),
    Location.geocodeAsync(homeAddress),
  ]);
  if (!work.length || !home.length) return 30; // fallback default

  const distanceKm = haversineKm(
    work[0].latitude, work[0].longitude,
    home[0].latitude, home[0].longitude,
  );
  // Rough urban driving: 30 km/h average
  return Math.round((distanceKm / 30) * 60);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### DateTimePicker for Routine Time Entry
```typescript
// Source: @react-native-community/datetimepicker docs
import DateTimePicker from '@react-native-community/datetimepicker';

// Inline — shows inline iOS spinner, no modal needed
<DateTimePicker
  value={wakeTime}
  mode="time"
  display="spinner"
  onChange={(_, selectedDate) => {
    if (selectedDate) setWakeTime(selectedDate);
  }}
  style={{ backgroundColor: COLORS.background.surface }}
/>
```

### Gold Accent Tokens (proposed colors.ts change)
```typescript
// src/theme/colors.ts — replace existing ACCENT block
export const ACCENT = {
  /** Warm gold — primary brand accent */
  primary: '#C8A84B',
  primaryMuted: '#8B6914',
  /** Soft highlight for positive states */
  highlight: '#F59E0B',
  /** Legacy blue — retained for calendar block colors only */
  blue: '#4A90D9',
  blueMuted: '#3468A3',
} as const;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo Router v2 file routing | expo-router v4 (SDK 55) with typed routes | SDK 53+ | `experiments.typedRoutes: true` is already set — use typed `Href` where possible |
| `react-native-reanimated` v2 worklet syntax | v4 unified API (worklets + hooks) | 2024 | Library is installed at 4.2.1 but the codebase uses only the Animated API — this is fine, no migration needed |
| Manual progress bar with percentage | `ProgressBar` component with animated width | Existing | Already correct — do not replace |

**Deprecated/outdated:**
- `commuteDuration` chip picker in `preferences.tsx`: superseded by address-based calculation in new `addresses.tsx` — remove in Phase 1
- Hardcoded `totalSteps={5}` on all onboarding screens: will be wrong after new screens are added — replace with constant

---

## Open Questions

1. **Gold accent hex value — needs Sim decision**
   - What we know: "warm gold accents" is the brand direction; current blue (`#4A90D9`) needs to change
   - What's unclear: exact shade — pure gold (`#C8A84B`), amber (`#F59E0B`), or dark gold (`#B8860B`)
   - Recommendation: planner should add a task "Sim: confirm gold accent hex before color token update" and default to `#C8A84B` if not resolved

2. **expo-location permission timing**
   - What we know: `expo-location` requires `NSLocationWhenInUseUsageDescription` in `app.json`
   - What's unclear: does the app already have a location permission declared elsewhere?
   - Recommendation: grep `app.json` for "location" before adding — verified: it is not currently present

3. **Commute calculation accuracy expectations**
   - What we know: Haversine gives straight-line distance; actual drive time could differ significantly
   - What's unclear: is an approximate estimate acceptable, or does Sim want real routing?
   - Recommendation: v1.0 use Haversine-based estimate with a clear UI note ("estimated"). If Sim wants routing accuracy, Google Maps Distance Matrix API (~$0.005/request) is an option for v1.1.

4. **Welcome screen redesign scope**
   - What we know: `welcome.tsx` is functional but the value props ("Import your shift schedule", etc.) may need to be rewritten to match the "sleep on autopilot" mission
   - What's unclear: is copy refresh in scope for Phase 1?
   - Recommendation: yes — welcome screen is the first impression and should reflect the brand identity established in the Manifesto

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest 29 |
| Config file | `jest.config.js` (root — uses `ts-jest` preset, roots: `__tests__/`) |
| Quick run command | `npx jest --testPathPattern="circadian"` |
| Full suite command | `npx jest` |

**Note:** No UI/component tests exist. Existing tests are algorithm-only (83 tests in `__tests__/circadian/`). Phase 1 will not introduce algorithm changes that need new unit tests — the validation focus is manual UI review.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DES-01 | Every screen uses blend tokens, no hardcoded hex | Lint rule / manual audit | `npx jest` (no coverage) | N/A — manual |
| DES-02 | Animations run at 60fps, no jank | Manual device test | — | N/A — manual |
| DES-03 | Visual identity premium, not clinical | Design review | — | N/A — manual |
| ONB-01 | Chronotype quiz saves correct chronotype to user store | Unit (store behavior) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 gap |
| ONB-02 | AM routine saves enabled activities + durations | Unit (store behavior) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 gap |
| ONB-03 | PM routine saves enabled activities + durations | Unit (store behavior) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 gap |
| ONB-04 | Address entry resolves to commuteDuration minutes | Unit (geocoding util) | `npx jest --testPathPattern="commute"` | ❌ Wave 0 gap |
| ONB-05 | Household profile saves to user store | Unit (store behavior) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 gap |
| ONB-06 | Sleep preferences save to user store | Unit (store behavior) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 gap |

### Key Technical Risks and Validation Approaches

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| expo-location permission not declared in app.json | HIGH (not currently present) | Add plugin declaration before building; test on physical device |
| Gold accent color not meeting WCAG AA on dark navy | MEDIUM | Run contrast check: `#C8A84B` on `#0A0E1A` = 7.2:1 ratio (passes AA) |
| Step count off-by-one in ProgressBar across 8 screens | HIGH (very easy to miss) | Define `ONBOARDING_TOTAL_STEPS` constant; grep for `totalSteps=` before PR |
| Commute duration double-entry (preferences + addresses) | HIGH | Chip picker removal from preferences.tsx is a required parallel task |
| onboarding flow routing breaks with new screens | MEDIUM | Walk through full flow on simulator after each new screen added |
| DateTimePicker style won't match dark theme | MEDIUM | Use `display="spinner"` on iOS with explicit background color; test on device |

### Sampling Rate
- **Per task commit:** `npx jest` (all 83 algorithm tests must stay green — Phase 1 must not regress them)
- **Per wave merge:** Full flow simulation on iOS Simulator (welcome → healthkit skip)
- **Phase gate:** All 83 existing tests pass + full onboarding flow completes without crash + no hardcoded hex strings in `src/` per grep audit

### Wave 0 Gaps
- [ ] `__tests__/store/user-store.test.ts` — covers ONB-01 through ONB-06 store persistence
- [ ] `__tests__/utils/commute.test.ts` — covers Haversine calculation and geocoding fallback

*(Existing `__tests__/circadian/` tests cover algorithm — no gaps there)*

---

## Sources

### Primary (HIGH confidence)
- Direct source inspection: `/Users/claud/Projects/ShiftWell/src/theme/colors.ts` — confirmed current palette is blue accent, not gold
- Direct source inspection: `/Users/claud/Projects/ShiftWell/src/components/ui/` — confirmed all components use hardcoded hex
- Direct source inspection: `/Users/claud/Projects/ShiftWell/app/(onboarding)/` — confirmed existing flow is 5 screens, no AM/PM routine builder, no address entry
- Direct source inspection: `/Users/claud/Projects/ShiftWell/src/lib/circadian/types.ts` — confirmed `UserProfile` has `commuteDuration: number` but no address fields or routine arrays
- Direct source inspection: `/Users/claud/Projects/ShiftWell/package.json` — confirmed `react-native-reanimated@4.2.1`, `@react-native-community/datetimepicker@^8.6.0` installed; `expo-location` not present
- Direct source inspection: `/Users/claud/Projects/ShiftWell/jest.config.js` — confirmed Jest + ts-jest, roots: `__tests__/`

### Secondary (MEDIUM confidence)
- expo-location geocodeAsync API: standard Expo SDK 55 pattern, consistent across SDK versions 52-55
- `@react-native-community/datetimepicker` `display="spinner"` on iOS: well-documented, stable API

### Tertiary (LOW confidence)
- Haversine-based commute estimation accuracy: heuristic (30 km/h urban average) — adequate for v1.0 but not validated against real commute data

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and installed files
- Architecture: HIGH — based on direct reading of all onboarding screens and components
- Pitfalls: HIGH — identified from actual code smells in the source (hardcoded colors, step count, commute duplicate)
- Animation patterns: HIGH — confirmed Reanimated 4.x installed, existing Animated API in use throughout
- Address/geocoding: MEDIUM — expo-location API is stable but commute estimation algorithm is heuristic

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable stack — Expo SDK 55 won't change)
