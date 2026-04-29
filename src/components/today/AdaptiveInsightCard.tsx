/**
 * AdaptiveInsightCard
 *
 * Appears at the top of the Today screen when the Adaptive Brain has
 * changed the plan since last open. Shows the primary change with its
 * reason, a science citation if available, and an undo button (24h window).
 *
 * Learning phase (days 1–30): shows [Accept] [Dismiss] — requires user confirmation.
 * Calibrated phase (day 31+): shows [Undo] — silent autopilot, undo available.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/src/theme';
import type { AdaptiveChange, AdaptiveContext, ChangeFactor } from '@/src/lib/adaptive/types';

interface Props {
  changes: AdaptiveChange[];
  context: AdaptiveContext;
  onUndo: () => void;
  onDismiss: () => void;
}

const FACTOR_COLORS: Record<ChangeFactor, string> = {
  circadian: '#7B61FF',  // purple
  debt: '#C8A84B',       // gold
  recovery: '#60A5FA',   // blue
  schedule: '#34D399',   // green
};

const FACTOR_ICONS: Record<ChangeFactor, keyof typeof Ionicons.glyphMap> = {
  circadian: 'moon-outline',
  debt: 'battery-half-outline',
  recovery: 'fitness-outline',
  schedule: 'calendar-outline',
};

export function AdaptiveInsightCard({ changes, context, onUndo, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || changes.length === 0) return null;

  const primary = changes[0];
  const accentColor = FACTOR_COLORS[primary.factor];
  const iconName = FACTOR_ICONS[primary.factor];
  const isLearning = context.meta.learningPhase;

  const hasUndo = !isLearning && context.meta.daysTracked > 0;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${accentColor}20` }]}>
          <Ionicons name={iconName} size={16} color={accentColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>
            {isLearning ? 'Suggested Change' : 'Plan Updated'}
          </Text>
        </View>
        <Pressable onPress={() => { onDismiss(); setDismissed(true); }} hitSlop={10}>
          <Ionicons name="close-circle-outline" size={18} color={COLORS.text.dim} />
        </Pressable>
      </View>

      <Text style={styles.primary}>{primary.humanReadable}</Text>
      <Text style={styles.reason}>{primary.reason}</Text>
      {primary.citation ? (
        <Text style={styles.citation}>
          <Ionicons name="flask-outline" size={10} color={COLORS.text.dim} />
          {'  '}{primary.citation}
        </Text>
      ) : null}

      {changes.length > 1 && (
        <Text style={styles.moreChanges}>
          +{changes.length - 1} more adjustment{changes.length > 2 ? 's' : ''}
        </Text>
      )}

      <View style={styles.actions}>
        {isLearning ? (
          <>
            <Pressable
              style={[styles.actionButton, { borderColor: accentColor }]}
              onPress={() => { onDismiss(); setDismissed(true); }}
            >
              <Text style={[styles.actionText, { color: accentColor }]}>Accept</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.dismissButton]}
              onPress={() => { onDismiss(); setDismissed(true); }}
            >
              <Text style={[styles.actionText, { color: COLORS.text.secondary }]}>Dismiss</Text>
            </Pressable>
          </>
        ) : hasUndo ? (
          <Pressable
            style={[styles.actionButton, styles.undoButton]}
            onPress={() => { onUndo(); setDismissed(true); }}
          >
            <Ionicons name="arrow-undo-outline" size={12} color={COLORS.text.secondary} />
            <Text style={[styles.actionText, { color: COLORS.text.secondary, marginLeft: 4 }]}>
              Undo
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.dim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  primary: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  reason: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  citation: {
    fontSize: 11,
    color: COLORS.text.dim,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  moreChanges: {
    fontSize: 10,
    color: COLORS.text.dim,
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dismissButton: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  undoButton: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
