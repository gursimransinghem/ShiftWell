import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { TEXT, heroNumber } from '@/src/theme';
import { scoreViewHaptic, scoreHighHaptic } from '@/src/lib/haptics/haptic-service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 104;
const RING_RADIUS = 48; // (RING_SIZE / 2) - stroke/2 = 52 - 4 = 48
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_COLOR = '#34D399';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HeroScoreProps {
  score: number;
  sleepHours: number;
  targetHours: number;
  weeklyScores: number[];
  trend: number;
  scrollOffset?: SharedValue<number>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroScore({
  score,
  sleepHours,
  targetHours,
  weeklyScores,
  trend,
  scrollOffset,
}: HeroScoreProps) {
  // Haptics on mount
  useEffect(() => {
    scoreViewHaptic();
    if (score >= 90) {
      scoreHighHaptic();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ring fill animation
  const strokeOffset = useSharedValue(CIRCUMFERENCE);

  // Breathing glow animation
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    const fillFraction = Math.min(score / 100, 1);
    strokeOffset.value = withTiming(CIRCUMFERENCE * (1 - fillFraction), {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, strokeOffset]);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 }),
      ),
      -1,
      false,
    );
  }, [glowOpacity]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const heroStyle = useAnimatedStyle(() => {
    if (!scrollOffset) return {};
    return {
      transform: [
        { translateY: scrollOffset.value * -0.4 },
        { scale: interpolate(scrollOffset.value, [0, 200], [1, 0.4], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(scrollOffset.value, [0, 200], [1, 0], Extrapolation.CLAMP),
    };
  });

  // Sparkline bar heights (normalize to max 22px)
  const maxScore = Math.max(...weeklyScores, 1);
  const barHeights = weeklyScores.map((s) => Math.max(4, (s / maxScore) * 22));
  const todayIndex = weeklyScores.length - 1;

  const trendColor = trend >= 0 ? '#34D399' : '#FF6B6B';
  const trendArrow = trend >= 0 ? '↑' : '↓';

  return (
    <Animated.View style={[styles.container, heroStyle]}>
      {/* Ring + glow */}
      <View style={styles.ringWrapper}>
        {/* Breathing glow behind ring */}
        <Animated.View style={[styles.glow, animatedGlowStyle]} />

        {/* SVG ring */}
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="rgba(52,211,153,0.12)"
            strokeWidth={3}
            fill="none"
          />
          {/* Fill arc */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={RING_COLOR}
            strokeWidth={3}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>

        {/* Score centered in ring */}
        <View style={styles.scoreOverlay}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Sparkline */}
      <View style={styles.sparkline}>
        {barHeights.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height,
                backgroundColor:
                  index === todayIndex ? RING_COLOR : 'rgba(52,211,153,0.25)',
              },
            ]}
          />
        ))}
      </View>

      {/* Label */}
      <Text style={styles.label}>
        Recovery Score · {sleepHours}h of {targetHours}h
      </Text>

      {/* Trend */}
      <Text style={[styles.trend, { color: trendColor }]}>
        {trendArrow} {Math.abs(trend)} pts from yesterday
      </Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...heroNumber,
    color: TEXT.primary,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
    gap: 3,
  },
  bar: {
    width: 5,
    borderRadius: 2.5,
  },
  label: {
    fontSize: 13,
    color: TEXT.muted,
    marginTop: 8,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
