import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

import { parseICSForShifts } from '@/src/lib/calendar/ics-parser';
import { useShiftsStore } from '@/src/store/shifts-store';
import { BACKGROUND, TEXT, ACCENT, BORDER, SEMANTIC, BLOCK_COLORS } from '@/src/theme';
import { SPACING, RADIUS } from '@/src/theme';
import { heading2, heading3, body, bodySmall, caption, label } from '@/src/theme';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import type { ShiftEvent, PersonalEvent } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 'pick' | 'review' | 'done';

interface ParsedResult {
  detectedShifts: ShiftEvent[];
  otherEvents: PersonalEvent[];
}

const SHIFT_TYPE_COLORS: Record<string, string> = {
  day: BLOCK_COLORS.shiftDay,
  evening: BLOCK_COLORS.shiftEvening,
  night: BLOCK_COLORS.shiftNight,
  extended: SEMANTIC.warning,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImportScreen() {
  const [step, setStep] = useState<Step>('pick');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [importedCount, setImportedCount] = useState(0);

  const importShifts = useShiftsStore((s) => s.importShifts);
  const importPersonalEvents = useShiftsStore((s) => s.importPersonalEvents);

  // -----------------------------------------------------------------------
  // File picking & parsing
  // -----------------------------------------------------------------------

  const pickFile = useCallback(async () => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/calendar', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        setError('Could not read the selected file. Please try again.');
        return;
      }

      setLoading(true);

      const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!fileContent || !fileContent.includes('BEGIN:VCALENDAR')) {
        setError(
          'This does not appear to be a valid .ics calendar file. Please export your schedule from your calendar app and try again.',
        );
        setLoading(false);
        return;
      }

      const { detectedShifts, otherEvents } = parseICSForShifts(fileContent);

      setParsed({ detectedShifts, otherEvents });
      setCheckedIds(new Set(detectedShifts.map((s) => s.id)));
      setStep('review');
    } catch (e: any) {
      console.error('Import error:', e);
      setError(
        'Something went wrong while reading the file. Make sure it is a valid .ics calendar export.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Checkbox toggling
  // -----------------------------------------------------------------------

  const toggleShift = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!parsed) return;
    const allIds = parsed.detectedShifts.map((s) => s.id);
    const allChecked = allIds.every((id) => checkedIds.has(id));
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(allIds));
    }
  }, [parsed, checkedIds]);

  // -----------------------------------------------------------------------
  // Import action
  // -----------------------------------------------------------------------

  const handleImport = useCallback(() => {
    if (!parsed) return;

    const selectedShifts = parsed.detectedShifts.filter((s) => checkedIds.has(s.id));
    importShifts(selectedShifts);
    importPersonalEvents(parsed.otherEvents);

    setImportedCount(selectedShifts.length);
    setStep('done');
  }, [parsed, checkedIds, importShifts, importPersonalEvents]);

  // -----------------------------------------------------------------------
  // Renderers
  // -----------------------------------------------------------------------

  const renderShiftRow = useCallback(
    ({ item }: { item: ShiftEvent }) => {
      const checked = checkedIds.has(item.id);
      const badgeColor = SHIFT_TYPE_COLORS[item.shiftType] || ACCENT.primary;
      const dateStr = format(item.start, 'EEE, MMM d');
      const timeStr = `${format(item.start, 'h:mm a')} - ${format(item.end, 'h:mm a')}`;

      return (
        <Pressable
          onPress={() => toggleShift(item.id)}
          style={styles.shiftRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
        >
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <View style={styles.checkboxInner} />}
          </View>
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.shiftDate}>{dateStr}</Text>
            <Text style={styles.shiftTime}>{timeStr}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {item.shiftType.charAt(0).toUpperCase() + item.shiftType.slice(1)}
            </Text>
          </View>
        </Pressable>
      );
    },
    [checkedIds, toggleShift],
  );

  // -----------------------------------------------------------------------
  // Step: Pick file
  // -----------------------------------------------------------------------

  if (step === 'pick') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>Import Your Schedule</Text>
          <Text style={styles.description}>
            Import your work shifts from a .ics calendar file. NightShift will
            automatically detect which events are shifts and build your
            personalized sleep plan.
          </Text>

          <Card style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to export</Text>
            <Text style={styles.instructionText}>
              1. Open your scheduling app (QGenda, Amion, etc.){'\n'}
              2. Look for "Export" or "Subscribe" options{'\n'}
              3. Choose "Download .ics file"{'\n'}
              4. Select the file here
            </Text>
          </Card>

          <View style={styles.pickActions}>
            <Button
              title={loading ? 'Reading file...' : 'Choose .ics File'}
              onPress={pickFile}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            />
          </View>

          <Text style={styles.hint}>
            Works with QGenda, Amion, Google Calendar, Apple Calendar, Outlook,
            and any app that exports .ics files.
          </Text>

          {error && (
            <Card style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="Try Again"
                onPress={pickFile}
                variant="secondary"
                size="sm"
              />
            </Card>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // -----------------------------------------------------------------------
  // Step: Review detected shifts
  // -----------------------------------------------------------------------

  if (step === 'review' && parsed) {
    const shiftCount = parsed.detectedShifts.length;
    const otherCount = parsed.otherEvents.length;
    const selectedCount = checkedIds.size;
    const allChecked =
      shiftCount > 0 &&
      parsed.detectedShifts.every((s) => checkedIds.has(s.id));

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('pick')} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.stepIndicator}>
            <View style={styles.stepDotActive} />
            <View style={styles.stepDotActive} />
            <View style={styles.stepDot} />
          </View>
        </View>

        <View style={styles.reviewHeader}>
          <Text style={styles.heading}>Review Shifts</Text>
          <Text style={styles.summary}>
            {shiftCount} shift{shiftCount !== 1 ? 's' : ''} detected
            {otherCount > 0
              ? `, ${otherCount} other event${otherCount !== 1 ? 's' : ''}`
              : ''}
          </Text>
        </View>

        {shiftCount === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No shifts detected</Text>
            <Text style={styles.emptyDescription}>
              We couldn't identify any work shifts in this file. Shifts are
              typically 6-24 hour events. Try importing a file that contains
              your work schedule.
            </Text>
            <Button
              title="Choose Another File"
              onPress={() => setStep('pick')}
              variant="secondary"
              size="md"
            />
          </View>
        ) : (
          <>
            <Pressable onPress={toggleAll} style={styles.selectAllRow}>
              <View style={[styles.checkbox, allChecked && styles.checkboxChecked]}>
                {allChecked && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.selectAllText}>
                {allChecked ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>

            <FlatList
              data={parsed.detectedShifts}
              keyExtractor={(item) => item.id}
              renderItem={renderShiftRow}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.importBar}>
              <Button
                title={`Import ${selectedCount} Shift${selectedCount !== 1 ? 's' : ''}`}
                onPress={handleImport}
                variant="primary"
                size="lg"
                fullWidth
                disabled={selectedCount === 0}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    );
  }

  // -----------------------------------------------------------------------
  // Step: Done
  // -----------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.doneContent}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>{'\u2713'}</Text>
        </View>
        <Text style={styles.heading}>Import Complete</Text>
        <Text style={styles.doneDescription}>
          {importedCount} shift{importedCount !== 1 ? 's' : ''} imported
          successfully. Your sleep plan will update automatically.
        </Text>

        <View style={styles.doneActions}>
          <Button
            title="View Schedule"
            onPress={() => router.replace('/(tabs)/schedule')}
            variant="primary"
            size="lg"
            fullWidth
          />
          <View style={{ height: SPACING.md }} />
          <Button
            title="Back to Settings"
            onPress={() => router.back()}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  backText: {
    ...body,
    color: ACCENT.primary,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER.default,
  },
  stepDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['3xl'],
  },
  heading: {
    ...heading2,
    color: TEXT.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...body,
    color: TEXT.secondary,
    marginBottom: SPACING['3xl'],
    lineHeight: 22,
  },
  instructionCard: {
    marginBottom: SPACING['2xl'],
  },
  instructionTitle: {
    ...label,
    color: TEXT.primary,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    ...bodySmall,
    color: TEXT.secondary,
    lineHeight: 22,
  },
  pickActions: {
    marginBottom: SPACING.xl,
  },
  hint: {
    ...caption,
    color: TEXT.tertiary,
    textAlign: 'center',
  },
  errorCard: {
    marginTop: SPACING.xl,
    backgroundColor: SEMANTIC.errorMuted,
    borderColor: SEMANTIC.error + '44',
  },
  errorText: {
    ...bodySmall,
    color: SEMANTIC.error,
    marginBottom: SPACING.md,
  },

  // Review step
  reviewHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  summary: {
    ...bodySmall,
    color: TEXT.secondary,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectAllText: {
    ...label,
    color: ACCENT.primary,
    marginLeft: SPACING.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['4xl'],
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER.strong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    borderColor: ACCENT.primary,
    backgroundColor: ACCENT.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  shiftInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  shiftTitle: {
    ...body,
    color: TEXT.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  shiftDate: {
    ...bodySmall,
    color: TEXT.secondary,
  },
  shiftTime: {
    ...caption,
    color: TEXT.tertiary,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    ...caption,
    fontWeight: '600',
  },
  importBar: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: BORDER.subtle,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  emptyTitle: {
    ...heading3,
    color: TEXT.primary,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...body,
    color: TEXT.secondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },

  // Done step
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SEMANTIC.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  successEmoji: {
    fontSize: 32,
    color: SEMANTIC.success,
    fontWeight: '700',
  },
  doneDescription: {
    ...body,
    color: TEXT.secondary,
    textAlign: 'center',
    marginBottom: SPACING['3xl'],
    lineHeight: 22,
  },
  doneActions: {
    width: '100%',
    alignItems: 'center',
  },
});
