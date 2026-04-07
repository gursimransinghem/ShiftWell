/**
 * CircadianForecastCard — Phase 22
 *
 * Displays the most critical upcoming shift transition with a severity badge
 * and pre-adaptation start date prompt.
 *
 * Reads from usePredictionStore().mostCriticalTransition().
 * Falls back gracefully to "Clear skies ahead" when no transitions exist.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import { usePredictionStore } from '@/src/store/prediction-store';
import type { TransitionPrediction } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  /** Optional override — if not provided, reads from prediction store */
  prediction?: TransitionPrediction | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVERITY_COLORS = {
  critical: '#FF3B30',
  high: '#FF9500',
  medium: '#FFCC00',
  low: '#34C759',
};

const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Moderate',
  low: 'Low',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTransitionType(type: string): string {
  switch (type) {
    case 'day-to-night': return 'Day → Night shift';
    case 'night-to-day': return 'Night → Day shift';
    case 'day-to-evening': return 'Day → Evening shift';
    case 'evening-to-day': return 'Evening → Day shift';
    case 'evening-to-night': return 'Evening → Night shift';
    case 'night-to-evening': return 'Night → Evening shift';
    case 'off-to-night': return 'Return to nights';
    case 'off-to-extended': return '24h shift ahead';
    case 'extended-recovery': return 'Extended shift recovery';
    default: return 'Shift transition';
  }
}

function formatDaysUntil(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CircadianForecastCard({ prediction: predictionProp }: Props) {
  const storePrediction = usePredictionStore((s) => s.mostCriticalTransition());
  const prediction = predictionProp !== undefined ? predictionProp : storePrediction;

  // Empty state — clear skies
  if (!prediction) {
    return (
      <View>
        <Text style={styles.sectionLabel}>CIRCADIAN FORECAST</Text>
        <View style={styles.card}>
          <View style={styles.clearRow}>
            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            <Text style={styles.clearText}>Clear skies ahead</Text>
          </View>
          <Text style={styles.clearSubtext}>No high-stress transitions in the next 14 days.</Text>
        </View>
      </View>
    );
  }

  const color = SEVERITY_COLORS[prediction.severity];
  const hasPreAdaptation = prediction.preAdaptationStartDate !== prediction.transitionDate;

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
            <Text style={styles.transitionLabel}>
              {formatTransitionType(prediction.transitionType)}
            </Text>
            <Text style={styles.dateLabel}>
              {formatDaysUntil(prediction.daysUntilTransition)}
              {' · '}
              {formatDate(prediction.transitionDate)}
            </Text>
          </View>

          {/* Severity badge */}
          <View style={[styles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.badgeText, { color }]}>
              {SEVERITY_LABELS[prediction.severity]}
            </Text>
          </View>
        </View>

        {/* Pre-adaptation prompt */}
        {hasPreAdaptation && (
          <View style={[styles.preAdaptRow, { backgroundColor: color + '10' }]}>
            <Ionicons name="calendar-outline" size={13} color={color} />
            <Text style={[styles.preAdaptText, { color }]}>
              Start adapting {formatDate(prediction.preAdaptationStartDate)}
            </Text>
          </View>
        )}

        {/* Alertness nadir footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Predicted alertness nadir: {Math.round(prediction.predictedAlertnesNadir)}%
          </Text>
        </View>
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
    borderLeftColor: COLORS.border.subtle,
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
  preAdaptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  preAdaptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 2,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.text.tertiary,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  clearSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
