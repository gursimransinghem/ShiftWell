import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialize,
  checkPremiumStatus,
  purchasePackage,
  restorePurchases,
  getOfferings,
  onPremiumStatusChange,
} from '../lib/premium/premium-service';
import type { Feature } from '../lib/premium/entitlements';
import { isFeatureAvailable } from '../lib/premium/entitlements';

const TRIAL_DAYS = 14;

// ---------------------------------------------------------------------------
// Trial helpers
// ---------------------------------------------------------------------------

function computeTrialDaysLeft(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0;
  const start = new Date(trialStartedAt).getTime();
  const elapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - elapsed);
}

function computeIsInTrial(trialStartedAt: string | null): boolean {
  return computeTrialDaysLeft(trialStartedAt) > 0;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface PremiumState {
  isPremium: boolean;
  plan: 'free' | 'premium';
  expiresAt: Date | null;
  isLoading: boolean;
  offerings: any | null;

  // Trial
  trialStartedAt: string | null;
  trialDaysLeft: number;
  isInTrial: boolean;

  // Actions
  initializePremium: () => Promise<void>;
  startTrial: () => void;
  refreshStatus: () => Promise<void>;
  purchase: (pkg: any) => Promise<void>;
  restore: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  canAccess: (feature: Feature) => boolean;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      plan: 'free',
      expiresAt: null,
      isLoading: false,
      offerings: null,
      trialStartedAt: null,
      trialDaysLeft: 0,
      isInTrial: false,

      startTrial: () => {
        const { trialStartedAt } = get();
        // Only start trial once
        if (trialStartedAt) return;
        const now = new Date().toISOString();
        set({
          trialStartedAt: now,
          trialDaysLeft: TRIAL_DAYS,
          isInTrial: true,
        });
      },

      initializePremium: async () => {
        // Refresh trial state from persisted start date
        const { trialStartedAt } = get();
        const daysLeft = computeTrialDaysLeft(trialStartedAt);
        const inTrial = computeIsInTrial(trialStartedAt);
        set({ trialDaysLeft: daysLeft, isInTrial: inTrial });

        try {
          await initialize();
          const status = await checkPremiumStatus();
          set({
            isPremium: status.isPremium,
            plan: status.plan,
            expiresAt: status.expiresAt,
          });

          onPremiumStatusChange((status) => {
            set({
              isPremium: status.isPremium,
              plan: status.plan,
              expiresAt: status.expiresAt,
            });
          });
        } catch {
          // RevenueCat not configured yet — rely on trial state
        }
      },

      refreshStatus: async () => {
        // Re-compute trial
        const { trialStartedAt } = get();
        set({
          trialDaysLeft: computeTrialDaysLeft(trialStartedAt),
          isInTrial: computeIsInTrial(trialStartedAt),
        });

        try {
          const status = await checkPremiumStatus();
          set({
            isPremium: status.isPremium,
            plan: status.plan,
            expiresAt: status.expiresAt,
          });
        } catch {
          // Ignore — keep current status
        }
      },

      purchase: async (pkg) => {
        set({ isLoading: true });
        try {
          await purchasePackage(pkg);
          const status = await checkPremiumStatus();
          set({
            isPremium: status.isPremium,
            plan: status.plan,
            expiresAt: status.expiresAt,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      restore: async () => {
        set({ isLoading: true });
        try {
          await restorePurchases();
          const status = await checkPremiumStatus();
          set({
            isPremium: status.isPremium,
            plan: status.plan,
            expiresAt: status.expiresAt,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      loadOfferings: async () => {
        try {
          const offerings = await getOfferings();
          set({ offerings });
        } catch {
          // Ignore — offerings not available
        }
      },

      // Access = paid premium OR active trial
      canAccess: (feature: Feature) => {
        const { isPremium, isInTrial } = get();
        return isFeatureAvailable(feature, isPremium || isInTrial);
      },
    }),
    {
      name: 'premium-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        trialStartedAt: state.trialStartedAt,
      }),
    },
  ),
);
