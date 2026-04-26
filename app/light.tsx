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

import Card from '@/src/components/ui/Card';
import { useTrackingStore, type LightEntry } from '@/src/store/tracking-store';
import { useTodayPlan } from '@/src/hooks/useTodayPlan';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from '@/src/theme';

const LIGHT_PRESETS: {
  label: string;
  type: LightEntry['type'];
  duration: number;
  emoji: string;
  desc: string;
}[] = [
  {
    label: 'Bright Light',
    type: 'bright-light',
    duration: 30,
    emoji: '\u{2600}',
    desc: '30 min outdoor or light therapy',
  },
  {
    label: 'Blue-Blockers On',
    type: 'blue-blockers',
    duration: 60,
    emoji: '\u{1F576}',
    desc: 'Wearing blue-blocking glasses',
  },
  {
    label: 'Dim Lights',
    type: 'dim-lights',
    duration: 120,
    emoji: '\u{1F31C}',
    desc: 'Dimmed room lights pre-sleep',
  },
  {
    label: 'Screens Off',
    type: 'screens-off',
    duration: 30,
    emoji: '\u{1F4F4}',
    desc: 'No screens before bed',
  },
];

export default function LightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logLight = useTrackingStore((s) => s.logLight);
  const lightLog = useTrackingStore((s) => s.lightLog);
  const { todayBlocks } = useTodayPlan();
  const [justLogged, setJustLogged] = useState<string | null>(null);

  const todayEntries = useMemo(() => {
    const now = new Date();
    return lightLog.filter(
      (e) =>
        e.timestamp.getFullYear() === now.getFullYear() &&
        e.timestamp.getMonth() === now.getMonth() &&
        e.timestamp.getDate() === now.getDate(),
    );
  }, [lightLog]);

  const lightBlocks = useMemo(
    () =>
      todayBlocks.filter(
        (b) => b.type === 'light-seek' || b.type === 'light-avoid',
      ),
    [todayBlocks],
  );

  const now = new Date();
  const activeLight = lightBlocks.find(
    (b) => now >= b.start && now <= b.end,
  );

  const brightMinutes = useMemo(
    () =>
      todayEntries
        .filter((e) => e.type === 'bright-light')
        .reduce((sum, e) => sum + e.durationMinutes, 0),
    [todayEntries],
  );

  const handleLog = useCallback(
    (preset: (typeof LIGHT_PRESETS)[number]) => {
      logLight({
        timestamp: new Date(),
        type: preset.type,
        durationMinutes: preset.duration,
        label: preset.label,
      });
      setJustLogged(preset.label);
      setTimeout(() => setJustLogged(null), 1500);
    },
    [logLight],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>{'\u{2190}'} Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Light</Text>
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
          <Text style={styles.statusEmoji}>
            {activeLight?.type === 'light-seek' ? '\u{2600}' : activeLight?.type === 'light-avoid' ? '\u{1F31C}' : '\u{1F4A1}'}
          </Text>
          {activeLight ? (
            <>
              <Text style={styles.statusTitle}>{activeLight.label}</Text>
              <Text style={styles.statusDesc}>{activeLight.description}</Text>
              <View style={[styles.activeBadge, {
                backgroundColor: activeLight.type === 'light-seek'
                  ? BLOCK_COLORS.lightProtocol + '33'
                  : COLORS.semantic.infoMuted,
              }]}>
                <Text style={[styles.activeBadgeText, {
                  color: activeLight.type === 'light-seek'
                    ? BLOCK_COLORS.lightProtocol
                    : COLORS.accent.primary,
                }]}>
                  Active now — until {format(activeLight.end, 'h:mm a')}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>No active protocol</Text>
              <Text style={styles.statusDesc}>
                {brightMinutes > 0
                  ? `${brightMinutes} min bright light logged today`
                  : 'Log your light exposure below'}
              </Text>
            </>
          )}
        </Card>

        {/* Today's protocol from plan */}
        {lightBlocks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TODAY&apos;S LIGHT PROTOCOL</Text>
            {lightBlocks.map((block) => {
              const isPast = block.end < now;
              const isActive = block.start <= now && now <= block.end;
              return (
                <View
                  key={block.id}
                  style={[
                    styles.protocolRow,
                    isPast && styles.protocolPast,
                    isActive && styles.protocolActive,
                  ]}
                >
                  <Text style={styles.protocolEmoji}>
                    {block.type === 'light-seek' ? '\u{2600}' : '\u{1F576}'}
                  </Text>
                  <View style={styles.protocolContent}>
                    <Text style={[styles.protocolLabel, isPast && styles.textMuted]}>
                      {block.label}
                    </Text>
                    <Text style={[styles.protocolTime, isPast && styles.textMuted]}>
                      {format(block.start, 'h:mm a')} – {format(block.end, 'h:mm a')}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowText}>NOW</Text>
                    </View>
                  )}
                  {isPast && <Text style={styles.checkMark}>{'\u{2713}'}</Text>}
                </View>
              );
            })}
          </>
        )}

        {/* Quick log */}
        <Text style={styles.sectionLabel}>QUICK LOG</Text>
        <View style={styles.presetGrid}>
          {LIGHT_PRESETS.map((preset) => (
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
              <Text style={styles.presetDesc}>{preset.desc}</Text>
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
                  <Text style={styles.logDuration}>{entry.durationMinutes} min</Text>
                </View>
              ))}
          </>
        )}

        {/* Science note */}
        <Card style={styles.scienceCard}>
          <Text style={styles.scienceTitle}>Why light matters</Text>
          <Text style={styles.scienceBody}>
            Light is the most powerful zeitgeber (time-giver) for your circadian clock.
            Bright light ({'>'}2500 lux) can shift your clock by ~1 hour per day.
            Correctly timed exposure helps shift workers adapt faster. Blue-blocking glasses
            on the commute home after night shifts protect your daytime sleep
            (Eastman & Burgess, 2009).
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background.primary },
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
  statusTitle: { ...TYPOGRAPHY.heading3, color: COLORS.text.primary, marginBottom: SPACING.xs },
  statusDesc: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, textAlign: 'center' },
  activeBadge: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  activeBadgeText: { ...TYPOGRAPHY.caption, fontWeight: '600' },

  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginTop: SPACING['2xl'],
    marginBottom: SPACING.md,
  },

  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  protocolPast: { opacity: 0.5 },
  protocolActive: { borderColor: BLOCK_COLORS.lightProtocol },
  protocolEmoji: { fontSize: 22, marginRight: SPACING.md },
  protocolContent: { flex: 1 },
  protocolLabel: { ...TYPOGRAPHY.label, color: COLORS.text.primary },
  protocolTime: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginTop: 2 },
  textMuted: { color: COLORS.text.tertiary },
  nowBadge: {
    backgroundColor: BLOCK_COLORS.lightProtocol + '33',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  nowText: { ...TYPOGRAPHY.caption, color: BLOCK_COLORS.lightProtocol, fontWeight: '700' },
  checkMark: { color: COLORS.semantic.success, fontSize: 16 },

  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
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
  presetDesc: { ...TYPOGRAPHY.caption, color: COLORS.text.tertiary, textAlign: 'center', marginTop: 2 },
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
  logDuration: { ...TYPOGRAPHY.label, color: BLOCK_COLORS.lightProtocol },

  scienceCard: { marginTop: SPACING['2xl'] },
  scienceTitle: { ...TYPOGRAPHY.label, color: COLORS.text.primary, marginBottom: SPACING.sm },
  scienceBody: { ...TYPOGRAPHY.bodySmall, color: COLORS.text.secondary, lineHeight: 20 },
});
