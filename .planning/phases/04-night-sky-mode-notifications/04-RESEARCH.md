# Phase 4: Night Sky Mode & Notifications - Research

**Researched:** 2026-04-02
**Domain:** React Native animation (Reanimated 4), expo-notifications SDK 55, UI state machine (wind-down detection)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Night Sky Mode activates automatically based on plan's wind-down time (typically 30-60 min before bedtime). Can also be triggered manually.
- **D-02:** UI: deep dark sky gradient background with subtle firefly/star particle animations. Minimal UI — no navigation chrome.
- **D-03:** Shows exactly three things: (1) alarm confirmation with time, (2) latest acceptable wake time, (3) tomorrow morning's schedule summary.
- **D-04:** Recharge animation: a circular fill that shows projected sleep quality. Updates in real-time — staying up past bedtime visibly decreases the fill.
- **D-05:** Quick bedtime tips cycle through: water intake, phone placement, room temperature. Subtle, not intrusive.
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

### Deferred Ideas (OUT OF SCOPE)
None — staying within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NSM-01 | App transitions to dark night-sky theme as bedtime approaches | Wind-down window detection via useTodayPlan + plan blocks; modal screen overlay pattern |
| NSM-02 | Night Sky Mode shows only critical info: alarm confirmation, latest wake time, morning schedule | Plan block data (main-sleep start/end, wake block); tomorrow's blocks from plan-store |
| NSM-03 | Recharge animation shows projected sleep quality (adjusts if user is up past bedtime) | Reanimated 4 withTiming + useSharedValue for circular arc; real-time degradation formula |
| NSM-04 | Quick bedtime tips cycle (water, phone placement, room temp based on weather) | Existing SleepTip system already has this content; cycling via useEffect interval |
| NSM-05 | Firefly/star particle animations create soothing visual environment | Reanimated 4 useSharedValue + useAnimatedStyle per particle; no new library needed |
| NOTIF-01 | Wind-down reminder push notification (30-60 min before bedtime) | notification-service.ts already has scheduleWindDownNotification — needs emoji + warm copy update |
| NOTIF-02 | Caffeine cutoff reminder push notification | notification-service.ts already has scheduleCaffeineCutoff — needs emoji + warm copy update |
| NOTIF-03 | Morning brief push notification (score + first open block in schedule) | New scheduleNotificationAsync call at wake block time; first tomorrow block lookup from plan |
| NOTIF-04 | Notifications are warm, emoji, minimal (not clinical) | Copy update only — service already functional |
| NOTIF-05 | User can customize notification timing and preferences | New notification-prefs store slice + Settings section; lead-time offset stored in Zustand/AsyncStorage |
</phase_requirements>

---

## Summary

Phase 4 has two distinct domains: (1) an immersive full-screen UI mode (Night Sky Mode) and (2) local push notification scheduling. Research reveals that most of the infrastructure is already in place and requires upgrade rather than new builds.

The notification service (`src/lib/notifications/notification-service.ts`) already schedules wind-down, caffeine cutoff, and wake reminders using expo-notifications SDK 55. The service uses the correct `SchedulableTriggerInputTypes.DATE` API and cancels/reschedules on plan regeneration. What it lacks: emoji-rich warm copy (NOTIF-04), a morning brief notification (NOTIF-03), user preference offsets (NOTIF-05), and the SDK 55 notification handler registration in `_layout.tsx`. The existing notification mock infrastructure is absent — `expo-notifications` has no `__mocks__/` entry and will need one.

For Night Sky Mode, react-native-reanimated 4.2.1 is already installed and sufficient for both the particle system and the recharge arc animation. No additional animation library is needed. The recharge arc will use `useSharedValue` + `useAnimatedProps` on a react-native-svg `Circle` with `strokeDashoffset` — which requires adding `react-native-svg` (not currently installed). Alternatively, a pure-Reanimated approach using `View` with `border-radius` + `transform` can approximate the arc without SVG. Given the "feels alive" requirement in the design brief, the SVG approach is strongly preferred for a true circular arc.

