import type { SleepBlockType } from '../circadian/types';

/**
 * ActivityAttributes define the static data that doesn't change
 * during a Live Activity's lifetime.
 */
export interface ShiftWellActivityAttributes {
  planDate: string;
}

/**
 * ContentState defines the dynamic data updated in real-time
 * on the Lock Screen / Dynamic Island.
 */
export interface ShiftWellContentState {
  currentBlockType: SleepBlockType | 'shift' | 'none';
  currentBlockLabel: string;
  currentBlockEndTime: number;
  nextBlockType: SleepBlockType | 'shift' | 'none';
  nextBlockLabel: string;
  nextBlockStartTime: number;
  accentColor: string;
}
