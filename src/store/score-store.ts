/**
 * Zustand score store — persists daily adherence events and computes nightly scores.
 *
 * Phase 33 update: incorporates Apple Watch HRV signal into recovery score.
 * HRV data (SDNN) is fetched from HealthKit after each sleep window and
 * feeds into a deviation-based score (BIOMETRIC-ALGORITHM-SPEC.md §2–3).
 *
 * HRV state lifecycle:
 *  - Days 1–13: calibrating — data collected but not used in score
 *  - Day 14+: HRV active at 25% weight, weights shift to 40/30/25/5
 *  - Transition periods: HRV suspended, fallback to 50/45/0/5
 *
 * finalizeDay is synchronous (backward-compatible) and immediately writes
 * the adherence-based score. HRV enrichment runs via finalizeWithHRV (async)
 * and updates the score in the background when Apple Watch data is available.
 *
 * Mirrors notification-store.ts pattern (create/persist/createJSONStorage/AsyncStorage).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import {
  computeAdherenceScore,
  AdherenceEvent,
} from '@/src/lib/adherence/adherence-calculator';
import {
  calculateHRVScore,
  shouldIncludeHRV,
  updateBaseline,
  buildHRVWeights,
} from '@/src/lib/hrv/hrv-processor';
import { fetchOvernightHRV } from '@/src/lib/healthkit/hrv-reader';
import { usePlanStore } from '@/src/store/plan-store';

export type { AdherenceEvent };
export type { AdherenceEventType } from '@/src/lib/adherence/adherence-calculator';

export interface DailyScore {
  /** 'YYYY-MM-DD' */
  dateISO: string;
  /** null = no sleep block planned (no-shift day); 0-100 = scored night */
  score: number | null;
  /** HRV score component (0-100) for this night, null if not yet calibrated */
  hrv_score?: number | null;
  /** True when sleep quality data was suppressed due to apnea/breathing events */
  sleepQualitySuppressed?: boolean;
  /** Screening message when sleep quality is suppressed */
  sleepQualityScreeningMessage?: string | null;
}

export interface ScoreStore {
  // ── Adherence / daily history ─────────────────────────────────────────────
  pendingEvents: AdherenceEvent[];
  dailyHistory: DailyScore[];
  lastFinalizedDateISO: string | null;

  // ── HRV calibration state ─────────────────────────────────────────────────
  /** Most recent overnight SDNN reading in milliseconds (null if no Watch) */
  overnightSDNN: number | null;
  /** Personal 30-day rolling mean SDNN (null during calibration days 1-13) */
  personalHRVBaseline: number | null;
  /** Rolling array of past SDNN values — used to compute personalHRVBaseline */
  hrvBaselineValues: number[];
  /** Number of nights contributing to the baseline (capped at 30 for reporting) */
  hrvBaselineDays: number;
  /** True when Apple Watch is paired and HRV permission granted */
  hrv_available: boolean;
  /** Latest night's HRV component score (0-100), null when not yet active */
  hrv_score: number | null;
  /** True during calibration window (days 1-13 with Apple Watch) */
  hrv_calibrating: boolean;
  /** 0.0 to 1.0 calibration progress (hrvBaselineDays / 14), used for UI */
  hrv_calibration_progress: number;
  /** True when HRV is excluded due to active circadian transition protocol */
  hrv_suppressed_transition: boolean;

  // ── Sleep quality suppression (WATCH-03/04) ───────────────────────────────
  /** True when last night had apnea events or breathing disturbance rate > 10/hr */
  sleepQualitySuppressed: boolean;
  /** Screening message text when suppressed */
  sleepQualityScreeningMessage: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  /** Append an adherence event; deduplicates by type+dateISO */
  recordEvent: (event: AdherenceEvent) => void;

  /**
   * Compute and persist the adherence-based score for the given date (synchronous).
   * Second call for the same date is a no-op (idempotent guard).
   * Call finalizeWithHRV after this to incorporate Apple Watch data.
   */
  finalizeDay: (dateISO: string, hasSleepBlock: boolean) => void;

  /**
   * Async HRV enrichment — fetches HealthKit data and updates the daily score.
   * Safe to call without awaiting: all errors caught internally.
   * Should be called after finalizeDay when Apple Watch data may be available.
   */
  finalizeWithHRV: (
    dateISO: string,
    opts?: {
      apneaEventCount?: number | null;
      breathingDisturbanceRate?: number | null;
    }
  ) => Promise<void>;