Wind-down window detection is straightforward: `useTodayPlan` already computes `nextBlock`; Night Sky Mode activates when `nextBlock.type === 'wind-down'` OR when `now` is within 60 minutes of the next `main-sleep` block start. This can be a pure computed value from existing plan data — no new sensor or timer needed beyond the existing 60-second tick already in `useTodayPlan`.

**Primary recommendation:** Upgrade the existing notification service (copy + morning brief + prefs), add `react-native-svg` for the recharge arc, implement Night Sky Mode as a full-screen modal overlay on the Today tab, and wire all particle/arc animations through Reanimated 4.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.2.1 (installed) | Particle animations, recharge arc, fade transitions | Already in project; v4 runs on JS thread via `react-native-worklets` 0.7.2 |
| expo-notifications | 55.0.12 (installed) | Local push notification scheduling | Locked decision D-10; already wired into plan-store |
| react-native-svg | 15.15.4 (needs install) | Circular arc stroke for recharge animation | Only library that provides SVG `Circle` with `strokeDashoffset` in RN |
| zustand | 5.0.11 (installed) | Notification preference storage | Already the state management pattern in this codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 (installed) | Wind-down window time comparisons | Already used in useTodayPlan for isWithinInterval, isAfter |
| react-native-safe-area-context | ~5.6.2 (installed) | Full-screen Night Sky Mode insets | Full-screen overlay must handle notch/home indicator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-svg (CircleArc) | Pure View + borderRadius transform | SVG gives pixel-perfect arc; View approach requires creative clip masking, harder to animate smoothly |
| react-native-svg | @shopify/react-native-skia 2.6.0 | Skia is more powerful but ~4MB heavier; SVG is sufficient and lighter for a single arc |
| Reanimated particles | React Native `Animated` API | Reanimated runs closer to native thread; Animated is fine for simple fades but particle loops benefit from Reanimated |

**Installation (new package only):**
```bash
npx expo install react-native-svg
```

**Version verification:**
```bash
npm view react-native-svg version  # 15.15.4 confirmed 2026-04-02
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── night-sky/
│       ├── NightSkyOverlay.tsx      # Full-screen modal overlay shell
│       ├── StarParticles.tsx        # Particle field (30-50 animated dots)
│       ├── RechargeArc.tsx          # SVG circular fill animation
│       ├── BedtimeTipCycler.tsx     # Auto-cycling tip display
│       └── index.ts                 # Barrel export
├── hooks/
│   └── useNightSkyMode.ts           # Wind-down window detection logic
└── lib/
    └── notifications/
        ├── notification-service.ts  # UPGRADE: warm copy, morning brief
        ├── notification-prefs.ts    # NEW: preference types + defaults
        └── index.ts                 # Re-export
src/store/
└── notification-store.ts            # NEW: Zustand slice for prefs (lead times, enabled flags)
app/
└── (tabs)/
    └── index.tsx                    # MODIFY: integrate useNightSkyMode, render NightSkyOverlay
app/(tabs)/settings.tsx              # MODIFY: add notification preferences section
```

### Pattern 1: Wind-Down Window Detection Hook

**What:** A hook that computes whether Night Sky Mode should be active based on plan block timing.

**When to use:** Consumed by `app/(tabs)/index.tsx` to conditionally render `NightSkyOverlay`.

**Example:**
```typescript
// src/hooks/useNightSkyMode.ts
// Source: derived from existing useTodayPlan pattern (src/hooks/useTodayPlan.ts)

import { useMemo } from 'react';
import { isAfter, differenceInMinutes } from 'date-fns';
import { usePlanStore } from '@/src/store/plan-store';
import { useNotificationStore } from '@/src/store/notification-store';

export function useNightSkyMode(): { isActive: boolean; minutesUntilSleep: number } {
  const plan = usePlanStore((s) => s.plan);
  const windDownLeadMinutes = useNotificationStore((s) => s.windDownLeadMinutes); // default 60

  return useMemo(() => {
    const now = new Date();
    const blocks = plan?.blocks ?? [];

    // Find the next main-sleep or wind-down block starting in the future
    const nextSleep = blocks.find(
      (b) => (b.type === 'main-sleep' || b.type === 'wind-down') && isAfter(b.start, now),
    );

    if (!nextSleep) return { isActive: false, minutesUntilSleep: Infinity };

    const minutesUntilSleep = differenceInMinutes(nextSleep.start, now);
    const isActive = minutesUntilSleep <= windDownLeadMinutes;

    return { isActive, minutesUntilSleep };
  }, [plan, windDownLeadMinutes]);
}
```

