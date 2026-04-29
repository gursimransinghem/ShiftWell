import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';
import { COLORS } from '@/src/theme';

export default function EntryScreen() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (onboardingComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcome');
    }
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
