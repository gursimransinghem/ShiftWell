import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, differenceInMinutes } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useTrackingStore, type DebriefEntry } from '@/src/store/tracking-store';
import { usePlanStore } from '@/src/store/plan-store';
import { COLORS, BLOCK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'OK', 'Good', 'Great'];
const QUALITY_EMOJIS = ['', '\u{1F629}', '\u{1F615}', '\u{1F610}', '\u{1F60A}', '\u{1F929}'];

export default function DebriefScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logDebrief = useTrackingStore((s) => s.logDebrief);
  const plan = usePlanStore((s) => s.plan);

  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [feltRested, setFeltRested] = useState<boolean | null>(null);
  const [wakeUps, setWakeUps] = useState(0);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const lastSleepBlock = useMemo(() => {
    if (!plan) return null;
    const now = new Date();
    const pastSleep = plan.blocks
      .filter((b) => b.type === 'main-sleep' && b.end.getTime() < now.getTime())
      .sort((a, b) => b.end.getTime() - a.end.getTime());
    return pastSleep[0] ?? null;
  }, [plan]);

  const plannedDuration = lastSleepBlock
    ? differenceInMinutes(lastSleepBlock.end, lastSleepBlock.start)
    : null;

  const handleSave = useCallback(() => {
    if (quality === null) return;
    logDebrief({
      date: new Date(),
      sleepQuality: quality,
      feltRested: feltRested ?? false,
      wakeUps,
      notes: notes.trim(),
    });
    setSaved(true);
    setTimeout(() => router.back(), 800);
  }, [quality, feltRested, wakeUps, notes, logDebrief, router]);

  if (saved) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.savedEmoji}>{'\u{2705}'}</Text>
        <Text style={styles.savedText}>Debrief logged</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Sleep Debrief</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + SPACING['3xl'] },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Last sleep summary */}
          {lastSleepBlock && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Last planned sleep</Text>
              <Text style={styles.summaryTime}>
                {format(lastSleepBlock.start, 'h:mm a')} – {format(lastSleepBlock.end, 'h:mm a')}
              </Text>
              {plannedDuration && (
                <Text style={styles.summaryDuration}>
                  {Math.floor(plannedDuration / 60)}h {plannedDuration % 60}m planned
                </Text>
              )}
            </Card>
          )}

          {/* Sleep quality */}
          <Text style={styles.sectionLabel}>HOW DID YOU SLEEP?</Text>
          <View style={styles.starRow}>
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <Pressable
                key={n}
                onPress={() => setQuality(n)}
                style={[
                  styles.starButton,
                  quality !== null && n <= quality && styles.starActive,
                ]}
              >
                <Text style={styles.starEmoji}>
                  {quality !== null && n <= quality ? '\u{2B50}' : '\u{2606}'}
                </Text>
              </Pressable>
            ))}
          </View>
          {quality !== null && (
            <Text style={styles.qualityLabel}>
              {QUALITY_EMOJIS[quality]} {QUALITY_LABELS[quality]}
            </Text>
          )}

          {/* Felt rested */}
          <Text style={styles.sectionLabel}>DO YOU FEEL RESTED?</Text>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setFeltRested(true)}
              style={[
                styles.toggleButton,
                feltRested === true && styles.toggleActive,
              ]}
            >
              <Text style={styles.toggleEmoji}>{'\u{1F44D}'}</Text>
              <Text style={[styles.toggleText, feltRested === true && styles.toggleTextActive]}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFeltRested(false)}
              style={[
                styles.toggleButton,
                feltRested === false && styles.toggleActive,
              ]}
            >
              <Text style={styles.toggleEmoji}>{'\u{1F44E}'}</Text>
              <Text style={[styles.toggleText, feltRested === false && styles.toggleTextActive]}>
                Not really
              </Text>
            </Pressable>
          </View>

          {/* Wake-ups */}
          <Text style={styles.sectionLabel}>WAKE-UPS DURING SLEEP</Text>
          <View style={styles.counterRow}>
            <Pressable
              onPress={() => setWakeUps(Math.max(0, wakeUps - 1))}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>{'\u{2212}'}</Text>
            </Pressable>
            <Text style={styles.counterValue}>{wakeUps}</Text>
            <Pressable
              onPress={() => setWakeUps(wakeUps + 1)}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Notes */}
          <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything notable? Noise, stress, dreams..."
            placeholderTextColor={COLORS.text.tertiary}
            multiline
            numberOfLines={3}
            selectionColor={COLORS.accent.primary}
          />

          {/* Save */}
          <View style={styles.actions}>
            <Button
              title="Save Debrief"
              onPress={handleSave}
              variant="primary"
              fullWidth
              disabled={quality === null}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background.primary },
  flex: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
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

  summaryCard: { alignItems: 'center', paddingVertical: SPACING.xl },
  summaryLabel: { ...TYPOGRAPHY.caption, color: COLORS.text.tertiary, marginBottom: SPACING.xs },
  summaryTime: { ...TYPOGRAPHY.heading3, color: COLORS.text.primary },
  summaryDuration: { ...TYPOGRAPHY.bodySmall, color: COLORS.text.secondary, marginTop: SPACING.xs },

  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginTop: SPACING['2xl'],
    marginBottom: SPACING.md,
  },

  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  starButton: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starActive: {
    borderColor: BLOCK_COLORS.lightProtocol,
    backgroundColor: BLOCK_COLORS.lightProtocol + '1A',
  },
  starEmoji: { fontSize: 24 },
  qualityLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    minHeight: 44,
  },
  toggleActive: {
    borderColor: COLORS.accent.primary,
    backgroundColor: COLORS.semantic.infoMuted,
  },
  toggleEmoji: { fontSize: 20 },
  toggleText: { ...TYPOGRAPHY.body, color: COLORS.text.secondary },
  toggleTextActive: { color: COLORS.text.primary },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING['2xl'],
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: { ...TYPOGRAPHY.heading3, color: COLORS.text.primary },
  counterValue: { ...TYPOGRAPHY.heading2, color: COLORS.text.primary, minWidth: 40, textAlign: 'center' },

  notesInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    color: COLORS.text.primary,
    fontSize: 15,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  actions: { marginTop: SPACING['2xl'] },

  savedEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  savedText: { ...TYPOGRAPHY.heading3, color: COLORS.text.primary },
});
