import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { startOfMonth } from 'date-fns';
import { MonthView, DayDetail } from '@/src/components/calendar';
import { useShiftsStore, usePlanStore } from '@/src/store';
import type { ShiftEvent } from '@/src/lib/circadian/types';
import { BACKGROUND, ACCENT, TEXT } from '@/src/theme';

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
        router.push({
          pathname: '/add-shift',
          params: { date: preselectedDate.toISOString() },
        });
      } else if (selectedDate) {
        router.push({
          pathname: '/add-shift',
          params: { date: selectedDate.toISOString() },
        });
      } else {
        router.push('/add-shift');
      }
    },
    [router, selectedDate],
  );

  const handleEditShift = useCallback(
    (shift: ShiftEvent) => {
      router.push({
        pathname: '/add-shift',
        params: { shiftId: shift.id },
      });
    },
    [router],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MonthView
          month={currentMonth}
          shifts={shifts}
          planBlocks={planBlocks}
          onDayPress={handleDayPress}
          selectedDate={selectedDate}
          onMonthChange={setCurrentMonth}
        />

        {selectedDate && (
          <DayDetail
            date={selectedDate}
            shifts={shifts}
            planBlocks={planBlocks}
            onAddShift={() => handleAddShift(selectedDate)}
            onEditShift={handleEditShift}
          />
        )}

        {shifts.length === 0 && !selectedDate && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\u{1F4C5}'}</Text>
            <Text style={styles.emptyTitle}>No shifts yet</Text>
            <Text style={styles.emptyBody}>
              Add your first shift to get a personalized sleep plan built around your schedule.
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

      {/* Floating Action Button */}
      <Pressable
        onPress={() => handleAddShift()}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add shift"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    color: TEXT.onAccent,
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
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
    backgroundColor: ACCENT.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  emptyCtaText: {
    color: TEXT.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
