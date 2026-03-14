import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../lib/circadian/types';
import { DEFAULT_PROFILE } from '../lib/circadian/types';

export interface UserState {
  profile: UserProfile;
  onboardingComplete: boolean;
  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: { ...DEFAULT_PROFILE },
      onboardingComplete: false,

      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      resetOnboarding: () =>
        set({
          profile: { ...DEFAULT_PROFILE },
          onboardingComplete: false,
        }),
    }),
    {
      name: 'nightshift-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
