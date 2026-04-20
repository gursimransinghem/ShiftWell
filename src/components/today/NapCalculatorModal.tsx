/**
 * NapCalculatorModal — bottom-sheet modal for optimal nap duration selection.
 *
 * Science-backed nap options with sleep stage explanations.
 * Default selection: 20-min Classic Power Nap.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NapCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NapOption {
  minutes: number;
  type: string;
  emoji: string;
  color: string;
  benefit: string;
  science: string;
  bestFor: string;
  avoidInertia: boolean;
  badge?: string;
}

// ---------------------------------------------------------------------------
// Nap science data
// ---------------------------------------------------------------------------

const NAP_OPTIONS: NapOption[] = [
  {
    minutes: 10,
    type: 'Power Nap',
    emoji: '⚡',
    color: '#34D399',
    benefit: 'Instant alertness boost',
    science:
      'Stage N1-N2 sleep only. Zero inertia — you\'ll feel sharp immediately on wake.',
    bestFor: 'Between tasks, pre-commute, when you have < 15 min',
    avoidInertia: false,
  },
  {
    minutes: 20,
    type: 'Classic Power Nap',
    emoji: '💤',
    color: '#60A5FA',
    benefit: 'Optimal alertness + memory',
    science:
      'Peak N2 consolidation window. NASA studies show 26-min naps improve alertness by 54%.',
    bestFor: 'Mid-shift recovery, pre-night shift boost',
    avoidInertia: false,
    badge: 'RECOMMENDED',
  },
  {
    minutes: 30,
    type: 'Extended Nap',
    emoji: '😴',
    color: '#C8A84B',
    benefit: 'Deeper rest, mild inertia',
    science:
      'Risk of entering N3 (deep sleep). Allow 15-20 min recovery before driving or critical tasks.',
    bestFor: 'When you have buffer time post-nap',
    avoidInertia: true,
  },
  {
    minutes: 60,
    type: 'SWS Nap',
    emoji: '🧠',
    color: '#FB923C',
    benefit: 'Memory consolidation, immune boost',
    science:
      'Enters slow-wave sleep. Expect 20-30 min sleep inertia. Strong improvement in procedural memory.',
    bestFor: 'Recovery day, pre-long shift',
    avoidInertia: true,
  },
  {
    minutes: 90,
    type: 'Full Sleep Cycle',
    emoji: '🌊',
    color: '#A78BFA',
    benefit: 'Complete cognitive reset',
    science:
      'Full NREM+REM cycle. Equivalent to a short overnight. Minimal inertia as you wake from REM.',
    bestFor: 'Pre-night shift extension, severe sleep debt',
    avoidInertia: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NapCalculatorModal({ visible, onClose }: NapCalculatorModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(1);

  const selected = NAP_OPTIONS[selectedIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Bottom sheet — stop propagation so tapping sheet doesn't close */}
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.title}>Nap Calculator</Text>
              <Text style={styles.subtitle}>
                Select available time to find your optimal nap
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Nap option cards — horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
          >
            {NAP_OPTIONS.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <TouchableOpacity
                  key={option.minutes}
                  onPress={() => setSelectedIndex(index)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  style={[
                    styles.optionCard,
                    isSelected ? styles.optionCardSelected : styles.optionCardUnselected,
                  ]}
                >
                  {/* Badge */}
                  {option.badge ? (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{option.badge}</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeSpacer} />
                  )}

                  {/* Emoji */}
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>

                  {/* Minutes */}
                  <Text style={[styles.optionMinutes, { color: option.color }]}>
                    {option.minutes} min
                  </Text>

                  {/* Type */}
                  <Text style={styles.optionType}>{option.type}</Text>

                  {/* Benefit */}
                  <Text style={styles.optionBenefit} numberOfLines={2}>
                    {option.benefit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Detail panel */}
          <View style={styles.detailPanel}>
            {/* Science note */}
            <Text style={styles.scienceText}>{selected.science}</Text>

            {/* Best for */}
            <View style={styles.bestForRow}>
              <Text style={styles.bestForLabel}>Best for: </Text>
              <Text style={styles.bestForValue}>{selected.bestFor}</Text>
            </View>

            {/* Inertia warning */}
            {selected.avoidInertia && (
              <View style={styles.warningRow}>
                <Text style={styles.warningText}>
                  ⚠ Allow 15-20 min before driving or critical tasks
                </Text>
              </View>
            )}

            {/* CTA */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.ctaButton}
              accessibilityRole="button"
            >
              <Text style={styles.ctaText}>Start your nap now</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12141F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING['2xl'],
    paddingBottom: SPACING['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.md,
    marginTop: -4,
  },
  optionsList: {
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  optionCard: {
    width: 120,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: COLORS.background.surface,
  },
  optionCardSelected: {
    borderColor: '#7B61FF',
    borderWidth: 1.5,
    backgroundColor: 'rgba(123,97,255,0.08)',
  },
  optionCardUnselected: {
    borderColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(123,97,255,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B61FF',
    letterSpacing: 0.5,
  },
  badgeSpacer: {
    height: 18,
    marginBottom: 6,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  optionMinutes: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionType: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionBenefit: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  detailPanel: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.background.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  scienceText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  bestForRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bestForLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bestForValue: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  warningRow: {
    backgroundColor: '#FB923C1A',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  warningText: {
    fontSize: 12,
    color: '#FB923C',
    lineHeight: 17,
  },
  ctaButton: {
    backgroundColor: '#7B61FF',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
