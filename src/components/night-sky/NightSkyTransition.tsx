import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface NightSkyTransitionProps {
  /** When true, animate into Night Sky; when false, reverse back to Today */
  isActive: boolean;
  /** Today screen content — fades out when isActive becomes true */
  children: React.ReactNode;
  /** Night Sky content — fades in when isActive becomes true */
  nightSkyContent: React.ReactNode;
}

// ---------------------------------------------------------------------------
// NightSkyTransition — cinematic metamorphosis from Today → Night Sky
// ---------------------------------------------------------------------------
export function NightSkyTransition({
  isActive,
  children,
  nightSkyContent,
}: NightSkyTransitionProps) {
  // 0 = Today visible, 1 = Night Sky visible
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: 3000,
      easing: Easing.inOut(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Background: interpolates from Today bg (#0B0D16) → Night Sky bg (#060811)
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#0B0D16', '#060811'],
    ),
  }));

  // Today content: opacity 1 → 0 over first 2s (progress 0 → 0.67)
  const todayStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(progress.value / 0.667, 1),
  }));

  // Night Sky content: opacity 0 → 1 starting at 1s (progress 0.33 → 1)
  const nightSkyStyle = useAnimatedStyle(() => ({
    opacity: Math.max((progress.value - 0.333) / 0.667, 0),
  }));

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      {/* Today content — fades out */}
      <Animated.View style={[StyleSheet.absoluteFill, todayStyle]} pointerEvents={isActive ? 'none' : 'auto'}>
        {children}
      </Animated.View>

      {/* Night Sky content — fades in */}
      <Animated.View style={[StyleSheet.absoluteFill, nightSkyStyle]} pointerEvents={isActive ? 'auto' : 'none'}>
        {nightSkyContent}
      </Animated.View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
