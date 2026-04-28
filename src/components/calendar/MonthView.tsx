import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getHours,
} from 'date-fns';
import type { ShiftEvent, PlanBlock } from '@/src/lib/circadian/types';
import { BACKGROUND, TEXT, ACCENT, BLOCK_COLORS, BORDER, PURPLE, RADIUS, SPACING, TYPOGRAPHY } from '@/src/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthViewProps {
  month: Date;
  shifts: ShiftEvent[];
  planBlocks: PlanBlock[];
  onDayPress: (date: Date) => void;
  selectedDate: Date | null;
  onMonthChange?: (date: Date) => void;
}

/** Get colored dots for a given day based on shifts and plan blocks. */
function getDotsForDay(
  date: Date,
  shifts: ShiftEvent[],
  planBlocks: PlanBlock[],
): { color: string; key: string }[] {
  const dots: { color: string; key: string }[] = [];

  for (const shift of shifts) {
    if (isSameDay(shift.start, date) || isSameDay(shift.end, date)) {
      if (shift.shiftType === 'night') {
        dots.push({ color: BLOCK_COLORS.shiftNight, key: `shift-${shift.id}` });
      } else if (shift.shiftType === 'evening') {
        dots.push({ color: BLOCK_COLORS.shiftEvening, key: `shift-${shift.id}` });
      } else {
        dots.push({ color: BLOCK_COLORS.shiftDay, key: `shift-${shift.id}` });
      }
    }
  }

  for (const block of planBlocks) {
    if (isSameDay(block.start, date) || isSameDay(block.end, date)) {
      if (block.type === 'main-sleep') {
        if (!dots.some((d) => d.color === BLOCK_COLORS.sleep)) {
          dots.push({ color: BLOCK_COLORS.sleep, key: `sleep-${block.id}` });
        }
      } else if (block.type === 'nap') {
        if (!dots.some((d) => d.color === BLOCK_COLORS.nap)) {
          dots.push({ color: BLOCK_COLORS.nap, key: `nap-${block.id}` });
        }
      }
    }
  }

  return dots.slice(0, 3); // max 3 dots per cell
}

// ---------------------------------------------------------------------------
// Animated day cell — handles scale pop on selection
// ---------------------------------------------------------------------------

function DayCell({
  day,
  month,
  selectedDate,
  shifts,
  planBlocks,
  onDayPress,
}: {
  day: Date;
  month: Date;
  selectedDate: Date | null;
  shifts: ShiftEvent[];
  planBlocks: PlanBlock[];
  onDayPress: (date: Date) => void;
}) {
  const inMonth = isSameMonth(day, month);
  const today = isToday(day);
  const selected = selectedDate ? isSameDay(day, selectedDate) : false;
  const dots = getDotsForDay(day, shifts, planBlocks);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      scaleAnim.setValue(1);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selected, scaleAnim]);

  const handlePress = useCallback(() => {
    onDayPress(day);
  }, [day, onDayPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.dayCell,
        selected && styles.dayCellSelected,
      ]}
      accessibilityRole="button"
      accessibilityLabel={format(day, 'EEEE, MMMM d')}
    >
      <Animated.View
        style={[
          styles.dayNumberContainer,
          today && styles.todayCircle,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            !inMonth && styles.dayNumberDimmed,
            today && styles.dayNumberToday,
            selected && styles.dayNumberSelected,
          ]}
        >
          {format(day, 'd')}
        </Text>
      </Animated.View>

      {/* Event dots */}
      <View style={styles.dotsRow}>
        {dots.map((dot) => (
          <View
            key={dot.key}
            style={[styles.dot, { backgroundColor: dot.color }]}
          />
        ))}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MonthView({
  month,
  shifts,
  planBlocks,
  onDayPress,
  selectedDate,
  onMonthChange,
}: MonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  // Month transition fade
  const gridOpacity = useRef(new Animated.Value(1)).current;
  const prevMonthRef = useRef(month.getTime());

  useEffect(() => {
    if (prevMonthRef.current !== month.getTime()) {
      prevMonthRef.current = month.getTime();
      gridOpacity.setValue(0);
      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [month, gridOpacity]);

  const handlePrev = () => onMonthChange?.(subMonths(month, 1));
  const handleNext = () => onMonthChange?.(addMonths(month, 1));

  return (
    <View style={styles.container}>
      {/* Month header with navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={handlePrev}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
        >
          <Text style={styles.navArrow}>{'\u2039'}</Text>
        </Pressable>

        <Text style={styles.monthTitle}>{format(month, 'MMMM yyyy')}</Text>

        <Pressable
          onPress={handleNext}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={8}
        >
          <Text style={styles.navArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid — animated on month change */}
      <Animated.View style={[styles.grid, { opacity: gridOpacity }]} pointerEvents="box-none">
        {weeks.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.weekRow}>
            {week.map((day) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                month={month}
                selectedDate={selectedDate}
                shifts={shifts}
                planBlocks={planBlocks}
                onDayPress={onDayPress}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  navArrow: {
    color: ACCENT.primary,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  monthTitle: {
    ...TYPOGRAPHY.label,
    color: TEXT.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    color: TEXT.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    opacity: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellSelected: {
    borderColor: PURPLE,
    backgroundColor: 'rgba(123,97,255,0.12)',
    shadowColor: PURPLE,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  dayNumberContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  todayCircle: {
    backgroundColor: 'rgba(200,168,75,0.16)',
  },
  dayNumber: {
    color: TEXT.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberDimmed: {
    color: TEXT.dim,
    opacity: 0.45,
  },
  dayNumberToday: {
    color: ACCENT.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
