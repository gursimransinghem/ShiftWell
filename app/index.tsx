import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { COLORS } from '@/src/theme';

function seedMockData() {
  // DEV: Seed data so Today screen shows full V6 layout
  const { profile, setProfile, completeOnboarding } = useUserStore.getState();
  const { shifts, addShift } = useShiftsStore.getState();

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

  // Add a shift for tomorrow if no shifts exist
  if (shifts.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(19, 0, 0, 0);

    addShift({
      title: 'Day Shift',
      start: tomorrow,
      end: tomorrowEnd,
      shiftType: 'day',
      source: 'manual',
    });
  }
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
