/**
 * TipCard — displays a single sleep tip in a collapsible card.
 *
 * Shows emoji + title + first line when collapsed.
 * Expands to reveal full body, category badge, and source on tap.
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
import Card from '../ui/Card';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import type { SleepTip } from '../../lib/tips/sleep-tips';
import { getCategoryColor, getCategoryLabel } from '../../lib/tips/sleep-tips';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TipCardProps {
  tip: SleepTip;
  /** Start expanded (default: false) */
  initialExpanded?: boolean;
}

export default function TipCard({ tip, initialExpanded = false }: TipCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const categoryColor = getCategoryColor(tip.category);
  const categoryLabel = getCategoryLabel(tip.category);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  // Extract first sentence for collapsed preview
  const firstSentence = tip.body.split('. ')[0] + '.';

  return (
    <Pressable onPress={toggle} accessibilityRole="button">
      <Card style={[styles.card, { borderLeftColor: categoryColor }]}>
        {/* Header row: emoji + title + chevron */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{tip.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 2}>
              {tip.title}
            </Text>
            {!expanded && (
              <Text style={styles.preview} numberOfLines={1}>
                {firstSentence}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>{expanded ? '\u25B2' : '\u25BC'}</Text>
        </View>

        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.body}>{tip.body}</Text>

            {/* Footer row: category badge + source */}
            <View style={styles.footer}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColor + '20' },
                ]}
              >
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {categoryLabel}
                </Text>
              </View>

              {tip.source && (
                <Text style={styles.source}>Source: {tip.source}</Text>
              )}
            </View>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  preview: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    marginLeft: 8,
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 12,
    marginLeft: 36, // Align with text (emoji width + margin)
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  source: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});
