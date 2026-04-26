import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CaffeineEntry {
  id: string;
  timestamp: Date;
  type: 'coffee' | 'tea' | 'energy-drink' | 'soda' | 'other';
  mgCaffeine: number;
  label: string;
}

export interface LightEntry {
  id: string;
  timestamp: Date;
  type: 'bright-light' | 'blue-blockers' | 'dim-lights' | 'screens-off';
  durationMinutes: number;
  label: string;
}

export interface DebriefEntry {
  id: string;
  date: Date;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  feltRested: boolean;
  wakeUps: number;
  notes: string;
}

export interface TrackingState {
  caffeineLog: CaffeineEntry[];
  lightLog: LightEntry[];
  debriefLog: DebriefEntry[];

  logCaffeine: (entry: Omit<CaffeineEntry, 'id'>) => void;
  logLight: (entry: Omit<LightEntry, 'id'>) => void;
  logDebrief: (entry: Omit<DebriefEntry, 'id'>) => void;

  getCaffeineToday: () => CaffeineEntry[];
  getLightToday: () => LightEntry[];
  getDebriefForDate: (date: Date) => DebriefEntry | undefined;

  clearOldEntries: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function reviveDates<T extends Record<string, any>>(
  items: T[],
  fields: string[],
): T[] {
  return items.map((item) => {
    const revived = { ...item };
    for (const f of fields) {
      if (revived[f]) (revived as any)[f] = new Date(revived[f]);
    }
    return revived;
  });
}

const dateAwareStorage = {
  getItem: async (name: string) => {
    const raw = await AsyncStorage.getItem(name);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      if (parsed.state.caffeineLog)
        parsed.state.caffeineLog = reviveDates(parsed.state.caffeineLog, ['timestamp']);
      if (parsed.state.lightLog)
        parsed.state.lightLog = reviveDates(parsed.state.lightLog, ['timestamp']);
      if (parsed.state.debriefLog)
        parsed.state.debriefLog = reviveDates(parsed.state.debriefLog, ['date']);
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

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      caffeineLog: [],
      lightLog: [],
      debriefLog: [],

      logCaffeine: (entry) =>
        set((state) => ({
          caffeineLog: [...state.caffeineLog, { ...entry, id: generateId() }],
        })),

      logLight: (entry) =>
        set((state) => ({
          lightLog: [...state.lightLog, { ...entry, id: generateId() }],
        })),

      logDebrief: (entry) =>
        set((state) => ({
          debriefLog: [...state.debriefLog, { ...entry, id: generateId() }],
        })),

      getCaffeineToday: () => get().caffeineLog.filter((e) => isToday(e.timestamp)),

      getLightToday: () => get().lightLog.filter((e) => isToday(e.timestamp)),

      getDebriefForDate: (date: Date) =>
        get().debriefLog.find((e) => isSameDay(e.date, date)),

      clearOldEntries: () => {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        set((state) => ({
          caffeineLog: state.caffeineLog.filter(
            (e) => e.timestamp.getTime() > cutoff,
          ),
          lightLog: state.lightLog.filter(
            (e) => e.timestamp.getTime() > cutoff,
          ),
          debriefLog: state.debriefLog.filter(
            (e) => e.date.getTime() > cutoff,
          ),
        }));
      },
    }),
    {
      name: 'shiftwell-tracking',
      storage: createJSONStorage(() => dateAwareStorage),
    },
  ),
);
