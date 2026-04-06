/**
 * Adaptive Change Logger
 *
 * Computes a diff between two SleepPlans and annotates each meaningful
 * change with its primary factor (circadian, debt, recovery, schedule).
 *
 * Changes smaller than 15 minutes are filtered out as noise.
 * Results are sorted by magnitude descending (most significant first).
 *
 * Scientific basis: docs/superpowers/specs/2026-04-06-adaptive-brain-design.md
 */

import { format } from 'date-fns';
import type { SleepPlan, PlanBlock } from '../circadian/types';
import type { AdaptiveContext, AdaptiveChange, ChangeType, ChangeFactor } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const NOISE_THRESHOLD_MINUTES = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a local YYYY-MM-DD key from a Date.
 * Uses date-fns format to respect the local timezone (avoids UTC rollover).
 */
function dateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Index plan blocks of a given type by date string */
function indexByDate(blocks: PlanBlock[], type: PlanBlock['type']): Map<string, PlanBlock> {
  const map = new Map<string, PlanBlock>();
  for (const block of blocks) {
    if (block.type === type) {
      map.set(dateKey(block.start), block);
    }
  }
  return map;
}

/** Delta in minutes (positive = newTime is later) */
function deltaMinutes(oldTime: Date, newTime: Date): number {
  return Math.round((newTime.getTime() - oldTime.getTime()) / 60_000);
}

/**
 * Determine the primary factor driving a change on a given date.
 *
 * Priority: circadian > debt > recovery > schedule
 */
function determineFactor(dateStr: string, context: AdaptiveContext): ChangeFactor {
  const { circadian, debt, recovery } = context;

  // Circadian: protocol is active and the date falls within its window
  if (
    circadian.protocol &&
    circadian.protocol.dailyTargets.length > 0 &&
    circadian.protocol.dailyTargets.some((t) => dateKey(t.date) === dateStr)
  ) {
    return 'circadian';
  }

  if (debt.severity !== 'none') return 'debt';

  if (recovery.score !== null && recovery.zone !== 'green') return 'recovery';

  return 'schedule';
}

/**
 * Build the human-readable label for a change.
 */
function buildHumanReadable(
  type: ChangeType,
  magnitudeMinutes: number,
  napBlock?: PlanBlock,
): string {
  const absMag = Math.abs(magnitudeMinutes);

  switch (type) {
    case 'bedtime-shifted':
      return magnitudeMinutes > 0
        ? `Bedtime shifted ${absMag} min later`
        : `Bedtime shifted ${absMag} min earlier`;

    case 'wake-shifted':
      return magnitudeMinutes > 0
        ? `Wake time shifted ${absMag} min later`
        : `Wake time shifted ${absMag} min earlier`;

    case 'nap-added':
      return napBlock
        ? `Recovery nap added at ${format(napBlock.start, 'h:mm a')}`
        : `Recovery nap added`;

    case 'nap-removed':
      return `Nap removed — sleep window extended`;

    case 'window-extended':
      return `Sleep window extended ${absMag} min`;

    case 'banking-triggered':
      return `Banking protocol active — extend sleep ${absMag} min tonight`;

    default:
      return `Plan adjusted ${absMag} min`;
  }
}

/**
 * Build the reason string keyed to the factor.
 */
