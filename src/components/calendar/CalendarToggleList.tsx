/**
 * CalendarToggleList
 *
 * A scrollable list of calendars with enable/disable toggles and an optional
 * "Work Schedule" tag for bypassing shift detection heuristics (D-07).
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ACCENT, BACKGROUND, BORDER, RADIUS, SPACING, TEXT } from '@/src/theme';
import type { CalendarMeta } from '@/src/lib/calendar/calendar-types';

interface CalendarToggleListProps {
  calendars: CalendarMeta[];
  workCalendarId: string | null;
  onToggle: (calendarId: string) => void;
  onSetWorkCalendar: (calendarId: string | null) => void;
}

export function CalendarToggleList({
  calendars,
  workCalendarId,
  onToggle,
  onSetWorkCalendar,
}: CalendarToggleListProps) {
  if (calendars.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No calendars found.</Text>
      </View>
    );
  }

  const workCalendar = workCalendarId
    ? calendars.find((c) => c.id === workCalendarId)
    : null;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={calendars.length > 5}
    >
      {/* Calendar rows */}
      {calendars.map((calendar) => (
        <View key={calendar.id} style={styles.row}>
          {/* Color dot */}
          <View style={[styles.colorDot, { backgroundColor: calendar.color || BORDER.strong }]} />

          {/* Calendar name + Work badge */}
          <View style={styles.calendarInfo}>
            <Text style={styles.calendarTitle} numberOfLines={1}>
              {calendar.title}
            </Text>
            {calendar.id === workCalendarId && (
              <View style={styles.workBadge}>
                <Text style={styles.workBadgeText}>Work</Text>
              </View>
            )}
          </View>

          {/* Toggle */}
          <Switch
            value={calendar.enabled}
            onValueChange={() => onToggle(calendar.id)}
            trackColor={{ false: BORDER.subtle, true: ACCENT.primary }}
            thumbColor={TEXT.primary}
          />
        </View>
      ))}

      {/* Work Schedule tag section */}
      <View style={styles.workSection}>
        <Text style={styles.workSectionTitle}>Tag as Work Schedule</Text>
        <Text style={styles.workSectionDesc}>
          Events from your work calendar skip auto-detection
        </Text>

        {workCalendar ? (
          /* Tagged state — show name with clear button */
          <View style={styles.taggedContainer}>
            <View style={[styles.colorDot, { backgroundColor: workCalendar.color || BORDER.strong }]} />
            <Text style={styles.taggedName} numberOfLines={1}>
              {workCalendar.title}
            </Text>
            <Pressable
              onPress={() => onSetWorkCalendar(null)}
              style={styles.clearButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          </View>
        ) : (
          /* Untagged state — show calendar chips */
          <View style={styles.chipsContainer}>
            {calendars.map((cal) => (
              <Pressable
                key={cal.id}
                onPress={() => onSetWorkCalendar(cal.id)}
                style={styles.chip}
              >
                <View style={[styles.chipDot, { backgroundColor: cal.color || BORDER.strong }]} />
                <Text style={styles.chipText} numberOfLines={1}>
                  {cal.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: TEXT.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.subtle,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  calendarInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  calendarTitle: {
    fontSize: 15,
    color: TEXT.primary,
    fontWeight: '500',
    flex: 1,
  },
  workBadge: {
    backgroundColor: ACCENT.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  workBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: BACKGROUND.primary,
  },
  workSection: {
    marginTop: SPACING['2xl'],
    gap: SPACING.sm,
  },
  workSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
  },
  workSectionDesc: {
    fontSize: 13,
    color: TEXT.secondary,
    lineHeight: 18,
  },
  taggedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: BACKGROUND.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    marginTop: SPACING.sm,
  },
  taggedName: {
    flex: 1,
    fontSize: 14,
    color: TEXT.primary,
    fontWeight: '500',
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearText: {
    fontSize: 14,
    color: TEXT.secondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: BACKGROUND.elevated,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: BORDER.default,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    color: TEXT.primary,
    maxWidth: 120,
  },
});
