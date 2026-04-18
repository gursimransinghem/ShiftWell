import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptionCard from '@/src/components/ui/OptionCard';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import type { Chronotype } from '@/src/lib/circadian/types';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';
import {
  trackOnboardingScreenViewed,
  trackOnboardingScreenCompleted,
  trackOnboardingScreenSkipped,
} from '@/src/lib/analytics/onboarding-events';

const OPTIONS: { value: Chronotype; emoji: string; label: string; subtitle: string }[] = [
  {
    value: 'early',
    emoji: '\u{1F305}',
    label: 'Before 10pm',
    subtitle: '"I\'m a morning person, fight me"',
  },
  {
    value: 'intermediate',
    emoji: '\u{1F319}',
    label: '10pm \u2013 midnight',
    subtitle: '"Somewhere in the middle"',
  },
  {
    value: 'late',
    emoji: '\u{1F989}',
    label: 'After midnight',
    subtitle: '"My natural state is nocturnal"',
  },
];

export default function ChronotypeScreen() {
  const screenStart = useRef(Date.now());
  const { onboardingStartedAt } = useOnboardingStore();
  const setProfile = useUserStore((s) => s.setProfile);

  const [selected, setSelected] = useState<Chronotype | null>(null);

  useEffect(() => {
    trackOnboardingScreenViewed('chronotype', onboardingStartedAt ?? Date.now());
  }, [onboardingStartedAt]);

  function handleSelect(value: Chronotype) {
    setSelected(value);
    setProfile({ chronotype: value });
    trackOnboardingScreenCompleted('chronotype', Date.now() - screenStart.current);
    setTimeout(() => router.push('/(onboarding)/sleep-and-naps'), 150);
  }

  function handleSkip() {
    setProfile({ chronotype: 'intermediate' });
    trackOnboardingScreenSkipped('chronotype');
    router.push('/(onboarding)/sleep-and-naps');
  }

  function handleBack() {
    router.back();
  }

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
            currentStep={ONBOARDING_STEPS.chronotype}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <AnimatedTransition delay={0} duration={250}>
          <Text style={styles.headline}>When does your body naturally want to sleep?</Text>
          <Text style={styles.body}>
            Pick the bedtime that feels most natural when you have no obligations.
          </Text>
        </AnimatedTransition>

        <AnimatedTransition delay={100} duration={250}>
          <View style={styles.options}>
            {OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                title={opt.label}
                description={opt.subtitle}
                icon={opt.emoji}
                selected={selected === opt.value}
                onPress={() => handleSelect(opt.value)}
              />
            ))}
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
  options: {
    gap: SPACING.md,
  },
});
