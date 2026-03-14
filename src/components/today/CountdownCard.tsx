import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
}: CountdownCardProps) {
  const calcDiff = useCallback(
    () => differenceInMinutes(targetTime, new Date()),
    [targetTime],
  );

  const [diffMins, setDiffMins] = useState(calcDiff);

  useEffect(() => {
    setDiffMins(calcDiff());
    const id = setInterval(() => setDiffMins(calcDiff()), 60_000);
    return () => clearInterval(id);
  }, [calcDiff]);

  const isPast = diffMins < 0;
  const isNow = diffMins >= 0 && diffMins <= 0;

  return (
    <Card
      style={[
        styles.card,
        { borderColor: isPast ? COLORS.border.default : `${color}44` },
        isPast && styles.pastCard,
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
