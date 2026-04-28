import React, { useMemo, useState } from 'react';
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

import { GradientMeshBackground } from '@/src/components/ui';
import ReferralCard from '@/src/components/ui/ReferralCard';
import { useFeatureGate } from '@/src/lib/premium/feature-gate';
import { useAuthStore } from '@/src/store/auth-store';
import { useBriefStore } from '@/src/store/brief-store';
import { useNotificationStore } from '@/src/store/notification-store';
import { usePlanStore } from '@/src/store/plan-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useUserStore } from '@/src/store/user-store';
import {
  ACCENT,
  BACKGROUND,
  BORDER,
  COLORS,
  RADIUS,
  SEMANTIC,
  SPACING,
  TEXT as TEXT_COLORS,
  TYPOGRAPHY,
} from '@/src/theme';

const CHRONOTYPE_LABELS: Record<string, string> = {
  early: 'Early Bird',
  intermediate: 'Intermediate',
  late: 'Night Owl',
};

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface ToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBadge, disabled && styles.iconBadgeDisabled]}>
          <Ionicons
            name={icon}
            size={16}
            color={disabled ? TEXT_COLORS.tertiary : ACCENT.primary}
          />
        </View>
        <View style={styles.rowTextBlock}>
          <Text style={[styles.rowLabel, disabled && styles.rowLabelMuted]}>{label}</Text>
          <Text style={styles.rowSubLabel}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: BORDER.strong,
          true: ACCENT.primaryMuted,
        }}
        thumbColor={value ? ACCENT.primary : '#F3F4F6'}
      />
    </View>
  );
}

interface StepperProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChangeValue: (value: number) => void;
}

