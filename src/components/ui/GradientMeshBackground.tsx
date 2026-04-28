import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect, LinearGradient } from 'react-native-svg';

// ---------------------------------------------------------------------------
// GradientMeshBackground
//
// A layered ambient backdrop:
//   1. A static base linear gradient (deep navy → near-black) for depth.
//   2. Three large soft radial-gradient orbs (purple, deep purple, warm gold)
//      that drift slowly. Built from react-native-svg so the orbs feel like
//      true soft glows rather than flat circles.
//
// All decorative — pointerEvents="none" on the layer; touches pass through.
// ---------------------------------------------------------------------------

interface GradientMeshBackgroundProps {
  children: React.ReactNode;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ORB_SIZE = Math.max(SCREEN_W, 380) * 0.95;

interface OrbConfig {
  id: string;
  /** rgb triplet for stop color — alpha controlled by stop opacity */
  rgb: [number, number, number];
  /** Stop-0 opacity at orb center */
  centerOpacity: number;
  initialX: number;
  initialY: number;
  driftX: number;
  driftY: number;
  duration: number;
}

const ORBS: OrbConfig[] = [
  {
    // Purple — top-left primary ambient
    id: 'orb-purple',
    rgb: [123, 97, 255],
    centerOpacity: 0.32,
    initialX: -ORB_SIZE * 0.35,
    initialY: -ORB_SIZE * 0.25,
    driftX: 50,
    driftY: 40,
    duration: 22000,
  },
  {
    // Deep indigo — center mid (replaces green for Path B coherence)
    id: 'orb-indigo',
    rgb: [100, 70, 240],
    centerOpacity: 0.18,
    initialX: SCREEN_W * 0.25,
    initialY: SCREEN_H * 0.18,
    driftX: -40,
    driftY: -30,
    duration: 30000,
  },
  {
    // Warm gold — bottom-right brand anchor
    id: 'orb-gold',
    rgb: [200, 168, 75],
    centerOpacity: 0.16,
    initialX: SCREEN_W * 0.45,
    initialY: SCREEN_H * 0.55,
    driftX: -45,
    driftY: -35,
    duration: 26000,
  },
];

interface AmbientOrbProps {
  config: OrbConfig;
}

function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
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

  const stopFar = rgba(config.rgb, 0);
  const stopMid = rgba(config.rgb, config.centerOpacity * 0.35);
  const stopNear = rgba(config.rgb, config.centerOpacity);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          left: config.initialX,
          top: config.initialY,
          width: ORB_SIZE,
          height: ORB_SIZE,
        },
        animatedStyle,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient
            id={config.id}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor={stopNear} />
            <Stop offset="40%" stopColor={stopMid} />
            <Stop offset="100%" stopColor={stopFar} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${config.id})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Static linear backdrop — deep space to slightly lighter mid-tone.
 * Sits behind the orbs to give the screen a directional depth cue.
 */
function StaticBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="bg-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0B0F1C" />
            <Stop offset="55%" stopColor="#080B14" />
            <Stop offset="100%" stopColor="#05070E" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#bg-vertical)" />
      </Svg>
    </View>
  );
}

export function GradientMeshBackground({ children }: GradientMeshBackgroundProps) {
  return (
    <View style={styles.container}>
      <StaticBackdrop />

      {/* Ambient orb layer — behind all content */}
      <View style={styles.orbLayer} pointerEvents="none">
        {ORBS.map((orb) => (
          <AmbientOrb key={orb.id} config={orb} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B14',
  },
  orbLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
});
