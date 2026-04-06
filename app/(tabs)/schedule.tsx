import React, { useCallback, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { startOfMonth, startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { MonthView, DayDetail } from '@/src/components/calendar';
import { useShiftsStore, usePlanStore } from '@/src/store';
import type { ShiftEvent } from '@/src/lib/circadian/types';
import { GradientMeshBackground } from '@/src/components/ui';
import { BACKGROUND, ACCENT, TEXT, BLOCK_COLORS, COLORS, SPACING, RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Shift type emoji/color map
// ---------------------------------------------------------------------------

function shiftEmoji(shiftType: string): string {
  switch (shiftType) {
    case 'night': return '\u{1F319}';
    case 'evening': return '\u{1F307}';
    case 'extended': return '\u{23F0}';
    default: return '\u{2600}';
  }
}

function shiftColor(shiftType: string): string {
  switch (shiftType) {
    case 'night': return BLOCK_COLORS.shiftNight;
    case 'evening': return '#FF9F43';
    case 'extended': return '#FF6B6B';
    default: return BLOCK_COLORS.shiftDay;
  }
}

function shiftDotColor(shift: ShiftEvent): string {
  return shiftColor(shift.shiftType);
}

// ---------------------------------------------------------------------------
// Week Strip
// ---------------------------------------------------------------------------

function WeekStrip({
  selectedDate,
  shifts,
  onDayPress,
}: {
  selectedDate: Date | null;
  shifts: ShiftEvent[];
  onDayPress: (date: Date) => void;
}) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weekStrip}
    >
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const dayShifts = shifts.filter((s) => isSameDay(s.start, day));

        return (
          <Pressable
            key={day.toISOString()}
            onPress={() => onDayPress(day)}
            style={[
              styles.weekDay,
              isToday && styles.weekDayToday,
              isSelected && styles.weekDaySelected,
            ]}
          >
            <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>
              {format(day, 'EEE')}
            </Text>
            <Text style={[styles.weekDayNum, isToday && styles.weekDayNumToday]}>
              {format(day, 'd')}
            </Text>
            {/* Shift dots */}
            <View style={styles.dotRow}>
              {dayShifts.slice(0, 3).map((s, i) => (
                <View
                  key={i}
                  style={[styles.shiftDot, { backgroundColor: shiftDotColor(s) }]}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Shift Card
// ---------------------------------------------------------------------------

function ShiftCard({ shift, onPress }: { shift: ShiftEvent; onPress: () => void }) {
  const color = shiftColor(shift.shiftType);
  const emoji = shiftEmoji(shift.shiftType);
  const startTime = format(shift.start, 'h:mm a');
  const endTime = format(shift.end, 'h:mm a');
  const durationMins = Math.round((shift.end.getTime() - shift.start.getTime()) / 60000);
  const durationH = Math.floor(durationMins / 60);
  const durationM = durationMins % 60;
  const durationStr = durationM > 0 ? `${durationH}h ${durationM}m` : `${durationH}h`;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shiftCard, pressed && { opacity: 0.8 }]}>
      <View style={[styles.shiftIconCircle, { backgroundColor: `${color}1A` }]}>
        <Text style={styles.shiftIconEmoji}>{emoji}</Text>
      </View>
      <View style={styles.shiftCardContent}>
        <Text style={styles.shiftCardTitle} numberOfLines={1}>
          {shift.title || 'Shift'}
        </Text>
        <Text style={styles.shiftCardTime}>
          {startTime} - {endTime}
        </Text>
      </View>
      <Text style={styles.shiftCardDuration}>{durationStr}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ScheduleScreen() {
  const router = useRouter();
  const shifts = useShiftsStore((s) => s.shifts);
  const plan = usePlanStore((s) => s.plan);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const planBlocks = plan?.blocks ?? [];

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleAddShift = useCallback(
    (preselectedDate?: Date) => {
      if (preselectedDate) {
        router.push({ pathname: '/add-shift', params: { date: preselectedDate.toISOString() } });
      } else if (selectedDate) {
        router.push({ pathname: '/add-shift', params: { date: selectedDate.toISOString() } });
      } else {
        router.push('/add-shift');
      }
    },
    [router, selectedDate],
  );

  const handleEditShift = useCallback(
    (shift: ShiftEvent) => {
      router.push({ pathname: '/add-shift', params: { shiftId: shift.id } });
    },
    [router],
  );

  // Selected day shifts
  const selectedDayShifts = useMemo(() => {
    if (!selectedDate) return [];
    return shifts.filter((s) => isSameDay(s.start, selectedDate));
  }, [shifts, selectedDate]);

  return (
    <GradientMeshBackground>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Week Strip */}
          <WeekStrip
            selectedDate={selectedDate}
            shifts={shifts}
            onDayPress={handleDayPress}
          />

          {/* Month View */}
          <MonthView
            month={currentMonth}
            shifts={shifts}
            planBlocks={planBlocks}
            onDayPress={handleDayPress}
            selectedDate={selectedDate}
            onMonthChange={setCurrentMonth}
          />

          {/* Day Detail */}
          {selectedDate && (
            <View style={styles.dayDetailSection}>
              <Text style={styles.dayDetailHeader}>
                {format(selectedDate, 'EEEE, MMMM d').toUpperCase()}
              </Text>

              {selectedDayShifts.length > 0 ? (
                selectedDayShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onPress={() => handleEditShift(shift)}
                  />
                ))
              ) : (
                <Text style={styles.noDayShifts}>No shifts scheduled</Text>
              )}

              <DayDetail
                date={selectedDate}
                shifts={shifts}
                planBlocks={planBlocks}
                onAddShift={() => handleAddShift(selectedDate)}
                onEditShift={handleEditShift}
              />
            </View>
          )}

          {/* Empty state */}
          {shifts.length === 0 && !selectedDate && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{'\u{1F4C5}'}</Text>
              <Text style={styles.emptyTitle}>No shifts yet</Text>
              <Text style={styles.emptyBody}>
                Add your first shift to get a personalized sleep plan built
                around your schedule.
              </Text>
              <Pressable
                onPress={() => handleAddShift()}
                style={styles.emptyCta}
                accessibilityRole="button"
                accessibilityLabel="Add your first shift"
              >
                <Text style={styles.emptyCtaText}>Add Your First Shift</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <Pressable
          onPress={() => handleAddShift()}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add shift"
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </View>
    </GradientMeshBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },

  /* Week strip */
  weekStrip: {
    flexDirection: 'row',
    paddingBottom: SPACING.md,
    gap: 6,
  },
  weekDay: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 46,
  },
  weekDayToday: {
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.5)',
    backgroundColor: 'rgba(200,168,75,0.08)',
  },
  weekDaySelected: {
    backgroundColor: 'rgba(123,97,255,0.12)',
  },
  weekDayLabel: {
    fontSize: 11,
    color: TEXT.tertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  weekDayLabelToday: {
    color: '#C8A84B',
  },
  weekDayNum: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.primary,
    marginBottom: 4,
  },
  weekDayNumToday: {
    color: '#C8A84B',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  shiftDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  /* Shift card */
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    marginBottom: 8,
  },
  shiftIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shiftIconEmoji: {
    fontSize: 18,
  },
  shiftCardContent: {
    flex: 1,
  },
  shiftCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    marginBottom: 2,
  },
  shiftCardTime: {
    fontSize: 12,
    color: TEXT.secondary,
  },
  shiftCardDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT.muted,
  },

  /* Day detail section */
  dayDetailSection: {
    marginTop: SPACING.lg,
  },
  dayDetailHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.tertiary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  noDayShifts: {
    fontSize: 13,
    color: TEXT.muted,
    marginBottom: SPACING.md,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#7B61FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: 'rgba(123,97,255,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 26,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT.primary,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: TEXT.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyCta: {
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
