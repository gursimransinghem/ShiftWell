# ShiftWell V6 UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ShiftWell's UI from functional incremental build to premium V6 design — Recovery Day pill, hero score with sparkline, unified countdowns, spine timeline, animated gradient mesh, floating nav, plus 7 elevate features.

**Architecture:** Wave-based execution (7 waves, 25 tasks). Each wave unlocks the next. Tasks within a wave are parallelizable. Theme tokens → Infrastructure components → Core components → Screen assembly → Night Sky → Elevate features → Verification.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript 5.9, react-native-reanimated 4.2.1, react-native-svg 15.15, Zustand 5, expo-haptics (new), expo-av (new)

**Design Spec:** `docs/design/2026-04-05-ui-redesign/SPEC.md`
**Build Target Mockup:** `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html`

---

## File Map

### New Files
| File | Purpose |
|------|---------|
| `src/components/today/StatusPill.tsx` | V3 boxed status pill (recovery/shift/wind-down) |
| `src/components/today/HeroScore.tsx` | Centered SVG ring + sparkline + breathing glow |
| `src/components/today/CountdownRow.tsx` | Unified 3-cell countdown |
| `src/components/today/CollapsedPast.tsx` | Collapsed past events with expand |
| `src/components/today/InsightLine.tsx` | Bottom-positioned expandable insight |
| `src/components/today/WindDownView.tsx` | Wind-down state: large countdown + checklist |
| `src/components/ui/GradientMeshBackground.tsx` | Animated 3-orb ambient background |
| `src/components/ui/SkeletonLoader.tsx` | Shimmer loading placeholders |
| `src/components/navigation/FloatingTabBar.tsx` | Glassmorphic floating tab bar |
| `src/components/providers/AdaptiveColorProvider.tsx` | Time-based white point shift |
| `src/components/night-sky/FireflyParticle.tsx` | Animated gold particles |
| `src/components/night-sky/NightSkyTransition.tsx` | Cinematic metamorphosis transition |
| `src/lib/haptics/haptic-service.ts` | Narrative haptic patterns |
| `src/lib/audio/sound-service.ts` | Sound effect playback |
| `app/(tabs)/profile.tsx` | Profile screen (replaces Settings) |

### Modified Files
| File | Changes |
|------|---------|
| `src/theme/colors.ts` | Warm backgrounds, add text.muted/dim tokens |
| `src/theme/typography.ts` | Add heroNumber, countdownValue, timestamp styles |
| `src/theme/spacing.ts` | Add V6-specific spacing constants |
| `src/components/today/TimelineEvent.tsx` | Narrow timestamps, accent bars, reanimated migration |
| `src/components/today/index.ts` | Export new components |
| `src/components/ui/Button.tsx` | Migrate to reanimated |
| `src/components/ui/AnimatedTransition.tsx` | Migrate to reanimated |
| `src/components/night-sky/NightSkyOverlay.tsx` | Fireflies, enhanced stars, structured cards |
| `src/components/night-sky/StarParticles.tsx` | 3 speed tiers (2s/3s/5s) |
| `src/components/night-sky/RechargeArc.tsx` | Purple glow, 60s rotation |
| `app/(tabs)/index.tsx` | Full Today screen rewrite (5 states) |
| `app/(tabs)/schedule.tsx` | Week strip, icon shift cards, gradient FAB |
| `app/(tabs)/_layout.tsx` | FloatingTabBar integration, Profile route |
| `app/(onboarding)/welcome.tsx` | Swipeable cards, gradient CTA |
| `app/_layout.tsx` | AdaptiveColorProvider wrapper |

---

## Wave 0: Dependencies (sequential, ~10 min)

### Task 0.1: Install Dependencies + Create Service Stubs

**Files:**
- Modify: `package.json`
- Create: `src/lib/haptics/haptic-service.ts`
- Create: `src/lib/audio/sound-service.ts`

- [ ] **Step 1: Install expo-haptics and expo-av**

```bash
cd /Users/claud/Projects/ShiftWell
npx expo install expo-haptics expo-av
```

- [ ] **Step 2: Create haptic service stub**

```typescript
// src/lib/haptics/haptic-service.ts
import * as Haptics from 'expo-haptics';

export async function tapLight() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function tapSuccess() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function scoreViewHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function windDownStartHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
}

export async function countdownZeroHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export async function scoreHighHaptic() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
}
```

- [ ] **Step 3: Create sound service stub**

