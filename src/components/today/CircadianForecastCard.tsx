/**
 * CircadianForecastCard — Phase 22
 *
 * Displays upcoming shift transitions with stress severity badges and
 * pre-adaptation protocol actions. Only visible when a medium+ stress
 * transition exists within the next 7 days.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import type { TransitionStressPoint, StressSeverity } from '@/src/lib/predictive/stress-scorer';
import type { PreAdaptationPlan } from '@/src/lib/predictive/pre-adaptation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  stressPoints: TransitionStressPoint[];
  preAdaptation: PreAdaptationPlan | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<StressSeverity, string> = {
  low: '#34D399',    // green
  medium: '#C8A84B', // yellow
  high: '#FB923C',   // orange
  critical: '#FF6B6B', // red
};

const SEVERITY_LABELS: Record<StressSeverity, string> = {
  low: 'Low stress',
  medium: 'Moderate stress',
  high: 'High stress',
  critical: 'Critical stress',
};

function transitionLabel(type: TransitionStressPoint['transitionType']): string {
  switch (type) {
    case 'day-to-night': return 'Day → Night shift';
    case 'night-to-day': return 'Night → Day shift';
    case 'evening-to-night': return 'Evening → Night shift';
    case 'isolated-night': return 'Isolated night shift';
    case 'day-to-evening': return 'Day → Evening shift';
    default: return 'Shift transition';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CircadianForecastCard({ stressPoints, preAdaptation }: Props) {
  // Only show when medium+ stress within 7 days
  const relevantPoints = stressPoints.filter(
    (p) => p.severity !== 'low' && p.daysUntil <= 7,
  );

  if (relevantPoints.length === 0) return null;

  const primary = relevantPoints[0];
  const color = SEVERITY_COLORS[primary.severity];
  const isPreAdapting = preAdaptation !== null;

  return (
    <View>
      <Text style={styles.sectionLabel}>CIRCADIAN FORECAST</Text>

      <View style={[styles.card, { borderLeftColor: color }]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name="moon-outline" size={16} color={color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.transitionLabel}>{transitionLabel(primary.transitionType)}</Text>
            <Text style={styles.dateLabel}>
              {primary.daysUntil === 0
                ? 'Today'
                : primary.daysUntil === 1
                ? 'Tomorrow'
                : `In ${primary.daysUntil} days`}
              {' · '}
              {format(primary.date, 'MMM d')}
            </Text>
          </View>

          {/* Severity badge */}
          <View style={[styles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.badgeText, { color }]}>
              {SEVERITY_LABELS[primary.severity]}
            </Text>
          </View>
        </View>

        {/* Pre-adaptation status */}
        {isPreAdapting && (
          <View style={[styles.statusRow, { backgroundColor: color + '10' }]}>
            <Ionicons name="checkmark-circle" size={14} color={color} />
            <Text style={[styles.statusText, { color }]}>
              Pre-adaptation protocol active
            </Text>
          </View>
        )}

        {/* Today's pre-adaptation action (if any) */}
        {isPreAdapting && preAdaptation!.dailyActions.length > 0 && (() => {
          const todayISO = new Date().toISOString().slice(0, 10);
          const todayAction = preAdaptation!.dailyActions.find(
            (a) => a.date.toISOString().slice(0, 10) === todayISO,
          );
          return todayAction ? (
            <View style={styles.actionBlock}>
              <Text style={styles.actionTitle}>Today's preparation</Text>
              <Text style={styles.actionBody}>{todayAction.lightGuidance}</Text>
              {todayAction.napGuidance && (
                <Text style={styles.actionBody}>{todayAction.napGuidance}</Text>
              )}
              <View style={styles.shiftPill}>
                <Text style={styles.shiftPillText}>
                  Bedtime: {todayAction.bedtimeShift > 0 ? '+' : ''}
                  {todayAction.bedtimeShift} min
                </Text>
              </View>
            </View>
          ) : null;
        })()}

        {/* Additional upcoming transitions */}
        {relevantPoints.length > 1 && (
          <View style={styles.moreRow}>
            <Text style={styles.moreText}>
              +{relevantPoints.length - 1} more transition
              {relevantPoints.length > 2 ? 's' : ''} in the next 7 days
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  transitionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 1,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBlock: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border.subtle,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  actionBody: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  shiftPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.elevated,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    marginTop: 2,
  },
  shiftPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  moreRow: {
    marginTop: SPACING.sm,
  },
  moreText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});
