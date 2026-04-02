import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShiftEvent, PersonalEvent } from '../lib/circadian/types';
import { classifyShiftType } from '../lib/circadian/classify-shifts';
import { queueWrite } from '../lib/sync/sync-engine';

export interface ShiftsState {
  shifts: ShiftEvent[];
  personalEvents: PersonalEvent[];
  /** IDs of shifts that need circadian recalculation (Phase 3 consumes this — D-16) */
  recalculationNeeded: string[];
  addShift: (shift: Omit<ShiftEvent, 'id'>) => void;
  updateShift: (id: string, updates: Partial<ShiftEvent>) => void;
  removeShift: (id: string) => void;
  importShifts: (shifts: ShiftEvent[]) => void;
  clearShifts: () => void;
  addPersonalEvent: (event: PersonalEvent) => void;
  importPersonalEvents: (events: PersonalEvent[]) => void;
  /** Returns IDs of all shifts that originated from calendar sync (D-16 deletion detection) */
  getCalendarSyncedShiftIds: () => string[];
  /** Flag a shift for recalculation — Phase 3 Circadian Reset will consume this (D-16) */
  markRecalculationNeeded: (shiftId: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Revive ISO date strings back into Date objects for shift and event arrays.
 */
function reviveDates<T extends { start: Date; end: Date }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    start: new Date(item.start),
    end: new Date(item.end),
  }));
}

/**
 * Custom storage wrapper that handles Date serialization/deserialization.
 * Dates are stored as ISO strings by JSON.stringify and parsed back on read.
 */
const dateAwareStorage: StateStorage = {
  getItem: async (name: string) => {
    const raw = await AsyncStorage.getItem(name);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      if (parsed.state.shifts) {
        parsed.state.shifts = reviveDates(parsed.state.shifts);
      }
      if (parsed.state.personalEvents) {
        parsed.state.personalEvents = reviveDates(parsed.state.personalEvents);
      }
    }
    return JSON.stringify(parsed);
  },
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useShiftsStore = create<ShiftsState>()(
  persist(
    (set, get) => ({
      shifts: [],
      personalEvents: [],
      recalculationNeeded: [],

      addShift: (shift) => {
        const start = shift.start instanceof Date ? shift.start : new Date(shift.start);
        const end = shift.end instanceof Date ? shift.end : new Date(shift.end);
        const shiftType = classifyShiftType(start, end);
        const id = generateId();

        set((state) => ({
          shifts: [
            ...state.shifts,
            { ...shift, id, start, end, shiftType },
          ],
        }));

        // Queue cloud sync (async, non-blocking)
        queueWrite('shifts', 'upsert', {
          id, title: shift.title, start_time: start.toISOString(),
          end_time: end.toISOString(), shift_type: shiftType, source: 'manual',
        });
      },

      updateShift: (id, updates) =>
        set((state) => ({
          shifts: state.shifts.map((s) => {
            if (s.id !== id) return s;

            const updated = { ...s, ...updates };
            // Re-classify if times changed
            if (updates.start || updates.end) {
              updated.shiftType = classifyShiftType(updated.start, updated.end);
            }
            return updated;
          }),
        })),

      removeShift: (id) => {
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== id),
        }));
        queueWrite('shifts', 'delete', { id });
      },

      importShifts: (shifts) =>
        set((state) => ({
          shifts: [
            ...state.shifts,
            ...shifts.map((s) => ({
              ...s,
              id: s.id || generateId(),
              start: s.start instanceof Date ? s.start : new Date(s.start),
              end: s.end instanceof Date ? s.end : new Date(s.end),
            })),
          ],
        })),

      clearShifts: () => set({ shifts: [], personalEvents: [] }),

      addPersonalEvent: (event) =>
        set((state) => ({
          personalEvents: [
            ...state.personalEvents,
            {
              ...event,
              id: event.id || generateId(),
              start: event.start instanceof Date ? event.start : new Date(event.start),
              end: event.end instanceof Date ? event.end : new Date(event.end),
            },
          ],
        })),

      importPersonalEvents: (events) =>
        set((state) => ({
          personalEvents: [
            ...state.personalEvents,
            ...events.map((e) => ({
              ...e,
              id: e.id || generateId(),
              start: e.start instanceof Date ? e.start : new Date(e.start),
              end: e.end instanceof Date ? e.end : new Date(e.end),
            })),
          ],
        })),

      getCalendarSyncedShiftIds: () =>
        get().shifts
          .filter((s) => s.source === 'calendar')
          .map((s) => s.id),

      markRecalculationNeeded: (shiftId) =>
        set((state) => ({
          recalculationNeeded: state.recalculationNeeded.includes(shiftId)
            ? state.recalculationNeeded
            : [...state.recalculationNeeded, shiftId],
        })),
    }),
    {
      name: 'nightshift-shifts',
      storage: createJSONStorage(() => dateAwareStorage),
    },
  ),
);
