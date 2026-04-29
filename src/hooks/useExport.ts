import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { generateICS, type ExportOptions, DEFAULT_EXPORT_OPTIONS } from '../lib/calendar/ics-generator';
import type { SleepPlan } from '../lib/circadian/types';
import { usePlanStore } from '../store/plan-store';

export async function sharePlanICS(
  plan: SleepPlan,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
): Promise<boolean> {
  const icsContent = generateICS(plan, options);
  const fileName = 'ShiftWell-Sleep-Plan.ics';
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, icsContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    return false;
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/calendar',
    dialogTitle: 'Export Sleep Plan',
    UTI: 'com.apple.ical.ics',
  });

  return true;
}

/**
 * Custom hook for exporting the current sleep plan as an .ics file.
 *
 * Generates the ICS content, writes it to a temp file via expo-file-system,
 * then opens the native share sheet via expo-sharing.
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPlan = useCallback(
    async (options: ExportOptions = DEFAULT_EXPORT_OPTIONS) => {
      setError(null);
      setIsExporting(true);

      try {
        const plan = usePlanStore.getState().plan;

        if (!plan) {
          setError('No sleep plan available. Import your shifts first to generate a plan.');
          return false;
        }

        if (plan.blocks.length === 0) {
          setError('Your sleep plan has no blocks to export. Try regenerating it.');
          return false;
        }

        const shared = await sharePlanICS(plan, options);
        if (!shared) {
          setError('Sharing is not available on this device.');
          return false;
        }

        return true;
      } catch (e: any) {
        console.error('Export error:', e);
        setError('Something went wrong while exporting. Please try again.');
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportPlan, isExporting, error };
}
