import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { requestPermissions } from '@/src/lib/notifications/notification-service';
import {
  trackOnboardingScreenViewed,
  trackOnboardingCompleted,
  trackNotificationPermissionResponse,
} from '@/src/lib/analytics/onboarding-events';

interface PlanRowProps {
  icon: string;
  label: string;
  value: string;
}

function PlanRow({ icon, label, value }: PlanRowProps) {
  return (
    <View style={styles.planRow}>
      <Text style={styles.planIcon}>{icon}</Text>
      <Text style={styles.planLabel}>{label}</Text>
      <Text style={styles.planValue}>{value}</Text>
    </View>
  );
}

export default function PlanReadyScreen() {
  const screenStart = useRef(Date.now());
  const { onboardingStartedAt, setNotificationPermissionDeferred } = useOnboardingStore();
  const { profile, completeOnboarding } = useUserStore();
  const shiftCount = useShiftsStore((s) => s.shifts.length);
  const [notifLoading, setNotifLoading] = useState(false);
  const hasShifts = shiftCount > 0;
  const showNap = profile.napPreference;

  useEffect(() => {
    trackOnboardingScreenViewed('plan-ready', onboardingStartedAt ?? Date.now());
  }, [onboardingStartedAt]);

  async function handleEnableNotifications() {
    setNotifLoading(true);
    try {
      const granted = await requestPermissions();
      trackNotificationPermissionResponse(granted ? 'granted' : 'denied');
    } finally {
      setNotifLoading(false);
      finishOnboarding();
    }
  }

  function handleSkipNotifications() {
    setNotificationPermissionDeferred(true);
    trackNotificationPermissionResponse('deferred');
    finishOnboarding();
  }

  function finishOnboarding() {
    const totalMs = Date.now() - (onboardingStartedAt ?? screenStart.current);
    trackOnboardingCompleted(totalMs);
    completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressWrapper}>
          <ProgressBar
            currentStep={ONBOARDING_STEPS.planReady}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        {/* Success badge */}
        <AnimatedTransition delay={0} duration={300}>
          <View style={styles.successBadge}>
            <Text style={styles.checkmark}>{'\u2713'}</Text>
            <Text style={styles.successText}>
              {hasShifts ? 'Your schedule is ready.' : 'Your setup is ready.'}
            </Text>
          </View>
        </AnimatedTransition>

        {/* Plan readiness card */}
        <AnimatedTransition delay={150} duration={250}>
          <View style={styles.planCard}>
            <Text style={styles.planCardLabel}>
              {hasShifts ? 'What happens next' : 'Add shifts to build your plan'}
            </Text>
            <View style={styles.planRows}>
              <PlanRow
                icon={'\u{1F4C5}'}
                label="Schedule"
                value={hasShifts ? `${shiftCount} shift${shiftCount === 1 ? '' : 's'} loaded` : 'Add shifts on the Schedule tab'}
              />
              <PlanRow
                icon={'\u{1F6CF}\uFE0F'}
                label="Sleep"
                value={hasShifts ? 'Generated around your actual shifts' : 'Generated after your first shift'}
              />
              {showNap && (
                <PlanRow icon={'\u23F0'} label="Nap" value="Included when it fits your day" />
              )}
              <PlanRow icon={'\u2600\uFE0F'} label="Light" value="Timed to your shift pattern" />
              <PlanRow icon={'\u{1F37D}\uFE0F'} label="Meals" value="Aligned to your body clock" />
              <PlanRow icon={'\u2615'} label="Caffeine" value="Cutoff calculated from sleep timing" />
            </View>
            <Text style={styles.planCardNote}>
              {hasShifts
                ? `Based on your ${profile.chronotype} chronotype and saved shifts. Open Today to review the actual plan.`
                : 'No sample times here: ShiftWell will calculate real recommendations after you add or import shifts.'}
            </Text>
          </View>
        </AnimatedTransition>

        {/* Notification ask */}
        <AnimatedTransition delay={300} duration={250}>
          <View style={styles.notifSection}>
            <Text style={styles.notifQuestion}>
              Want reminders before your sleep windows?
            </Text>

            <Button
              title={notifLoading ? '' : '\u{1F514}  Yes, remind me'}
              onPress={handleEnableNotifications}
              size="lg"
              fullWidth
              loading={notifLoading}
              icon={notifLoading ? <ActivityIndicator size="small" color="#fff" /> : undefined}
            />

            <Pressable
              onPress={handleSkipNotifications}
              style={({ pressed }) => [styles.notifSkip, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
            >
              <Text style={styles.notifSkipText}>Not right now</Text>
            </Pressable>
          </View>
        </AnimatedTransition>

        {/* Final CTA */}
        <AnimatedTransition delay={400} duration={250}>
          <View style={styles.footer}>
            <Button
              title="Go to my dashboard"
              onPress={finishOnboarding}
              size="lg"
              fullWidth
              variant="secondary"
            />
          </View>
        </AnimatedTransition>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  progressWrapper: {
    marginTop: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.semantic.success,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  successText: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
  },
  planCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  planCardLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent.primary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  planRows: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  planIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  planLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    width: 70,
  },
  planValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  planCardNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  notifSection: {
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  notifQuestion: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  notifSkip: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  notifSkipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
  },
  footer: {
    marginTop: SPACING.sm,
  },
});
