import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { BACKGROUND, TEXT } from '@/src/theme';
import { StarParticles } from './StarParticles';
import { FireflyParticle } from './FireflyParticle';
import { RechargeArc } from './RechargeArc';
import { BedtimeTipCycler } from './BedtimeTipCycler';
import { playNightSkyEnter } from '@/src/lib/audio/sound-service';

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
  useEffect(() => {
    playNightSkyEnter();
  }, []);

  const alarmLabel = format(alarmTime, 'h:mm a');
  const latestWakeLabel = format(latestWakeTime, 'h:mm a');
  // Cap tomorrow items at 3 per spec
  const scheduleItems = tomorrowSchedule.slice(0, 3);

  return (
    <View style={styles.root}>
      {/* Deep night background overlay — lighter center at top */}
      <View style={styles.backgroundBase} />
      <View style={styles.backgroundTopOverlay} />

      {/* Star field — absolute background layer */}
      <StarParticles />

      {/* Firefly particles — warm gold floaters */}
      <FireflyParticle count={4} />

      <SafeAreaView style={styles.safeArea}>
        {/* Dismiss button — circular X, top-right */}
        {onDismiss ? (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityLabel="Dismiss Night Sky overlay"
          >
            <Text style={styles.dismissLabel}>✕</Text>
          </TouchableOpacity>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero arc section */}
          <Text style={styles.arcLabel}>Sleep Quality</Text>
          <RechargeArc fillFraction={fillFraction} />
          <Text style={styles.rechargingLabel}>recharging</Text>

          {/* Alarm confirmation */}
          <View style={styles.infoBlock}>
            <Text style={styles.alarmText}>⏰ {alarmLabel}</Text>
            <Text style={styles.secondaryText}>
              Latest wake: {latestWakeLabel}
            </Text>
          </View>

          {/* Tomorrow schedule preview — glass card */}
          {scheduleItems.length > 0 ? (
            <View style={styles.tomorrowCard}>
              <Text style={styles.tomorrowHeader}>TOMORROW</Text>
              {scheduleItems.map((label, i) => (
                <View key={i} style={styles.tomorrowRow}>
                  <Text style={styles.tomorrowItemName}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Bedtime tip cycler — gold-bordered card */}
          <View style={styles.tipCard}>
            <BedtimeTipCycler />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#060811',
    zIndex: 100,
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060811',
  },
  backgroundTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(10,8,28,0.5)',
  },
  safeArea: {
    flex: 1,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissLabel: {
    color: TEXT.secondary,
    fontSize: 13,
    lineHeight: 16,
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
  rechargingLabel: {
    color: TEXT.muted,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 8,
    textTransform: 'lowercase',
  },
  infoBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
  alarmText: {
    color: TEXT.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  secondaryText: {
    color: TEXT.muted,
    fontSize: 12,
  },
  // Tomorrow card — glass card
  tomorrowCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: BACKGROUND.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
  },
  tomorrowHeader: {
    color: '#C8A84B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  tomorrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tomorrowItemName: {
    color: TEXT.secondaryBright,
    fontSize: 13,
    flex: 1,
  },
  // Bedtime tip card — gold-bordered
  tipCard: {
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.08)',
    backgroundColor: 'rgba(200,168,75,0.04)',
    borderRadius: 12,
    padding: 12,
  },
});
