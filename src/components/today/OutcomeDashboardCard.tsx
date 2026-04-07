/**
 * OutcomeDashboardCard — Phase 25 (Intelligence Polish)
 *
 * Shows the user's personal sleep improvement outcomes.
 * Only rendered after 14+ days of data (otherwise returns null).
 *
 * Layout:
 *   - Headline: "Your sleep improved X% since you started using ShiftWell"
 *   - Stats row: days tracked, current streak, adherence rate
 *   - Mini progress bars for adherence and streak
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';
import type { PersonalOutcome } from '@/src/lib/intelligence/outcome-calculator';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_DAYS_TO_SHOW = 14;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MiniBarProps {
  value: number;  // 0–100
  color: string;
  label: string;
}

function MiniBar({ value, color, label }: MiniBarProps) {
  const pct = Math.max(2, Math.min(100, value));
  return (
    <View style={styles.miniBarWrapper}>
      <View style={styles.miniBarTrack}>
        <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.miniBarLabel}>{label}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OutcomeDashboardCardProps {
  outcome: PersonalOutcome;
}

export function OutcomeDashboardCard({ outcome }: OutcomeDashboardCardProps) {
  // Hide until we have enough data to show meaningful outcomes
  if (outcome.daysUsing < MIN_DAYS_TO_SHOW) return null;

  const {
    daysUsing,
    sleepImprovement,
    adherenceRate,
    currentStreak,
    bestStreak,
    transitionsHandled,
  } = outcome;

  const hasImprovement = sleepImprovement > 0;
  const headlineText = hasImprovement
    ? `Your sleep improved ${sleepImprovement}% since you started using ShiftWell`
    : 'You\'ve been tracking your sleep with ShiftWell — keep it up!';

  const adherenceColor = adherenceRate >= 70 ? '#34D399' : adherenceRate >= 50 ? '#C8A84B' : '#FF6B6B';
  const streakColor = currentStreak >= 7 ? '#34D399' : currentStreak >= 3 ? '#C8A84B' : COLORS.text.muted;

  return (
    <View style={styles.card}>
      {/* Headline */}
      <View style={styles.titleRow}>
        <Text style={styles.icon}>🌟</Text>
        <Text style={styles.title}>Your Progress</Text>
      </View>

      <Text style={styles.headline}>{headlineText}</Text>

      <View style={styles.divider} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{daysUsing}</Text>
          <Text style={styles.statLabel}>Days{'\n'}Tracked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: streakColor }]}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: adherenceColor }]}>{adherenceRate}%</Text>
          <Text style={styles.statLabel}>On-Time{'\n'}Sleep</Text>
        </View>
        {transitionsHandled > 0 && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{transitionsHandled}</Text>
              <Text style={styles.statLabel}>Shifts{'\n'}Adapted</Text>
            </View>
          </>
        )}
      </View>

      {/* Mini progress indicators */}
      <View style={styles.barsBlock}>
        <MiniBar
          value={adherenceRate}
          color={adherenceColor}
          label={`On-time adherence — ${adherenceRate}% of nights within 30 min of target`}
        />
        {bestStreak > 0 && (
          <MiniBar
            value={Math.min(100, (currentStreak / Math.max(bestStreak, 1)) * 100)}
            color={streakColor}
            label={`Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''} — best: ${bestStreak}`}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  barsBlock: {
    gap: SPACING.sm,
  },
  miniBarWrapper: {
    gap: 4,
  },
  miniBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 6,
    borderRadius: 3,
  },
  miniBarLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    lineHeight: 16,
  },
});
