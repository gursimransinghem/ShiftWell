import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import OptionCard from '@/src/components/ui/OptionCard';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, PURPLE, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';
import {
  trackOnboardingScreenViewed,
  trackOnboardingScreenCompleted,
  trackOnboardingScreenSkipped,
} from '@/src/lib/analytics/onboarding-events';

const SLEEP_MIN = 5;
const SLEEP_MAX = 10;
const SLEEP_STEP = 0.5;
const SLEEP_DEFAULT = 7.5;

export default function SleepAndNapsScreen() {
  const screenStart = useRef(Date.now());
  const { onboardingStartedAt } = useOnboardingStore();
  const setProfile = useUserStore((s) => s.setProfile);

  const [sleepNeed, setSleepNeed] = useState(SLEEP_DEFAULT);
  const [napPreference, setNapPreference] = useState<boolean | null>(null);

  useEffect(() => {
    trackOnboardingScreenViewed('sleep-and-naps', onboardingStartedAt ?? Date.now());
  }, [onboardingStartedAt]);

  function decrement() {
    setSleepNeed((prev) => Math.max(SLEEP_MIN, Math.round((prev - SLEEP_STEP) * 10) / 10));
  }

  function increment() {
    setSleepNeed((prev) => Math.min(SLEEP_MAX, Math.round((prev + SLEEP_STEP) * 10) / 10));
  }

  function handleContinue() {
    const nap = napPreference ?? true;
    setProfile({ sleepNeed, napPreference: nap });
    trackOnboardingScreenCompleted('sleep-and-naps', Date.now() - screenStart.current);
    router.push('/(onboarding)/household');
  }

  function handleSkip() {
    setProfile({ sleepNeed: SLEEP_DEFAULT, napPreference: true });
    trackOnboardingScreenSkipped('sleep-and-naps');
    router.push('/(onboarding)/household');
  }

  function handleBack() {
    router.back();
  }

  const canContinue = napPreference !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.navButton} accessibilityRole="button">
            <Text style={styles.navText}>{'\u2190'} Back</Text>
          </Pressable>
          <Pressable onPress={handleSkip} style={styles.navButton} accessibilityRole="button">
            <Text style={styles.navText}>Skip {'\u2192'}</Text>
          </Pressable>
        </View>

        <View style={styles.progressWrapper}>
          <ProgressBar
            currentStep={ONBOARDING_STEPS.sleepAndNaps}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <AnimatedTransition delay={0} duration={250}>
          <Text style={styles.headline}>How much sleep do you actually need?</Text>
          <Text style={styles.body}>
            Not how much you get. How much you need to not feel like a zombie.
          </Text>
        </AnimatedTransition>

        {/* Sleep need stepper */}
        <AnimatedTransition delay={100} duration={250}>
          <View style={styles.stepperCard}>
            <View style={styles.stepperRow}>
              <Pressable
                onPress={decrement}
                disabled={sleepNeed <= SLEEP_MIN}
                style={[styles.stepperBtn, sleepNeed <= SLEEP_MIN && styles.stepperBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Decrease sleep hours"
              >
                <Text style={[styles.stepperBtnText, sleepNeed <= SLEEP_MIN && styles.stepperBtnTextDisabled]}>
                  {'\u2212'}
                </Text>
              </Pressable>

              <View style={styles.stepperValueBlock}>
                <Text style={styles.stepperValue}>{sleepNeed}</Text>
                <Text style={styles.stepperUnit}>hours</Text>
              </View>

              <Pressable
                onPress={increment}
                disabled={sleepNeed >= SLEEP_MAX}
                style={[styles.stepperBtn, sleepNeed >= SLEEP_MAX && styles.stepperBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Increase sleep hours"
              >
                <Text style={[styles.stepperBtnText, sleepNeed >= SLEEP_MAX && styles.stepperBtnTextDisabled]}>
                  +
                </Text>
              </Pressable>
            </View>
            <Text style={styles.stepperRange}>Range: 5h \u2014 10h, step: 30 min</Text>
          </View>
        </AnimatedTransition>

        <View style={styles.divider} />

        {/* Nap preference */}
        <AnimatedTransition delay={200} duration={250}>
          <Text style={styles.napQuestion}>
            Are you open to strategic naps on long stretches?
          </Text>

          <View style={styles.napOptions}>
            <OptionCard
              title="Yes, if they fit"
              description="Show me nap windows when they help"
              icon={'\u{1F4A4}'}
              selected={napPreference === true}
              onPress={() => setNapPreference(true)}
            />
            <OptionCard
              title="No, I can't nap"
              description="Skip nap recommendations entirely"
              icon={'\u{1F6AB}'}
              selected={napPreference === false}
              onPress={() => setNapPreference(false)}
            />
          </View>
        </AnimatedTransition>

        <AnimatedTransition delay={300} duration={250}>
          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              size="lg"
              fullWidth
              disabled={!canContinue}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  navButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  navText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  progressWrapper: {
    marginBottom: SPACING['3xl'],
  },
  headline: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  stepperCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING['2xl'],
    marginBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING['2xl'],
    marginBottom: SPACING.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  stepperBtnDisabled: {
    opacity: 0.3,
  },
  stepperBtnText: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  stepperBtnTextDisabled: {
    color: COLORS.text.tertiary,
  },
  stepperValueBlock: {
    alignItems: 'center',
    minWidth: 80,
  },
  stepperValue: {
    fontSize: 44,
    fontWeight: '800',
    color: PURPLE,
    letterSpacing: -1,
    lineHeight: 50,
  },
  stepperUnit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  stepperRange: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginBottom: SPACING['2xl'],
  },
  napQuestion: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  napOptions: {
    gap: SPACING.md,
    marginBottom: SPACING['3xl'],
  },
  footer: {
    marginTop: 'auto',
  },
});