```typescript
// src/lib/audio/sound-service.ts
import { Audio } from 'expo-av';

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

// Stubs - wire up audio files later
export async function playCountdownComplete() {
  if (!soundEnabled) return;
  // TODO: load and play countdown-complete sound
}

export async function playChecklistDone() {
  if (!soundEnabled) return;
  // TODO: load and play checklist-done sound
}

export async function playNightSkyEnter() {
  if (!soundEnabled) return;
  // TODO: load and play night-sky-enter sound
}
```

- [ ] **Step 4: Verify tests pass**

```bash
npm test 2>&1 | tail -5
```
Expected: All 172 tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/haptics/ src/lib/audio/
git commit -m "chore: install expo-haptics + expo-av, create service stubs"
```

---

## Wave 1: Theme Foundation (parallel, ~15 min)

### Task 1.1: Update Color Tokens

**Files:**
- Modify: `src/theme/colors.ts`

- [ ] **Step 1: Read current colors.ts**

Read `src/theme/colors.ts` to understand exact current token structure.

- [ ] **Step 2: Update background colors and add new text tiers**

Update `BACKGROUND.primary` from `#0A0E1A` to `#0B0D16`.
Update `BACKGROUND.surface` from `#141929` to `#151A2A`.

Add new text tokens while preserving existing ones for backward compatibility:
- `TEXT.secondary` stays `#9CA3AF` (widely used, matches spec's `text.tertiary`)
- Add `TEXT.secondaryBright: '#D1D5DB'` (spec's `text.secondary`)
- `TEXT.tertiary` stays `#6B7280` (matches spec's `text.muted`)
- Add `TEXT.muted: '#6B7280'` (alias for clarity)
- Add `TEXT.dim: '#4B5563'` (new)

Update `BORDER.subtle` from `'#171D2E'` to `'rgba(255,255,255,0.06)'` — but if React Native requires hex, use `'#0F0F0F10'` or keep as-is and override in components.

- [ ] **Step 3: Verify tests pass**

```bash
npm test 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/theme/colors.ts
git commit -m "style(theme): warm backgrounds, add text.muted/dim/secondaryBright tokens"
```

### Task 1.2: Update Typography Tokens

**Files:**
- Modify: `src/theme/typography.ts`

- [ ] **Step 1: Read current typography.ts**

Read `src/theme/typography.ts` for current style definitions.

- [ ] **Step 2: Add V6 typography styles**

Add these new exported styles (following existing pattern):

```typescript
export const heroNumber: TextStyle = {
  fontSize: 36,
  fontWeight: '700',
};

export const screenHeading: TextStyle = {
  fontSize: 28,
  fontWeight: '700',
  letterSpacing: -0.5,
};

export const countdownValue: TextStyle = {
  fontSize: 22,
  fontWeight: '700',
  letterSpacing: -0.5,
};

export const cardTitle: TextStyle = {
  fontSize: 14,
  fontWeight: '600',
};

export const meta: TextStyle = {
  fontSize: 11,
  fontWeight: '500',
};

export const sectionLabel: TextStyle = {
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase',
};

export const timestamp: TextStyle = {
  fontSize: 9,
  fontWeight: '500',
  letterSpacing: -0.3,
};

export const captionSmall: TextStyle = {
  fontSize: 8,
  fontWeight: '500',
};
```

Add to `FONT_SIZE` if missing: `8`, `9`, `10`.

- [ ] **Step 3: Update index.ts exports**

Ensure `src/theme/index.ts` re-exports the new styles.

- [ ] **Step 4: Commit**

```bash
git add src/theme/
git commit -m "style(theme): add V6 typography styles (heroNumber, countdown, timestamp, etc.)"
```

### Task 1.3: Update Spacing Tokens

**Files:**
- Modify: `src/theme/spacing.ts`

- [ ] **Step 1: Add V6 layout constants**

```typescript
// Add to spacing.ts
export const V6_LAYOUT = {
  headerToStatus: 16,
  statusToHero: 20,
  heroToCountdown: 16,
  countdownToTimeline: 16,
  timelineEventGap: 4,
  screenToTab: 12,
  timeColumn: 32,    // narrow timestamps
  spineColumn: 18,
  accentBar: 3.5,
} as const;

// Add to RADIUS
export const V6_RADIUS = {
  pill: 14,
  countdown: 18,
  tabBar: 22,
  timelineCard: 12,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/spacing.ts
git commit -m "style(theme): add V6 layout spacing and radius constants"
```

---

## Wave 2: Infrastructure Components (parallel, ~30 min)

### Task 2.1: Create GradientMeshBackground

**Files:**
- Create: `src/components/ui/GradientMeshBackground.tsx`

- [ ] **Step 1: Read existing RechargeArc.tsx for SVG animation pattern**

Read `src/components/night-sky/RechargeArc.tsx` — it demonstrates the `react-native-svg` + reanimated pattern.

- [ ] **Step 2: Implement GradientMeshBackground**

Component renders 3 animated SVG radial gradients (purple, gold, green) that drift on a 20s cycle. Uses `useSharedValue` + `withRepeat(withTiming())` to animate `cx`/`cy` positions of each gradient ellipse. Apply noise texture via a small repeated image or dithered pattern overlay.

Key implementation details:
- Uses `react-native-svg`: `Svg`, `Defs`, `RadialGradient`, `Stop`, `Rect`
- 3 `RadialGradient` elements with animated center positions
- Each gradient: `<Stop offset="0" stopColor="rgba(123,97,255,0.06)" />` to `<Stop offset="1" stopColor="transparent" />`
- Full-screen absolute positioned, `pointerEvents="none"`
- Props: `{ children: ReactNode }` — wraps screen content

- [ ] **Step 3: Test in isolation**

Temporarily render `<GradientMeshBackground />` in Today screen to verify animation works. Visual check only.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GradientMeshBackground.tsx
git commit -m "feat(ui): add animated gradient mesh background"
```

### Task 2.2: Create FloatingTabBar

**Files:**
- Create: `src/components/navigation/FloatingTabBar.tsx`

- [ ] **Step 1: Read current tab layout**

Read `app/(tabs)/_layout.tsx` for the current Expo Router `<Tabs>` configuration and props shape.

- [ ] **Step 2: Implement FloatingTabBar**

Custom tab bar receiving Expo Router's `BottomTabBarProps`. Renders absolutely positioned at bottom with glassmorphic background.

Key implementation details:
- Uses `expo-blur` `BlurView` for backdrop blur (install if needed: `npx expo install expo-blur`)
- Position absolute, bottom 12px, left/right 14px, borderRadius 22
- Background: `rgba(11,13,22,0.92)`, blur intensity 16
- Border: 1px `rgba(255,255,255,0.05)`, boxShadow via `elevation` + `shadowColor`
- 3 tabs rendered from `state.routes` — use SF Symbols via `@expo/vector-icons` Ionicons or custom SVG
- Active tab: `text.secondaryBright` (#D1D5DB), gold glow shadow on icon
- Inactive: `text.dim` (#4B5563)
- Tap triggers `tapLight()` from haptic service
- Adds bottom safe area padding for home indicator

- [ ] **Step 3: Verify it renders correctly with 3 tabs**

- [ ] **Step 4: Commit**

```bash
git add src/components/navigation/
git commit -m "feat(nav): add floating glassmorphic tab bar"
```

### Task 2.3: Create SkeletonLoader

**Files:**
- Create: `src/components/ui/SkeletonLoader.tsx`

- [ ] **Step 1: Implement base shimmer + variants**

Base: Animated linear gradient sweep (reanimated `useSharedValue` + `translateX` loop).

Export variants matching V6 sections:
- `HeroSkeleton` — circular placeholder (96px) + 2 text lines below
- `CountdownSkeleton` — 3-cell row with rounded rects
- `TimelineSkeleton` — 3 rows with dot + card placeholders
- `InsightSkeleton` — single row placeholder

All use `BACKGROUND.surface` base color with `BACKGROUND.elevated` shimmer highlight.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SkeletonLoader.tsx
git commit -m "feat(ui): add skeleton loader variants for zero-state excellence"
```

### Task 2.4: Create AdaptiveColorProvider

**Files:**
- Create: `src/components/providers/AdaptiveColorProvider.tsx`

- [ ] **Step 1: Implement provider**

React Context that provides time-based white point color.

```typescript
// Key logic:
const hour = new Date().getHours();
// 6 AM = cool (#F8FAFF), 10 PM = warm (#FFF5E6)
// Linear interpolation between 6-22 range
const t = Math.max(0, Math.min(1, (hour - 6) / 16));
const adaptiveWhite = interpolateColor(t, [0, 1], ['#F8FAFF', '#FFF5E6']);
```

Export `useAdaptiveColor()` hook. Update every 60 seconds via `useEffect` interval.

- [ ] **Step 2: Commit**

```bash
git add src/components/providers/
git commit -m "feat(theme): add adaptive color temperature provider"
```

---

## Wave 3: Core Today Components (parallel, ~60 min)

### Task 3.1: Create StatusPill

**Files:**
- Create: `src/components/today/StatusPill.tsx`

- [ ] **Step 1: Implement StatusPill**

V3 boxed style with state-dependent colors. Read the spec section "Status Pill (V3 boxed style)" for exact dimensions.

Props:
```typescript
interface StatusPillProps {
  state: 'recovery' | 'on-shift' | 'wind-down' | 'empty';
  primaryText: string;
  secondaryText: string;
}
```

State color mapping:
- recovery: green (#34D399), icon 🌿
- on-shift: orange (#FF9F43), icon 🏥
- wind-down: indigo (#818CF8), icon 🌙

Animated glow pulse: `boxShadow` via reanimated (4s loop, `rgba(stateColor, 0.06)`).

- [ ] **Step 2: Commit**

```bash
git add src/components/today/StatusPill.tsx
git commit -m "feat(today): add StatusPill component with state variants"
```

### Task 3.2: Create HeroScore

**Files:**
- Create: `src/components/today/HeroScore.tsx`

- [ ] **Step 1: Read RechargeArc.tsx for SVG ring pattern**

Read `src/components/night-sky/RechargeArc.tsx` — reuse the animated SVG circle pattern.

- [ ] **Step 2: Implement HeroScore**

Props:
```typescript
interface HeroScoreProps {
  score: number;           // 0-100
  sleepHours: number;      // actual hours slept
  targetHours: number;     // planned hours
  weeklyScores: number[];  // last 7 days for sparkline
  trend: number;           // +/- points from yesterday
  scrollOffset?: SharedValue<number>;  // for parallax (Wave 6)
}
```

Key sub-elements:
- SVG ring (104px, 3px border) with animated `strokeDashoffset` proportional to score
- Ambient glow: absolute-positioned View with radial gradient background, 4s opacity pulse (Living Score Ring — the "breathing" biofeedback)
- Sparkline: 7 View bars, today's bar is `#34D399`, others `rgba(52,211,153,0.25)`
- Label + trend text below

- [ ] **Step 3: Commit**

```bash
git add src/components/today/HeroScore.tsx
git commit -m "feat(today): add HeroScore with SVG ring, sparkline, breathing glow"
```

### Task 3.3: Create CountdownRow

**Files:**
- Create: `src/components/today/CountdownRow.tsx`

- [ ] **Step 1: Implement CountdownRow**

Props:
```typescript
interface CountdownCell {
  emoji: string;
  value: string;
  label: string;
  color: string;
  isActive?: boolean;
}

interface CountdownRowProps {
  cells: CountdownCell[];
}
```

Single container: flexDirection row, borderRadius 18, border 1px `rgba(255,255,255,0.06)`, overflow hidden. Cells separated by 1px left border. Active cell gets gradient background. Values use `countdownValue` typography with `fontVariantNumeric: ['tabular-nums']` (React Native: `fontVariant: ['tabular-nums']`).

- [ ] **Step 2: Commit**

```bash
git add src/components/today/CountdownRow.tsx
git commit -m "feat(today): add unified CountdownRow component"
```

### Task 3.4: Refactor TimelineEvent

**Files:**
- Modify: `src/components/today/TimelineEvent.tsx`

- [ ] **Step 1: Read current TimelineEvent.tsx (390 lines)**

Read the full file to understand current props, rendering, and animation patterns.

- [ ] **Step 2: Refactor to V6 spec**

Key changes:
- Time column: 32px wide (from 48px), 10px font (from 13px), right-aligned, `fontVariant: ['tabular-nums']`
- Spine column: 18px wide (from 24px), 1.5px line width
- Accent bar: 3.5px wide, left side of card, colored per event type
- Card: borderRadius 12 (from 14), padding 12px vert / 14px horiz
- Card title: 15px weight 600 (from 15px — keep), with emoji prefix
- Card meta: 12px `text.muted`
- Inline countdown: 15px weight 700, right-aligned, colored per type
- Migrate ALL `Animated` (legacy) to `react-native-reanimated`:
  - Replace `useRef(new Animated.Value())` → `useSharedValue()`
  - Replace `Animated.timing` → `withTiming`
  - Replace `Animated.loop(Animated.sequence(...))` → `withRepeat(withSequence(...))`
  - Replace `Animated.View` (RN) → `Animated.View` (reanimated)
  - Replace `useNativeDriver` pattern → reanimated automatically uses native driver
- Active dot: box-shadow breathe via `useAnimatedStyle` returning `shadowRadius` oscillation

- [ ] **Step 3: Verify tests pass**

```bash
npm test 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/today/TimelineEvent.tsx
git commit -m "refactor(today): TimelineEvent — narrow timestamps, accent bars, reanimated migration"
```

### Task 3.5: Create CollapsedPast

**Files:**
- Create: `src/components/today/CollapsedPast.tsx`

- [ ] **Step 1: Implement CollapsedPast**

Props:
```typescript
interface CollapsedPastProps {
  events: PlanBlock[];      // past events to represent
  onExpand: () => void;     // tap handler
  isExpanded: boolean;
}
```

Renders: empty time column (32px) + spine column (18px) + row of colored dots (6px, 40% opacity) + "N completed" text + chevron ▼. When expanded, renders full `TimelineEvent` list at 35% opacity below (animated slide-down via reanimated `withTiming` on `maxHeight`).

- [ ] **Step 2: Commit**

```bash
git add src/components/today/CollapsedPast.tsx
git commit -m "feat(today): add CollapsedPast with expandable past events"
```

### Task 3.6: Create InsightLine

**Files:**
- Create: `src/components/today/InsightLine.tsx`

- [ ] **Step 1: Read InsightBanner.tsx for insight content logic**

Read `src/components/today/InsightBanner.tsx` — extract the `getInsightContent()` logic (DayType-based message generation).

- [ ] **Step 2: Implement InsightLine**

Bottom-positioned insight with expand/collapse. Reuses insight content generation from InsightBanner but with simplified UI:
- Collapsed: flex row, 💡 emoji + single-line text, border-top separator
- Expanded: slide-down showing 2-3 additional insights (300ms ease-out)
- Color adapts per state (gold default, orange during shift, indigo during wind-down)

Props:
```typescript
interface InsightLineProps {
  dayType: DayType;
  stats: PlanStats;
  profile: UserProfile;
  isExpanded: boolean;
  onToggle: () => void;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/today/InsightLine.tsx
git commit -m "feat(today): add InsightLine component (bottom-positioned)"
```

### Task 3.7: Create WindDownView

**Files:**
- Create: `src/components/today/WindDownView.tsx`

- [ ] **Step 1: Implement WindDownView**

Standalone view for the wind-down Today state. Contains:
- Large centered countdown (52px, `#818CF8`, text-shadow glow)
- "until bedtime" label (12px, `text.muted`)
- Wind-down checklist (4 items): dim lights, screens off, set alarm, cool room
- Checklist items: glass cards with ✅/⬜ toggle, strike-through when complete
- Insight at bottom (indigo-tinted)
- Background: `linear-gradient(180deg, #0B0D16, #0D0F22)` via two-color View

Props:
```typescript
interface WindDownViewProps {
  minutesUntilBedtime: number;
  sleepTime: Date;
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  insight: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/today/WindDownView.tsx
git commit -m "feat(today): add WindDownView with countdown + checklist"
```

### Task 3.8: Migrate UI primitives to reanimated

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/AnimatedTransition.tsx`

- [ ] **Step 1: Read Button.tsx and AnimatedTransition.tsx**

- [ ] **Step 2: Migrate Button.tsx**

Replace `import { Animated } from 'react-native'` with reanimated imports. Convert `scaleAnim` from `useRef(new Animated.Value(1))` to `useSharedValue(1)`. Use `withSpring` for press scale (0.97, damping 15, stiffness 150). Use `useAnimatedStyle` to drive scale transform.

- [ ] **Step 3: Migrate AnimatedTransition.tsx**

Replace legacy entrance animation with reanimated `entering` prop: `FadeIn.delay(delay).duration(duration)` from `react-native-reanimated`.

- [ ] **Step 4: Verify tests pass**

```bash
npm test 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/AnimatedTransition.tsx
git commit -m "refactor(ui): migrate Button + AnimatedTransition to reanimated"
```

### Task 3.9: Update today/index.ts exports

**Files:**
- Modify: `src/components/today/index.ts`

- [ ] **Step 1: Add exports for all new components**

```typescript
export { StatusPill } from './StatusPill';
export { HeroScore } from './HeroScore';
export { CountdownRow } from './CountdownRow';
export { CollapsedPast } from './CollapsedPast';
export { InsightLine } from './InsightLine';
export { WindDownView } from './WindDownView';
// Keep existing exports
export { TimelineEvent } from './TimelineEvent';
export { TipCard } from './TipCard';
export { SchedulePreview } from './SchedulePreview';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/today/index.ts
git commit -m "chore(today): export new V6 components"
```

---

## Wave 4: Screen Assembly (sequential, ~60 min)

### Task 4.1: Rewrite Today Screen

**Files:**
- Modify: `app/(tabs)/index.tsx` (482 lines → rewrite)

- [ ] **Step 1: Read current index.tsx thoroughly**

Read `app/(tabs)/index.tsx`, `src/hooks/useTodayPlan.ts`, `src/hooks/useNightSkyMode.ts`, `src/hooks/useRecoveryScore.ts` to understand all state dependencies.

- [ ] **Step 2: Rewrite Today screen with V6 layout**

Replace the current flat-section layout with the V6 structure. The screen must handle 5 states:

1. **Empty** (no shifts): Centered CTA with gradient button + "Import from calendar" link
2. **Recovery Day**: StatusPill(recovery) → HeroScore → CountdownRow → Timeline (with CollapsedPast) → InsightLine
3. **On Shift**: StatusPill(on-shift) → CountdownRow (shift ends / sleep / target) → InsightLine (warning) → Timeline (after-shift events)
4. **Wind-down**: StatusPill(wind-down) → WindDownView
5. **Night Sky**: NightSkyOverlay (full-screen, already handled)

Wrap content in `GradientMeshBackground`. Add `SkeletonLoader` for loading state. Stagger section entrance animations (100ms intervals via `AnimatedTransition` with increasing delay).

Key state logic (from existing hooks):
- `useTodayPlan()` → `{ isEmpty, todayBlocks, activeBlock, nextBlock, countdowns, currentShift }`
- `useNightSkyMode()` → `{ isActive, minutesUntilSleep, fillFraction, ... }`
- `useRecoveryScore()` → `{ score, insight, trend, dailyScores }`

Determine state:
```typescript
function getTodayState(): 'empty' | 'recovery' | 'on-shift' | 'wind-down' | 'night-sky' {
  if (nightSky.isActive) return 'night-sky';
  if (isEmpty) return 'empty';
  if (nightSky.minutesUntilSleep !== null && nightSky.minutesUntilSleep < windDownLead) return 'wind-down';
  if (currentShift) return 'on-shift';
  return 'recovery';
}
```

- [ ] **Step 3: Verify it renders without crashes**

Run the app: `npx expo start --ios` and check each state can be triggered.

- [ ] **Step 4: Verify tests pass**

```bash
npm test 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat(today): rewrite Today screen with V6 5-state layout"
```

### Task 4.2: Create Profile Screen

**Files:**
- Create: `app/(tabs)/profile.tsx`
- Modify: `app/(tabs)/settings.tsx` (keep as redirect or remove)

- [ ] **Step 1: Read settings.tsx (944 lines)**

Read the full file. Identify which sections map to V6 Profile sections:
- Account → Account section (upgrade, sign out)
- Sync → condensed into Preferences
- Notifications → condensed row ("3 active")
- Profile → Stats header + Preferences
- Import/Export → Data section
- Danger Zone → Account section

- [ ] **Step 2: Create profile.tsx**

New screen with V6 Profile layout:
1. Avatar header: 56px gradient View (purple→gold), name, chronotype + sleep need, plan badge
2. Stats row: 3-cell grid from `useRecoveryScore()` weekly data
3. Preferences section: glass card with condensed settings
4. Data section: export, import, HealthKit status
5. Account section: upgrade (gold), sign out (red)
6. Sound effects toggle (for sound-service)

Wrap in `GradientMeshBackground`. Pull handler functions from `settings.tsx`.

- [ ] **Step 3: Update settings.tsx**

Either delete and update any `router.push('/(tabs)/settings')` references, or keep as a redirect:
```typescript
import { Redirect } from 'expo-router';
export default function Settings() {
  return <Redirect href="/(tabs)/profile" />;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/profile.tsx app/(tabs)/settings.tsx
git commit -m "feat(profile): create Profile screen replacing Settings"
```

### Task 4.3: Update Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Read current _layout.tsx**

- [ ] **Step 2: Integrate FloatingTabBar and Profile route**

```typescript
import { FloatingTabBar } from '@/src/components/navigation/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,  // screens handle own headers
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* Hide old settings route if kept as redirect */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
```

- [ ] **Step 3: Verify tab navigation works**

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat(nav): integrate FloatingTabBar, add Profile route"
```

### Task 4.4: Update Schedule Screen

**Files:**
- Modify: `app/(tabs)/schedule.tsx`

- [ ] **Step 1: Read current schedule.tsx (183 lines)**

- [ ] **Step 2: Add week strip and icon shift cards**

Replace month grid header with horizontal week strip (7 day columns, swipeable via `ScrollView horizontal`). Today highlighted with gold border + `rgba(200,168,75,0.08)` background. Colored dots below dates for shift types.

Update shift cards to glass style: 40px emoji icon in colored background circle, name + time, duration on right.

Update FAB: gradient `linearGradient(135deg, #7B61FF, #C8A84B)`, borderRadius 14.

Wrap in `GradientMeshBackground`.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/schedule.tsx
git commit -m "feat(schedule): week strip navigation + icon shift cards + gradient FAB"
```

### Task 4.5: Update Onboarding

**Files:**
- Modify: `app/(onboarding)/welcome.tsx`

- [ ] **Step 1: Update welcome screen to V6 style**

- Dot indicators: active dot `#7B61FF` 20px wide pill, inactive 7px circle `#1F2937`
- Moon emoji (44px) hero
- Gradient headline (if possible with React Native — fallback to gold color)
- Feature cards: glass cards with 40px emoji icons in colored backgrounds
- CTA: gradient button (purple → gold)
- Legal: 9px, `text.dim`

- [ ] **Step 2: Commit**

```bash
git add app/(onboarding)/welcome.tsx
git commit -m "feat(onboarding): V6 premium styling with gradient CTA"
```

### Task 4.6: Wire AdaptiveColorProvider in root layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Wrap app in AdaptiveColorProvider**

Read `app/_layout.tsx`, then add `<AdaptiveColorProvider>` around the root `<Slot>` or `<Stack>`.

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(theme): wire AdaptiveColorProvider in root layout"
```

---

## Wave 5: Night Sky Enhancement (sequential, ~40 min)

### Task 5.1: Create FireflyParticle + Enhance Stars/Arc

**Files:**
- Create: `src/components/night-sky/FireflyParticle.tsx`
- Modify: `src/components/night-sky/StarParticles.tsx`
- Modify: `src/components/night-sky/RechargeArc.tsx`

- [ ] **Step 1: Create FireflyParticle**

3-4 warm gold particles (`#C8A84B`), using reanimated. Each particle: absolute positioned, 3-4px diameter, 1px blur. Animation: 7-10s float upward with opacity fade in/out. Staggered delays (2s intervals).

```typescript
interface FireflyParticleProps {
  count?: number;  // default 4
}
```

- [ ] **Step 2: Enhance StarParticles with 3 speed tiers**

Read current `StarParticles.tsx`. Add speed variation: assign each star one of 3 tiers (fast: 2s, medium: 3s, slow: 5s). Currently all use same timing. Change the `withTiming` duration per particle based on `tier = index % 3`.

- [ ] **Step 3: Enhance RechargeArc with glow + rotation**

Read current `RechargeArc.tsx`. Add:
- Purple color (`#7B61FF`) with `drop-shadow(0 0 8px rgba(123,97,255,0.5))` via `shadowColor`/`shadowRadius`
- 60s slow rotation: `useSharedValue(0)` animated to `360` with `withRepeat(withTiming(360, { duration: 60000 }))`
- Ambient glow: absolute-positioned View behind arc, radial gradient `rgba(123,97,255,0.12)`, 4s opacity pulse

- [ ] **Step 4: Commit**

```bash
git add src/components/night-sky/
git commit -m "feat(night-sky): add fireflies, 3-speed stars, glowing rotating arc"
```

### Task 5.2: Update NightSkyOverlay + Add Transition

**Files:**
- Modify: `src/components/night-sky/NightSkyOverlay.tsx`
- Create: `src/components/night-sky/NightSkyTransition.tsx`

- [ ] **Step 1: Update NightSkyOverlay**

Read current file (160 lines). Changes:
- Background: radial gradient via SVG (`ellipse at 50% 25%`, `#0D1025` → `#060811`)
- Dismiss: circular X button (28px, border `rgba(255,255,255,0.06)`) replacing "Done" text
- Add `<FireflyParticle count={4} />` alongside `<StarParticles />`
- Score display: 44px with `%` in 20px muted
- Tomorrow card: glass card with gold "TOMORROW" header, structured rows (emoji + name + time)
- Bedtime tip: gold-bordered card with 💡

- [ ] **Step 2: Create NightSkyTransition**

Orchestrates the cinematic metamorphosis from Today → Night Sky:
- Uses `useSharedValue` for transition progress (0 → 1)
- Background: `interpolateColor` from app bg to night sky bg
- Stars: staggered opacity fade-in (each star delays by `index * 100ms`)
- Score ring morphs into recharge arc: `withTiming` on width (104 → 180), position (centered), color (green → purple)
- Timeline cards: opacity fade to 0

Exports `useNightSkyTransition()` hook that returns `{ progress, startTransition }`.

- [ ] **Step 3: Wire transition into Today screen**

Update `app/(tabs)/index.tsx` to use `NightSkyTransition` wrapping the Night Sky overlay activation. The transition triggers when `useNightSkyMode().isActive` becomes true.

- [ ] **Step 4: Commit**

```bash
git add src/components/night-sky/ app/(tabs)/index.tsx
git commit -m "feat(night-sky): cinematic metamorphosis transition + enhanced overlay"
```

---

## Wave 6: Elevate Features (parallel, ~30 min)

### Task 6.1: Scroll Parallax for HeroScore

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `src/components/today/HeroScore.tsx`

- [ ] **Step 1: Add scroll handler to Today screen**

Replace `ScrollView` with `Animated.ScrollView` (reanimated). Add `useAnimatedScrollHandler` to capture `scrollY` shared value.

- [ ] **Step 2: Apply parallax to HeroScore**

Pass `scrollY` to HeroScore. In HeroScore, use `useAnimatedStyle`:
```typescript
const heroStyle = useAnimatedStyle(() => ({
  transform: [
    { translateY: scrollOffset.value * -0.4 },  // moves 40% slower
    { scale: interpolate(scrollOffset.value, [0, 200], [1, 0.4], Extrapolation.CLAMP) },
  ],
  opacity: interpolate(scrollOffset.value, [0, 200], [1, 0], Extrapolation.CLAMP),
}));
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/index.tsx src/components/today/HeroScore.tsx
git commit -m "feat(today): scroll parallax — hero score floats above content"
```

### Task 6.2: Wire Haptic Storytelling

**Files:**
- Modify: `src/components/today/HeroScore.tsx`
- Modify: `src/components/today/StatusPill.tsx`
- Modify: `src/components/today/CountdownRow.tsx`
- Modify: `src/components/today/WindDownView.tsx`

- [ ] **Step 1: Wire haptics into components**

- HeroScore: call `scoreViewHaptic()` on mount, `scoreHighHaptic()` if score >= 90
- StatusPill: call `windDownStartHaptic()` when state changes to 'wind-down'
- CountdownRow: call `countdownZeroHaptic()` when any cell value reaches "0:00"
- WindDownView checklist: call `tapSuccess()` on item toggle

- [ ] **Step 2: Commit**

```bash
git add src/components/today/
git commit -m "feat(haptics): wire narrative haptic patterns into Today components"
```

### Task 6.3: Wire Sound Effects

**Files:**
- Modify: `src/components/today/WindDownView.tsx`
- Modify: `src/components/night-sky/NightSkyOverlay.tsx`

- [ ] **Step 1: Wire sounds**

- WindDownView checklist: call `playChecklistDone()` on item complete
- NightSkyOverlay: call `playNightSkyEnter()` on mount
- CountdownRow: call `playCountdownComplete()` when a countdown reaches zero

- [ ] **Step 2: Commit**

```bash
git add src/components/today/ src/components/night-sky/
git commit -m "feat(audio): wire sound effects into wind-down + night sky"
```

---

## Wave 7: Verification (sequential, ~15 min)

### Task 7.1: Full Test Suite + Visual QA

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
npm test 2>&1 | grep -E '(PASS|FAIL|Tests:|Suites:)'
```

Expected: All 172+ tests pass.

- [ ] **Step 2: Fix any regressions**

If tests fail, diagnose and fix. Common causes:
- Import path changes (settings → profile)
- Token name changes in theme
- Component prop shape changes

- [ ] **Step 3: Visual QA checklist**

Open `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html` side-by-side with the running app. Check:
- [ ] Recovery Day pill renders with 🌿 and green tint
- [ ] Hero score ring is centered, glows, breathes
- [ ] Sparkline shows 7 bars with today highlighted
- [ ] Countdown row has 3 unified cells with correct colors
- [ ] Timeline has narrow timestamps, spine, accent bars
- [ ] Past events collapse with colored dots
- [ ] Insight line sits at bottom with 💡
- [ ] Floating tab bar has blur and gold active glow
- [ ] Gradient mesh background animates subtly
- [ ] Night Sky has fireflies, 3-speed stars, glowing arc
- [ ] Wind-down has large countdown + checklist
- [ ] Profile shows avatar, stats, preferences
- [ ] All animations run at 60fps (no jank)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: address visual QA feedback from V6 redesign"
```

---

## Summary

| Wave | Tasks | Time (parallel) | Depends On |
|------|-------|-----------------|------------|
| 0 | 1 task | ~10 min | — |
| 1 | 3 tasks | ~15 min | Wave 0 |
| 2 | 4 tasks | ~15 min | Wave 1 |
| 3 | 9 tasks | ~20 min | Wave 1 |
| 4 | 6 tasks | ~40 min | Wave 2+3 |
| 5 | 2 tasks | ~25 min | Wave 3+4 |
| 6 | 3 tasks | ~15 min | Wave 4 |
| 7 | 1 task | ~15 min | All |

**Total: 29 tasks, ~155 min critical path with parallelization**
