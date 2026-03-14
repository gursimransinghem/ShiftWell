import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parse, set as setDate, parseISO } from 'date-fns';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Button from '@/src/components/ui/Button';
import { useShiftsStore } from '@/src/store';
import type { ShiftType } from '@/src/lib/circadian/types';
import { BACKGROUND, TEXT, ACCENT, BLOCK_COLORS, BORDER } from '@/src/theme';

/** Auto-detect shift type from start hour */
function detectShiftType(start: Date, end: Date): ShiftType {
  const startHour = start.getHours();
  const endHour = end.getHours();

  // Night shift: starts between 18:00-04:00
  if (startHour >= 18 || startHour < 4) return 'night';
  // Evening shift: starts between 14:00-18:00
  if (startHour >= 14 && startHour < 18) return 'evening';
  // Extended: >16h
  const durationMs = end.getTime() - start.getTime();
  if (durationMs > 16 * 60 * 60 * 1000) return 'extended';
  // Default: day
  return 'day';
}

function shiftTypeBadgeColor(type: ShiftType): string {
  switch (type) {
    case 'night':
      return BLOCK_COLORS.shiftNight;
    case 'evening':
      return BLOCK_COLORS.shiftEvening;
    case 'day':
      return BLOCK_COLORS.shiftDay;
    case 'extended':
      return BLOCK_COLORS.caffeineCutoff;
  }
}

function shiftTypeLabel(type: ShiftType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function AddShiftScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shiftId?: string; date?: string }>();

  const shifts = useShiftsStore((s) => s.shifts);
  const addShift = useShiftsStore((s) => s.addShift);
  const updateShift = useShiftsStore((s) => s.updateShift);
  const removeShift = useShiftsStore((s) => s.removeShift);

  const existingShift = params.shiftId
    ? shifts.find((s) => s.id === params.shiftId)
    : undefined;

  const isEditing = !!existingShift;

  // Initialize state from existing shift or defaults
  const initialDate = useMemo(() => {
    if (existingShift) return existingShift.start;
    if (params.date) {
      try {
        return parseISO(params.date);
      } catch {
        return new Date();
      }
    }
    return new Date();
  }, [existingShift, params.date]);

  const [title, setTitle] = useState(existingShift?.title ?? 'Shift');
  const [shiftDate, setShiftDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(() => {
    if (existingShift) return existingShift.start;
    return setDate(initialDate, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
  });
  const [endTime, setEndTime] = useState(() => {
    if (existingShift) return existingShift.end;
    return setDate(initialDate, { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 });
  });

  // Picker visibility state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const detectedType = useMemo(() => detectShiftType(startTime, endTime), [startTime, endTime]);
  const badgeColor = shiftTypeBadgeColor(detectedType);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selected) {
        setShiftDate(selected);
        // Update start/end dates to match the new date
        setStartTime((prev) =>
          setDate(selected, {
            hours: prev.getHours(),
            minutes: prev.getMinutes(),
            seconds: 0,
            milliseconds: 0,
          }),
        );
        setEndTime((prev) =>
          setDate(selected, {
            hours: prev.getHours(),
            minutes: prev.getMinutes(),
            seconds: 0,
            milliseconds: 0,
          }),
        );
      }
    },
    [],
  );

  const handleStartTimeChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      setShowStartPicker(Platform.OS === 'ios');
      if (selected) {
        setStartTime(
          setDate(shiftDate, {
            hours: selected.getHours(),
            minutes: selected.getMinutes(),
            seconds: 0,
            milliseconds: 0,
          }),
        );
      }
    },
    [shiftDate],
  );

  const handleEndTimeChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      setShowEndPicker(Platform.OS === 'ios');
      if (selected) {
        let newEnd = setDate(shiftDate, {
          hours: selected.getHours(),
          minutes: selected.getMinutes(),
          seconds: 0,
          milliseconds: 0,
        });
        // If end is before start, assume next day
        if (newEnd.getTime() <= startTime.getTime()) {
          newEnd = new Date(newEnd.getTime() + 24 * 60 * 60 * 1000);
        }
        setEndTime(newEnd);
      }
    },
    [shiftDate, startTime],
  );

  const handleSave = useCallback(() => {
    if (isEditing && existingShift) {
      updateShift(existingShift.id, {
        title,
        start: startTime,
        end: endTime,
      });
    } else {
      addShift({
        title,
        start: startTime,
        end: endTime,
        shiftType: detectedType,
      });
    }
    router.back();
  }, [isEditing, existingShift, title, startTime, endTime, detectedType, addShift, updateShift, router]);

  const handleDelete = useCallback(() => {
    if (existingShift) {
      removeShift(existingShift.id);
      router.back();
    }
  }, [existingShift, removeShift, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleCancel}
          style={styles.headerButton}
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Shift' : 'Add Shift'}</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Shift type badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.typeBadgeText}>{shiftTypeLabel(detectedType)} Shift</Text>
            </View>
          </View>

          {/* Title input */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Shift"
              placeholderTextColor={TEXT.tertiary}
              selectionColor={ACCENT.primary}
            />
          </View>

          {/* Date picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [styles.pickerButton, pressed && styles.pickerPressed]}
            >
              <Text style={styles.pickerText}>{format(shiftDate, 'EEEE, MMM d, yyyy')}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={shiftDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                themeVariant="dark"
              />
            )}
          </View>

          {/* Start time */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Start Time</Text>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              style={({ pressed }) => [styles.pickerButton, pressed && styles.pickerPressed]}
            >
              <Text style={styles.pickerText}>{format(startTime, 'h:mm a')}</Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
                themeVariant="dark"
                minuteInterval={5}
              />
            )}
          </View>

          {/* End time */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>End Time</Text>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              style={({ pressed }) => [styles.pickerButton, pressed && styles.pickerPressed]}
            >
              <Text style={styles.pickerText}>{format(endTime, 'h:mm a')}</Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={handleEndTimeChange}
                themeVariant="dark"
                minuteInterval={5}
              />
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button title="Save" onPress={handleSave} variant="primary" fullWidth />

            {isEditing && (
              <Pressable
                onPress={handleDelete}
                style={styles.deleteButton}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>Delete Shift</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: BACKGROUND.surface,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.default,
  },
  headerButton: {
    width: 70,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    color: TEXT.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  cancelText: {
    color: ACCENT.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: TEXT.onAccent,
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: TEXT.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: BACKGROUND.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER.default,
    color: TEXT.primary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
  },
  pickerButton: {
    backgroundColor: BACKGROUND.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER.default,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerPressed: {
    borderColor: ACCENT.primary,
    opacity: 0.8,
  },
  pickerText: {
    color: TEXT.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    marginTop: 12,
    gap: 16,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 44,
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
