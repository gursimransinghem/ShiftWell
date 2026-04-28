import React, { useCallback, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { startOfMonth, startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { MonthView, DayDetail } from '@/src/components/calendar';
import { useShiftsStore, usePlanStore } from '@/src/store';
import type { ShiftEvent } from '@/src/lib/circadian/types';
import { GradientMeshBackground } from '@/src/components/ui';
import {
  ACCENT,
  BLOCK_COLORS,
  COLORS,
  RADIUS,
  SPACING,
  TEXT,
  TYPOGRAPHY,
} from '@/src/theme';

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
            style={({ pressed }) => [
              styles.weekDay,
              isToday && styles.weekDayToday,
              isSelected && styles.weekDaySelected,
              pressed && styles.weekDayPressed,
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shiftCard, pressed && styles.shiftCardPressed]}
    >
      <View style={[styles.shiftIconCircle, { backgroundColor: `${color}20` }]}>
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
      <View style={styles.shiftCardMeta}>
        <Text style={styles.shiftCardDuration}>{durationStr}</Text>
        <Ionicons name="chevron-forward" size={14} color={TEXT.dim} />
      </View>
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

  const selectedLabel = selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a day';
  const selectedSummary = selectedDate
    ? selectedDayShifts.length > 0
      ? `${selectedDayShifts.length} shift${selectedDayShifts.length === 1 ? '' : 's'} scheduled`
      : 'No shifts scheduled yet'
    : `${shifts.length} shift${shifts.length === 1 ? '' : 's'} this month`;

  return (
    <GradientMeshBackground>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>Schedule</Text>
            <Text style={styles.screenSubtitle}>
              See your month at a glance and drill into the days that matter.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryLabel}>{selectedDate ? 'SELECTED DAY' : 'THIS MONTH'}</Text>
                <Text style={styles.summaryValue}>{selectedLabel}</Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>
                  {planBlocks.length > 0 ? `${planBlocks.length} plan blocks` : 'No plan yet'}
                </Text>
              </View>
            </View>
            <Text style={styles.summaryBody}>{selectedSummary}</Text>
          </View>

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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: 128,
  },
  headerBlock: {
    marginBottom: SPACING.lg,
  },
  screenTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    maxWidth: 320,
  },
  summaryCard: {
    backgroundColor: 'rgba(16,20,34,0.94)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.text.muted,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.4,
  },
  summaryBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondaryBright,
    marginTop: SPACING.md,
  },
  summaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(123,97,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.2)',
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT.purple,
  },

  /* Week strip */
  weekStrip: {
    flexDirection: 'row',
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  weekDay: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 58,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(19,23,38,0.72)',
  },
  weekDayToday: {
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.36)',
    backgroundColor: 'rgba(200,168,75,0.1)',
  },
  weekDaySelected: {
    backgroundColor: 'rgba(123,97,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.34)',
  },
  weekDayPressed: {
    opacity: 0.88,
  },
  weekDayLabel: {
    fontSize: 11,
    color: TEXT.tertiary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  weekDayLabelToday: {
    color: ACCENT.primary,
  },
  weekDayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.primary,
    marginBottom: 4,
  },
  weekDayNumToday: {
    color: ACCENT.primary,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(18,23,37,0.84)',
    padding: 14,
    marginBottom: SPACING.sm,
  },
  shiftCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  shiftIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  shiftIconEmoji: {
    fontSize: 18,
  },
  shiftCardContent: {
    flex: 1,
  },
  shiftCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT.primary,
    marginBottom: 4,
  },
  shiftCardTime: {
    fontSize: 13,
    color: TEXT.secondary,
  },
  shiftCardMeta: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: SPACING.sm,
  },
  shiftCardDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT.muted,
  },

  /* Day detail section */
  dayDetailSection: {
    marginTop: SPACING.lg,
  },
  dayDetailHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT.tertiary,
    letterSpacing: 1.1,
    marginBottom: SPACING.md,
  },
  noDayShifts: {
    fontSize: 14,
    color: TEXT.muted,
    marginBottom: SPACING.md,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: ACCENT.purple,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: ACCENT.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(16,20,34,0.9)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginTop: SPACING.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT.primary,
    marginBottom: 8,
  },
  emptyBody: {
    ...TYPOGRAPHY.body,
    color: TEXT.secondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyCta: {
    backgroundColor: ACCENT.purple,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: ACCENT.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
