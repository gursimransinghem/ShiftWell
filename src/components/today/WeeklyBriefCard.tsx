/**
 * WeeklyBriefCard — AI-generated Monday sleep summary.
 *
 * Shows on Today screen on Mondays (or until dismissed).
 * Matches SleepDebtCard card style: COLORS.background.surface, RADIUS.lg, SPACING.lg.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BriefResponse } from '@/src/lib/ai/claude-client';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function trendIndicator(trend: BriefResponse['trend']): string {
  switch (trend) {
    case 'improving':
      return '\u2191'; // ↑
    case 'declining':
      return '\u2193'; // ↓
    case 'stable':
    default:
      return '\u2192'; // →
  }
}

function trendColor(trend: BriefResponse['trend']): string {
  switch (trend) {
    case 'improving':
      return '#34D399';
    case 'declining':
      return '#FF6B6B';
    case 'stable':
    default:
      return '#C8A84B';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WeeklyBriefCardProps {
  brief: BriefResponse;
  onDismiss: () => void;
}

export function WeeklyBriefCard({ brief, onDismiss }: WeeklyBriefCardProps) {
  const indicator = trendIndicator(brief.trend);
  const color = trendColor(brief.trend);
  const trendLabel =
    brief.trend.charAt(0).toUpperCase() + brief.trend.slice(1);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{'📊 Weekly Sleep Brief'}</Text>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={8}
          style={styles.dismissBtn}
          accessibilityLabel="Dismiss weekly brief"
        >
          <Text style={styles.dismissIcon}>{'✕'}</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Summary + trend indicator */}
      <View style={styles.trendRow}>
        <View style={[styles.trendBadge, { borderColor: color }]}>
          <Text style={[styles.trendIndicator, { color }]}>{indicator}</Text>
          <Text style={[styles.trendLabel, { color }]}>{trendLabel}</Text>
        </View>
      </View>
      <Text style={styles.summary}>{brief.summary}</Text>

      {/* Recommendation */}
      <View style={styles.recommendationBlock}>
        <Text style={styles.recommendationTitle}>{'💡 This Week'}</Text>
        <Text style={styles.recommendationBody}>{brief.recommendation}</Text>
      </View>

      {/* Encouragement footer */}
      <Text style={styles.encouragement}>{brief.encouragement}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissIcon: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: SPACING.md,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  trendIndicator: {
    fontSize: 14,
    fontWeight: '700',
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  recommendationBlock: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  recommendationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recommendationBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  encouragement: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.muted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
