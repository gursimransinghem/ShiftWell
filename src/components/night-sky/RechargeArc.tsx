import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { BACKGROUND, TEXT } from '@/src/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PURPLE = '#7B61FF';

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
  const rotation = useSharedValue(0);
  const ambientOpacity = useSharedValue(0.5);

  // Arc fill animation
  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - fillFraction), {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillFraction]);

  // 60s slow rotation
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false,
    );
    // Ambient glow pulse: 0.5 → 1 → 0.5 on 4s loop
    ambientOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.5, { duration: 2000 }),
      ),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    shadowColor: PURPLE,
    shadowRadius: 8,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
  }));

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: ambientOpacity.value,
  }));

  const percentValue = Math.round(fillFraction * 100);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient glow behind arc */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: 'rgba(123,97,255,0.12)',
          },
          ambientStyle,
        ]}
      />

      {/* SVG arc with slow rotation */}
      <Animated.View style={containerStyle}>
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
            stroke={PURPLE}
            strokeWidth={12}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedArcProps}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
          />
        </Svg>
      </Animated.View>

      {/* Centered percentage label — not rotated */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text
            style={{
              color: TEXT.primary,
              fontSize: 44,
              fontWeight: '700',
              lineHeight: 48,
            }}
          >
            {percentValue}
          </Text>
          <Text
            style={{
              color: TEXT.muted,
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 4,
              marginLeft: 2,
            }}
          >
            %
          </Text>
        </View>
      </View>
    </View>
  );
}
