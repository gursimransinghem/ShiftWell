import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useShiftsStore } from '@/src/store/shifts-store';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';
import type { ShiftEvent } from '@/src/lib/circadian/types';
import {
  trackOnboardingScreenViewed,
  trackShiftImportMethod,
} from '@/src/lib/analytics/onboarding-events';

/** 3-night demo rotation: 12-hour night shifts (7pm–7am), every other night */
function buildDemoShifts(): ShiftEvent[] {
  const now = new Date();
  // Start tonight (or tomorrow if it's already past 7pm)
  const base = new Date(now);
  if (now.getHours() >= 19) {
    base.setDate(base.getDate() + 1);
  }
  base.setHours(19, 0, 0, 0);

  return [0, 2, 4].map((offsetDays, i) => {
    const start = new Date(base);
    start.setDate(base.getDate() + offsetDays);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(7, 0, 0, 0);
    return {
      id: `demo-${i}`,
      title: 'Night Shift (Demo)',
      start,
      end,
      shiftType: 'night' as const,
      source: 'manual' as const,
    };
  });
}

interface OptionTileProps {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function OptionTile({ emoji, title, subtitle, onPress }: OptionTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      accessibilityRole="button"
    >
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <View style={styles.tileText}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.tileChevron}>{'\u203A'}</Text>
    </Pressable>
  );
}

export default function ShiftsScreen() {
  const screenStart = useRef(Date.now());
  const { onboardingStartedAt, setDemoMode } = useOnboardingStore();
  const importShifts = useShiftsStore((s) => s.importShifts);

  useEffect(() => {
    trackOnboardingScreenViewed('shifts', onboardingStartedAt ?? Date.now());
  }, [onboardingStartedAt]);

  function handleCalendarImport() {
    trackShiftImportMethod('calendar');
    // The import flow owns its completion navigation. Pushing plan-ready here too
    // would skip the review step and leave a confusing back stack.
    router.push('/import?from=onboarding');
  }

  function handleManual() {
    trackShiftImportMethod('manual');
    // Send users straight to the shift form; plan-ready should not imply a real
    // plan exists before at least one shift has been entered.
    router.push('/add-shift?from=onboarding');
  }

  function handleDemo() {
    trackShiftImportMethod('demo');
    setDemoMode(true);
    importShifts(buildDemoShifts());
    router.push('/(onboarding)/plan-ready');
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
        </View>

        <View style={styles.progressWrapper}>
          <ProgressBar
            currentStep={ONBOARDING_STEPS.shifts}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <AnimatedTransition delay={0} duration={250}>
          <Text style={styles.headline}>Drop in your schedule.</Text>
          <Text style={styles.body}>
            This is where it gets good. We need your shifts to build your plan.
          </Text>
        </AnimatedTransition>

        <AnimatedTransition delay={100} duration={250}>
          <View style={styles.tiles}>
            <OptionTile
              emoji={'\u{1F4C5}'}
              title="Import a calendar file"
              subtitle="Choose a .ics export from QGenda, Amion, Apple, Google, or Outlook"
              onPress={handleCalendarImport}
            />
            <OptionTile
              emoji={'\u270F\uFE0F'}
              title="Enter manually"
              subtitle="Add your first shift now"
              onPress={handleManual}
            />
            <OptionTile
              emoji={'\u{1F51C}'}
              title="I'll do this later"
              subtitle="Explore with demo data — a sample night rotation"
              onPress={handleDemo}
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
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  navButton: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
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
  tiles: {
    gap: SPACING.md,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.lg,
    minHeight: 80,
    gap: SPACING.md,
  },
  tilePressed: {
    opacity: 0.75,
    backgroundColor: COLORS.background.elevated,
  },
  tileEmoji: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 3,
  },
  tileSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  tileChevron: {
    fontSize: 20,
    color: COLORS.text.tertiary,
  },
});
