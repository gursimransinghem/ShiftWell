import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { TEXT } from '@/src/theme';
import { windDownStartHaptic } from '@/src/lib/haptics/haptic-service';

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
  const prevState = useRef<typeof state>(state);

  useEffect(() => {
    if (state === 'wind-down' && prevState.current !== 'wind-down') {
      windDownStartHaptic();
    }
    prevState.current = state;
  }, [state]);

  const glowOpacity = useSharedValue(0.08);
  const dotPulse = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.18, { duration: 2200 }),
        withTiming(0.08, { duration: 2200 }),
      ),
      -1,
      false,
    );
    dotPulse.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
  }, [glowOpacity, dotPulse]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotPulse.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: `${color}1A`,
          borderColor: `${color}33`,
          shadowColor: color,
        },
        animatedContainerStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${color}26`, borderColor: `${color}33` },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.textBlock}>
        <View style={styles.primaryRow}>
          <Animated.View style={[styles.statusDot, { backgroundColor: color }, dotStyle]} />
          <Text style={styles.primaryText} numberOfLines={1}>{primaryText}</Text>
        </View>
        <Text style={styles.secondaryText} numberOfLines={1}>{secondaryText}</Text>
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 19,
  },
  textBlock: {
    flex: 1,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: 0.1,
    flex: 1,
  },
  secondaryText: {
    fontSize: 12,
    color: TEXT.secondary,
    letterSpacing: 0.1,
  },
});
