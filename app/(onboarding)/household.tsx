import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';
import {
  trackOnboardingScreenViewed,
  trackOnboardingScreenCompleted,
  trackOnboardingScreenSkipped,
} from '@/src/lib/analytics/onboarding-events';

const CHIPS: { id: string; emoji: string; label: string }[] = [
  { id: 'kids', emoji: '\u{1F476}', label: 'Young kids' },
  { id: 'pets', emoji: '\u{1F436}', label: 'Pets' },
  { id: 'commute', emoji: '\u{1F697}', label: 'Long commute' },
];

export default function HouseholdScreen() {
  const screenStart = useRef(Date.now());
  const { onboardingStartedAt } = useOnboardingStore();
  const setProfile = useUserStore((s) => s.setProfile);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    trackOnboardingScreenViewed('household', onboardingStartedAt ?? Date.now());
  }, [onboardingStartedAt]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleContinue() {
    setProfile({
      hasYoungChildren: selected.has('kids'),
      hasPets: selected.has('pets'),
      commuteDuration: selected.has('commute') ? 45 : 30,
    });
    trackOnboardingScreenCompleted('household', Date.now() - screenStart.current);
    router.push('/(onboarding)/shifts');
  }

  function handleSkip() {
    setProfile({ hasYoungChildren: false, hasPets: false, commuteDuration: 30 });
    trackOnboardingScreenSkipped('household');
    router.push('/(onboarding)/shifts');
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
            currentStep={ONBOARDING_STEPS.household}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <AnimatedTransition delay={0} duration={250}>
          <Text style={styles.headline}>What's your situation at home?</Text>
          <Text style={styles.body}>
            Select everything that might eat into your sleep time.
          </Text>
        </AnimatedTransition>

        <AnimatedTransition delay={100} duration={250}>
          <View style={styles.chips}>
            {CHIPS.map((chip) => {
              const active = selected.has(chip.id);
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => toggle(chip.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                >
                  <Text style={styles.chipEmoji}>{chip.emoji}</Text>
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </AnimatedTransition>

        <AnimatedTransition delay={200} duration={250}>
          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              size="lg"
              fullWidth
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING['3xl'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 32,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  chipActive: {
    backgroundColor: 'rgba(123,97,255,0.12)',
    borderColor: '#7B61FF',
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#7B61FF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
  },
});
