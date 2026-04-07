import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, ACCENT, PURPLE } from '@/src/theme';

interface TimeRangePickerProps {
  startTime: Date;
  endTime: Date;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date) => void;
  label?: string;
}

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mins} ${ampm}`;
}

export default function TimeRangePicker({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  label,
}: TimeRangePickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <Pressable
          onPress={() => onStartChange(startTime)}
          style={({ pressed }) => [
            styles.timeButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Start time: ${formatTime(startTime)}`}
        >
          <Text style={styles.timeText}>{formatTime(startTime)}</Text>
        </Pressable>

        <Text style={styles.arrow}>{'\u2192'}</Text>

        <Pressable
          onPress={() => onEndChange(endTime)}
          style={({ pressed }) => [
            styles.timeButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`End time: ${formatTime(endTime)}`}
        >
          <Text style={styles.timeText}>{formatTime(endTime)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButton: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    borderColor: PURPLE,
  },
  timeText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  arrow: {
    color: COLORS.text.secondary,
    fontSize: 20,
    marginHorizontal: 16,
  },
});