**Critical note:** The `useTodayPlan` hook already has a 60-second `setInterval` tick at line 108-112. `useNightSkyMode` should NOT add its own — it should either share the tick or recompute on the same plan subscription without a tick. The plan already updates every minute from that hook.

**Recommended approach:** `useNightSkyMode` reads from `usePlanStore` directly. The Today screen already re-renders on the `useTodayPlan` tick, which will propagate through to the Night Sky Mode check. No separate timer needed.

### Pattern 2: Recharge Arc Animation (react-native-svg + Reanimated 4)

**What:** A circular progress arc that fills to represent projected sleep quality, depleting in real time if user stays up past bedtime.

**When to use:** Hero element inside `NightSkyOverlay`.

**Key math:**
- Circle circumference: `2 * π * radius`
- `strokeDasharray` = circumference
- `strokeDashoffset` = circumference * (1 - fillFraction)
- Fill fraction starts at projected quality (0.0–1.0) and decreases by `1 / totalSleepMinutes` per elapsed minute past bedtime

**Example:**
```typescript
// src/components/night-sky/RechargeArc.tsx
// Source: react-native-svg + Reanimated useAnimatedProps pattern

import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RechargeArc({ fillFraction }: { fillFraction: number }) {
  const offset = useSharedValue(CIRCUMFERENCE * (1 - fillFraction));

  // When fillFraction changes (each minute tick), animate to new value
  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - fillFraction), {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [fillFraction]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      {/* Background track */}
      <Circle cx={90} cy={90} r={RADIUS} stroke="#1C2137" strokeWidth={12} fill="none" />
      {/* Animated fill */}
      <AnimatedCircle
        cx={90} cy={90} r={RADIUS}
        stroke="#C8A84B"           // ACCENT.primary
        strokeWidth={12}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={animatedProps}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"  // Start from top
      />
    </Svg>
  );
}
```

**Recharge formula:** `fillFraction = clamp(plannedSleepHours / targetSleepHours, 0, 1)`. If current time > planned bedtime: `fillFraction -= (minutesPastBedtime / totalSleepMinutes) * 0.5` (50% penalty weight — feel free to tune).

### Pattern 3: Particle System (Reanimated 4 only, no SVG needed)

**What:** 25-40 floating dots with randomized positions, sizes, and slow drift animations.

**When to use:** Background layer of `NightSkyOverlay`.

**Example (single particle):**
```typescript
// Source: Reanimated 4 withRepeat + withSequence pattern

import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';

function StarParticle({ x, y, size, delay }: StarParticleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Fade in/out loop
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 }),
      ),
      -1, // infinite
      true, // reverse
    ));
    // Subtle vertical drift
    translateY.value = withDelay(delay, withRepeat(
      withTiming(-8, { duration: 4000 + Math.random() * 2000 }),
      -1,
      true,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#FFFFFF' }, style]} />
  );
}
```

**Performance note:** 30-40 particles at this complexity is within safe Reanimated budget on modern iOS (iPhone 12+). Each particle runs its animation entirely in the worklet thread. Keep total under 50. Generate positions once at mount using `useMemo` with a seeded random — not on every render.

### Pattern 4: Notification Handler Registration (SDK 55 — CRITICAL)

**What:** `setNotificationHandler` must be called in the app root before any notifications are presented, or foreground notifications will be silently dropped.

**SDK 55 breaking change:** `shouldShowAlert` is deprecated. Must use `shouldShowBanner: true` + `shouldShowList: true` instead.

**Example:**
```typescript
// app/_layout.tsx — add to RootLayoutNav useEffect

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,    // SDK 55: replaces shouldShowAlert
    shouldShowList: true,      // SDK 55: shows in notification center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### Pattern 5: Morning Brief Notification

**What:** New notification type scheduled at wake block time, showing sleep score and first upcoming block.

**Example:**
```typescript
// src/lib/notifications/notification-service.ts — new function

