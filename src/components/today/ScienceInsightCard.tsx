/**
 * ScienceInsightCard — Feature 3
 *
 * Daily rotating science-backed insight card. Richer version of InsightLine —
 * shows tip emoji, title, expandable body, category badge, and citation.
 * Rotates daily using a date hash (same tip all day, changes each day).
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import { getTipOfTheDay, getCategoryColor, getCategoryLabel } from '@/src/lib/tips/sleep-tips';
import { useUserStore } from '@/src/store/user-store';
import { usePlanStore } from '@/src/store/plan-store';
import type { DayType } from '@/src/lib/circadian/types';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScienceInsightCardProps {
  /** Override day type for tip selection (defaults to 'off') */
  dayType?: DayType;
}

export function ScienceInsightCard({ dayType = 'off' }: ScienceInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const profile = useUserStore((s) => s.profile);

  const tip = getTipOfTheDay(dayType, profile);
  if (!tip) return null;

  const categoryColor = getCategoryColor(tip.category);
  const categoryLabel = getCategoryLabel(tip.category);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel="Science insight card">
      <View style={[styles.card, { borderLeftColor: categoryColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{tip.emoji}</Text>
          <View style={styles.headerMeta}>
            <View style={[styles.categoryPill, { backgroundColor: `${categoryColor}20` }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {categoryLabel}
              </Text>
            </View>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 2}>
              {tip.title}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.text.muted}
            style={styles.chevron}
          />
        </View>

        {/* Collapsed preview */}
        {!expanded && (
          <Text style={styles.preview} numberOfLines={1}>
            {tip.body.split('. ')[0] + '.'}
          </Text>
        )}

        {/* Expanded body */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.body}>{tip.body}</Text>
            {tip.source && (
              <View style={styles.citationRow}>
                <Ionicons name="flask-outline" size={12} color={COLORS.text.muted} />
                <Text style={styles.citation}>Source: {tip.source}</Text>
              </View>
            )}
          </View>
        )}

        {/* Label row */}
        <View style={styles.footerRow}>
          <Ionicons name="bulb-outline" size={11} color={COLORS.text.muted} />
          <Text style={styles.footerText}>Daily science insight · Tap to {expanded ? 'collapse' : 'expand'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
    borderLeftWidth: 3,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 30,
  },
  headerMeta: {
    flex: 1,
    gap: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 19,
  },
  chevron: {
    marginTop: 4,
  },
  preview: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 17,
    marginLeft: 36,
  },
  expandedContent: {
    marginLeft: 36,
    gap: 10,
  },
  body: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 19,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  citation: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.text.muted,
  },
});
