/**
 * Unified Transition Planner — the single authority for circadian transition logic.
 *
 * Before this module the codebase had FOUR independent transition mechanisms
 * (adaptive/circadian-protocols, predictive/pre-adaptation, predictive/stress-scorer,
 * circadian/prediction-engine) — each with its own shift-rate numbers and its own
 * isolated-night handling. That is how the gap-analysis G3 contradiction and the
 * super-physiological rates (G8) shipped.
 *
 * This module does NOT merge those four files (too risky pre-launch). Instead it is the
 * ONE place that owns:
 *   1. SHIFT_RATE_CAPS    — the physiological rate ceiling, imported by all four.
 *   2. selectMode()       — the consecutive-night gate (R1 — the highest-value fix).
 *   3. detectNightBlocks() — one night-block detector, replacing four private counters.
 *
 * Every transition module imports these. No module keeps a private rate or a private
 * isolated-night rule. That closes the defect R2/R3 target by construction.
 *
 * Evidence: Eastman & Burgess (rate ceilings, delay>advance asymmetry); Smith & Eastman
 * (the consecutive-night gate); Smith/Fogg/Eastman 2009 (compromise phase DLMO 03:00).
 */

import { differenceInCalendarDays } from 'date-fns';
import type { ShiftEvent } from './types';

// ─── Rate authority (R3) ──────────────────────────────────────────────────────

/**
 * Physiological per-day clock-shift ceilings, in minutes. Verified 2026-05-24.
 * No transition module may emit a per-day delta outside [-MAX_ADVANCE, +MAX_DELAY].
 */
export const SHIFT_RATE_CAPS = {
  /** Delay ceiling. Eastman/Burgess 12h-shift data ~2.4h/day; capped conservatively. */
  MAX_DELAY_PER_DAY: 120,
  /**
   * Advance ceiling. The ~1.6h/day figure is a 12h-shift LAB ceiling; field-sustainable
   * advance is 0.5-0.7h/day. Capped at 1.0h (A/B-audit research correction — was 1.5h).
   */
  MAX_ADVANCE_PER_DAY: 60,
} as const;

/** Compromise circadian phase target for night workers — DLMO 03:00 (Smith/Fogg/Eastman 2009). */
export const COMPROMISE_DLMO_HOUR = 3.0;

/**
 * Consecutive-night gate threshold. Blocks of ≥ this many nights → attempt partial
 * adaptation; shorter blocks stay day-anchored. [MODERATE] evidence — the exact cutover
 * is tunable against future ShiftWell cohort data, hence one named constant.
 */
export const ADAPT_THRESHOLD_NIGHTS = 4;

/**
 * Only truly-consecutive nights (START dates exactly 1 calendar day apart) form a
 * single block. A day off STARTS A NEW BLOCK.
 *
 * A/B hardening HF-3 (supersedes the earlier AF-16 resolution): tolerating a one-day
 * gap merged two genuinely separate short runs — e.g. 3-on / 1-off / 3-on — into one
 * 6-night block that then selected Adapt mode. That is the exact rotation-whiplash
 * escalation R1 exists to prevent. The mode gate must key on ACTUAL consecutive
 * nights, so the block boundary is a true consecutive run.
 */
const BLOCK_GAP_TOLERANCE_DAYS = 1;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Hold = keep the day schedule, manage acutely. Adapt = partial shift to compromise phase. */
export type TransitionMode = 'hold' | 'adapt';

/** A maximal run of night/extended shifts. */
export interface NightBlock {
  /** Start instant of the first night shift in the block. */
  startDate: Date;
  /** Start instant of the last night shift in the block. */
  endDate: Date;
  /** Count of night/extended shifts in the block (an extended shift counts as 1). */
  consecutiveNights: number;
}

// ─── The consecutive-night gate (R1) ──────────────────────────────────────────

/**
 * The single highest-value fix. 1-3 consecutive nights → 'hold' (do NOT shift the
 * clock — manage with naps, strategic caffeine, alertness light, fast re-anchor).
 * ≥4 nights → 'adapt' (partial shift toward the compromise phase, never full inversion).
 */
export function selectMode(consecutiveNights: number): TransitionMode {
  return consecutiveNights >= ADAPT_THRESHOLD_NIGHTS ? 'adapt' : 'hold';
}

/** Clamp a raw per-day bedtime shift to physiological limits. +delay / −advance. */
export function clampDailyShift(rawMinutes: number): number {
  if (rawMinutes > 0) return Math.min(rawMinutes, SHIFT_RATE_CAPS.MAX_DELAY_PER_DAY);
  if (rawMinutes < 0) return Math.max(rawMinutes, -SHIFT_RATE_CAPS.MAX_ADVANCE_PER_DAY);
  return 0;
}

// ─── Night-block detection ────────────────────────────────────────────────────

/**
 * Group night/extended shifts into maximal blocks. A gap of one day off between two
 * night shifts does NOT break the block (the worker has not de-adapted in one day);
 * a gap of ≥2 days off starts a new block.
 */
export function detectNightBlocks(shifts: ShiftEvent[]): NightBlock[] {
  const nights = shifts
    .filter((s) => s.shiftType === 'night' || s.shiftType === 'extended')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (nights.length === 0) return [];

  const blocks: NightBlock[] = [];
  let blockStart = nights[0];
  let blockEnd = nights[0];
  let count = 1;

  for (let i = 1; i < nights.length; i++) {
    const gap = differenceInCalendarDays(nights[i].start, nights[i - 1].start);
    if (gap <= BLOCK_GAP_TOLERANCE_DAYS) {
      count += 1;
      blockEnd = nights[i];
    } else {
      blocks.push({
        startDate: blockStart.start,
        endDate: blockEnd.start,
        consecutiveNights: count,
      });
      blockStart = nights[i];
      blockEnd = nights[i];
      count = 1;
    }
  }
  blocks.push({
    startDate: blockStart.start,
    endDate: blockEnd.start,
    consecutiveNights: count,
  });
  return blocks;
}

/**
 * How many consecutive nights does the block that a given calendar date falls in (or
 * starts) have? Returns 0 when the date is not part of any night block. Used by the
 * transition modules to feed selectMode().
 */
export function consecutiveNightsForDate(shifts: ShiftEvent[], date: Date): number {
  const blocks = detectNightBlocks(shifts);
  for (const block of blocks) {
    const fromStart = differenceInCalendarDays(date, block.startDate);
    const toEnd = differenceInCalendarDays(block.endDate, date);
    // date sits within [blockStart-1 .. blockEnd+1] — tolerate the pre-shift day.
    if (fromStart >= -1 && toEnd >= -1) {
      return block.consecutiveNights;
    }
  }
  return 0;
}
