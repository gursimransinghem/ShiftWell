import { Redirect } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';

export default function EntryScreen() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  return <Redirect href={onboardingComplete ? '/(tabs)' : '/welcome'} />;
}
