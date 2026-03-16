import { create } from 'zustand';
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

export interface PremiumState {
  isPremium: boolean;
  plan: 'free' | 'premium';
  expiresAt: Date | null;
  isLoading: boolean;
  offerings: any | null;

  // Actions
  initializePremium: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  purchase: (pkg: any) => Promise<void>;
  restore: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  canAccess: (feature: Feature) => boolean;
}

export const usePremiumStore = create<PremiumState>()((set, get) => ({
  isPremium: false,
  plan: 'free',
  expiresAt: null,
  isLoading: false,
  offerings: null,

  initializePremium: async () => {
    try {
      await initialize();
      const status = await checkPremiumStatus();
      set({
        isPremium: status.isPremium,
        plan: status.plan,
        expiresAt: status.expiresAt,
      });

      // Listen for changes
      onPremiumStatusChange((status) => {
        set({
          isPremium: status.isPremium,
          plan: status.plan,
          expiresAt: status.expiresAt,
        });
      });
    } catch {
      // RevenueCat not configured yet — stay on free
    }
  },

  refreshStatus: async () => {
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

  canAccess: (feature: Feature) => {
    return isFeatureAvailable(feature, get().isPremium);
  },
}));