  /** Last 7 days as {day, score} ordered oldest→newest */
  weeklyScores: () => { day: string; score: number | null }[];

  /** Today's score from dailyHistory, or null if not yet finalized */
  todayScore: () => number | null;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a sleep block time string (e.g. "22:30") relative to a date.
 * Returns null if the format is invalid.
 */
function parseSleepBlockTime(timeStr: string, baseDateISO: string): Date | null {
  try {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const base = new Date(baseDateISO + 'T00:00:00');
    base.setHours(hours, minutes, 0, 0);
    return base;
  } catch {
    return null;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      pendingEvents: [],
      dailyHistory: [],
      lastFinalizedDateISO: null,

      // HRV calibration initial state
      overnightSDNN: null,
      personalHRVBaseline: null,
      hrvBaselineValues: [],
      hrvBaselineDays: 0,
      hrv_available: false,
      hrv_score: null,
      hrv_calibrating: false,
      hrv_calibration_progress: 0,
      hrv_suppressed_transition: false,

      // Sleep quality suppression initial state
      sleepQualitySuppressed: false,
      sleepQualityScreeningMessage: null,

      recordEvent: (event) =>
        set((s) => {
          const already = s.pendingEvents.some(
            (e) => e.type === event.type && e.dateISO === event.dateISO,
          );
          if (already) return s;
          return { pendingEvents: [...s.pendingEvents, event] };
        }),

      finalizeDay: (dateISO, hasSleepBlock) => {
        const s = get();
        if (s.lastFinalizedDateISO === dateISO) return; // idempotent guard
        const score = computeAdherenceScore(s.pendingEvents, hasSleepBlock, dateISO);
        const entry: DailyScore = { dateISO, score };
        const updated = [...s.dailyHistory, entry].slice(-30);
        set({ dailyHistory: updated, lastFinalizedDateISO: dateISO });
      },

      finalizeWithHRV: async (dateISO, opts = {}) => {
        const s = get();
        // Only run if we have a finalized entry for this date
        const existingEntry = s.dailyHistory.find((h) => h.dateISO === dateISO);
        if (!existingEntry) return;

        // ── Sleep apnea / breathing suppression ────────────────────────────
        const { apneaEventCount = null, breathingDisturbanceRate = null } = opts;
        const isSleepQualitySuppressed =
          (apneaEventCount !== null && apneaEventCount > 0) ||
          (breathingDisturbanceRate !== null && breathingDisturbanceRate > 10);

        const screeningMessage = isSleepQualitySuppressed
          ? 'Your sleep data suggests possible breathing disruptions. Sleep apnea is common in shift workers. Consider discussing with your doctor.'
          : null;

        // ── Circadian transition check ──────────────────────────────────────
        let inCircadianTransition = false;
        try {
          const planState = usePlanStore.getState();
          const protocol = planState.adaptiveContext?.circadian?.protocol ?? null;
          const daysUntil = planState.daysUntilTransition ?? 999;
          inCircadianTransition = protocol !== null || daysUntil <= 7;
        } catch {
          inCircadianTransition = false;
        }

        // ── Fetch HRV from HealthKit ────────────────────────────────────────
        let newOvernightSDNN: number | null = null;

        try {
          const planState = usePlanStore.getState();
          const sleepBlock = planState.plan?.blocks?.find(
            (b: { type: string }) => b.type === 'main-sleep',
          ) as { startTime?: string; endTime?: string } | undefined;

          if (sleepBlock?.startTime && sleepBlock?.endTime) {
            const sleepStart = parseSleepBlockTime(sleepBlock.startTime, dateISO);
            const sleepEndBase = parseSleepBlockTime(sleepBlock.endTime, dateISO);
            let sleepEnd = sleepEndBase;
            if (sleepEnd && sleepStart && sleepEnd <= sleepStart) {
              // Cross-midnight sleep: end is the next morning
              sleepEnd = new Date(sleepEnd.getTime() + 24 * 60 * 60 * 1000);
            }
            if (sleepStart && sleepEnd) {
              newOvernightSDNN = await fetchOvernightHRV(sleepStart, sleepEnd);
            }
          } else {
            // Fallback: 8-hour lookback
            const fallbackEnd = new Date();
            const fallbackStart = new Date(fallbackEnd.getTime() - 8 * 60 * 60 * 1000);
            newOvernightSDNN = await fetchOvernightHRV(fallbackStart, fallbackEnd);
          }
        } catch {
          newOvernightSDNN = null;
        }

        // ── Update HRV baseline (skip during transitions) ───────────────────
        const currentState = get();
        let newBaselineValues = [...(currentState.hrvBaselineValues ?? [])];
        let newBaseline = currentState.personalHRVBaseline;

        if (newOvernightSDNN !== null && !inCircadianTransition) {
          const result = updateBaseline(newBaselineValues, newOvernightSDNN, 30);
          newBaselineValues = result.values;
          newBaseline = result.mean;
        }

        const newBaselineDays = newBaselineValues.length;
        const hrv_available = newOvernightSDNN !== null;

        // ── Compute HRV score ───────────────────────────────────────────────
        const includeHRV = shouldIncludeHRV(hrv_available, newBaselineDays, inCircadianTransition);
        const hrv_score =
          includeHRV && newOvernightSDNN !== null && newBaseline !== null
            ? calculateHRVScore(newOvernightSDNN, newBaseline)
            : null;

        // ── Weight-adjusted recovery score ──────────────────────────────────
        // Re-compute using HRV weights when HRV is available
        const adherence_score = computeAdherenceScore(
          currentState.pendingEvents,
          existingEntry.score !== null,
          dateISO,
        ) ?? 0;
        // debt_score placeholder — full engine from adaptive context (Phase 15)
        const debt_score = 60;
        const transition_score = inCircadianTransition ? 70 : 100;

        const weights = buildHRVWeights(includeHRV, newBaselineDays);
        let finalScore: number | null = existingEntry.score; // preserve if no HRV

        if (existingEntry.score !== null) {
          finalScore = Math.round(
            Math.max(0, Math.min(100,
              adherence_score * weights.adherence +
              debt_score      * weights.debt +
              (hrv_score ?? 0) * weights.hrv +
              transition_score * weights.transition,
            )),
          );
        }

        // ── Calibration UI state ────────────────────────────────────────────
        const hrv_calibrating = newBaselineDays > 0 && newBaselineDays < 14;
        const hrv_calibration_progress = Math.min(newBaselineDays / 14, 1.0);
        const hrv_suppressed_transition = inCircadianTransition && hrv_available;

        // ── Update daily record in history ──────────────────────────────────
        const updatedHistory = get().dailyHistory.map((h) =>
          h.dateISO === dateISO
            ? {
                ...h,
                score: finalScore,
                hrv_score,
                ...(isSleepQualitySuppressed && {
                  sleepQualitySuppressed: true,
                  sleepQualityScreeningMessage: screeningMessage,
                }),
              }
            : h,
        );

        set({
          dailyHistory: updatedHistory,
          overnightSDNN: newOvernightSDNN,
          personalHRVBaseline: newBaseline,
          hrvBaselineValues: newBaselineValues,
          hrvBaselineDays: newBaselineDays,
          hrv_available,
          hrv_score,
          hrv_calibrating,
          hrv_calibration_progress,
          hrv_suppressed_transition,
          sleepQualitySuppressed: isSleepQualitySuppressed,
          sleepQualityScreeningMessage: screeningMessage,
        });
      },

      weeklyScores: () => {
        const history = get().dailyHistory;
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
          const d = subDays(today, 6 - i);
          const iso = format(d, 'yyyy-MM-dd');
          const found = history.find((h) => h.dateISO === iso);
          return {
            day: DAY_LABELS[d.getDay()],
            score: found?.score ?? null,
          };
        });
      },

      todayScore: () => {
        const iso = format(new Date(), 'yyyy-MM-dd');
        const found = get().dailyHistory.find((h) => h.dateISO === iso);
        return found?.score ?? null;
      },
    }),
    {
      name: 'score-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        dailyHistory: s.dailyHistory,
        pendingEvents: s.pendingEvents,
        lastFinalizedDateISO: s.lastFinalizedDateISO,
        // HRV calibration fields — persisted so baseline survives app restart
        personalHRVBaseline: s.personalHRVBaseline,
        hrvBaselineValues: s.hrvBaselineValues,
        hrvBaselineDays: s.hrvBaselineDays,
        overnightSDNN: s.overnightSDNN,
        hrv_calibrating: s.hrv_calibrating,
        hrv_calibration_progress: s.hrv_calibration_progress,
        hrv_available: s.hrv_available,
        hrv_score: s.hrv_score,
        hrv_suppressed_transition: s.hrv_suppressed_transition,
      }),
    },
  ),
);
