/**
 * Sleep Comparison Card — planned vs actual bedtime, wake, and duration.
 *
 * Shows a structured comparison of last night's planned sleep window
 * against what HealthKit actually recorded, with color-coded deviation
 * badges to quickly convey how close the user was to the plan.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import Card from '@/src/components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/src/theme';
import type { SleepComparison } from '@/src/lib/healthkit/sleep-comparison';

// ---------------------------------------------------------------------------
// Deviation color thresholds
// ---------------------------------------------------------------------------

const DEV_GREEN = '#34D399';
const DEV_YELLOW = '#FBBF24';
const DEV_RED = '#FF6B6B';

function deviationColor(absMinutes: number): string {
  if (absMinutes <= 15) return DEV_GREEN;
  if (absMinutes <= 45) return DEV_YELLOW;
  return DEV_RED;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

function formatDuration(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  return `${h}h ${m}m`;
}

function formatDeviation(minutes: number): string {
  const abs = Math.abs(minutes);
  if (abs < 1) return 'On time';
  const sign = minutes > 0 ? '+' : '-';
  if (abs < 60) return `${sign}${abs}m`;
  return `${sign}${formatDuration(abs)}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SleepComparisonCardProps {
  comparison: SleepComparison | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SleepComparisonCard({ comparison }: SleepComparisonCardProps) {
  if (!comparison) {
    return (
      <Card style={styles.card}>
        <Text style={styles.header}>LAST NIGHT</Text>
        <Text style={styles.noData}>No plan data available</Text>
      </Card>
    );
  }

  const hasActual = comparison.actual !== null;

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>LAST NIGHT</Text>

      {/* Column headers */}
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        <Text style={styles.colHeader}>Planned</Text>
        <Text style={styles.colHeader}>Actual</Text>
        <View style={styles.devCol} />
      </View>

      {/* Bedtime row */}
      <ComparisonRow
        label="Bedtime"
        planned={formatTime(comparison.planned.start)}
        actual={hasActual ? formatTime(comparison.actual!.start) : null}
        deviationMinutes={comparison.bedtimeDeviationMinutes}
        hasActual={hasActual}
      />

      {/* Wake time row */}
      <ComparisonRow
        label="Wake"
        planned={formatTime(comparison.planned.end)}
        actual={hasActual ? formatTime(comparison.actual!.end) : null}
        deviationMinutes={comparison.wakeDeviationMinutes}
        hasActual={hasActual}
      />

      {/* Duration row */}
      <ComparisonRow
        label="Duration"
        planned={formatDuration(comparison.planned.durationMinutes)}
        actual={hasActual ? formatDuration(comparison.actual!.durationMinutes) : null}
        deviationMinutes={comparison.durationDeviationMinutes}
        hasActual={hasActual}
        isLast
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Row sub-component
// ---------------------------------------------------------------------------

interface ComparisonRowProps {
  label: string;
  planned: string;
  actual: string | null;
  deviationMinutes: number;
  hasActual: boolean;
  isLast?: boolean;
}

function ComparisonRow({
  label,
  planned,
  actual,
  deviationMinutes,
  hasActual,
  isLast = false,
}: ComparisonRowProps) {
  const absDeviation = Math.abs(deviationMinutes);
  const color = deviationColor(absDeviation);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.timeValue}>{planned}</Text>
      <Text style={[styles.timeValue, !hasActual && styles.noDataValue]}>
        {hasActual ? actual : 'No data'}
      </Text>
      {hasActual ? (
        <View style={[styles.devBadge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.devText, { color }]}>
            {formatDeviation(deviationMinutes)}
          </Text>
        </View>
      ) : (
        <View style={styles.devCol} />
      )}
    </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelCol: {
    flex: 1,
  },
  colHeader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    width: 64,
    textAlign: 'center',
  },
  devCol: {
    width: 72,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  rowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  timeValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    width: 64,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  noDataValue: {
    color: COLORS.text.tertiary,
  },
  devBadge: {
    width: 72,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  devText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  noData: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});
