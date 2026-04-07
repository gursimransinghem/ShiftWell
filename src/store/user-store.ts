import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../lib/circadian/types';
import { DEFAULT_PROFILE } from '../lib/circadian/types';

export interface UserState {
  profile: UserProfile;
  onboardingComplete: boolean;
  healthkitConnected: boolean;
  weeklyBriefEnabled: boolean;
  setProfile: (profile: Partial<UserProfile>) => void;
  setHealthkitConnected: (connected: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setWeeklyBriefEnabled: (v: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: { ...DEFAULT_PROFILE },
      onboardingComplete: false,
      healthkitConnected: false,
      weeklyBriefEnabled: true,

      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      setHealthkitConnected: (connected) =>
        set({ healthkitConnected: connected }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      resetOnboarding: () =>
        set({
          profile: { ...DEFAULT_PROFILE },
          onboardingComplete: false,
          healthkitConnected: false,
          weeklyBriefEnabled: true,
        }),

      setWeeklyBriefEnabled: (v: boolean) => set({ weeklyBriefEnabled: v }),
    }),
    {
      name: 'nightshift-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
