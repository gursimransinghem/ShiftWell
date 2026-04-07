/**
 * AutopilotActivationCard — Phase 34 (30-Day Autopilot)
 *
 * Shown on the Today screen when the user becomes eligible for autopilot
 * (eligible=true, enabled=false, card not dismissed within 7 days).
 *
 * Design: matches AdaptiveInsightCard — dark glass background, gold accent,
 * no border radius extremes.
 */

import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import { useAutopilotStore } from '@/src/store/autopilot-store';

const GOLD = COLORS.accent.primary;          // #C8A84B
const GOLD_MUTED = COLORS.accent.primaryMuted; // #8B6914

interface Props {
  /** Called after the user taps "Enable Autopilot" and the animation completes */
  onEnabled?: () => void;
  /** Called after the user taps "Not Now" */
  onDismissed?: () => void;
}

export function AutopilotActivationCard({ onEnabled, onDismissed }: Props) {
  const { eligible, enabled, cardDismissedAt, enable, dismissCard } = useAutopilotStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Card is visible only when:
  //   1. User is eligible
  //   2. Autopilot is not yet enabled
  //   3. Card was not dismissed within the last 7 days
  const dismissedRecently = (() => {
    if (!cardDismissedAt) return false;
    const dismissedMs = new Date(cardDismissedAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedMs < sevenDaysMs;
  })();

  if (!eligible || enabled || hidden || dismissedRecently) return null;

  const handleEnable = () => {
    enable();
    setShowSuccess(true);
    // Hide card after brief confirmation
    setTimeout(() => {
      setHidden(true);
      onEnabled?.();
    }, 1800);
  };

  const handleDismiss = () => {
    dismissCard();
    setHidden(true);
    onDismissed?.();
  };

  if (showSuccess) {
    return (
      <View style={styles.successCard}>
        <Ionicons name="checkmark-circle" size={20} color={GOLD} />
        <Text style={styles.successText}>Autopilot enabled</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="speedometer-outline" size={18} color={GOLD} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Autopilot Ready</Text>
          <Text style={styles.subtitle}>30 days of data collected</Text>
        </View>
      </View>

      {/* Body */}
      <Text style={styles.body}>
        After 30 days of data, ShiftWell can now make small adjustments to your
        sleep windows automatically — always within safe limits, always reversible.
      </Text>

      {/* Feature bullets */}
      <View style={styles.bulletList}>
        {FEATURE_BULLETS.map((bullet) => (
          <View key={bullet} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle-outline" size={13} color={GOLD} />
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <Pressable style={styles.enableButton} onPress={handleEnable}>
        <Text style={styles.enableButtonText}>Enable Autopilot</Text>
      </Pressable>

      <Pressable style={styles.dismissLink} onPress={handleDismiss}>
        <Text style={styles.dismissText}>Not Now</Text>
      </Pressable>
    </View>
  );
}

const FEATURE_BULLETS = [
  'Adjustments capped at 30 minutes per cycle',
  'Every change explained in plain language',
  'Exit anytime with one tap',
] as const;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: `${GOLD}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 11,
    color: GOLD,
    marginTop: 1,
  },
  body: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  bulletList: {
    gap: 6,
    marginBottom: SPACING.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bulletText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1,
  },
  enableButton: {
    backgroundColor: GOLD,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  dismissLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dismissText: {
    fontSize: 13,
    color: COLORS.text.dim,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${GOLD}15`,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'center',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: GOLD,
  },
});
