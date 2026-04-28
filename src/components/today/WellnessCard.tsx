/**
 * WellnessCard — Phase 23
 *
 * Renders fitness and meal timing prescriptions on the Today screen,
 * contextualized to the user's current shift type and recovery state.
 *
 * Position: Below PatternAlertCard on the Today screen.
 * Design: Dark mode, gold accents (#C8A84B), consistent with BehavioralChecklist.
 *
 * Scientific basis:
 *   - suggestWorkout: SimVault fitness protocol for shift workers
 *   - suggestMealPlan: Manoogian et al. (2022), Chellappa et al. (2021)
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import {
  suggestWorkout,
  suggestMealPlan,
  getMealPrepReminder,
  type WorkoutIntensity,
} from '@/src/lib/prescriptions/shift-prescriptions';
import { useShiftsStore } from '@/src/store/shifts-store';
import { useScoreStore } from '@/src/store/score-store';
import { COLORS, SPACING, RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTENSITY_COLORS: Record<WorkoutIntensity, string> = {
  rest: '#60A5FA',     // blue — recovery
  light: '#34D399',   // green — easy
  moderate: '#C8A84B', // gold — moderate
  full: '#FB923C',    // orange — strong
};

const INTENSITY_ICONS: Record<WorkoutIntensity, keyof typeof Ionicons.glyphMap> = {
  rest: 'bed-outline',
  light: 'walk-outline',
  moderate: 'fitness-outline',
  full: 'barbell-outline',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMealTime(isoString: string): string {
  try {
    return format(new Date(isoString), 'h:mm a');
  } catch {
    return '';
  }
}

function getCurrentShiftType(shifts: { start: Date; end: Date; shiftType: string }[]): string {
  const now = new Date();
  const active = shifts.find((s) => s.start <= now && s.end >= now);
  if (active) return active.shiftType;

  // Next upcoming shift today
  const upcoming = shifts
    .filter((s) => s.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length > 0) {
    const next = upcoming[0];
    // If shift starts today (same calendar day)
    const nextDate = next.start.toISOString().slice(0, 10);
    const todayDate = now.toISOString().slice(0, 10);
    if (nextDate === todayDate) return next.shiftType;
  }

  return 'off';
}

function isRecoveryDay1(shifts: { start: Date; end: Date; shiftType: string }[]): boolean {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  const hadNightYesterday = shifts.some(
    (s) => s.shiftType === 'night' && s.start.toISOString().slice(0, 10) === yesterdayDate,
  );

  const todayDate = now.toISOString().slice(0, 10);
  const hasShiftToday = shifts.some((s) => s.start.toISOString().slice(0, 10) === todayDate);

  return hadNightYesterday && !hasShiftToday;
}

function getNextNightBlockStart(shifts: { start: Date; shiftType: string }[]): string | null {
  const now = new Date();
  const upcoming = shifts
    .filter((s) => s.start > now && s.shiftType === 'night')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return upcoming.length > 0 ? upcoming[0].start.toISOString() : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WellnessCard() {
  const shifts = useShiftsStore((state) => state.shifts);
  const todayScore = useScoreStore((state) => state.todayScore());

  const shiftType = useMemo(() => getCurrentShiftType(shifts), [shifts]);
  const recoveryDay1 = useMemo(() => isRecoveryDay1(shifts), [shifts]);

  const workout = useMemo(
    () => suggestWorkout(shiftType, recoveryDay1, todayScore),
    [shiftType, recoveryDay1, todayScore],
  );

  const todayShiftStart = useMemo(() => {
    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10);
    const todayShift = shifts.find((s) => s.start.toISOString().slice(0, 10) === todayDate);
    return todayShift ? todayShift.start.toISOString() : null;
  }, [shifts]);

  const mealPlan = useMemo(
    () => suggestMealPlan(shiftType, todayShiftStart),
    [shiftType, todayShiftStart],
  );

  const mealPrepReminder = useMemo(() => {
    const nextNightBlock = getNextNightBlockStart(shifts);
    return getMealPrepReminder(nextNightBlock, new Date().toISOString().slice(0, 10));
  }, [shifts]);

  const intensityColor = INTENSITY_COLORS[workout.intensity];
  const intensityIcon = INTENSITY_ICONS[workout.intensity];

  // Next meal: first meal that hasn't passed yet
  const now = new Date();
  const nextMeal = mealPlan.meals.find((m) => new Date(m.timeISO) > now) ?? mealPlan.meals[0];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>WELLNESS TODAY</Text>

      {/* Fitness suggestion */}
      <View style={[styles.card, { borderLeftColor: intensityColor }]}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: intensityColor + '20' }]}>
            <Ionicons name={intensityIcon} size={16} color={intensityColor} />
          </View>
          <View style={styles.content}>
            <Text style={styles.cardLabel}>FITNESS</Text>
            <Text style={styles.primaryText}>
              {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
              {workout.durationMin > 0 ? ` · ${workout.durationMin} min` : ''}
              {workout.type !== 'Rest' ? ` · ${workout.type}` : ''}
            </Text>
            <Text style={styles.noteText}>{workout.note}</Text>
          </View>
        </View>
      </View>

      {/* Next meal suggestion */}
      {nextMeal ? (
        <View style={[styles.card, { borderLeftColor: COLORS.accent.primary }]}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.accent.primary + '20' }]}>
              <Ionicons name="restaurant-outline" size={16} color={COLORS.accent.primary} />
            </View>
            <View style={styles.content}>
              <Text style={styles.cardLabel}>NEXT MEAL</Text>
              <Text style={styles.primaryText}>
                {nextMeal.label} at {formatMealTime(nextMeal.timeISO)}
              </Text>
              <Text style={styles.noteText}>{nextMeal.macroFocus}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Meal prep reminder */}
      {mealPrepReminder ? (
        <View style={styles.reminderRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.accent.primary} style={styles.reminderIcon} />
          <Text style={styles.reminderText}>{mealPrepReminder}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  noteText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    marginTop: 2,
  },
  reminderIcon: {
    marginRight: 6,
  },
  reminderText: {
    fontSize: 12,
    color: COLORS.accent.primary,
    fontWeight: '500',
  },
});
