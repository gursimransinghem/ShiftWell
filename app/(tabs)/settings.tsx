import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

import { CalendarSettingsSection } from '@/src/components/calendar';
import { useShiftsStore } from '@/src/store/shifts-store';
import { useUserStore } from '@/src/store/user-store';
import { usePlanStore } from '@/src/store/plan-store';
import { useAuthStore } from '@/src/store/auth-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useExport } from '@/src/hooks/useExport';
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from '@/src/lib/calendar/ics-generator';
import { fullSync, getSyncStatus } from '@/src/lib/sync/sync-engine';
import { requestPermissions, getScheduledNotifications, schedulePlanNotifications } from '@/src/lib/notifications/notification-service';
import { useNotificationStore } from '@/src/store/notification-store';
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

  // Auth & Premium selectors
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const premiumPlan = usePremiumStore((s) => s.plan);
  const premiumExpiresAt = usePremiumStore((s) => s.expiresAt);
  const canAccess = usePremiumStore((s) => s.canAccess);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [autoSync, setAutoSync] = useState(true);

  // Notification state
  const [notifPermission, setNotifPermission] = useState<boolean | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [sleepReminders, setSleepReminders] = useState(true);
  const [caffeineCutoffAlerts, setCaffeineCutoffAlerts] = useState(true);
  const [wakeAlarms, setWakeAlarms] = useState(true);

  // Notification preferences from store (persisted)
  const windDownEnabled = useNotificationStore((s) => s.windDownEnabled);
  const windDownLeadMinutes = useNotificationStore((s) => s.windDownLeadMinutes);
  const caffeineCutoffEnabled = useNotificationStore((s) => s.caffeineCutoffEnabled);
  const morningBriefEnabled = useNotificationStore((s) => s.morningBriefEnabled);
  const setWindDown = useNotificationStore((s) => s.setWindDown);
  const setCaffeineCutoff = useNotificationStore((s) => s.setCaffeineCutoff);
  const setMorningBrief = useNotificationStore((s) => s.setMorningBrief);

  // Export options state
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
  });

  // Check notification permission and scheduled count on mount
  useEffect(() => {
    (async () => {
      try {
        const scheduled = await getScheduledNotifications();
        setScheduledCount(scheduled.length);
        setNotifPermission(scheduled !== undefined);
      } catch {
        setNotifPermission(false);
      }
    })();
  }, []);

  // Refresh sync status periodically
  useEffect(() => {
    if (isAuthenticated) {
      setSyncStatus(getSyncStatus());
    }
  }, [isAuthenticated]);

  const updateExportOption = useCallback(
    (key: keyof ExportOptions, value: boolean) => {
      setExportOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleSync = useCallback(async () => {
    if (!userId) return;
    setIsSyncing(true);
    try {
      await fullSync(userId);
      setSyncStatus(getSyncStatus());
    } catch (err) {
      Alert.alert('Sync Error', 'Could not sync at this time. Please try again later.');
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestPermissions();
    setNotifPermission(granted);
  }, []);

  const handleToggleWindDown = useCallback((val: boolean) => {
    setWindDown(val);
    const currentPlan = usePlanStore.getState().plan;
    if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
  }, [setWindDown]);

  const handleToggleCaffeineCutoff = useCallback((val: boolean) => {
    setCaffeineCutoff(val);
    const currentPlan = usePlanStore.getState().plan;
    if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
  }, [setCaffeineCutoff]);

  const handleToggleMorningBrief = useCallback((val: boolean) => {
    setMorningBrief(val);
    const currentPlan = usePlanStore.getState().plan;
    if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
  }, [setMorningBrief]);

  const handleWindDownLeadTime = useCallback(() => {
    Alert.alert(
      'Wind-down Lead Time',
      'How many minutes before bedtime should we remind you?',
      [
        {
          text: '30 min',
          onPress: () => {
            setWindDown(true, 30);
            const currentPlan = usePlanStore.getState().plan;
            if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
          },
        },
        {
          text: '45 min',
          onPress: () => {
            setWindDown(true, 45);
            const currentPlan = usePlanStore.getState().plan;
            if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
          },
        },
        {
          text: '60 min',
          onPress: () => {
            setWindDown(true, 60);
            const currentPlan = usePlanStore.getState().plan;
            if (currentPlan) schedulePlanNotifications(currentPlan.blocks).catch(() => {});
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, [setWindDown]);

  const handleExport = useCallback(async () => {
    if (!canAccess('ics_export')) {
      router.push('/paywall');
      return;
    }
    await exportPlan(exportOptions);
  }, [exportPlan, exportOptions, canAccess]);

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

  const formatLastSynced = (date: Date | null): string => {
    if (!date) return 'Never';
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* ---- Account Section ---- */}
        <SectionHeader title="ACCOUNT" />
        <Card style={styles.card}>
          {isAuthenticated ? (
            <>
              <SettingsRow label="Email" value={email ?? '—'} />
              <View style={styles.cardDivider} />
              <View style={styles.settingsRow}>
                <Text style={styles.rowLabel}>Plan</Text>
                <View style={styles.planBadgeContainer}>
                  <View
                    style={[
                      styles.planBadge,
                      isPremium ? styles.planBadgePremium : styles.planBadgeFree,
                    ]}
                  >
                    <Text
                      style={[
                        styles.planBadgeText,
                        isPremium ? styles.planBadgeTextPremium : styles.planBadgeTextFree,
                      ]}
                    >
                      {isPremium ? 'Premium' : 'Free'}
                    </Text>
                  </View>
                  {isPremium && premiumExpiresAt && (
                    <Text style={styles.planExpiry}>
                      Expires {format(premiumExpiresAt, 'MMM d, yyyy')}
                    </Text>
                  )}
                </View>
              </View>
              {!isPremium && (
                <>
                  <View style={styles.cardDivider} />
                  <View style={styles.upgradeButtonWrapper}>
                    <Button
                      title="Upgrade to Premium"
                      onPress={() => router.push('/paywall')}
                      variant="primary"
                      size="md"
                      fullWidth
                    />
                  </View>
                </>
              )}
              <View style={styles.cardDivider} />
              <View style={styles.signOutWrapper}>
                <Button
                  title="Sign Out"
                  onPress={handleSignOut}
                  variant="ghost"
                  size="sm"
                />
              </View>
            </>
          ) : (
            <>
              <Button
                title="Sign In"
                onPress={() => router.push('/(auth)/sign-in')}
                variant="primary"
                size="md"
                fullWidth
              />
              <Text style={styles.authHint}>
                Create an account to sync across devices and access premium features
              </Text>
            </>
          )}
        </Card>

        {/* ---- Sync Section ---- */}
        {isAuthenticated && (
          <>
            <SectionHeader title="SYNC" />
            <Card style={styles.card}>
              <SettingsRow
                label="Last synced"
                value={formatLastSynced(syncStatus.lastSyncedAt)}
              />
              {syncStatus.pendingCount > 0 && (
                <>
                  <View style={styles.cardDivider} />
                  <SettingsRow
                    label="Pending writes"
                    value={`${syncStatus.pendingCount}`}
                  />
                </>
              )}
              <View style={styles.cardDivider} />
              <View style={styles.syncButtonWrapper}>
                {isSyncing ? (
                  <View style={styles.syncingRow}>
                    <ActivityIndicator size="small" color={ACCENT.primary} />
                    <Text style={styles.syncingText}>Syncing…</Text>
                  </View>
                ) : (
                  <Button
                    title="Sync Now"
                    onPress={handleSync}
                    variant="secondary"
                    size="md"
                    fullWidth
                  />
                )}
              </View>
              <View style={styles.cardDivider} />
              <ToggleRow
                label="Auto-sync"
                value={autoSync}
                onValueChange={setAutoSync}
              />
            </Card>
          </>
        )}

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
          <View style={styles.premiumFeatureRow}>
            <Button
              title={!canAccess('ics_import') ? '🔒 Import Schedule' : 'Import Schedule'}
              onPress={() => {
                if (!canAccess('ics_import')) {
                  router.push('/paywall');
                  return;
                }
                router.push('/import');
              }}
              variant="secondary"
              size="md"
              fullWidth
            />
            {!canAccess('ics_import') && (
              <Text style={styles.premiumLabel}>Premium</Text>
            )}
          </View>
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

          <View style={styles.premiumFeatureRow}>
            <Button
              title={!canAccess('ics_export') ? '🔒 Export Sleep Plan' : 'Export Sleep Plan'}
              onPress={handleExport}
              variant="primary"
              size="lg"
              fullWidth
              loading={isExporting}
              disabled={!plan}
            />
            {!canAccess('ics_export') && (
              <Text style={styles.premiumLabel}>Premium</Text>
            )}
          </View>

          {!plan && (
            <Text style={styles.exportHint}>
              Import your shifts first to generate an exportable sleep plan.
            </Text>
          )}
          {exportError && (
            <Text style={styles.exportErrorText}>{exportError}</Text>
          )}
        </Card>

        {/* ---- Calendar Sync Section ---- */}
        <SectionHeader title="CALENDAR SYNC" />
        <Card style={styles.card}>
          <CalendarSettingsSection />
        </Card>

        {/* ---- Notifications Section ---- */}
        <SectionHeader title="NOTIFICATIONS" />
        <Card style={styles.card}>
          {notifPermission === false ? (
            <>
              <Text style={styles.notifStatusText}>
                Notifications are not enabled
              </Text>
              <View style={{ height: SPACING.sm }} />
              <Button
                title="Enable Notifications"
                onPress={handleEnableNotifications}
                variant="primary"
                size="md"
                fullWidth
              />
            </>
          ) : (
            <>
              <ToggleRow
                label="Sleep reminders"
                value={sleepReminders}
                onValueChange={setSleepReminders}
              />
              <View style={styles.cardDivider} />
              <ToggleRow
                label="Caffeine cutoff alerts"
                value={caffeineCutoffAlerts}
                onValueChange={setCaffeineCutoffAlerts}
              />
              <View style={styles.cardDivider} />
              <ToggleRow
                label="Wake alarms"
                value={wakeAlarms}
                onValueChange={setWakeAlarms}
              />
              <View style={styles.cardDivider} />

              {/* ---- Notification Preferences (store-backed, persisted) ---- */}
              <ToggleRow
                label="Wind-down reminder"
                value={windDownEnabled}
                onValueChange={handleToggleWindDown}
              />
              {windDownEnabled && (
                <>
                  <View style={styles.cardDivider} />
                  <SettingsRow
                    label="Wind-down lead time"
                    value={`${windDownLeadMinutes} min`}
                    onPress={handleWindDownLeadTime}
                  />
                </>
              )}
              <View style={styles.cardDivider} />
              <ToggleRow
                label="Caffeine cutoff reminder"
                value={caffeineCutoffEnabled}
                onValueChange={handleToggleCaffeineCutoff}
              />
              <View style={styles.cardDivider} />
              <ToggleRow
                label="Morning brief"
                value={morningBriefEnabled}
                onValueChange={handleToggleMorningBrief}
              />

              {scheduledCount > 0 && (
                <>
                  <View style={styles.cardDivider} />
                  <SettingsRow
                    label="Scheduled notifications"
                    value={`${scheduledCount}`}
                  />
                </>
              )}
            </>
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

  // Account section
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  planBadgeFree: {
    backgroundColor: BORDER.strong,
  },
  planBadgePremium: {
    backgroundColor: ACCENT.primaryMuted,
  },
  planBadgeText: {
    ...caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planBadgeTextFree: {
    color: TEXT.secondary,
  },
  planBadgeTextPremium: {
    color: ACCENT.primary,
  },
  planExpiry: {
    ...caption,
    color: TEXT.tertiary,
  },
  upgradeButtonWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  signOutWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'flex-start',
  },
  authHint: {
    ...caption,
    color: TEXT.tertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Sync section
  syncButtonWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  syncingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  syncingText: {
    ...body,
    color: ACCENT.primary,
  },

  // Notifications section
  notifStatusText: {
    ...bodySmall,
    color: TEXT.secondary,
    marginBottom: SPACING.xs,
  },

  // Premium gating
  premiumFeatureRow: {
    position: 'relative',
  },
  premiumLabel: {
    ...caption,
    color: ACCENT.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
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