export async function scheduleMorningBrief(
  wakeTime: Date,
  firstBlockLabel: string,
): Promise<string | null> {
  if (wakeTime.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Good morning!',
      body: `First up: ${firstBlockLabel}`,
      data: { type: 'morning-brief' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: wakeTime,
    },
  });
}
```

**Where to find `firstBlockLabel`:** Filter `plan.blocks` for blocks starting after `wakeTime`, sorted by `start`, take `blocks[0].label`.

### Pattern 6: Notification Preferences Store

**What:** Zustand slice persisted via AsyncStorage. Stores lead-time offsets and per-notification enabled flags.

**Example:**
```typescript
// src/store/notification-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  windDownEnabled: boolean;
  windDownLeadMinutes: number;       // default 45 (D-06: 30-60 range)
  caffeineCutoffEnabled: boolean;
  caffeineCutoffLeadMinutes: number; // default 30
  morningBriefEnabled: boolean;
  setWindDown: (enabled: boolean, leadMinutes?: number) => void;
  setCaffeineCutoff: (enabled: boolean, leadMinutes?: number) => void;
  setMorningBrief: (enabled: boolean) => void;
}
```

**Integration point:** `schedulePlanNotifications` in `notification-service.ts` must read from `useNotificationStore.getState()` to apply lead-time offsets and enabled flags.

### Anti-Patterns to Avoid

- **Polling for wind-down activation:** Don't add a new `setInterval` in `useNightSkyMode`. The Today screen already ticks every 60 seconds via `useTodayPlan`. Re-use that timing.
- **Generating particles on every render:** Generate randomized particle positions once with `useMemo` (or `useRef`) at mount, not inline in render.
- **Using `shouldShowAlert` in notification handler:** SDK 55 marks it deprecated. Use `shouldShowBanner` + `shouldShowList`.
- **Forgetting `Animated.createAnimatedComponent`:** `useAnimatedProps` only works with animated components. Regular `Circle` from react-native-svg won't accept animated props directly.
- **Hardcoding `windDownLeadMinutes` in Night Sky Mode:** Must read from notification store (same source of truth as the notification scheduling).
- **Full-screen modal re-mounting on every minute tick:** Night Sky Mode overlay should be conditionally rendered at the Today screen level, not inside useTodayPlan — avoid driving transitions from within the hook.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular arc animation | Custom canvas drawing loop | react-native-svg + Reanimated `useAnimatedProps` | SVG declarative API handles arc math; `strokeDashoffset` is the standard technique |
| Gradient background | JS-computed gradient pixels | React Native `LinearGradient` (expo-linear-gradient) or StyleSheet `backgroundColor` with overlay | Actually: `expo-linear-gradient` NOT installed — use nested `View` with opacity layers and solid colors from `BACKGROUND.*` tokens. Deep sky is achievable with `#0A0E1A` to `#050810` gradient approximated with two layered Views |
| Particle positioning | Physics engine | Simple `useSharedValue` per particle with `withRepeat` | 30-40 particles with slow drift need no physics; bounce/collision not required |
| Notification scheduling logic | Custom alarm manager | expo-notifications `SchedulableTriggerInputTypes.DATE` | iOS/Android OS-level scheduling with proper permission handling already abstracted |
| Notification persistence across app restarts | Manual ID tracking in AsyncStorage | expo-notifications `getAllScheduledNotificationsAsync` + `cancelAllScheduledNotificationsAsync` | Already implemented in notification-service.ts |

**Key insight:** The existing notification service is already well-architected. Phase 4 upgrades copy/content and adds preference offsets — it does not replace the service.

---

## Common Pitfalls

### Pitfall 1: SDK 55 Notification Handler API Change
**What goes wrong:** Notifications scheduled and triggered but never shown while app is in foreground. Silent failure.
**Why it happens:** `setNotificationHandler` not called at all, or called with `shouldShowAlert: true` (deprecated in SDK 55) instead of `shouldShowBanner: true` + `shouldShowList: true`.
**How to avoid:** Add `setNotificationHandler` call to `app/_layout.tsx` `useEffect` (before any notifications fire) using the SDK 55 interface.
**Warning signs:** `schedulePlanNotifications` returns IDs successfully but no banner appears when app is open.

