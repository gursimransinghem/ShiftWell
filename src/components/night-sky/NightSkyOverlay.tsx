import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { BACKGROUND, TEXT, ACCENT } from '@/src/theme';
import { StarParticles } from './StarParticles';
import { RechargeArc } from './RechargeArc';
import { BedtimeTipCycler } from './BedtimeTipCycler';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface NightSkyOverlayProps {
  /** main-sleep block start — rendered as the set alarm time */
  alarmTime: Date;
  /** main-sleep block end — latest wake boundary */
  latestWakeTime: Date;
  /** Labels of first 3 blocks starting tomorrow morning */
  tomorrowSchedule: string[];
  /** 0.0 (empty) to 1.0 (full) for the recharge arc */
  fillFraction: number;
  /** Manual close handler */
  onDismiss?: () => void;
}

// ---------------------------------------------------------------------------
// NightSkyOverlay — full-screen modal composing all Night Sky sub-components
// ---------------------------------------------------------------------------
export function NightSkyOverlay({
  alarmTime,
  latestWakeTime,
  tomorrowSchedule,
  fillFraction,
  onDismiss,
}: NightSkyOverlayProps) {
  const alarmLabel = format(alarmTime, 'h:mm a');
  const latestWakeLabel = format(latestWakeTime, 'h:mm a');
  // Cap tomorrow items at 3 per spec
  const scheduleItems = tomorrowSchedule.slice(0, 3);

  return (
    <View style={styles.root}>
      {/* Star field — absolute background layer */}
      <StarParticles />

      <SafeAreaView style={styles.safeArea}>
        {/* Dismiss button — top-right, per D-02 minimal UI */}
        {onDismiss ? (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} accessibilityLabel="Dismiss Night Sky overlay">
            <Text style={styles.dismissLabel}>Done</Text>
          </TouchableOpacity>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero arc section */}
          <Text style={styles.arcLabel}>Sleep Quality</Text>
          <RechargeArc fillFraction={fillFraction} />

          {/* Alarm confirmation */}
          <View style={styles.infoBlock}>
            <Text style={styles.alarmText}>⏰ Alarm set for {alarmLabel}</Text>
            <Text style={styles.secondaryText}>Latest wake: {latestWakeLabel}</Text>
          </View>

          {/* Tomorrow schedule preview */}
          {scheduleItems.length > 0 ? (
            <View style={styles.tomorrowBlock}>
              <Text style={styles.tomorrowHeader}>Tomorrow</Text>
              {scheduleItems.map((label, i) => (
                <Text key={i} style={styles.tomorrowItem}>
                  {label}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Bedtime tip cycler */}
          <BedtimeTipCycler />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles — all colors use theme tokens
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BACKGROUND.primary,
    zIndex: 100,
  },
  safeArea: {
    flex: 1,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  dismissLabel: {
    color: TEXT.secondary,
    fontSize: 15,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  arcLabel: {
    color: TEXT.secondary,
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
  alarmText: {
    color: TEXT.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  secondaryText: {
    color: TEXT.secondary,
    fontSize: 14,
  },
  tomorrowBlock: {
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 8,
  },
  tomorrowHeader: {
    color: ACCENT.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tomorrowItem: {
    color: TEXT.secondary,
    fontSize: 14,
    paddingVertical: 3,
  },
});
