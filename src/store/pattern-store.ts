/**
 * Pattern Store — Phase 23
 *
 * Zustand persist store for detected behavioral/sleep patterns and generated alerts.
 * Patterns are detected from discrepancy history, shift history, and debt data.
 * Alerts are generated from patterns using alert-generator with guardrail validation.
 *
 * Persists to AsyncStorage as 'pattern-store'.
 * Maximum 20 alerts retained. Refresh debounced to 24h.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectPatterns, type DetectedPattern } from '../lib/patterns/pattern-detector';
import { generatePatternAlert } from '../lib/patterns/alert-generator';
import type { PatternAlert } from '../lib/patterns/types';
import type { SleepDiscrepancy, DiscrepancyHistory } from '../lib/feedback/types';
import type { ShiftEvent } from '../lib/circadian/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ALERTS = 20;
const REFRESH_DEBOUNCE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export interface PatternState {
  /** All generated pattern alerts */
  alerts: PatternAlert[];
  /** Last analysis timestamp (ISO string) or null if never analyzed */
  lastAnalyzedISO: string | null;
  /** True while analysis is running */
  isAnalyzing: boolean;

  // Derived — computed from alerts
  /** All non-dismissed alerts, sorted by severity (critical first) */
  activeAlerts: () => PatternAlert[];
  /** Highest priority active alert (first of sorted active alerts), or null */
  highestPriorityAlert: () => PatternAlert | null;

  /**
   * Run pattern detection + alert generation and update the store.
   * Debounced: skips if last analysis was < 24h ago.
   *
   * @param discrepancyHistory  Feedback pipeline discrepancy records
   * @param shiftHistory        All historical shifts
   * @param debtHistory         Daily debt records
   */
  refreshAlerts: (
    discrepancyHistory: SleepDiscrepancy[],
    shiftHistory: ShiftEvent[],
    debtHistory: { dateISO: string; hours: number }[],
  ) => void;

  /**
   * Convenience overload accepting DiscrepancyHistory wrapper.
   */
  refreshAlertsFromHistory: (
    history: DiscrepancyHistory,
    shiftHistory: ShiftEvent[],
    debtHistory: { dateISO: string; hours: number }[],
  ) => void;

  /** Dismiss an alert by patternId */
  dismissAlert: (patternId: string) => void;

  // ---- Legacy API (backward compatibility with Phase 6 PatternAlertCard) ----

  /** @deprecated Use alerts instead — kept for PatternAlertCard Phase 6 logic */
  patterns: DetectedPattern[];
  /** @deprecated Use dismissAlert instead */
  dismissedPatterns: string[];
  /** @deprecated Use refreshAlerts instead */
  detectAndUpdate: (
    discrepancyHistory: SleepDiscrepancy[],
    shiftHistory: ShiftEvent[],
    debtHistory: { dateISO: string; hours: number }[],
  ) => void;
  /** @deprecated Use dismissAlert instead */
  dismissPattern: (key: string) => void;
  /** Clear all dismissed patterns (e.g., at start of new month). */
  clearDismissed: () => void;
}

// ---------------------------------------------------------------------------
// Severity ordering helper
// ---------------------------------------------------------------------------

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

function sortAlertsBySeverity(alerts: PatternAlert[]): PatternAlert[] {
  return [...alerts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePatternStore = create<PatternState>()(
  persist(
    (set, get) => ({
      alerts: [],
      lastAnalyzedISO: null,
      isAnalyzing: false,

      // ---- Derived ----

      activeAlerts: () => {
        return sortAlertsBySeverity(get().alerts.filter((a) => !a.dismissed));
      },

      highestPriorityAlert: () => {
        const active = get().activeAlerts();
        return active.length > 0 ? active[0] : null;
      },

      // ---- Actions ----

      refreshAlerts: (discrepancyHistory, shiftHistory, debtHistory) => {
        const { lastAnalyzedISO } = get();

        // Debounce: skip if analyzed within last 24h
        if (lastAnalyzedISO) {
          const lastMs = new Date(lastAnalyzedISO).getTime();
          if (Date.now() - lastMs < REFRESH_DEBOUNCE_MS) {
            set({ isAnalyzing: false });
            return;
          }
        }

        set({ isAnalyzing: true });

        const detected = detectPatterns(discrepancyHistory, shiftHistory, debtHistory);

        // Generate alerts from detected patterns
        const newAlerts = detected.map(generatePatternAlert);

        // Merge with existing alerts: preserve dismissed state for matching patternIds
        const existing = get().alerts;
        const existingById = new Map(existing.map((a) => [a.patternId, a]));

        const merged = newAlerts.map((alert) => {
          const prev = existingById.get(alert.patternId);
          return prev ? { ...alert, dismissed: prev.dismissed } : alert;
        });

        // Cap at MAX_ALERTS
        const trimmed = merged.slice(0, MAX_ALERTS);

        set({
          alerts: trimmed,
          patterns: detected, // keep legacy field in sync
          lastAnalyzedISO: new Date().toISOString(),
          isAnalyzing: false,
        });
      },

      refreshAlertsFromHistory: (history, shiftHistory, debtHistory) => {
        get().refreshAlerts(history.records, shiftHistory, debtHistory);
      },

      dismissAlert: (patternId) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.patternId === patternId ? { ...a, dismissed: true } : a,
          ),
        }));
      },

      // ---- Legacy API ----

      patterns: [],
      dismissedPatterns: [],

      detectAndUpdate: (discrepancyHistory, shiftHistory, debtHistory) => {
        const detected = detectPatterns(discrepancyHistory, shiftHistory, debtHistory);
        set({ patterns: detected });
        // Also trigger refreshAlerts for new API consistency (bypass debounce)
        set({ lastAnalyzedISO: null });
        get().refreshAlerts(discrepancyHistory, shiftHistory, debtHistory);
      },

      dismissPattern: (key) => {
        set((state) => ({
          dismissedPatterns: state.dismissedPatterns.includes(key)
            ? state.dismissedPatterns
            : [...state.dismissedPatterns, key],
        }));
      },

      clearDismissed: () => set({ dismissedPatterns: [] }),
    }),
    {
      name: 'pattern-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        alerts: s.alerts.slice(0, MAX_ALERTS),
        lastAnalyzedISO: s.lastAnalyzedISO,
        dismissedPatterns: s.dismissedPatterns,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Helpers (kept for backward compatibility with PatternAlertCard)
// ---------------------------------------------------------------------------

/**
 * Compute the dismissal key for a pattern.
 * Components use this to check dismissal and to call dismissPattern().
 */
export function patternDismissalKey(pattern: DetectedPattern): string {
  return `${pattern.type}:${pattern.detectedAt.slice(0, 10)}`;
}
