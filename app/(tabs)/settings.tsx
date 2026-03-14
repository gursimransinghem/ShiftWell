import React, { useState, useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

import { useShiftsStore } from '@/src/store/shifts-store';
import { useUserStore } from '@/src/store/user-store';
import { usePlanStore } from '@/src/store/plan-store';
import { useExport } from '@/src/hooks/useExport';
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from '@/src/lib/calendar/ics-generator';
import {
  BACKGROUND,
  TEXT,
  ACCENT,
  BORDER,
  SEMANTIC,
  SPACING,
  RADIUS,
  heading2,
  heading3,
  body,
  bodySmall,
  caption,
  label,
} from '@/src/theme';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHRONOTYPE_LABELS: Record<string, string> = {
  early: 'Early Bird',
  intermediate: 'Intermediate',
  late: 'Night Owl',
};

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ---------------------------------------------------------------------------
// Settings Row
// ---------------------------------------------------------------------------

function SettingsRow({
  label: rowLabel,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.settingsRow}>
      <Text style={styles.rowLabel}>{rowLabel}</Text>
      {value != null && <Text style={styles.rowValue}>{value}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ---------------------------------------------------------------------------
// Toggle Row
// ---------------------------------------------------------------------------

function ToggleRow({
  label: rowLabel,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.rowLabel}>{rowLabel}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: BORDER.strong, true: ACCENT.primaryMuted }}
        thumbColor={value ? ACCENT.primary : TEXT.tertiary}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { exportPlan, isExporting, error: exportError } = useExport();

  // Store selectors
  const shiftCount = useShiftsStore((s) => s.shifts.length);
  const personalEventCount = useShiftsStore((s) => s.personalEvents.length);
  const clearShifts = useShiftsStore((s) => s.clearShifts);
  const profile = useUserStore((s) => s.profile);
  const resetOnboarding = useUserStore((s) => s.resetOnboarding);
  const plan = usePlanStore((s) => s.plan);

  // Export options state
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
  });

  const updateExportOption = useCallback(
    (key: keyof ExportOptions, value: boolean) => {
      setExportOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleExport = useCallback(async () => {
    await exportPlan(exportOptions);
  }, [exportPlan, exportOptions]);

  const confirmResetOnboarding = useCallback(() => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset your preferences and restart the setup process. Your imported shifts will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/(onboarding)');
          },
        },
      ],
    );
  }, [resetOnboarding]);

  const confirmClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your shifts, events, preferences, and sleep plans. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            clearShifts();
            resetOnboarding();
            router.replace('/');
          },
        },
      ],
    );
  }, [clearShifts, resetOnboarding]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* ---- Import Section ---- */}
        <SectionHeader title="IMPORT" />
        <Card style={styles.card}>
          <View style={styles.importRow}>
            <View style={styles.importInfo}>
              <Text style={styles.rowLabel}>Imported Shifts</Text>
              <Text style={styles.rowSubtext}>
                {shiftCount} shift{shiftCount !== 1 ? 's' : ''}
                {personalEventCount > 0
                  ? `, ${personalEventCount} event${personalEventCount !== 1 ? 's' : ''}`
                  : ''}
              </Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <Button
            title="Import Schedule"
            onPress={() => router.push('/import')}
            variant="secondary"
            size="md"
            fullWidth
          />
        </Card>

        {/* ---- Export Section ---- */}
        <SectionHeader title="EXPORT" />
        <Card style={styles.card}>
          <Text style={styles.exportInfo}>
            .ics file — works with Apple Calendar, Google Calendar, Outlook
          </Text>

          <ToggleRow
            label="Include meal timing"
            value={exportOptions.includeMeals}
            onValueChange={(v) => updateExportOption('includeMeals', v)}
          />
          <ToggleRow
            label="Include light protocol"
            value={exportOptions.includeLight}
            onValueChange={(v) => updateExportOption('includeLight', v)}
          />
          <ToggleRow
            label="Include caffeine cutoff"
            value={exportOptions.includeCaffeine}
            onValueChange={(v) => updateExportOption('includeCaffeine', v)}
          />
          <ToggleRow
            label="Include wind-down"
            value={exportOptions.includeWindDown}
            onValueChange={(v) => updateExportOption('includeWindDown', v)}
          />
          <ToggleRow
            label="Include naps"
            value={exportOptions.includeNaps}
            onValueChange={(v) => updateExportOption('includeNaps', v)}
          />

          <View style={{ height: SPACING.md }} />

          <Button
            title="Export Sleep Plan"
            onPress={handleExport}
            variant="primary"
            size="lg"
            fullWidth
            loading={isExporting}
            disabled={!plan}
          />

          {!plan && (
            <Text style={styles.exportHint}>
              Import your shifts first to generate an exportable sleep plan.
            </Text>
          )}
          {exportError && (
            <Text style={styles.exportErrorText}>{exportError}</Text>
          )}
        </Card>

        {/* ---- Profile Section ---- */}
        <SectionHeader title="PROFILE" />
        <Card style={styles.card} padding={false}>
          <SettingsRow
            label="Chronotype"
            value={CHRONOTYPE_LABELS[profile.chronotype] ?? profile.chronotype}
          />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="Sleep need"
            value={`${profile.sleepNeed}h`}
          />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="Caffeine half-life"
            value={`${profile.caffeineHalfLife}h`}
          />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="Strategic naps"
            value={profile.napPreference ? 'Yes' : 'No'}
          />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="Commute"
            value={`${profile.commuteDuration} min`}
          />
          <View style={styles.cardDivider} />
          <View style={styles.editButtonWrapper}>
            <Button
              title="Edit Preferences"
              onPress={() => router.push('/(onboarding)')}
              variant="ghost"
              size="sm"
            />
          </View>
        </Card>

        {/* ---- About Section ---- */}
        <SectionHeader title="ABOUT" />
        <Card style={styles.card} padding={false}>
          <SettingsRow label="Version" value={appVersion} />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="How It Works"
            onPress={() =>
              Alert.alert(
                'How ShiftWell Works',
                'ShiftWell uses the Two-Process Model of sleep regulation (Borbely, 1982) combined with your chronotype and shift schedule to generate personalized sleep, nap, caffeine, and light exposure timing.\n\nThe algorithm accounts for circadian phase shifts during night work and optimizes recovery on days off.',
              )
            }
          />
          <View style={styles.cardDivider} />
          <SettingsRow
            label="Science & References"
            onPress={() =>
              Alert.alert(
                'Research References',
                '1. Borbely AA (1982) — Two-Process Model of Sleep Regulation\n\n2. Czeisler CA et al. (1999) — Stability, Precision, and Near-24-Hour Period of the Human Circadian Pacemaker\n\n3. Boivin DB & Boudreau P (2014) — Impacts of Shift Work on Sleep and Circadian Rhythms\n\n4. Horne JA & Ostberg O (1976) — Morningness-Eveningness Questionnaire\n\n5. Lowden A et al. (2019) — Eating and Shift Work\n\n6. Sletten TL et al. (2020) — Light Exposure and Circadian Adaptation',
              )
            }
          />
        </Card>

        {/* ---- Danger Zone ---- */}
        <SectionHeader title="DANGER ZONE" />
        <Card style={styles.dangerCard}>
          <Pressable
            onPress={confirmResetOnboarding}
            style={styles.dangerRow}
          >
            <Text style={styles.dangerText}>Reset Onboarding</Text>
            <Text style={styles.dangerSubtext}>
              Re-run the setup process. Shifts are preserved.
            </Text>
          </Pressable>
          <View style={styles.cardDivider} />
          <Pressable onPress={confirmClearData} style={styles.dangerRow}>
            <Text style={[styles.dangerText, { color: SEMANTIC.error }]}>
              Clear All Data
            </Text>
            <Text style={styles.dangerSubtext}>
              Delete all shifts, events, and preferences permanently.
            </Text>
          </Pressable>
        </Card>

        <View style={{ height: SPACING['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['4xl'],
  },
  title: {
    ...heading2,
    color: TEXT.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  sectionHeader: {
    ...caption,
    color: TEXT.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: SPACING['2xl'],
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  rowLabel: {
    ...body,
    color: TEXT.primary,
  },
  rowValue: {
    ...body,
    color: TEXT.secondary,
  },
  rowSubtext: {
    ...caption,
    color: TEXT.tertiary,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  cardDivider: {
    height: 1,
    backgroundColor: BORDER.subtle,
    marginHorizontal: SPACING.lg,
  },

  // Import section
  importRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  importInfo: {
    flex: 1,
  },

  // Export section
  exportInfo: {
    ...caption,
    color: TEXT.tertiary,
    marginBottom: SPACING.lg,
  },
  exportHint: {
    ...caption,
    color: TEXT.tertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  exportErrorText: {
    ...caption,
    color: SEMANTIC.error,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Edit button
  editButtonWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'flex-start',
  },

  // Danger zone
  dangerCard: {
    marginBottom: SPACING.sm,
    borderColor: SEMANTIC.errorMuted,
  },
  dangerRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dangerText: {
    ...body,
    color: SEMANTIC.warning,
    fontWeight: '600',
  },
  dangerSubtext: {
    ...caption,
    color: TEXT.tertiary,
    marginTop: 2,
  },
});
