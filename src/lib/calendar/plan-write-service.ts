/**
 * plan-write-service.ts
 *
 * Handles writing all plan block types (not just sleep/nap) to the Apple Calendar.
 * Provides diff-based sync to prevent event flickering (PLAN-06 anti-pattern avoided).
 *
 * Two-tier write rule (D-04):
 * - ShiftWell calendar: ALL block types
 * - Native calendar: only main-sleep and nap (handled by calendar-service.ts)
 * - Google Calendar write-back: NOT implemented (Apple only per Research Pitfall 5)
 */

import * as ExpoCalendar from 'expo-calendar';
import { format } from 'date-fns';
import type { PlanBlock, SleepPlan } from '../circadian/types';
import { deleteSleepBlock } from './calendar-service';

// ── Title Builder ─────────────────────────────────────────────────────────────

/**
 * Build calendar event title for any SleepBlockType.
 * writeSleepBlock in calendar-service.ts only handles main-sleep/nap.
 * This covers all 8 block types.
 */
export function buildPlanBlockTitle(block: PlanBlock): string {
  const timeStr = format(block.start, 'h:mm a').replace('am', 'AM').replace('pm', 'PM');
  switch (block.type) {
    case 'main-sleep':     return `Sleep — ${timeStr}`;
    case 'nap':            return `Nap — ${timeStr}`;
    case 'wind-down':      return `Wind Down — ${timeStr}`;
    case 'wake':           return `Wake — ${timeStr}`;
    case 'caffeine-cutoff': return `Caffeine Cutoff — ${timeStr}`;
    case 'meal-window':    return `Meal Window — ${timeStr}`;
    case 'light-seek':     return `Light: Seek — ${timeStr}`;
    case 'light-avoid':    return `Light: Avoid — ${timeStr}`;
    default:               return `${block.label} — ${timeStr}`;
  }
}

// ── Single Block Write ─────────────────────────────────────────────────────────

/**
 * Write a single plan block to an Apple calendar (any block type).
 * Returns the created event ID.
 */
export async function writePlanBlock(block: PlanBlock, calendarId: string): Promise<string> {
  const title = buildPlanBlockTitle(block);
  const eventId = await ExpoCalendar.createEventAsync(calendarId, {
    title,
    startDate: block.start,
    endDate: block.end,
    notes: block.description,
    alarms: block.priority === 1 ? [{ relativeOffset: -15 }] : [],
  });
  return eventId;
}

// ── Change Detection ───────────────────────────────────────────────────────────

/**
 * Detect whether a plan block's timing has changed between two versions.
 * Stable block IDs allow safe diffing across regenerations.
 */
export function blockChanged(a: PlanBlock, b: PlanBlock): boolean {
  return a.start.getTime() !== b.start.getTime() || a.end.getTime() !== b.end.getTime();
}

// ── CalStore interface for dependency injection (testable) ────────────────────

interface CalStoreRef {
  shiftWellCalendarId: string | null;
  eventIdMap: Record<string, string>;
  mapEventId: (calendarEventId: string, planBlockId: string) => void;
  removeEventId: (calendarEventId: string) => void;
}

// ── Diff + Sync ───────────────────────────────────────────────────────────────

/**
 * Diff old plan blocks vs new plan blocks and sync to the ShiftWell Apple calendar.
 *
 * Algorithm:
 * 1. Build inverse map: planBlockId -> calendarEventId
 * 2. Delete blocks removed from the new plan
 * 3. Create new blocks not yet in calendar
 * 4. Update changed blocks (time shift detected via blockChanged)
 *
 * Best-effort: individual calendar call failures are logged but don't abort sync.
 */
export async function writeChangedBlocks(
  oldPlan: SleepPlan | null,
  newPlan: SleepPlan,
  calStore: CalStoreRef,
): Promise<void> {
  const shiftWellCalId = calStore.shiftWellCalendarId;
  if (!shiftWellCalId) return; // No ShiftWell calendar yet

  // Build inverse map: planBlockId -> calendarEventId (Pitfall 1 avoided)
  const planToEventId: Record<string, string> = Object.fromEntries(
    Object.entries(calStore.eventIdMap).map(([calId, planId]) => [planId, calId]),
  );

  // Build set of new block IDs for O(1) lookup
  const newBlockIds = new Set(newPlan.blocks.map((b) => b.id));

  // Build old block map for change detection
  const oldBlockById: Record<string, PlanBlock> = {};
  if (oldPlan) {
    for (const b of oldPlan.blocks) {
      oldBlockById[b.id] = b;
    }
  }

  // Step 1: Delete blocks no longer in new plan
  for (const [calEventId, planBlockId] of Object.entries(calStore.eventIdMap)) {
    if (!newBlockIds.has(planBlockId)) {
      try {
        await deleteSleepBlock(calEventId, shiftWellCalId);
        calStore.removeEventId(calEventId);
      } catch (e) {
        console.warn('[PlanWriteService] Failed to delete removed block:', planBlockId, e);
      }
    }
  }

  // Step 2: Create new blocks / update changed blocks
  for (const block of newPlan.blocks) {
    const existingEventId = planToEventId[block.id];

    if (existingEventId) {
      // Block exists in calendar — check if it changed
      const oldBlock = oldBlockById[block.id];
      if (oldBlock && blockChanged(oldBlock, block)) {
        try {
          // Use ExpoCalendar directly for non-sleep types (updateSleepBlock uses sleep-specific title)
          await ExpoCalendar.updateEventAsync(existingEventId, {
            title: buildPlanBlockTitle(block),
            startDate: block.start,
            endDate: block.end,
            notes: block.description,
            alarms: block.priority === 1 ? [{ relativeOffset: -15 }] : [],
          });
        } catch (e) {
          console.warn('[PlanWriteService] Failed to update block:', block.id, e);
        }
      }
      // Unchanged blocks: no action (prevents event flickering)
    } else {
      // New block — write to calendar and map the event ID
      try {
        const newEventId = await writePlanBlock(block, shiftWellCalId);
        calStore.mapEventId(newEventId, block.id);
      } catch (e) {
        console.warn('[PlanWriteService] Failed to write new block:', block.id, e);
      }
    }
  }
}