### Pitfall 2: No `expo-notifications` Mock in Jest
**What goes wrong:** Any test file that imports notification-service.ts (or any module that imports plan-store.ts) throws: `Cannot find native module 'ExpoNotifications'`.
**Why it happens:** expo-notifications has a native module that Jest's Node environment cannot load. No mock exists in `__mocks__/` yet.
**How to avoid:** Create `__mocks__/expo-notifications.ts` before writing any notification tests. The mock should export all functions as `jest.fn()` with sensible defaults.
**Warning signs:** Tests that previously passed start failing after importing any file that transitively uses notification-service.ts.

### Pitfall 3: `react-native-svg` Not in Jest Module Map
**What goes wrong:** Tests using `RechargeArc` throw module resolution errors.
**Why it happens:** `react-native-svg` requires a jest mock, similar to other native modules.
**How to avoid:** Add `'^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.ts'` to `jest.config.js` `moduleNameMapper`. The mock should return simple `View` wrappers for `Svg`, `Circle`, etc.
**Warning signs:** Jest errors mentioning `react-native-svg` after adding `RechargeArc.tsx` to any imported file.

### Pitfall 4: Night Sky Mode Triggering During Naps
**What goes wrong:** Night Sky Mode activates 60 minutes before a midday nap block, ruining the daytime UX.
**Why it happens:** `useNightSkyMode` naively checks any `main-sleep` block — including naps.
**How to avoid:** Night Sky Mode should only activate for the primary night sleep window. Filter for `b.type === 'main-sleep'` AND `b.priority === 1` (critical), OR check that the block starts between 20:00 and 08:00.
**Warning signs:** Users on night shifts see Night Sky Mode activate for their pre-shift nap.

### Pitfall 5: Particle Animation Memory Leak
**What goes wrong:** App memory climbs indefinitely as Night Sky Mode is entered/exited.
**Why it happens:** `withRepeat(-1)` animations not cancelled when component unmounts.
**How to avoid:** Call `cancelAnimation(sharedValue)` in the `useEffect` cleanup function for each particle's animated values. Reanimated 4's `useSharedValue` does handle cleanup automatically in most cases, but explicit cleanup is safer for `withRepeat(-1)` loops.
**Warning signs:** Memory profiler shows growing `Animated` objects after repeated Night Sky Mode toggles.

### Pitfall 6: `Animated.createAnimatedComponent` and SVG Circle
**What goes wrong:** `useAnimatedProps` silently does nothing on a regular `Circle`.
**Why it happens:** `useAnimatedProps` requires the component to be wrapped with `Animated.createAnimatedComponent`. Must be done once at module level, not inside the render function.
**How to avoid:** `const AnimatedCircle = Animated.createAnimatedComponent(Circle);` at module scope.
**Warning signs:** Arc fill never changes even though shared value is updating.

---

## Code Examples

Verified patterns from official sources and installed codebase:

### expo-notifications: Scheduling a DATE trigger (SDK 55)
```typescript
// Source: node_modules/expo-notifications/build/Notifications.types.d.ts — verified in installed package

await Notifications.scheduleNotificationAsync({
  content: {
    title: '🌙 Wind-down time',
    body: 'Your sleep window opens in 45 minutes',
    data: { type: 'wind-down' },
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerTime,  // Date object
  },
});
```

### expo-notifications: setNotificationHandler (SDK 55 interface)
```typescript
// Source: node_modules/expo-notifications/build/NotificationsHandler.d.ts — verified

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // NOT shouldShowAlert (deprecated)
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### Reanimated 4: useAnimatedProps on SVG Circle
```typescript
// Source: verified against node_modules/react-native-reanimated/lib/module/index.js exports

import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// In component:
const offset = useSharedValue(circumference);
const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset: offset.value,
}));

// Trigger animation:
offset.value = withTiming(newOffset, { duration: 1500 });
```

### Reanimated 4: Infinite particle loop with cleanup
```typescript
// Source: verified exports — withRepeat, withSequence, withTiming all confirmed in v4.2.1

import { useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';

useEffect(() => {
  opacity.value = withRepeat(
    withSequence(
      withTiming(0.9, { duration: 2000 }),
      withTiming(0.1, { duration: 2000 }),
    ),
    -1,
    true,
  );
  return () => {
    cancelAnimation(opacity);
  };
}, []);
```

### expo-notifications: Mock for Jest
```typescript
// __mocks__/expo-notifications.ts

const Notifications = {
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
    CALENDAR: 'calendar',
    DAILY: 'daily',
    WEEKLY: 'weekly',
  },
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
};

export default Notifications;
export const {
  setNotificationHandler,
  scheduleNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} = Notifications;
```

### react-native-svg: Mock for Jest
```typescript
// __mocks__/react-native-svg.ts

import React from 'react';
import { View } from 'react-native';

const Svg = (props: any) => <View {...props} />;
const Circle = (props: any) => <View {...props} />;
const G = (props: any) => <View {...props} />;
const Path = (props: any) => <View {...props} />;
const Text = (props: any) => <View {...props} />;

export default Svg;
export { Circle, G, Path, Text };
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shouldShowAlert: true` in notification handler | `shouldShowBanner: true` + `shouldShowList: true` | expo-notifications SDK 50+ | Breaking change in SDK 55 — existing handler must be updated |
| Reanimated 3 worklets (useWorkletCallback) | Reanimated 4 with `react-native-worklets` as separate package | v4.0 (2024) | Project has worklets 0.7.2 installed alongside reanimated 4.2.1 — this is correct |
| Manual `Animated.Value` + `Animated.timing` | `useSharedValue` + `withTiming` | Reanimated 2+ | `CountdownCard.tsx` still uses legacy `Animated` API — acceptable for simple breathing animation, but new Phase 4 components should use Reanimated 4 |

**Deprecated/outdated:**
- `shouldShowAlert`: Marked `@deprecated` in SDK 55 types — use `shouldShowBanner` and `shouldShowList`
- `Animated` (React Native core): Still works and is used in existing components (`CountdownCard.tsx`) — do NOT migrate existing components in Phase 4, only use Reanimated for new components

---

## Open Questions

1. **NightSkyOverlay presentation layer**
   - What we know: Today screen (`app/(tabs)/index.tsx`) is a ScrollView. Night Sky Mode should hide navigation chrome (D-02).
   - What's unclear: Whether Night Sky Mode should be a separate screen (`app/night-sky.tsx` pushed as modal), or a full-screen absolute View overlaid on the Today tab. A separate modal screen would auto-hide the tab bar. An overlay requires manual tab bar hiding.
   - Recommendation: Use `expo-router` `router.push('/(tabs)/night-sky')` as a new screen within the tabs group with `tabBarStyle: { display: 'none' }` in screen options — cleaner lifecycle management.

2. **Recharge fill fraction source**
   - What we know: D-03 shows projected sleep quality; D-04 it updates in real time.
   - What's unclear: "Projected sleep quality" is not currently computed anywhere. Phase 5 (Recovery Score) will define the full score. For Phase 4, a proxy is needed.
   - Recommendation: Use `plannedSleepHours / profile.sleepNeed` clamped to 0-1 as the initial fill. This is computable from the next `main-sleep` block duration vs. `useUserStore().profile.sleepNeed`.

3. **Bedtime tips content for Night Sky Mode (D-05)**
   - What we know: Tips should cycle "water intake, phone placement, room temperature." The existing `SLEEP_TIPS` library doesn't have exactly these three as distinct items, though `sleep-02` covers room temp and `sleep-04` covers phone.
   - What's unclear: Whether to use existing `SLEEP_TIPS` or define a curated 3-tip `BEDTIME_TIPS` array specifically for Night Sky Mode.
   - Recommendation: Define a separate `BEDTIME_TIPS` constant (3-5 items) in `src/lib/tips/bedtime-tips.ts` specific to Night Sky Mode — matches the "exactly three things" design principle and avoids diluting the tip engine.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-native-reanimated | NSM-03, NSM-05 | Yes | 4.2.1 | — |
| expo-notifications | NOTIF-01 through NOTIF-05 | Yes | 55.0.12 | — |
| react-native-svg | NSM-03 (recharge arc) | No | — | Pure View arc (inferior visual quality) |
| react-native-worklets | Reanimated dependency | Yes | 0.7.2 | — |
| date-fns | NSM-01 wind-down detection | Yes | 4.1.0 | — |

**Missing dependencies with no fallback:**
- `react-native-svg` — needed for `RechargeArc`. Install with `npx expo install react-native-svg`. No fallback produces equivalent quality.

**Missing dependencies with fallback:**
- None (other than SVG above)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + ts-jest 29.4.6 |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest --testPathPattern="notifications\|night-sky\|notification-store" --passWithNoTests` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NSM-01 | Wind-down detection activates within lead window | unit | `npx jest --testPathPattern="useNightSkyMode"` | No — Wave 0 |
| NSM-03 | Recharge fill fraction decreases past bedtime | unit | `npx jest --testPathPattern="rechargeCalculation"` | No — Wave 0 |
| NSM-04 | Bedtime tips cycle on interval | unit | `npx jest --testPathPattern="bedtime-tips"` | No — Wave 0 |
| NOTIF-01 | Wind-down scheduled with correct lead time | unit | `npx jest --testPathPattern="notification-service"` | No — Wave 0 |
| NOTIF-02 | Caffeine cutoff scheduled at block start time | unit | `npx jest --testPathPattern="notification-service"` | No — Wave 0 |
| NOTIF-03 | Morning brief fires at wake block start, includes first block label | unit | `npx jest --testPathPattern="notification-service"` | No — Wave 0 |
| NOTIF-05 | Lead time offset is applied from notification store | unit | `npx jest --testPathPattern="notification-store"` | No — Wave 0 |
| NSM-02, NSM-05 | UI renders correct blocks; particles mount | manual / visual | — | Manual only |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="notifications\|night-sky\|notification-store"`
- **Per wave merge:** `npx jest` (full 243+ test suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__mocks__/expo-notifications.ts` — required before any notification test can run; plan-store.ts transitively imports notification-service.ts
- [ ] `__mocks__/react-native-svg.ts` — required before any RechargeArc component test
- [ ] `jest.config.js` — add `'^react-native-svg$'` to `moduleNameMapper`
- [ ] `__tests__/notifications/notification-service.test.ts` — covers NOTIF-01, NOTIF-02, NOTIF-03
- [ ] `__tests__/store/notification-store.test.ts` — covers NOTIF-05
- [ ] `__tests__/hooks/useNightSkyMode.test.ts` — covers NSM-01
- [ ] `__tests__/lib/bedtime-tips.test.ts` — covers NSM-04

