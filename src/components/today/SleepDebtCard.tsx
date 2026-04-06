/**
 * SleepDebtCard — shows estimated sleep debt over the last 7 nights
 * and a recovery plan to clear it.
 *
 * Logic: maps adherence scores to nightly deficits, sums them (cap 10h),
 * and computes how many nights of +30 min would clear the debt.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useScoreStore } from '@/src/store/score-store';
import { useUserStore } from '@/src/store/user-store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deficitForScore(score: number): number {
  if (score >= 80) return 0;
  if (score >= 60) return 0.5;
  if (score >= 40) return 1.0;
  return 1.5;
}

function debtColor(debt: number): string {
  if (debt < 2) return '#34D399';
  if (debt <= 5) return '#C8A84B';
  return '#FF6B6B';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SleepDebtCard() {
  const dailyHistory = useScoreStore((s) => s.dailyHistory);
  const profile = useUserStore((s) => s.profile);

  const sleepNeed = profile.sleepNeed ?? 7.5;

  // Last 7 entries with a real score
  const recentScores = dailyHistory
    .filter((d) => d.score !== null)
    .slice(-7) as { dateISO: string; score: number }[];

  let totalDebt: number;
  if (recentScores.length === 0) {
    totalDebt = 2.0;
  } else {
    const raw = recentScores.reduce(
      (sum, d) => sum + deficitForScore(d.score),
      0,
    );
    totalDebt = Math.min(raw, 10);
  }

  const debtFraction = totalDebt / 10;
  const paybackNights = Math.ceil(totalDebt / 0.5);
  const color = debtColor(totalDebt);
  const debtLabel = totalDebt === 0 ? '0h' : `${totalDebt % 1 === 0 ? totalDebt : totalDebt.toFixed(1)}h`;

  return (
    <View style={styles.card}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>💤 Sleep Debt</Text>
        <Text style={[styles.debtValue, { color }]}>
          {debtLabel} {totalDebt > 0 ? '▼' : ''}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Debt bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(debtFraction * 100, totalDebt > 0 ? 2 : 0)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={styles.barLabel}>
        Estimated deficit over last 7 nights
      </Text>

      {/* Zero debt state */}
      {totalDebt === 0 && (
        <Text style={styles.onTrack}>
          No debt detected — you're on track!
        </Text>
      )}

      {/* Recovery plan */}
      {totalDebt > 0 && (
        <View style={styles.recoveryBlock}>
          <Text style={styles.recoveryTitle}>⚡ Recovery plan</Text>
          <Text style={styles.recoveryBody}>
            Add 30 min to your next {paybackNights} night
            {paybackNights !== 1 ? 's' : ''} to clear your debt and restore
            peak circadian performance.
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    justifyContent: 'space-between',
  },
  titleText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  debtValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: SPACING.md,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  barLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  onTrack: {
    ...TYPOGRAPHY.bodySmall,
    color: '#34D399',
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  recoveryBlock: {
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  recoveryTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recoveryBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});
