import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, OptionCard, ProgressBar } from '@/src/components/ui';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import type { RoutineStep } from '@/src/lib/circadian/types';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60] as const;

const PM_DEFAULTS: RoutineStep[] = [
  { id: 'dinner',    label: 'Dinner',             icon: '\u{1F37D}\uFE0F', durationMinutes: 30, enabled: true  },
  { id: 'family',    label: 'Family time',        icon: '\u{1F6CB}\uFE0F', durationMinutes: 60, enabled: false },
  { id: 'winddown',  label: 'Wind-down',          icon: '\u{1F4D6}', durationMinutes: 30, enabled: true  },
  { id: 'skincare',  label: 'Skincare / hygiene', icon: '\u{1FA77}', durationMinutes: 15, enabled: false },
  { id: 'phonedown', label: 'Phone down',         icon: '\u{1F4F5}', durationMinutes: 0,  enabled: true  },
  { id: 'lightsout', label: 'Lights out',         icon: '\u{1F319}', durationMinutes: 0,  enabled: true  },
];

export default function PmRoutineScreen() {
  const setProfile = useUserStore((s) => s.setProfile);
  const [activities, setActivities] = useState<RoutineStep[]>(PM_DEFAULTS);

  function toggleActivity(id: string) {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  }

  function setDuration(id: string, durationMinutes: number) {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, durationMinutes } : a)),
    );
  }

  function handleNext() {
    setProfile({ pmRoutine: activities.filter((a) => a.enabled) });
    router.push('/(onboarding)/addresses');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar
            currentStep={ONBOARDING_STEPS.pmRoutine}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <Text style={styles.title}>Your Evening Routine</Text>
        <Text style={styles.subtitle}>
          Select what you do between dinner and lights-out
        </Text>

        <View style={styles.activityList}>
          {activities.map((activity, index) => (
            <AnimatedTransition key={activity.id} delay={index * 80}>
              <Card style={styles.activityCard}>
                <OptionCard
                  title={activity.label}
                  icon={activity.icon}
                  selected={activity.enabled}
                  onPress={() => toggleActivity(activity.id)}
                  description={
                    activity.durationMinutes > 0 && activity.enabled
                      ? `${activity.durationMinutes} min`
                      : undefined
                  }
                />

                {activity.enabled && activity.durationMinutes > 0 && (
                  <View style={styles.durationRow}>
                    <Text style={styles.durationLabel}>Duration</Text>
                    <View style={styles.durationChips}>
                      {DURATION_OPTIONS.map((min) => (
                        <View key={min} style={styles.chipWrapper}>
                          <OptionCard
                            title={`${min}m`}
                            selected={activity.durationMinutes === min}
                            onPress={() => setDuration(activity.id, min)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            </AnimatedTransition>
          ))}
        </View>

        <View style={styles.footer}>
          <Button title="Next" onPress={handleNext} size="lg" fullWidth />
        </View>
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
    marginTop: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  title: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING['3xl'],
    lineHeight: 22,
  },
  activityList: {
    gap: SPACING.sm,
  },
  activityCard: {
    marginBottom: 0,
  },
  durationRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.elevated,
  },
  durationLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  durationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chipWrapper: {
    minWidth: 52,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING['3xl'],
  },
});
