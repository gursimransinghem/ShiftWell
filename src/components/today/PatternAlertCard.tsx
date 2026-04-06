/**
 * PatternAlertCard — detects and displays upcoming schedule pattern alerts.
 *
 * Detects: night-shift-soon, consecutive nights, mixed week.
 * Alerts can be individually dismissed. Returns null when no alerts remain.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays } from 'date-fns';
import { useShiftsStore } from '@/src/store/shifts-store';
import type { ShiftEvent } from '@/src/lib/circadian/types';
import { COLORS, SPACING, RADIUS } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatternAlert {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
  action: string;
}

// ---------------------------------------------------------------------------
// Alert detection
// ---------------------------------------------------------------------------

function detectAlerts(shifts: ShiftEvent[]): PatternAlert[] {
  const now = new Date();
  const alerts: PatternAlert[] = [];

  const upcomingShifts = shifts
    .filter((s) => s.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const nextWeekShifts = upcomingShifts.filter(
    (s) => differenceInDays(s.start, now) <= 14,
  );

  // 1. Night shift in <= 3 days
  const nightSoon = upcomingShifts.find(
    (s) => s.shiftType === 'night' && differenceInDays(s.start, now) <= 3,
  );

  if (nightSoon) {
    const daysAway = differenceInDays(nightSoon.start, now);
    const whenLabel =
      daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;

    alerts.push({
      id: 'night-soon',
      icon: 'moon',
      color: '#A78BFA',
      title: `Night shift ${whenLabel}`,
      body: 'Start shifting your bedtime 30 min later tonight. Avoid bright light after 8 PM.',
      action: 'Prep protocol active',
    });
  }

  // 2. Consecutive nights (2+ night shifts on consecutive calendar days)
  const nightShifts = upcomingShifts
    .filter((s) => s.shiftType === 'night')
    .slice(0, 5);

  let consecutiveCount = 0;
  let maxConsecutive = 0;
  let prevDayIndex: number | null = null;

  for (const shift of nightShifts) {
    const dayIndex = Math.floor(
      differenceInDays(shift.start, new Date(now.getFullYear(), now.getMonth(), now.getDate())),
    );

    if (prevDayIndex !== null && dayIndex === prevDayIndex + 1) {
      consecutiveCount += 1;
    } else {
      consecutiveCount = 1;
    }

    if (consecutiveCount > maxConsecutive) {
      maxConsecutive = consecutiveCount;
    }
    prevDayIndex = dayIndex;
  }

  if (maxConsecutive >= 2) {
    alerts.push({
      id: 'consecutive-nights',
      icon: 'warning',
      color: '#FB923C',
      title: `${maxConsecutive} consecutive nights ahead`,
      body: 'Fatigue compounds after night 2. Schedule a 90-min recovery nap between nights if possible.',
      action: 'Fatigue protocol',
    });
  }

  // 3. Mixed week: both night + day shifts in next 7 days (within 14-day window)
  const weekShifts = nextWeekShifts.filter(
    (s) => differenceInDays(s.start, now) <= 7,
  );
  const hasNightInWeek = weekShifts.some((s) => s.shiftType === 'night');
  const hasDayInWeek = weekShifts.some((s) => s.shiftType === 'day');

  if (hasNightInWeek && hasDayInWeek) {
    alerts.push({
      id: 'mixed-week',
      icon: 'shuffle',
      color: '#C8A84B',
      title: 'Mixed schedule ahead',
      body: 'Day + night shifts this week risk circadian whiplash. Use blue-light glasses and anchor a consistent wake time.',
      action: 'Adaptation plan',
    });
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PatternAlertCard() {
  const shifts = useShiftsStore((state) => state.shifts);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const allAlerts = useMemo(() => detectAlerts(shifts), [shifts]);
  const visibleAlerts = allAlerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  return (
    <View>
      {/* Section label */}
      <Text style={styles.sectionLabel}>PATTERN ALERTS</Text>

      {visibleAlerts.map((alert) => (
        <View key={alert.id} style={[styles.card, { borderLeftColor: alert.color }]}>
          {/* Icon row */}
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, { backgroundColor: alert.color + '20' }]}>
              <Ionicons name={alert.icon} size={16} color={alert.color} />
            </View>

            <Text style={styles.alertTitle}>{alert.title}</Text>

            <TouchableOpacity
              onPress={() => dismiss(alert.id)}
              accessibilityLabel="Dismiss alert"
              accessibilityRole="button"
              style={styles.dismissButton}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={COLORS.text.tertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <Text style={styles.bodyText}>{alert.body}</Text>

          {/* Action chip */}
          <View style={[styles.actionChip, { backgroundColor: alert.color + '20' }]}>
            <Text style={[styles.actionText, { color: alert.color }]}>
              {alert.action}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
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
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  alertTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dismissButton: {
    padding: 2,
    marginLeft: SPACING.sm,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  actionChip: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
