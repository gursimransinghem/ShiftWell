import React, { useMemo, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  useAnimatedStyle,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface FireflyParticleProps {
  /** Number of firefly particles to render (default 4) */
  count?: number;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random — avoids Math.random() across renders
// ---------------------------------------------------------------------------
function pseudoRandom(seed: number, salt: number): number {
  return Math.abs(Math.sin(seed * 7919 + salt * 31337)) % 1;
}

// ---------------------------------------------------------------------------
// Single animated firefly
// ---------------------------------------------------------------------------
interface FireflyData {
  id: number;
  x: number;
  startY: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
}

interface SingleFireflyProps {
  firefly: FireflyData;
}

function SingleFirefly({ firefly }: SingleFireflyProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    // opacity: 0 → 0.7 → 0.4 → 0.6 → 0
    opacity.value = withDelay(
      firefly.delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: firefly.duration * 0.2 }),
          withTiming(0.4, { duration: firefly.duration * 0.3 }),
          withTiming(0.6, { duration: firefly.duration * 0.3 }),
          withTiming(0, { duration: firefly.duration * 0.2 }),
        ),
        -1,
        false,
      ),
    );

    // drift upward
    translateY.value = withDelay(
      firefly.delay,
      withRepeat(withTiming(firefly.driftY, { duration: firefly.duration }), -1, true),
    );

    // gentle lateral drift
    translateX.value = withDelay(
      firefly.delay,
      withRepeat(withTiming(firefly.driftX, { duration: firefly.duration }), -1, true),
    );

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firefly.delay, firefly.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: firefly.x,
          top: firefly.startY,
          width: 3 + (firefly.id % 2), // 3-4px
          height: 3 + (firefly.id % 2),
          borderRadius: 4,
          backgroundColor: '#C8A84B',
          shadowColor: '#C8A84B',
          shadowRadius: 2,
          shadowOpacity: 0.8,
          shadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// FireflyParticle — warm gold particles that float upward
// ---------------------------------------------------------------------------
export function FireflyParticle({ count = 4 }: FireflyParticleProps) {
  const { width, height } = useWindowDimensions();

  const fireflies = useMemo<FireflyData[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        // scatter across screen width
        x: pseudoRandom(i, 10) * width,
        // start in lower half of screen
        startY: height * 0.5 + pseudoRandom(i, 11) * height * 0.4,
        // stagger each particle by 2s
        delay: i * 2000,
        // 7-10s per particle
        duration: 7000 + pseudoRandom(i, 12) * 3000,
        // drift up 40-60px (negative Y = up)
        driftY: -(40 + pseudoRandom(i, 13) * 20),
        // lateral drift ±20px
        driftX: (pseudoRandom(i, 14) - 0.5) * 40,
      })),
    [count, width, height],
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {fireflies.map((f) => (
        <SingleFirefly key={f.id} firefly={f} />
      ))}
    </View>
  );
}
