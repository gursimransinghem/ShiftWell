import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  /** True if user chose "explore with demo data" on the shifts screen */
  demoMode: boolean;
  /** True if user tapped "Not right now" on the notification ask */
  notificationPermissionDeferred: boolean;
  /** Timestamp of when onboarding was started (ms since epoch) */
  onboardingStartedAt: number | null;

  setDemoMode: (demo: boolean) => void;
  setNotificationPermissionDeferred: (deferred: boolean) => void;
  startOnboarding: () => void;
  resetOnboardingSession: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      demoMode: false,
      notificationPermissionDeferred: false,
      onboardingStartedAt: null,

      setDemoMode: (demo) => set({ demoMode: demo }),
      setNotificationPermissionDeferred: (deferred) =>
        set({ notificationPermissionDeferred: deferred }),
      startOnboarding: () => set({ onboardingStartedAt: Date.now() }),
      resetOnboardingSession: () =>
        set({
          demoMode: false,
          notificationPermissionDeferred: false,
          onboardingStartedAt: null,
        }),
    }),
    {
      name: 'nightshift-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
