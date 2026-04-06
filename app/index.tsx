import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useScoreStore } from '@/src/store/score-store';
import { format, subDays } from 'date-fns';
import { COLORS } from '@/src/theme';

function seedMockData() {
  // DEV: Seed data so Today screen shows full V6 layout
  const { profile, setProfile, completeOnboarding } = useUserStore.getState();
  const { shifts, addShift } = useShiftsStore.getState();

  // Start trial on first launch (no-op if already started)
  usePremiumStore.getState().startTrial();

  // Seed score history so HeroScore ring renders (no HealthKit in simulator)
  const { dailyHistory } = useScoreStore.getState();
  if (dailyHistory.length === 0) {
    const mockScores = [62, 71, 68, 75, 80, 73, 78];
    useScoreStore.setState({
      dailyHistory: mockScores.map((score, i) => ({
        dateISO: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
        score,
      })),
      lastFinalizedDateISO: format(new Date(), 'yyyy-MM-dd'),
    });
  }

  // Mark onboarding complete
  completeOnboarding();

  // Set profile if default
  if (!profile.sleepNeed || profile.sleepNeed === 7.5) {
    setProfile({
      sleepNeed: 7.5,
      caffeineHalfLife: 5,
      napPreference: 20,
      commuteMinutes: 15,
    });
  }

  // Add a completed yesterday day shift → makes today a Recovery Day
  // Clear any stale shifts first to ensure we get the right state
  const { clearShifts } = useShiftsStore.getState();
  if (typeof clearShifts === 'function') clearShifts();

  const shiftStart = new Date();
  shiftStart.setDate(shiftStart.getDate() - 1);
  shiftStart.setHours(7, 0, 0, 0); // Yesterday 7am

  const shiftEnd = new Date();
  shiftEnd.setDate(shiftEnd.getDate() - 1);
  shiftEnd.setHours(19, 0, 0, 0); // Yesterday 7pm

  addShift({
    title: 'Day Shift',
    start: shiftStart,
    end: shiftEnd,
    shiftType: 'day',
    source: 'manual',
  });
}

export default function EntryScreen() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  useEffect(() => {
    // DEV: Seed mock data and skip to tabs
    // TODO: Remove before production
    seedMockData();
    router.replace('/(tabs)');
  }, [onboardingComplete]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
