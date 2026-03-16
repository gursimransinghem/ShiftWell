/**
 * Weekly Trend Chart — 7-day bar chart of daily adherence scores.
 *
 * Simple, glanceable visualization showing the user's plan adherence
 * over the past week. Color-coded bars make patterns immediately
 * visible (green = great, yellow = okay, red = off-plan, gray = no data).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/src/components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_BAR_HEIGHT = 80;
const BAR_GREEN = '#34D399';
const BAR_YELLOW = '#FBBF24';
const BAR_RED = '#FF6B6B';
const BAR_EMPTY = COLORS.border.default;

function barColor(score: number | null): string {
  if (score === null) return BAR_EMPTY;
  if (score >= 80) return BAR_GREEN;
  if (score >= 50) return BAR_YELLOW;
  return BAR_RED;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeeklyTrendChartProps {
  dailyScores: { day: string; score: number | null }[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WeeklyTrendChart({ dailyScores }: WeeklyTrendChartProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.header}>WEEKLY ADHERENCE</Text>

      <View style={styles.chartContainer}>
        {dailyScores.map((item, index) => {
          const height = item.score !== null
            ? Math.max(4, (item.score / 100) * MAX_BAR_HEIGHT)
            : 4;
          const color = barColor(item.score);

          return (
            <View key={index} style={styles.barColumn}>
              {/* Score label above bar */}
              <Text style={styles.barScore}>
                {item.score !== null ? item.score : '-'}
              </Text>

              {/* Bar container with bottom alignment */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>

              {/* Day label */}
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {},
  header: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barScore: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: MAX_BAR_HEIGHT,
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: RADIUS.sm,
  },
  dayLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
  },
});
