import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

import { usePlanStore } from '@/src/store/plan-store';
import { useTodayPlan } from './useTodayPlan';
import {
  isLiveActivitySupported,
  getActiveActivityId,
  startActivity,
  updateActivity,
  endActivity,
} from '@/src/lib/live-activity';
import type { ShiftWellContentState } from '@/src/lib/live-activity';
import type { PlanBlock, SleepBlockType } from '@/src/lib/circadian/types';
import { BLOCK_COLORS } from '@/src/theme';

function colorForBlockType(type: SleepBlockType | 'shift' | 'none'): string {
  switch (type) {
    case 'main-sleep': return BLOCK_COLORS.sleep;
    case 'nap': return BLOCK_COLORS.nap;
    case 'caffeine-cutoff': return BLOCK_COLORS.caffeineCutoff;
    case 'wind-down': return BLOCK_COLORS.windDown;
    case 'meal-window': return BLOCK_COLORS.meal;
    case 'light-seek':
    case 'light-avoid': return BLOCK_COLORS.lightProtocol;
    case 'wake': return BLOCK_COLORS.shiftDay;
    case 'shift': return BLOCK_COLORS.shiftNight;
    default: return BLOCK_COLORS.shiftDay;
  }
}

function buildContentState(
  activeBlock: PlanBlock | null,
  nextBlock: PlanBlock | null,
): ShiftWellContentState {
  return {
    currentBlockType: activeBlock?.type ?? 'none',
    currentBlockLabel: activeBlock?.label ?? 'No active block',
    currentBlockEndTime: activeBlock?.end.getTime() ?? 0,
    nextBlockType: nextBlock?.type ?? 'none',
    nextBlockLabel: nextBlock?.label ?? '',
    nextBlockStartTime: nextBlock?.start.getTime() ?? 0,
    accentColor: colorForBlockType(activeBlock?.type ?? 'none'),
  };
}

/**
 * Auto-manages a Live Activity on the iOS Lock Screen.
 *
 * - Starts an activity when there are today blocks
 * - Updates the activity every minute (via useTodayPlan tick)
 * - Ends the activity when there are no more blocks
 */
export function useLiveActivity(): void {
  const { todayBlocks, activeBlock, nextBlock, isEmpty } = useTodayPlan();
  const lastStateRef = useRef<string>('');

  useEffect(() => {
    if (!isLiveActivitySupported()) return;

    const state = buildContentState(activeBlock, nextBlock);
    const stateKey = JSON.stringify(state);

    if (stateKey === lastStateRef.current) return;
    lastStateRef.current = stateKey;

    if (isEmpty) {
      if (getActiveActivityId()) {
        endActivity();
      }
      return;
    }

    if (!getActiveActivityId()) {
      startActivity(
        { planDate: format(new Date(), 'yyyy-MM-dd') },
        state,
      );
    } else {
      updateActivity(state);
    }
  }, [activeBlock, nextBlock, isEmpty]);

  useEffect(() => {
    return () => {
      if (getActiveActivityId()) {
        endActivity();
      }
    };
  }, []);
}
