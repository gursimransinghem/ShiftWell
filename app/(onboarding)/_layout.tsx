import { Stack } from 'expo-router';
import { COLORS } from '@/src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: COLORS.background.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="chronotype" />
      <Stack.Screen name="household" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="am-routine" />
      <Stack.Screen name="pm-routine" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="healthkit" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
