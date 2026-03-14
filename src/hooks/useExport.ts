import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { generateICS, type ExportOptions, DEFAULT_EXPORT_OPTIONS } from '../lib/calendar/ics-generator';
import { usePlanStore } from '../store/plan-store';

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

        // Generate ICS content
        const icsContent = generateICS(plan, options);

        // Write to a temp file
        const fileName = `ShiftWell-Sleep-Plan.ics`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, icsContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Check if sharing is available (not available on all platforms)
        const sharingAvailable = await Sharing.isAvailableAsync();

        if (!sharingAvailable) {
          setError('Sharing is not available on this device.');
          return false;
        }

        // Open share sheet
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/calendar',
          dialogTitle: 'Export Sleep Plan',
          UTI: 'com.apple.ical.ics',
        });

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