function Stepper({
  icon,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChangeValue,
}: StepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBadge}>
          <Ionicons name={icon} size={16} color={ACCENT.primary} />
        </View>
        <View style={styles.rowTextBlock}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowSubLabel}>Adjust in small increments</Text>
        </View>
      </View>

      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, !canDecrease && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.max(min, +(value - step).toFixed(1)))}
          disabled={!canDecrease}
          hitSlop={8}
          activeOpacity={0.8}
        >
          <Ionicons
            name="remove"
            size={16}
            color={canDecrease ? COLORS.text.primary : COLORS.text.muted}
          />
        </TouchableOpacity>

        <View style={styles.stepperValueWrap}>
          <Text style={styles.stepperValue}>{value}</Text>
          <Text style={styles.stepperUnit}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={[styles.stepperBtn, !canIncrease && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.min(max, +(value + step).toFixed(1)))}
          disabled={!canIncrease}
          hitSlop={8}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={16}
            color={canIncrease ? COLORS.text.primary : COLORS.text.muted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBadge, destructive && styles.iconBadgeDestructive]}>
          <Ionicons
            name={icon}
            size={16}
            color={destructive ? SEMANTIC.error : ACCENT.primary}
          />
        </View>
        <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={TEXT_COLORS.muted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const weeklyBriefEnabled = useUserStore((s) => s.weeklyBriefEnabled);
  const setWeeklyBriefEnabled = useUserStore((s) => s.setWeeklyBriefEnabled);

  const {
    isPremium,
    isInTrial,
    isGrandfathered,
    trialDaysLeft,
    plan,
  } = usePremiumStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const briefEnabled = useBriefStore((s) => s.enabled);
  const toggleBrief = useBriefStore((s) => s.toggleEnabled);

  const windDownEnabled = useNotificationStore((s) => s.windDownEnabled);
  const caffeineCutoffEnabled = useNotificationStore((s) => s.caffeineCutoffEnabled);
  const morningBriefEnabled = useNotificationStore((s) => s.morningBriefEnabled);
  const setWindDown = useNotificationStore((s) => s.setWindDown);
  const setCaffeineCutoff = useNotificationStore((s) => s.setCaffeineCutoff);
  const setMorningBrief = useNotificationStore((s) => s.setMorningBrief);

  const autopilot = usePlanStore((s) => s.autopilot);
  const transparencyLog = usePlanStore((s) => s.transparencyLog);
  const setAutopilotEnabled = usePlanStore((s) => s.setAutopilotEnabled);
  const { available: adaptiveBrainAvailable } = useFeatureGate('adaptive-brain');

  const [sleepNeed, setSleepNeed] = useState(profile.sleepNeed ?? 7.5);
  const [caffeineHalfLife, setCaffeineHalfLife] = useState(profile.caffeineHalfLife ?? 5);
  const [commuteMinutes, setCommuteMinutes] = useState(profile.commuteDuration ?? 30);
  const [strategicNaps, setStrategicNaps] = useState(profile.napPreference ?? true);
  const [saved, setSaved] = useState(false);
  const [showAutopilotHistory, setShowAutopilotHistory] = useState(false);

  const subscriptionLabel = useMemo(() => {
    if (isPremium) return `Pro · ${plan}`;
    if (isInTrial) {
      return `Trial · ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`;
    }
    if (isGrandfathered) return 'Founding access';
    return 'Free';
  }, [isGrandfathered, isInTrial, isPremium, plan, trialDaysLeft]);

  const subscriptionSummary = useMemo(() => {
    if (isPremium) {
      return 'Adaptive Brain, recovery insights, and premium planning features are unlocked.';
    }
    if (isInTrial) {
      return 'You are exploring the full ShiftWell experience with premium features enabled.';
    }
    if (isGrandfathered) {
      return 'Your install qualifies for early-access benefits while premium features evolve.';
    }
    return 'Core sleep planning is active. Upgrade when you want deeper coaching and automation.';
  }, [isGrandfathered, isInTrial, isPremium]);

  function handleSave() {
    setProfile({
      sleepNeed,
      caffeineHalfLife,
      commuteDuration: commuteMinutes,
      napPreference: strategicNaps,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleWeeklyBriefToggle(nextValue: boolean) {
    if (weeklyBriefEnabled !== nextValue) {
      setWeeklyBriefEnabled(nextValue);
    }
    if (briefEnabled !== nextValue) {
      toggleBrief();
    }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'You can sign back in anytime to restore your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This permanently removes your account and locally stored data from this device. This action cannot be undone.',
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

  function handlePlaceholderLegal(title: string) {
    Alert.alert(title, 'This item is not wired yet. Add the destination screen or external link when the legal pages are finalized.');
  }

  return (
    <GradientMeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>Settings</Text>
            <Text style={styles.screenSubtitle}>
              Tune the way ShiftWell plans, reminds, and adapts around your life.
            </Text>
          </View>

          <SettingsCard style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="moon" size={14} color={ACCENT.primary} />
                <Text style={styles.heroBadgeText}>{subscriptionLabel}</Text>
              </View>
              <TouchableOpacity
                style={styles.heroAction}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroActionText}>
                  {isPremium ? 'Manage' : 'Upgrade'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.heroTitle}>Design your recovery system.</Text>
            <Text style={styles.heroBody}>{subscriptionSummary}</Text>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>
                  {CHRONOTYPE_LABELS[profile.chronotype] ?? profile.chronotype}
                </Text>
                <Text style={styles.heroStatLabel}>Chronotype</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{profile.sleepNeed.toFixed(1)}h</Text>
                <Text style={styles.heroStatLabel}>Sleep target</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{profile.commuteDuration}m</Text>
                <Text style={styles.heroStatLabel}>Commute</Text>
              </View>
            </View>
          </SettingsCard>

          {!isPremium && !isInTrial && !isGrandfathered && (
            <>
              <SectionHeader title="WHAT PREMIUM ADDS" />
              <SettingsCard>
                {[
                  'Adaptive Brain for auto-adjusting sleep plans',
                  'AI coaching with weekly summaries and insights',
                  'Pattern recognition across rotating schedules',
                  'Predictive planning for difficult transitions',
                ].map((item, index) => (
                  <React.Fragment key={item}>
                    <View style={styles.bulletRow}>
                      <View style={styles.lockBadge}>
                        <Ionicons name="sparkles" size={12} color={ACCENT.primary} />
                      </View>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                    {index < 3 ? <View style={styles.divider} /> : null}
                  </React.Fragment>
                ))}
              </SettingsCard>
            </>
          )}

          <SectionHeader title="SLEEP PROFILE" />
          <SettingsCard>
            <Stepper
              icon="bed-outline"
              label="Sleep need"
              unit="hrs"
              value={sleepNeed}
              min={5}
              max={10}
              step={0.5}
              onChangeValue={setSleepNeed}
            />
            <View style={styles.divider} />
            <Stepper
              icon="cafe-outline"
              label="Caffeine half-life"
              unit="hrs"
              value={caffeineHalfLife}
              min={3}
              max={9}
              step={0.5}
              onChangeValue={setCaffeineHalfLife}
            />
            <View style={styles.divider} />
            <Stepper
              icon="car-outline"
              label="Commute time"
              unit="min"
              value={commuteMinutes}
              min={0}
              max={120}
              step={5}
              onChangeValue={setCommuteMinutes}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="moon-outline"
              label="Strategic naps"
              description="Let ShiftWell build naps into the plan when they are useful."
              value={strategicNaps}
              onValueChange={setStrategicNaps}
            />
          </SettingsCard>

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'save-outline'}
              size={16}
              color="#0B0D16"
            />
            <Text style={styles.saveBtnText}>{saved ? 'Saved' : 'Save Changes'}</Text>
          </TouchableOpacity>

          <SectionHeader title="AUTOMATION & COACHING" />
          <SettingsCard>
            <ToggleRow
              icon="newspaper-outline"
              label="Weekly sleep brief"
              description="Monday-morning AI recap with trend-level guidance."
              value={weeklyBriefEnabled && briefEnabled}
              onValueChange={handleWeeklyBriefToggle}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="alarm-outline"
              label="Wind-down reminders"
              description="Nudges before your planned sleep window opens."
              value={windDownEnabled}
              onValueChange={(value) => setWindDown(value)}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="cafe-outline"
              label="Caffeine cutoff alerts"
              description="Protect sleep timing with earlier cutoff prompts."
              value={caffeineCutoffEnabled}
              onValueChange={(value) => setCaffeineCutoff(value)}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="sunny-outline"
              label="Morning brief notifications"
              description="A gentle recap after wake time and overnight recovery."
              value={morningBriefEnabled}
              onValueChange={setMorningBrief}
            />

            {adaptiveBrainAvailable ? (
              <>
                <View style={styles.divider} />
                <ToggleRow
                  icon="sparkles-outline"
                  label="Autopilot mode"
                  description={
                    autopilot.eligible
                      ? autopilot.enabled
                        ? `${autopilot.autonomousChanges} automatic change${autopilot.autonomousChanges === 1 ? '' : 's'} logged so far.`
                        : 'Eligible now. Small safe plan changes can be applied automatically.'
                      : 'Unlocks after enough tracked history has built trust in the model.'
                  }
                  value={autopilot.enabled}
                  onValueChange={(value) => {
                    if (!autopilot.eligible) return;
                    setAutopilotEnabled(value);
                  }}
                  disabled={!autopilot.eligible}
                />

                {autopilot.enabled && transparencyLog.length > 0 ? (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.historyToggle}
                      onPress={() => setShowAutopilotHistory((value) => !value)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.historyToggleLabel}>Autopilot history</Text>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowValue}>{transparencyLog.length} entries</Text>
                        <Ionicons
                          name={showAutopilotHistory ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={TEXT_COLORS.muted}
                        />
                      </View>
                    </TouchableOpacity>

                    {showAutopilotHistory ? (
                      <View style={styles.historyBlock}>
                        {transparencyLog.slice(-8).reverse().map((entry, index) => (
                          <View
                            key={`${entry.dateISO}-${index}`}
                            style={[
                              styles.historyEntry,
                              index < Math.min(transparencyLog.length, 8) - 1 && styles.historyEntryBorder,
                            ]}
                          >
                            <Text style={styles.historyDate}>{entry.dateISO}</Text>
                            <Text style={styles.historyReason}>{entry.reason}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </SettingsCard>

          <SectionHeader title="COMMUNITY" />
          <ReferralCard />

          <SectionHeader title="ABOUT" />
          <SettingsCard>
            <LinkRow icon="person-outline" label="Account" value={email ?? 'Local only'} onPress={() => router.push('/(tabs)/profile')} />
            <View style={styles.divider} />
            <LinkRow icon="information-circle-outline" label="Version" value="1.0.0" onPress={() => {}} />
            <View style={styles.divider} />
            <LinkRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => handlePlaceholderLegal('Privacy Policy')}
            />
            <View style={styles.divider} />
            <LinkRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => handlePlaceholderLegal('Terms of Service')}
            />
          </SettingsCard>

          <SectionHeader title="MEDICAL DISCLAIMER" />
          <SettingsCard style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <View style={styles.disclaimerBadge}>
                <Ionicons name="medical-outline" size={16} color={ACCENT.primary} />
              </View>
              <Text style={styles.disclaimerText}>
                ShiftWell provides general wellness information based on circadian science.
                It does not diagnose or treat medical conditions, and it is not a substitute
                for professional medical advice.
              </Text>
            </View>
          </SettingsCard>

          <SectionHeader title="ACCOUNT" />
          <SettingsCard>
            {isAuthenticated ? (
              <>
                <LinkRow
                  icon="log-out-outline"
                  label="Sign Out"
                  onPress={handleSignOut}
                />
                <View style={styles.divider} />
                <LinkRow
                  icon="trash-outline"
                  label="Delete Account"
                  onPress={handleDeleteAccount}
                  destructive
                />
              </>
            ) : (
              <LinkRow
                icon="log-in-outline"
                label="Sign In"
                onPress={() => router.push('/(auth)/sign-in')}
              />
            )}
          </SettingsCard>

          <Text style={styles.legal}>
            Your schedule, recovery, and reminders are designed to support safer sleep habits
            around shift work. They should complement, not replace, clinical guidance.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientMeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'] + 88,
  },
  headerBlock: {
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  screenTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    maxWidth: 320,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1.1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    backgroundColor: 'rgba(19,23,38,0.9)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  heroCard: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(16,20,34,0.94)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(200,168,75,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.18)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(123,97,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.22)',
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT.purple,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.6,
    marginBottom: SPACING.sm,
  },
  heroBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondaryBright,
    marginBottom: SPACING.lg,
  },
  heroStatsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  heroStat: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 66,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowTextBlock: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  rowLabelMuted: {
    color: COLORS.text.secondary,
  },
  rowSubLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text.muted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  destructiveLabel: {
    color: SEMANTIC.error,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,168,75,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.14)',
  },
  iconBadgeDisabled: {
    backgroundColor: 'rgba(75,85,99,0.14)',
    borderColor: 'rgba(75,85,99,0.18)',
  },
  iconBadgeDestructive: {
    backgroundColor: 'rgba(255,107,107,0.09)',
    borderColor: 'rgba(255,107,107,0.16)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: BACKGROUND.elevated,
    borderWidth: 1,
    borderColor: BORDER.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperValueWrap: {
    minWidth: 54,
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 19,
  },
  stepperUnit: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 15,
    marginTop: SPACING.lg,
  },
  saveBtnDone: {
    backgroundColor: SEMANTIC.success,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0D16',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123,97,255,0.14)',
  },
  bulletText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondaryBright,
  },
  historyToggle: {
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyToggleLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  historyBlock: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  historyEntry: {
    paddingVertical: 10,
    gap: 4,
  },
  historyEntryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 0.4,
  },
  historyReason: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  disclaimerCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  disclaimerBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,168,75,0.1)',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text.secondary,
  },
  legal: {
    fontSize: 11,
    lineHeight: 17,
    color: TEXT_COLORS.dim,
    textAlign: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
});
