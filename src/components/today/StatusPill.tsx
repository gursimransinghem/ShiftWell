import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { TEXT, V6_RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatusPillProps {
  state: 'recovery' | 'on-shift' | 'wind-down';
  primaryText: string;
  secondaryText: string;
}

// ---------------------------------------------------------------------------
// State config
// ---------------------------------------------------------------------------

const STATE_CONFIG = {
  recovery: { color: '#34D399', emoji: '🌿' },
  'on-shift': { color: '#FF9F43', emoji: '🏥' },
  'wind-down': { color: '#818CF8', emoji: '🌙' },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StatusPill({ state, primaryText, secondaryText }: StatusPillProps) {
  const { color, emoji } = STATE_CONFIG[state];

  const glowOpacity = useSharedValue(0.06);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.14, { duration: 2000 }),
        withTiming(0.06, { duration: 2000 }),
      ),
      -1,
      false,
    );
  }, [glowOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: `${color}1A`, // 0.1 opacity hex
          borderColor: `${color}2E`,     // 0.18 opacity hex
          shadowColor: color,
        },
        animatedContainerStyle,
      ]}
    >
      {/* Icon container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${color}1F` }, // 0.12 opacity hex
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.primaryText}>{primaryText}</Text>
        <Text style={styles.secondaryText}>{secondaryText}</Text>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: V6_RADIUS.pill,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 18,
  },
  textBlock: {
    flex: 1,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT.primary,
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 12,
    color: TEXT.secondary,
  },
});
