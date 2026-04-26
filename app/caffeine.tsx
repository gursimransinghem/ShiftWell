import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useTrackingStore, type CaffeineEntry } from '@/src/store/tracking-store';
import { useTodayPlan } from '@/src/hooks/useTodayPlan';
import { useUserStore } from '@/src/store/user-store';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from '@/src/theme';

const CAFFEINE_PRESETS: { label: string; type: CaffeineEntry['type']; mg: number; emoji: string }[] = [
  { label: 'Coffee (8oz)', type: 'coffee', mg: 95, emoji: '\u{2615}' },
  { label: 'Espresso Shot', type: 'coffee', mg: 63, emoji: '\u{2615}' },
  { label: 'Black Tea', type: 'tea', mg: 47, emoji: '\u{1F375}' },
  { label: 'Green Tea', type: 'tea', mg: 28, emoji: '\u{1F375}' },
  { label: 'Energy Drink', type: 'energy-drink', mg: 160, emoji: '\u{26A1}' },
  { label: 'Cola/Soda', type: 'soda', mg: 34, emoji: '\u{1F964}' },
];

export default function CaffeineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const logCaffeine = useTrackingStore((s) => s.logCaffeine);
  const caffeineLog = useTrackingStore((s) => s.caffeineLog);
  const { todayBlocks } = useTodayPlan();
  const [justLogged, setJustLogged] = useState<string | null>(null);

  const todayEntries = useMemo(() => {
    const now = new Date();
    return caffeineLog.filter(
      (e) =>
        e.timestamp.getFullYear() === now.getFullYear() &&
        e.timestamp.getMonth() === now.getMonth() &&
        e.timestamp.getDate() === now.getDate(),
    );
  }, [caffeineLog]);

  const totalMgToday = useMemo(
    () => todayEntries.reduce((sum, e) => sum + e.mgCaffeine, 0),
    [todayEntries],
  );

  const cutoffBlock = useMemo(
    () => todayBlocks.find((b) => b.type === 'caffeine-cutoff' && b.label === 'Caffeine Cutoff'),
    [todayBlocks],
  );

  const now = new Date();
  const isPastCutoff = cutoffBlock ? now.getTime() >= cutoffBlock.start.getTime() : false;

  const remainingMg = Math.max(0, 400 - totalMgToday);

  const handleLog = useCallback(
    (preset: (typeof CAFFEINE_PRESETS)[number]) => {
      logCaffeine({
        timestamp: new Date(),
        type: preset.type,
        mgCaffeine: preset.mg,
        label: preset.label,
      });
      setJustLogged(preset.label);
      setTimeout(() => setJustLogged(null), 1500);
    },
    [logCaffeine],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>{'\u{2190}'} Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Caffeine</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{'\u{2615}'}</Text>
          <Text style={styles.statusAmount}>{totalMgToday} mg</Text>
          <Text style={styles.statusLabel}>consumed today</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.min(100, (totalMgToday / 400) * 100)}%`,
                  backgroundColor:
                    totalMgToday > 400
                      ? COLORS.semantic.error
                      : totalMgToday > 300
                        ? COLORS.semantic.warning
                        : COLORS.semantic.success,
                },
              ]}
            />
          </View>
          <Text style={styles.meterLabel}>
            {remainingMg > 0
              ? `${remainingMg} mg remaining (of 400 mg daily limit)`
              : 'Daily limit reached'}
          </Text>
        </Card>

        {/* Cutoff warning */}
        {isPastCutoff && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningText}>
              {'\u{26A0}'} Past your caffeine cutoff ({cutoffBlock ? format(cutoffBlock.start, 'h:mm a') : ''}).
              Caffeine now may disrupt sleep.
            </Text>
          </Card>
        )}

        {/* Cutoff info */}
        {cutoffBlock && !isPastCutoff && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>
              Cutoff at {format(cutoffBlock.start, 'h:mm a')} — based on your {profile.caffeineHalfLife}h half-life
            </Text>
          </Card>
        )}

        {/* Quick log */}
        <Text style={styles.sectionLabel}>QUICK LOG</Text>
        <View style={styles.presetGrid}>
          {CAFFEINE_PRESETS.map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => handleLog(preset)}
              style={({ pressed }) => [
                styles.presetCard,
                pressed && styles.presetPressed,
                justLogged === preset.label && styles.presetJustLogged,
              ]}
            >
              <Text style={styles.presetEmoji}>{preset.emoji}</Text>
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text style={styles.presetMg}>{preset.mg} mg</Text>
              {justLogged === preset.label && (
                <Text style={styles.loggedBadge}>{'\u{2713}'} Logged</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Today's log */}
        {todayEntries.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TODAY&apos;S LOG</Text>
            {todayEntries
              .slice()
              .reverse()
              .map((entry) => (
                <View key={entry.id} style={styles.logRow}>
                  <Text style={styles.logTime}>
                    {format(entry.timestamp, 'h:mm a')}
                  </Text>
                  <Text style={styles.logLabel}>{entry.label}</Text>
                  <Text style={styles.logMg}>{entry.mgCaffeine} mg</Text>
                </View>
              ))}
          </>
        )}

        {/* Science note */}
        <Card style={styles.scienceCard}>
          <Text style={styles.scienceTitle}>Why track caffeine?</Text>
          <Text style={styles.scienceBody}>
            Caffeine has a half-life of {profile.caffeineHalfLife} hours. Even 6 hours before bed,
            it can reduce total sleep by up to 1 hour (Drake et al., 2013).
            The AASM recommends staying under 400 mg/day with a cutoff 6-8 hours before sleep.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: { width: 70, minHeight: 44, justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.heading3, color: COLORS.text.primary, fontSize: 17 },
  cancelText: { color: COLORS.accent.primary, fontSize: 16, fontWeight: '500' },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  statusCard: { alignItems: 'center', paddingVertical: SPACING['2xl'] },
  statusEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  statusAmount: { ...TYPOGRAPHY.heading1, color: COLORS.text.primary },
  statusLabel: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, marginBottom: SPACING.lg },
  meterTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.background.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  meterFill: { height: '100%', borderRadius: RADIUS.full },
  meterLabel: { ...TYPOGRAPHY.caption, color: COLORS.text.tertiary },

  warningCard: {
    backgroundColor: COLORS.semantic.errorMuted,
    borderColor: COLORS.semantic.error,
    marginTop: SPACING.lg,
  },
  warningText: { ...TYPOGRAPHY.bodySmall, color: COLORS.semantic.error },

  infoCard: {
    backgroundColor: COLORS.semantic.infoMuted,
    borderColor: COLORS.semantic.info,
    marginTop: SPACING.lg,
  },
  infoText: { ...TYPOGRAPHY.bodySmall, color: COLORS.accent.primary },

  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginTop: SPACING['2xl'],
    marginBottom: SPACING.md,
  },

  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  presetCard: {
    width: '47%',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  presetPressed: { borderColor: COLORS.accent.primary, opacity: 0.8 },
  presetJustLogged: { borderColor: COLORS.semantic.success, backgroundColor: COLORS.semantic.successMuted },
  presetEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  presetLabel: { ...TYPOGRAPHY.label, color: COLORS.text.primary, textAlign: 'center' },
  presetMg: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginTop: 2 },
  loggedBadge: { ...TYPOGRAPHY.caption, color: COLORS.semantic.success, marginTop: SPACING.xs },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  logTime: { ...TYPOGRAPHY.bodySmall, color: COLORS.text.tertiary, width: 80 },
  logLabel: { ...TYPOGRAPHY.body, color: COLORS.text.primary, flex: 1 },
  logMg: { ...TYPOGRAPHY.label, color: BLOCK_COLORS.caffeineCutoff },

  scienceCard: { marginTop: SPACING['2xl'] },
  scienceTitle: { ...TYPOGRAPHY.label, color: COLORS.text.primary, marginBottom: SPACING.sm },
  scienceBody: { ...TYPOGRAPHY.bodySmall, color: COLORS.text.secondary, lineHeight: 20 },
});
