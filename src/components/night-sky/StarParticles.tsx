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
// Deterministic pseudo-random — avoids Math.random() inside useMemo which
// would produce different values across renders / hot-reloads.
// ---------------------------------------------------------------------------
function pseudoRandom(seed: number, salt: number): number {
  return Math.abs(Math.sin(seed * 9301 + salt * 49297)) % 1;
}

// ---------------------------------------------------------------------------
// Single animated star particle
// ---------------------------------------------------------------------------
interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface StarParticleProps {
  particle: ParticleData;
}

function StarParticle({ particle }: StarParticleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.1, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
    translateY.value = withDelay(
      particle.delay,
      withRepeat(withTiming(-8, { duration: 4000 }), -1, true),
    );

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particle.delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: '#FFFFFF',
        },
        animatedStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// StarParticles — 30-particle background field
// ---------------------------------------------------------------------------
export function StarParticles() {
  const { width, height } = useWindowDimensions();

  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: pseudoRandom(i, 0) * width,
        y: pseudoRandom(i, 1) * height,
        size: 1 + pseudoRandom(i, 2) * 2,
        delay: pseudoRandom(i, 3) * 3000,
      })),
    [width, height],
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {particles.map((p) => (
        <StarParticle key={p.id} particle={p} />
      ))}
    </View>
  );
}
