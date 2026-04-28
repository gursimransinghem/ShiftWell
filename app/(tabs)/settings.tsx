import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useAuthStore } from '@/src/store/auth-store';
import { useBriefStore } from '@/src/store/brief-store';
import { usePlanStore } from '@/src/store/plan-store';
import { useFeatureGate } from '@/src/lib/premium/feature-gate';
import { useExport } from '@/src/hooks/useExport';
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from '@/src/lib/calendar/ics-generator';
import { fullSync, getSyncStatus } from '@/src/lib/sync/sync-engine';
import { requestPermissions, getScheduledNotifications } from '@/src/lib/notifications/notification-service';
import {
  COLORS,
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
import { WeeklyBriefToggle } from '@/src/components/settings/WeeklyBriefToggle';

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ---------------------------------------------------------------------------
// Stepper control
// ---------------------------------------------------------------------------

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChangeValue: (v: number) => void;
}

function Stepper({ label, unit, value, min, max, step, onChangeValue }: StepperProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.max(min, +(value - step).toFixed(1)))}
          disabled={value <= min}
          hitSlop={8}
        >
          <Ionicons name="remove" size={18} color={value <= min ? COLORS.text.muted : COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {value}
          <Text style={styles.stepperUnit}> {unit}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.min(max, +(value + step).toFixed(1)))}
          disabled={value >= max}
          hitSlop={8}
        >
          <Ionicons name="add" size={18} color={value >= max ? COLORS.text.muted : COLORS.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Row with chevron
// ---------------------------------------------------------------------------

function LinkRow({ label, value, onPress, destructive }: {
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const CHRONOTYPE_LABELS: Record<string, string> = {
  early: 'Early bird',
  intermediate: 'Intermediate',
  late: 'Night owl',
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { profile, setProfile } = useUserStore();
  const { isPremium, isInTrial, isGrandfathered, trialDaysLeft, plan } = usePremiumStore();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const { enabled: briefEnabled, toggleEnabled: toggleBrief } = useBriefStore();
  const { autopilot, transparencyLog, setAutopilotEnabled } = usePlanStore();
  const { available: adaptiveBrainAvailable } = useFeatureGate('adaptive-brain');

  const [sleepNeed, setSleepNeed] = useState(profile.sleepNeed ?? 7.5);
  const [caffeineHalfLife, setCaffeineHalfLife] = useState(profile.caffeineHalfLife ?? 5);
  const [commuteMinutes, setCommuteMinutes] = useState(profile.commuteDuration ?? 15);
  const [napMinutes, setNapMinutes] = useState(
    typeof profile.napPreference === 'number' ? profile.napPreference : 20,
  );
  const [saved, setSaved] = useState(false);
  const [showTransparencyLog, setShowTransparencyLog] = useState(false);

  function handleSave() {
    setProfile({ sleepNeed, caffeineHalfLife, commuteDuration: commuteMinutes, napPreference: napMinutes > 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.replace('/(onboarding)/welcome');
          },
        },
      ],
    );
  }

  const subscriptionLabel = isPremium
    ? `Pro \u2014 ${plan}`
    : isInTrial
    ? `Trial \u2014 ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`
    : 'Free';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Subscription */}
        <SectionHeader title="SUBSCRIPTION" />
        <View style={styles.card}>
          <LinkRow
            label="ShiftWell Pro"
            value={subscriptionLabel}
            onPress={() => router.push('/paywall')}
          />
        </View>

        {/* Free Plan — show what's included vs locked for free/post-trial users */}
        {!isPremium && !isInTrial && !isGrandfathered && (
          <>
            <SectionHeader title="YOUR FREE PLAN INCLUDES" />
            <View style={styles.card}>
              {[
                'Sleep windows based on your shifts',
                'Calendar sync (import + export)',
                'Push notifications',
                'Nap placement',
                'Meal timing windows',
                'Light protocols',
              ].map((item) => (
                <View key={item} style={styles.row}>
                  <Text style={styles.freePlanCheck}>{'\u2713'}</Text>
                  <Text style={styles.rowLabel}>{item}</Text>
                </View>
              ))}
            </View>
            <SectionHeader title="UNLOCK WITH PREMIUM" />
            <View style={styles.card}>
              {[
                'Adaptive Brain — auto-adjusting sleep plans',
                'AI Coaching — personalized weekly insights',
                'Pattern Recognition — long-term sleep trends',
                'Predictive Scheduling — plan weeks ahead',
              ].map((item) => (
                <View key={item} style={styles.row}>
                  <Text style={styles.premiumLock}>{'\u{1F512}'}</Text>
                  <Text style={[styles.rowLabel, styles.rowLabelMuted]}>{item}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.upgradeBanner}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Sleep preferences */}
        <SectionHeader title="SLEEP PREFERENCES" />
        <View style={styles.card}>
          <Stepper label="Sleep need" unit="hrs" value={sleepNeed} min={5} max={10} step={0.5} onChangeValue={setSleepNeed} />
          <View style={styles.divider} />
          <Stepper label="Caffeine half-life" unit="hrs" value={caffeineHalfLife} min={3} max={9} step={0.5} onChangeValue={setCaffeineHalfLife} />
          <View style={styles.divider} />
          <Stepper label="Nap length" unit="min" value={napMinutes} min={10} max={90} step={5} onChangeValue={setNapMinutes} />
          <View style={styles.divider} />
          <Stepper label="Commute time" unit="min" value={commuteMinutes} min={0} max={120} step={5} onChangeValue={setCommuteMinutes} />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saved ? '\u2713 Saved' : 'Save Changes'}</Text>
        </TouchableOpacity>

        {/* AI Features */}
        <SectionHeader title="AI FEATURES" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.toggleLabelCol}>
              <Text style={styles.rowLabel}>Weekly Sleep Brief</Text>
              <Text style={styles.toggleSubtitle}>
                Every Monday — AI summary of your sleep week
              </Text>
            </View>
            <Switch
              value={briefEnabled}
              onValueChange={toggleBrief}
              trackColor={{ false: COLORS.background.elevated, true: COLORS.accent.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Autopilot toggle (adaptive-brain gated) */}
          {adaptiveBrainAvailable && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.autopilotLabelBlock}>
                  <Text style={styles.rowLabel}>Autopilot Mode</Text>
                  <Text style={styles.autopilotSubLabel}>
                    {autopilot.eligible
                      ? autopilot.enabled
                        ? `${autopilot.autonomousChanges} change${autopilot.autonomousChanges !== 1 ? 's' : ''} made automatically`
                        : 'Eligible — small changes applied silently'
                      : 'Available after 30 days of tracking'}
                  </Text>
                </View>
                <Switch
                  value={autopilot.enabled}
                  onValueChange={(val) => {
                    if (!autopilot.eligible) return;
                    setAutopilotEnabled(val);
                  }}
                  disabled={!autopilot.eligible}
                  trackColor={{ false: COLORS.border.default, true: COLORS.accent.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Transparency log (shown when autopilot is on and has entries) */}
              {autopilot.enabled && transparencyLog.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => setShowTransparencyLog((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.rowLabel}>Autopilot History</Text>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowValue}>{transparencyLog.length} entries</Text>
                      <Ionicons
                        name={showTransparencyLog ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={COLORS.text.muted}
                      />
                    </View>
                  </TouchableOpacity>

                  {showTransparencyLog && (
                    <View style={styles.transparencyBlock}>
                      {transparencyLog.slice(-10).reverse().map((entry, i) => (
                        <View key={i} style={styles.transparencyEntry}>
                          <Text style={styles.transparencyDate}>{entry.dateISO}</Text>
                          <Text style={styles.transparencyReason}>{entry.reason}</Text>
                        </View>
                      ))}
                      {transparencyLog.length > 10 && (
                        <Text style={styles.transparencyMore}>
                          +{transparencyLog.length - 10} older entries
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* ---- AI Coaching Section ---- */}
        <SectionHeader title="AI COACHING" />
        <Card style={styles.card}>
          <WeeklyBriefToggle />
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

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <LinkRow label="Privacy Policy" onPress={() => {}} />
          <View style={styles.divider} />
          <LinkRow label="Terms of Service" onPress={() => {}} />
        </View>

        {/* Medical Disclaimer */}
        <SectionHeader title="MEDICAL DISCLAIMER" />
        <View style={styles.card}>
          <View style={styles.disclaimerRow}>
            <Ionicons name="medical" size={16} color={COLORS.text.muted} style={styles.disclaimerIcon} />
            <Text style={styles.disclaimerText}>
              ShiftWell provides general wellness information based on circadian science research.
              It is not a substitute for medical advice. Consult your physician before making
              changes to your sleep, diet, or work schedule — especially if you have a medical
              condition or take medications.
            </Text>
          </View>
        </View>

        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.card}>
          <LinkRow
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        <Text style={styles.legal}>
          ShiftWell provides general wellness information based on circadian science research.
          It is not medical advice. Always consult your doctor about sleep concerns.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.text.primary,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  destructiveLabel: {
    color: '#FF6B6B',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 52,
    textAlign: 'center',
  },
  stepperUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text.muted,
  },

  // Save button
  saveBtn: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  saveBtnDone: {
    backgroundColor: '#34D399',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B0D16',
  },

  // Disclaimer
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  disclaimerIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  // Toggle row
  toggleLabelCol: {
    flex: 1,
    gap: 2,
    paddingRight: SPACING.md,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: COLORS.text.muted,
  },

  // Autopilot
  autopilotLabelBlock: {
    flex: 1,
    gap: 2,
    paddingRight: SPACING.md,
  },
  autopilotSubLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 16,
  },
  transparencyBlock: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  transparencyEntry: {
    gap: 2,
  },
  transparencyDate: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 0.5,
  },
  transparencyReason: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  transparencyMore: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },

  // Legal
  legal: {
    fontSize: 10,
    color: COLORS.text.dim,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },

  // Free plan / upgrade section
  freePlanCheck: {
    fontSize: 14,
    color: '#34D399',
    marginRight: 8,
    fontWeight: '700',
  },
  premiumLock: {
    fontSize: 14,
    marginRight: 8,
  },
  rowLabelMuted: {
    color: COLORS.text.muted,
  },
  upgradeBanner: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
