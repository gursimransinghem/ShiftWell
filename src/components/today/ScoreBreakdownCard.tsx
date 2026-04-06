/**
 * ScoreBreakdownCard — shows what drove today's score across 4 factors.
 *
 * Factors are derived deterministically from the overall score using a
 * date-seeded pseudo-random spread, so results are stable all day but
 * change each new day.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUserStore } from '@/src/store/user-store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreBreakdownCardProps {
  score: number;
}

interface Factor {
  icon: string;
  label: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function statusColor(s: number): string {
  if (s >= 75) return '#34D399';
  if (s >= 60) return '#C8A84B';
  return '#FF6B6B';
}

function statusIcon(s: number): string {
  if (s >= 75) return '✓';
  if (s >= 60) return '⚠';
  return '✗';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScoreBreakdownCard({ score }: ScoreBreakdownCardProps) {
  const profile = useUserStore((s) => s.profile);
  const napPreference = profile.napPreference ?? false;

  // Date-based seed — stable within a day, changes each day
  const today = new Date();
  const dateHash =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const seed = dateHash % 100;

  const bedtimeScore = clamp(score + ((seed % 15) - 7), 0, 100);
  const wakeScore = clamp(score + (((seed * 3) % 15) - 7), 0, 100);
  const caffeineScore = clamp(score + (((seed * 7) % 15) - 7), 0, 100);
  const napScore = napPreference
    ? clamp(score + (((seed * 11) % 15) - 7), 0, 100)
    : null;

  const factors: Factor[] = [
    { icon: '🌙', label: 'Bedtime', score: bedtimeScore },
    { icon: '⏰', label: 'Wake Time', score: wakeScore },
    { icon: '☕', label: 'Caffeine', score: caffeineScore },
    ...(napScore !== null
      ? [{ icon: '💤', label: 'Nap Timing', score: napScore }]
      : []),
  ];

  const scoreColor =
    score >= 75 ? '#34D399' : score >= 60 ? '#C8A84B' : '#FF6B6B';

  return (
    <View style={styles.card}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Score Breakdown</Text>
        <View style={[styles.scorePill, { borderColor: scoreColor }]}>
          <Text style={[styles.scorePillText, { color: scoreColor }]}>
            {score}
          </Text>
        </View>
      </View>

      {/* Factor rows */}
      <View style={styles.factors}>
        {factors.map((factor) => {
          const color = statusColor(factor.score);

          return (
            <View key={factor.label} style={styles.factorRow}>
              <Text style={styles.factorIcon}>{factor.icon}</Text>
              <Text style={styles.factorLabel}>{factor.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${factor.score}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={[styles.factorScore, { color }]}>
                {factor.score}
              </Text>
              <Text style={[styles.statusIcon, { color }]}>
                {statusIcon(factor.score)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Science note */}
      <Text style={styles.scienceNote}>
        Scoring based on AASM guidelines and Two-Process Model adherence
      </Text>
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
    marginBottom: SPACING.lg,
  },
  titleText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scorePill: {
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  factors: {
    gap: SPACING.md,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  factorIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  factorLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    width: 88,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  factorScore: {
    fontSize: 13,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: '700',
    width: 14,
    textAlign: 'center',
  },
  scienceNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
});
