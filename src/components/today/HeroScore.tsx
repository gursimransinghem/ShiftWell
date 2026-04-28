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
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TEXT } from '@/src/theme';
import { scoreViewHaptic, scoreHighHaptic } from '@/src/lib/haptics/haptic-service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 124;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const RING_GRADIENT_FROM = '#9C8BFF';
const RING_GRADIENT_TO = '#7B61FF';
const RING_TRACK = 'rgba(123,97,255,0.10)';
const ACTIVE_BAR = '#9C8BFF';
const INACTIVE_BAR = 'rgba(123,97,255,0.22)';

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
  useEffect(() => {
    scoreViewHaptic();
    if (score >= 90) {
      scoreHighHaptic();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const strokeOffset = useSharedValue(CIRCUMFERENCE);
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
        withTiming(0.85, { duration: 2200 }),
        withTiming(0.3, { duration: 2200 }),
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

  const maxScore = Math.max(...weeklyScores, 1);
  const barHeights = weeklyScores.map((s) => Math.max(4, (s / maxScore) * 26));
  const todayIndex = weeklyScores.length - 1;

  const trendColor = trend >= 0 ? '#34D399' : '#FF6B6B';
  const trendArrow = trend >= 0 ? '↑' : '↓';

  return (
    <Animated.View style={[styles.container, heroStyle]}>
      {/* Ring + glow */}
      <View style={styles.ringWrapper}>
        {/* Outer ambient glow */}
        <Animated.View style={[styles.glowOuter, animatedGlowStyle]} />
        {/* Inner soft glow */}
        <View style={styles.glowInner} />

        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          <Defs>
            <LinearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={RING_GRADIENT_FROM} />
              <Stop offset="100%" stopColor={RING_GRADIENT_TO} />
            </LinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={RING_TRACK}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {/* Fill arc with gradient */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="url(#ring-grad)"
            strokeWidth={RING_STROKE}
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
          <Text style={styles.scoreUnit}>/100</Text>
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
                backgroundColor: index === todayIndex ? ACTIVE_BAR : INACTIVE_BAR,
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.label}>
        Recovery Score · {sleepHours}h of {targetHours}h
      </Text>

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
    paddingTop: 20,
    paddingBottom: 22,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOuter: {
    position: 'absolute',
    width: RING_SIZE + 60,
    height: RING_SIZE + 60,
    borderRadius: (RING_SIZE + 60) / 2,
    backgroundColor: 'rgba(123,97,255,0.08)',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  glowInner: {
    position: 'absolute',
    width: RING_SIZE - 16,
    height: RING_SIZE - 16,
    borderRadius: (RING_SIZE - 16) / 2,
    backgroundColor: 'rgba(123,97,255,0.05)',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreText: {
    fontSize: 44,
    fontWeight: '700',
    color: TEXT.primary,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  scoreUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.muted,
    marginLeft: 2,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
    gap: 4,
    height: 28,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    color: TEXT.secondaryBright,
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  trend: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