function buildReason(factor: ChangeFactor, context: AdaptiveContext): string {
  const { circadian, debt, recovery } = context;

  switch (factor) {
    case 'circadian': {
      const type = circadian.protocol?.transitionType ?? 'transition';
      const days = circadian.protocol?.daysUntilTransition ?? 0;
      const daysLabel =
        days === 1 ? 'tomorrow' : `in ${days} day${days !== 1 ? 's' : ''}`;
      const typeLabel = type.replace(/-/g, ' ');
      return `${typeLabel} starts ${daysLabel}`;
    }

    case 'debt':
      return `${debt.rollingHours.toFixed(1)}h sleep deficit detected`;

    case 'recovery':
      return `Recovery score ${recovery.score}/100`;

    case 'schedule':
    default:
      return 'Schedule conflict detected';
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the diff between an old plan and a new plan, returning annotated
 * AdaptiveChange records for each meaningful change (> 15 min).
 *
 * @param oldPlan   - The previously generated sleep plan
 * @param newPlan   - The freshly generated sleep plan
 * @param context   - AdaptiveContext built this morning
 * @returns         - Sorted list of meaningful changes (largest magnitude first)
 */
export function computeDelta(
  oldPlan: SleepPlan,
  newPlan: SleepPlan,
  context: AdaptiveContext,
): AdaptiveChange[] {
  const changes: AdaptiveChange[] = [];

  // ── 1. Index main-sleep blocks by date ────────────────────────────────────
  const oldSleep = indexByDate(oldPlan.blocks, 'main-sleep');
  const newSleep = indexByDate(newPlan.blocks, 'main-sleep');

  // ── 2. Compare dates present in BOTH plans ────────────────────────────────
  for (const [dateStr, oldBlock] of oldSleep) {
    const newBlock = newSleep.get(dateStr);
    if (!newBlock) continue;

    const factor = determineFactor(dateStr, context);
    const reason = buildReason(factor, context);

    // Bedtime delta (block start = bedtime)
    const bedtimeDelta = deltaMinutes(oldBlock.start, newBlock.start);
    if (Math.abs(bedtimeDelta) > NOISE_THRESHOLD_MINUTES) {
      changes.push({
        type: 'bedtime-shifted',
        factor,
        magnitudeMinutes: Math.abs(bedtimeDelta),
        humanReadable: buildHumanReadable('bedtime-shifted', bedtimeDelta),
        reason,
      });
    }

    // Wake delta (block end = wake time)
    const wakeDelta = deltaMinutes(oldBlock.end, newBlock.end);
    if (Math.abs(wakeDelta) > NOISE_THRESHOLD_MINUTES) {
      changes.push({
        type: 'wake-shifted',
        factor,
        magnitudeMinutes: Math.abs(wakeDelta),
        humanReadable: buildHumanReadable('wake-shifted', wakeDelta),
        reason,
      });
    }
  }

  // ── 3. Nap block diffs ────────────────────────────────────────────────────
  const oldNaps = indexByDate(oldPlan.blocks, 'nap');
  const newNaps = indexByDate(newPlan.blocks, 'nap');

  // Naps added
  for (const [dateStr, newNap] of newNaps) {
    if (!oldNaps.has(dateStr)) {
      const factor = determineFactor(dateStr, context);
      const reason = buildReason(factor, context);
      // Nap duration as magnitude
      const napMins = Math.round(
        (newNap.end.getTime() - newNap.start.getTime()) / 60_000,
      );
      changes.push({
        type: 'nap-added',
        factor,
        magnitudeMinutes: napMins,
        humanReadable: buildHumanReadable('nap-added', napMins, newNap),
        reason,
      });
    }
  }

  // Naps removed
  for (const [dateStr, _oldNap] of oldNaps) {
    if (!newNaps.has(dateStr)) {
      const factor = determineFactor(dateStr, context);
      const reason = buildReason(factor, context);
      const napMins = Math.round(
        (_oldNap.end.getTime() - _oldNap.start.getTime()) / 60_000,
      );
      changes.push({
        type: 'nap-removed',
        factor,
        magnitudeMinutes: napMins,
        humanReadable: buildHumanReadable('nap-removed', napMins),
        reason,
      });
    }
  }

  // ── 4. Banking protocol trigger ───────────────────────────────────────────
  // Emit when banking window is open AND new sleep windows are longer overall.
  if (context.schedule.bankingWindowOpen) {
    const oldTotalMins = oldPlan.blocks
      .filter((b) => b.type === 'main-sleep')
      .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60_000, 0);

    const newTotalMins = newPlan.blocks
      .filter((b) => b.type === 'main-sleep')
      .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60_000, 0);

    const windowDelta = Math.round(newTotalMins - oldTotalMins);

    if (windowDelta > NOISE_THRESHOLD_MINUTES) {
      const reason = buildReason('debt', context);
      changes.push({
        type: 'banking-triggered',
        factor: 'debt',
        magnitudeMinutes: windowDelta,
        humanReadable: buildHumanReadable('banking-triggered', windowDelta),
        reason,
      });
    }
  }

  // ── 5. Filter noise and sort ──────────────────────────────────────────────
  return changes
    .filter((c) => c.magnitudeMinutes > NOISE_THRESHOLD_MINUTES)
    .sort((a, b) => b.magnitudeMinutes - a.magnitudeMinutes);
}
