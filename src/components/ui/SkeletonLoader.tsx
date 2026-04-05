import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import { BACKGROUND } from '@/src/theme';

// ---------------------------------------------------------------------------
// Base shimmer — pulsing opacity used by all skeleton variants
// ---------------------------------------------------------------------------
interface ShimmerProps {
  style?: object;
}

function Shimmer({ style }: ShimmerProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 750 }),
        withTiming(0.3, { duration: 750 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(opacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.shimmerBase, style, animatedStyle]}
    />
  );
}

// ---------------------------------------------------------------------------
// HeroSkeleton — circular 96px avatar + 2 text lines beneath it
// Matches: HeroSection / ReadinessScore circular display
// ---------------------------------------------------------------------------
export function HeroSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <Shimmer style={styles.heroCircle} />
      <View style={styles.heroTextGroup}>
        <Shimmer style={styles.heroTextLine1} />
        <Shimmer style={styles.heroTextLine2} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// CountdownSkeleton — 3 equal-width cells in a row
// Matches: CountdownTimer 3-segment display
// ---------------------------------------------------------------------------
export function CountdownSkeleton() {
  return (
    <View style={styles.countdownRow}>
      <Shimmer style={styles.countdownCell} />
      <Shimmer style={styles.countdownCell} />
      <Shimmer style={styles.countdownCell} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// TimelineSkeleton — 3 event rows each with a dot indicator + card
// Matches: DayTimeline event list
// ---------------------------------------------------------------------------
export function TimelineSkeleton() {
  return (
    <View style={styles.timelineContainer}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.timelineRow}>
          <Shimmer style={styles.timelineDot} />
          <Shimmer style={styles.timelineCard} />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// InsightSkeleton — single pill-shaped row
// Matches: InsightCard single-row variant
// ---------------------------------------------------------------------------
export function InsightSkeleton() {
  return (
    <View style={styles.insightRow}>
      <Shimmer style={styles.insightIcon} />
      <Shimmer style={styles.insightText} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: BACKGROUND.elevated,
    borderRadius: 6,
  },

  // Hero
  heroContainer: {
    alignItems: 'center',
    gap: 12,
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  heroTextGroup: {
    alignItems: 'center',
    gap: 8,
  },
  heroTextLine1: {
    width: 120,
    height: 14,
    borderRadius: 7,
  },
  heroTextLine2: {
    width: 80,
    height: 10,
    borderRadius: 5,
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countdownCell: {
    flex: 1,
    height: 64,
    borderRadius: 10,
  },

  // Timeline
  timelineContainer: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineCard: {
    flex: 1,
    height: 52,
    borderRadius: 10,
  },

  // Insight
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  insightText: {
    flex: 1,
    height: 14,
    borderRadius: 7,
  },
});
