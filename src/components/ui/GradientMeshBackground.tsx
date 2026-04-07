import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// GradientMeshBackground
//
// Three large ambient orbs (purple, gold, green) that slowly drift across
// the background. Uses reanimated-driven translateX/Y on Animated.Views with
// large borderRadius to simulate soft radial gradients without SVG complexity.
// ---------------------------------------------------------------------------

interface GradientMeshBackgroundProps {
  children: React.ReactNode;
}

const ORB_SIZE = 300;

interface OrbConfig {
  color: string;
  initialX: number;
  initialY: number;
  driftX: number;
  driftY: number;
  duration: number;
}

const ORBS: OrbConfig[] = [
  {
    // Purple — top-left region (Path B primary ambient)
    color: 'rgba(123,97,255,0.09)',
    initialX: -60,
    initialY: -80,
    driftX: 40,
    driftY: 30,
    duration: 20000,
  },
  {
    // Gold — bottom-right region (warm brand anchor)
    color: 'rgba(200,168,75,0.04)',
    initialX: 80,
    initialY: 120,
    driftX: -35,
    driftY: -25,
    duration: 24000,
  },
  {
    // Deep purple — center region (replaces green for Path B coherence)
    color: 'rgba(100,70,240,0.04)',
    initialX: 20,
    initialY: 40,
    driftX: 30,
    driftY: -40,
    duration: 28000,
  },
];

interface AmbientOrbProps {
  config: OrbConfig;
}

function AmbientOrb({ config }: AmbientOrbProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(config.driftX, {
        duration: config.duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    translateY.value = withRepeat(
      withTiming(config.driftY, {
        duration: config.duration * 1.1,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.driftX, config.driftY, config.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          backgroundColor: config.color,
          left: config.initialX,
          top: config.initialY,
        },
        animatedStyle,
      ]}
    />
  );
}

export function GradientMeshBackground({ children }: GradientMeshBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Ambient orb layer — behind all content */}
      <View style={styles.orbLayer} pointerEvents="none">
        {ORBS.map((orb, index) => (
          <AmbientOrb key={index} config={orb} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
});
