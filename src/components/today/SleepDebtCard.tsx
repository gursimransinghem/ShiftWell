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
import { usePlanStore } from '@/src/store/plan-store';
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
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);

  const sleepNeed = profile.sleepNeed ?? 7.5;

  // Use precise adaptive debt/bank when available; fall back to score-based estimate
  const { totalDebt, bankHours } = (() => {
    if (adaptiveContext) {
      const debt = Math.max(0, adaptiveContext.debt.rollingHours);
      const bank = adaptiveContext.debt.bankHours;
      return { totalDebt: debt, bankHours: bank };
    }
    // Fallback: score-based estimation
    const recentScores = dailyHistory
      .filter((d) => d.score !== null)
      .slice(-7) as { dateISO: string; score: number }[];
    const raw = recentScores.length === 0
      ? 2.0
      : recentScores.reduce((sum, d) => sum + deficitForScore(d.score), 0);
    return { totalDebt: Math.min(raw, 10), bankHours: 0 };
  })();

  const debtFraction = totalDebt / 10;
  const bankFraction = bankHours / 2; // bank capped at 2h display
  const paybackNights = Math.ceil(totalDebt / 0.5);
  const color = debtColor(totalDebt);
  const debtLabel = totalDebt === 0 ? '0h' : `${totalDebt % 1 === 0 ? totalDebt : totalDebt.toFixed(1)}h`;
  const bankLabel = bankHours > 0 ? `+${bankHours % 1 === 0 ? bankHours : bankHours.toFixed(1)}h banked` : null;

  return (
    <View style={styles.card}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>💤 Sleep Debt</Text>
        <View style={styles.valueRow}>
          {bankLabel && (
            <Text style={styles.bankValue}>{bankLabel}</Text>
          )}
          <Text style={[styles.debtValue, { color }]}>
            {totalDebt > 0 ? `−${debtLabel}` : debtLabel}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Debt bar */}
      {totalDebt > 0 && (
        <>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(debtFraction * 100, 2)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>
            {adaptiveContext ? 'Deficit from last 14 nights' : 'Estimated deficit over last 7 nights'}
          </Text>
        </>
      )}

      {/* Bank bar (shown when there's a surplus) */}
      {bankHours > 0 && (
        <>
          <View style={[styles.barTrack, totalDebt > 0 && styles.bankTrackMargin]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(bankFraction * 100, 2)}%`,
                  backgroundColor: '#34D399',
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, styles.bankBarLabel]}>
            Sleep bank · Protects vigilance for ~3 days of moderate restriction
          </Text>
        </>
      )}

      {/* Zero debt, zero bank */}
      {totalDebt === 0 && bankHours === 0 && (
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  debtValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34D399',
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
  bankTrackMargin: {
    marginTop: SPACING.md,
  },
  bankBarLabel: {
    color: '#34D399',
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