---

## Sources

### Primary (HIGH confidence)
- `node_modules/expo-notifications/build/index.d.ts` — verified SDK 55 exports and API surface
- `node_modules/expo-notifications/build/Notifications.types.d.ts` — verified `SchedulableTriggerInputTypes`, `NotificationBehavior` (shouldShowBanner/shouldShowList)
- `node_modules/expo-notifications/build/NotificationsHandler.d.ts` — verified `setNotificationHandler` signature and docstring example
- `node_modules/react-native-reanimated/lib/module/index.js` — verified all hooks and animation functions exported in v4.2.1
- `src/lib/notifications/notification-service.ts` — existing service structure, current API usage
- `src/store/plan-store.ts` — plan block access patterns, notification scheduling integration point
- `src/hooks/useTodayPlan.ts` — wind-down detection approach, existing 60-second tick pattern
- `src/lib/circadian/types.ts` — PlanBlock interface, SleepBlockType enum

### Secondary (MEDIUM confidence)
- `npm view react-native-svg version` — 15.15.4 confirmed latest (2026-04-02)
- `npm view @shopify/react-native-skia version` — 2.6.0 as alternative, verified but not recommended

### Tertiary (LOW confidence)
- Particle performance budget (30-50 particles) — based on general Reanimated worklet thread knowledge; actual safe ceiling may vary by device

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from installed node_modules and npm registry
- Architecture: HIGH — patterns derived directly from existing codebase conventions
- Pitfalls: HIGH — SDK 55 breaking change verified in types; Jest mock gaps verified by checking __mocks__ directory
- Performance budget for particles: LOW — treat as guideline, not guarantee

**Research date:** 2026-04-02
**Valid until:** 2026-06-01 (expo-notifications and Reanimated are active; SDK 56 release may shift notification handler API again)
