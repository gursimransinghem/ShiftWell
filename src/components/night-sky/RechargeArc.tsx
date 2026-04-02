import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ACCENT, BACKGROUND, TEXT } from '@/src/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// AnimatedCircle must be created at MODULE scope (not inside component)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface RechargeArcProps {
  /** 0.0 (empty) to 1.0 (full) */
  fillFraction: number;
}

// ---------------------------------------------------------------------------
// RechargeArc — hero SVG circular arc for Night Sky Mode
// ---------------------------------------------------------------------------
export function RechargeArc({ fillFraction }: RechargeArcProps) {
  const offset = useSharedValue(CIRCUMFERENCE * (1 - fillFraction));

  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - fillFraction), {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillFraction]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  const percentLabel = Math.round(fillFraction * 100) + '%';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG arc */}
      <Svg width={180} height={180} viewBox="0 0 180 180">
        {/* Background track */}
        <Circle
          cx={90}
          cy={90}
          r={RADIUS}
          stroke={BACKGROUND.elevated}
          strokeWidth={12}
          fill="none"
        />
        {/* Animated fill arc */}
        <AnimatedCircle
          cx={90}
          cy={90}
          r={RADIUS}
          stroke={ACCENT.primary}
          strokeWidth={12}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
      </Svg>

      {/* Centered percentage label */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: TEXT.primary,
            fontSize: 28,
            fontWeight: '700',
          }}
        >
          {percentLabel}
        </Text>
      </View>
    </View>
  );
}
