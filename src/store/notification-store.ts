import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  windDownEnabled: boolean;
  windDownLeadMinutes: number;       // D-06: 30-60 range, default 45
  caffeineCutoffEnabled: boolean;
  caffeineCutoffLeadMinutes: number; // D-07: default 30
  morningBriefEnabled: boolean;
  setWindDown: (enabled: boolean, leadMinutes?: number) => void;
  setCaffeineCutoff: (enabled: boolean, leadMinutes?: number) => void;
  setMorningBrief: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationPrefs>()(
  persist(
    (set) => ({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
      setWindDown: (enabled, leadMinutes) =>
        set((s) => ({
          windDownEnabled: enabled,
          windDownLeadMinutes: leadMinutes ?? s.windDownLeadMinutes,
        })),
      setCaffeineCutoff: (enabled, leadMinutes) =>
        set((s) => ({
          caffeineCutoffEnabled: enabled,
          caffeineCutoffLeadMinutes: leadMinutes ?? s.caffeineCutoffLeadMinutes,
        })),
      setMorningBrief: (enabled) => set({ morningBriefEnabled: enabled }),
    }),
    {
      name: 'notification-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        windDownEnabled: s.windDownEnabled,
        windDownLeadMinutes: s.windDownLeadMinutes,
        caffeineCutoffEnabled: s.caffeineCutoffEnabled,
        caffeineCutoffLeadMinutes: s.caffeineCutoffLeadMinutes,
        morningBriefEnabled: s.morningBriefEnabled,
      }),
    },
  ),
);
