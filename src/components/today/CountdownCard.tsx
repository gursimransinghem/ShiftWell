import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { differenceInMinutes } from 'date-fns';
import Card from '@/src/components/ui/Card';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CountdownCardProps {
  label: string;
  targetTime: Date;
  color: string;
  emoji: string;
  /** Whether this is the most urgent (first) countdown card */
  isUrgent?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCountdown(diffMins: number): string {
  if (diffMins <= 0) return 'Now';
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CountdownCard({
  label,
  targetTime,
  color,
  emoji,
  isUrgent = false,
}: CountdownCardProps) {
  const calcDiff = useCallback(
    () => differenceInMinutes(targetTime, new Date()),
    [targetTime],
  );

  const [diffMins, setDiffMins] = useState(calcDiff);

  // Breathing opacity animation for urgent card
  const glowOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setDiffMins(calcDiff());
    const id = setInterval(() => setDiffMins(calcDiff()), 60_000);
    return () => clearInterval(id);
  }, [calcDiff]);

  useEffect(() => {
    if (!isUrgent) return;

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, [isUrgent, glowOpacity]);

  const isPast = diffMins < 0;
  const isNow = diffMins >= 0 && diffMins <= 0;

  const cardContent = (
    <Card
      style={[
        styles.card,
        { borderColor: isPast ? COLORS.border.default : `${color}44` },
        isPast && styles.pastCard,
        isUrgent && !isPast && { borderColor: `${color}66` },
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>{emoji}</Text>

        <Text
          style={[styles.label, isPast && styles.pastText]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {isPast ? (
          <Text style={styles.completedText}>Completed</Text>
        ) : (
          <Text style={[styles.countdown, { color }]}>
            {isNow ? 'Now' : `in ${formatCountdown(diffMins)}`}
          </Text>
        )}
      </View>
    </Card>
  );

  if (isUrgent && !isPast) {
    return (
      <Animated.View style={{ opacity: glowOpacity }}>
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  pastCard: {
    opacity: 0.45,
  },
  inner: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  emoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  countdown: {
    ...TYPOGRAPHY.heading3,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  completedText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  pastText: {
    color: COLORS.text.tertiary,
  },
});
