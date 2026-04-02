/**
 * Calendar store.
 *
 * Zustand store with persist middleware for managing calendar connection state,
 * toggles, and write preferences. Google access tokens are stored in
 * expo-secure-store (not AsyncStorage) to keep credentials out of plain storage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { CalendarMeta, ChangeNotificationMode } from './calendar-types';

const GOOGLE_ACCESS_TOKEN_KEY = 'shiftwell_google_access_token';

interface CalendarState {
  // Apple
  appleConnected: boolean;
  appleCalendars: CalendarMeta[];
  shiftWellCalendarId: string | null;

  // Google
  googleConnected: boolean;
  googleCalendars: CalendarMeta[];
  /** In-memory cache only — NOT persisted to AsyncStorage. Read from SecureStore on startup. */
  googleAccessToken: string | null;
  googleTokenExpiry: number | null;

  // Work schedule calendar tag (D-07)
  workCalendarId: string | null;

  // Sync cursors
  googleSyncTokens: Record<string, string>;
  lastSyncedAt: string | null;

  // Write preferences (D-11, D-12)
  writeToNativeCalendar: boolean;   // default: true
  nativeWriteCalendarId: string | null;

  // Change notification mode (D-15) — default: 'silent'
  changeNotificationMode: ChangeNotificationMode;

  // Event ID mapping — calendarEventId -> planBlockId (prevents duplicate events on re-sync)
  eventIdMap: Record<string, string>;

  // Actions
  connectApple: (calendars: CalendarMeta[], shiftWellCalendarId: string) => void;
  disconnectApple: () => void;
  connectGoogle: (calendars: CalendarMeta[], accessToken: string, tokenExpiry: number) => void;
  disconnectGoogle: () => void;
  toggleCalendar: (calendarId: string) => void;
  setWorkCalendarId: (calendarId: string | null) => void;
  setWriteToNativeCalendar: (enabled: boolean) => void;
  setNativeWriteCalendarId: (calendarId: string | null) => void;
  setChangeNotificationMode: (mode: ChangeNotificationMode) => void;
  updateGoogleSyncToken: (calendarId: string, syncToken: string) => void;
  setLastSyncedAt: (timestamp: string) => void;
  mapEventId: (calendarEventId: string, planBlockId: string) => void;
  removeEventId: (calendarEventId: string) => void;
  getEnabledAppleCalendarIds: () => string[];
  getEnabledGoogleCalendarIds: () => string[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // Initial state
      appleConnected: false,
      appleCalendars: [],
      shiftWellCalendarId: null,

      googleConnected: false,
      googleCalendars: [],
      googleAccessToken: null,
      googleTokenExpiry: null,

      workCalendarId: null,

      googleSyncTokens: {},
      lastSyncedAt: null,

      writeToNativeCalendar: true,
      nativeWriteCalendarId: null,

      changeNotificationMode: 'silent',

      eventIdMap: {},

      // Actions
      connectApple: (calendars, shiftWellCalendarId) =>
        set({
          appleConnected: true,
          appleCalendars: calendars,
          shiftWellCalendarId,
        }),

      disconnectApple: () =>
        set({
          appleConnected: false,
          appleCalendars: [],
          shiftWellCalendarId: null,
        }),

      connectGoogle: (calendars, accessToken, tokenExpiry) => {
        // Store token in SecureStore — keep out of AsyncStorage
        SecureStore.setItemAsync(GOOGLE_ACCESS_TOKEN_KEY, accessToken).catch(() => {
          // Silent fail — in-memory fallback still works
        });
        set({
          googleConnected: true,
          googleCalendars: calendars,
          googleAccessToken: accessToken,
          googleTokenExpiry: tokenExpiry,
        });
      },

      disconnectGoogle: () => {
        SecureStore.deleteItemAsync(GOOGLE_ACCESS_TOKEN_KEY).catch(() => {});
        set({
          googleConnected: false,
          googleCalendars: [],
          googleAccessToken: null,
          googleTokenExpiry: null,
          googleSyncTokens: {},
        });
      },

      toggleCalendar: (calendarId) =>
        set((state) => {
          const appleCalendars = state.appleCalendars.map((cal) =>
            cal.id === calendarId ? { ...cal, enabled: !cal.enabled } : cal,
          );
          const googleCalendars = state.googleCalendars.map((cal) =>
            cal.id === calendarId ? { ...cal, enabled: !cal.enabled } : cal,
          );
          return { appleCalendars, googleCalendars };
        }),

      setWorkCalendarId: (calendarId) => set({ workCalendarId: calendarId }),

      setWriteToNativeCalendar: (enabled) => set({ writeToNativeCalendar: enabled }),

      setNativeWriteCalendarId: (calendarId) => set({ nativeWriteCalendarId: calendarId }),

      setChangeNotificationMode: (mode) => set({ changeNotificationMode: mode }),

      updateGoogleSyncToken: (calendarId, syncToken) =>
        set((state) => ({
          googleSyncTokens: { ...state.googleSyncTokens, [calendarId]: syncToken },
        })),

      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),

      mapEventId: (calendarEventId, planBlockId) =>
        set((state) => ({
          eventIdMap: { ...state.eventIdMap, [calendarEventId]: planBlockId },
        })),

      removeEventId: (calendarEventId) =>
        set((state) => {
          const { [calendarEventId]: _removed, ...rest } = state.eventIdMap;
          return { eventIdMap: rest };
        }),

      getEnabledAppleCalendarIds: () =>
        get()
          .appleCalendars.filter((cal) => cal.enabled)
          .map((cal) => cal.id),

      getEnabledGoogleCalendarIds: () =>
        get()
          .googleCalendars.filter((cal) => cal.enabled)
          .map((cal) => cal.id),
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Exclude googleAccessToken from persistence — stored in SecureStore instead
      partialize: (state) => {
        const { googleAccessToken, ...rest } = state;
        return rest;
      },
    },
  ),
);
