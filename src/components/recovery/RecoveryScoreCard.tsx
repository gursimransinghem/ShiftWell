/**
 * Recovery Score Card — circular score display with trend and streak.
 *
 * Shows the user's overall adherence score (0-100) in a large ring,
 * along with a supportive insight message, weekly trend indicator,
 * and streak badge for consecutive adherent days.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/src/components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Score color thresholds
// ---------------------------------------------------------------------------

const SCORE_RED = '#FF6B6B';
const SCORE_YELLOW = '#FBBF24';
const SCORE_GREEN = '#34D399';

function scoreColor(score: number): string {
  if (score <= 40) return SCORE_RED;
  if (score <= 70) return SCORE_YELLOW;
  return SCORE_GREEN;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecoveryScoreCardProps {
  score: number | null;
  insight: string;
  streakDays: number;
  weeklyTrend: 'improving' | 'stable' | 'declining';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RecoveryScoreCard({
  score,
  insight,
  streakDays,
  weeklyTrend,
}: RecoveryScoreCardProps) {
  const hasScore = score !== null;
  const color = hasScore ? scoreColor(score) : COLORS.text.tertiary;

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>RECOVERY SCORE</Text>

      {/* Circular score ring */}
      <View style={styles.ringContainer}>
        <View style={[styles.ring, { borderColor: hasScore ? color : COLORS.border.default }]}>
          {hasScore ? (
            <>
              <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </>
          ) : (
            <Text style={styles.noDataText}>No data</Text>
          )}
        </View>
      </View>

      {/* Trend + Streak row */}
      {hasScore && (
        <View style={styles.badgeRow}>
          <TrendBadge trend={weeklyTrend} />
          {streakDays > 0 && <StreakBadge days={streakDays} />}
        </View>
      )}

      {/* Insight */}
      {insight.length > 0 && (
        <Text style={styles.insight}>{insight}</Text>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TrendBadge({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  const config = {
    improving: { arrow: '\u2191', color: SCORE_GREEN, label: 'Improving' },
    stable: { arrow: '\u2192', color: COLORS.text.secondary, label: 'Stable' },
    declining: { arrow: '\u2193', color: SCORE_RED, label: 'Declining' },
  }[trend];

  return (
    <View style={[styles.pill, { backgroundColor: `${config.color}18` }]}>
      <Text style={[styles.pillText, { color: config.color }]}>
        {config.arrow} {config.label}
      </Text>
    </View>
  );
}

function StreakBadge({ days }: { days: number }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${SCORE_YELLOW}18` }]}>
      <Text style={[styles.pillText, { color: SCORE_YELLOW }]}>
        {'\uD83D\uDD25'} {days}-day streak
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const RING_SIZE = 140;
const RING_BORDER = 6;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  header: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
  },
  ringContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 48,
  },
  scoreLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  noDataText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  insight: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
