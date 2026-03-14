import { useMemo, useState, useEffect } from 'react';
import {
  isToday,
  isBefore,
  isAfter,
  isWithinInterval,
  compareAsc,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { usePlanStore } from '@/src/store/plan-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import type { PlanBlock, ShiftEvent, SleepBlockType } from '@/src/lib/circadian/types';
import { BLOCK_COLORS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Countdown {
  label: string;
  targetTime: Date;
  color: string;
  emoji: string;
}

export interface TodayPlanData {
  todayBlocks: PlanBlock[];
  activeBlock: PlanBlock | null;
  nextBlock: PlanBlock | null;
  countdowns: Countdown[];
  currentShift: ShiftEvent | null;
  isEmpty: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a block overlaps today at all (handles overnight blocks). */
function blockOverlapsToday(block: PlanBlock): boolean {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  // Block overlaps today if it starts before end-of-today AND ends after start-of-today.
  return isBefore(block.start, todayEnd) && isAfter(block.end, todayStart);
}

function emojiForType(type: SleepBlockType): string {
  switch (type) {
    case 'main-sleep':
      return '\u{1F634}'; // sleeping face
    case 'nap':
      return '\u{1F4A4}'; // zzz
    case 'caffeine-cutoff':
      return '\u{2615}';  // coffee
    case 'wind-down':
      return '\u{1F31C}'; // moon face
    case 'meal-window':
      return '\u{1F372}'; // food
    case 'light-seek':
      return '\u{2600}';  // sun
    case 'light-avoid':
      return '\u{1F576}'; // sunglasses
    case 'wake':
      return '\u{23F0}';  // alarm clock
    default:
      return '\u{1F552}'; // clock
  }
}

function colorForType(type: SleepBlockType): string {
  switch (type) {
    case 'main-sleep':
      return BLOCK_COLORS.sleep;
    case 'nap':
      return BLOCK_COLORS.nap;
    case 'caffeine-cutoff':
      return BLOCK_COLORS.caffeineCutoff;
    case 'wind-down':
      return BLOCK_COLORS.windDown;
    case 'meal-window':
      return BLOCK_COLORS.meal;
    case 'light-seek':
    case 'light-avoid':
      return BLOCK_COLORS.lightProtocol;
    case 'wake':
      return BLOCK_COLORS.shiftDay;
    default:
      return BLOCK_COLORS.shiftDay;
  }
}

/** Priority types for countdown selection. */
const COUNTDOWN_PRIORITY_TYPES: SleepBlockType[] = [
  'main-sleep',
  'nap',
  'caffeine-cutoff',
  'wind-down',
  'wake',
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTodayPlan(): TodayPlanData {
  // Force re-render every minute so active/next status stays current.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const plan = usePlanStore((s) => s.plan);
  const shifts = useShiftsStore((s) => s.shifts);

  return useMemo(() => {
    const now = new Date();

    // -- Today's blocks --
    const allBlocks = plan?.blocks ?? [];
    const todayBlocks = allBlocks
      .filter(blockOverlapsToday)
      .sort((a, b) => compareAsc(a.start, b.start));

    // -- Active block (now is within start..end) --
    const activeBlock =
      todayBlocks.find((b) =>
        isWithinInterval(now, { start: b.start, end: b.end }),
      ) ?? null;

    // -- Next upcoming block (starts after now) --
    const nextBlock =
      todayBlocks.find((b) => isAfter(b.start, now)) ?? null;

    // -- Current shift --
    const currentShift =
      shifts.find(
        (s) =>
          isWithinInterval(now, { start: s.start, end: s.end }) ||
          (isToday(s.start) && isAfter(s.start, now)),
      ) ?? null;

    // -- Countdowns: pick the next 3 key upcoming events --
    const upcoming = todayBlocks.filter(
      (b) =>
        isAfter(b.start, now) &&
        COUNTDOWN_PRIORITY_TYPES.includes(b.type),
    );

    // Also include next shift starting today if applicable.
    const nextShiftToday = shifts.find(
      (s) => isToday(s.start) && isAfter(s.start, now),
    );

    const countdowns: Countdown[] = upcoming.slice(0, 3).map((b) => ({
      label: b.label,
      targetTime: b.start,
      color: colorForType(b.type),
      emoji: emojiForType(b.type),
    }));

    // Append next shift if there's room and it's not already represented.
    if (nextShiftToday && countdowns.length < 3) {
      const shiftAlreadyIncluded = countdowns.some(
        (c) => c.targetTime.getTime() === nextShiftToday.start.getTime(),
      );
      if (!shiftAlreadyIncluded) {
        countdowns.push({
          label: nextShiftToday.title || 'Shift',
          targetTime: nextShiftToday.start,
          color: BLOCK_COLORS.shiftNight,
          emoji: '\u{1F3E5}', // hospital
        });
      }
    }

    // Sort countdowns chronologically.
    countdowns.sort((a, b) => compareAsc(a.targetTime, b.targetTime));

    return {
      todayBlocks,
      activeBlock,
      nextBlock,
      countdowns: countdowns.slice(0, 3),
      currentShift,
      isEmpty: todayBlocks.length === 0,
    };
  }, [plan, shifts]);
}
