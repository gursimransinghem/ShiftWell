import { isAfter, addHours } from 'date-fns';
import { writePlannedSleep } from './healthkit-service';
import type { PlanBlock } from '../circadian/types';

/**
 * Write upcoming main-sleep and nap blocks to HealthKit as planned sleep.
 *
 * Each written sample activates iOS Sleep Focus during that window,
 * silencing notifications and dimming the lock screen. Only writes
 * blocks starting within the next 36 hours to avoid stale entries.
 */
export async function writePlannedSleepWindows(
  blocks: PlanBlock[],
): Promise<number> {
  const now = new Date();
  const horizon = addHours(now, 36);
  let written = 0;

  const sleepBlocks = blocks.filter(
    (b) =>
      (b.type === 'main-sleep' || b.type === 'nap') &&
      isAfter(b.start, now) &&
      !isAfter(b.start, horizon),
  );

  for (const block of sleepBlocks) {
    const ok = await writePlannedSleep(block.start, block.end);
    if (ok) written++;
  }

  return written;
}
