/**
 * BriefFeedbackRow
 *
 * Compact thumbs-up / thumbs-down feedback row displayed below a weekly brief.
 * - Shows "Was this helpful?" with two icon buttons
 * - Thumbs-up turns green when selected; thumbs-down turns red when selected
 * - After feedback is recorded, replaces buttons with "Thanks for your feedback"
 * - Pre-populates selected state from previously recorded feedback
 *
 * Props:
 *   briefId: string — the ID of the WeeklyBrief being rated
 */

import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKGROUND, TEXT, BORDER } from '@/src/theme';
import {
  recordBriefFeedback,
  getFeedbackForBrief,
} from '@/src/lib/ai/feedback-tracker';
import type { BriefFeedback } from '@/src/lib/ai/types';

interface Props {
  briefId: string;
}

export function BriefFeedbackRow({ briefId }: Props) {
  const existing: BriefFeedback | null = getFeedbackForBrief(briefId);
  const [selected, setSelected] = useState<'positive' | 'negative' | null>(
    existing?.rating ?? null,
  );
  const [submitted, setSubmitted] = useState<boolean>(existing !== null);

  const handleFeedback = useCallback(
    (rating: 'positive' | 'negative') => {
      if (submitted) return;
      recordBriefFeedback(briefId, rating);
      setSelected(rating);
      setSubmitted(true);
    },
    [briefId, submitted],
  );

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.confirmText}>Thanks for your feedback</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Was this helpful?</Text>
      <View style={styles.buttons}>
        <Pressable
          style={[
            styles.button,
            selected === 'positive' && styles.buttonPositiveSelected,
          ]}
          onPress={() => handleFeedback('positive')}
          accessibilityLabel="Thumbs up — helpful"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Ionicons
            name="thumbs-up-outline"
            size={18}
            color={selected === 'positive' ? '#34D399' : TEXT.tertiary}
          />
        </Pressable>
        <Pressable
          style={[
            styles.button,
            selected === 'negative' && styles.buttonNegativeSelected,
          ]}
          onPress={() => handleFeedback('negative')}
          accessibilityLabel="Thumbs down — not helpful"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Ionicons
            name="thumbs-down-outline"
            size={18}
            color={selected === 'negative' ? '#F87171' : TEXT.tertiary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER.subtle,
    backgroundColor: BACKGROUND.surface,
  },
  label: {
    fontSize: 13,
    color: TEXT.tertiary,
    letterSpacing: 0.2,
  },
  confirmText: {
    fontSize: 13,
    color: TEXT.secondary,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BACKGROUND.elevated,
  },
  buttonPositiveSelected: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  buttonNegativeSelected: {
    borderColor: '#F87171',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
});
