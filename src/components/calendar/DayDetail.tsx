import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { format, isSameDay } from 'date-fns';
import type { ShiftEvent, PlanBlock, SleepBlockType } from '@/src/lib/circadian/types';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import { BACKGROUND, TEXT, ACCENT, BLOCK_COLORS, BORDER } from '@/src/theme';

interface DayDetailProps {
  date: Date;
  shifts: ShiftEvent[];
  planBlocks: PlanBlock[];
  onAddShift: () => void;
  onEditShift: (shift: ShiftEvent) => void;
}

type TimelineEvent = {
  id: string;
  start: Date;
  end: Date;
  label: string;
  color: string;
  emoji: string;
  isShift: boolean;
  shift?: ShiftEvent;
};

function getBlockColor(type: SleepBlockType): string {
  switch (type) {
    case 'main-sleep':
      return BLOCK_COLORS.sleep;
    case 'nap':
      return BLOCK_COLORS.nap;
    case 'wind-down':
      return BLOCK_COLORS.windDown;
    case 'caffeine-cutoff':
      return BLOCK_COLORS.caffeineCutoff;
    case 'meal-window':
      return BLOCK_COLORS.meal;
    case 'light-seek':
    case 'light-avoid':
      return BLOCK_COLORS.lightProtocol;
    case 'wake':
      return ACCENT.primary;
    default:
      return TEXT.tertiary;
  }
}

function getBlockEmoji(type: SleepBlockType): string {
  switch (type) {
    case 'main-sleep':
      return '\uD83D\uDCA4';
    case 'nap':
      return '\uD83D\uDECB\uFE0F';
    case 'wind-down':
      return '\uD83C\uDF19';
    case 'wake':
      return '\u2600\uFE0F';
    case 'caffeine-cutoff':
      return '\u2615';
    case 'meal-window':
      return '\uD83C\uDF7D\uFE0F';
    case 'light-seek':
      return '\uD83D\uDD06';
    case 'light-avoid':
      return '\uD83D\uDE0E';
    default:
      return '\uD83D\uDCCB';
  }
}

function getShiftEmoji(shiftType: string): string {
  switch (shiftType) {
    case 'night':
      return '\uD83C\uDF03';
    case 'evening':
      return '\uD83C\uDF06';
    case 'day':
      return '\u2600\uFE0F';
    default:
      return '\uD83C\uDFE2';
  }
}

function getShiftColor(shiftType: string): string {
  switch (shiftType) {
    case 'night':
      return BLOCK_COLORS.shiftNight;
    case 'evening':
      return BLOCK_COLORS.shiftEvening;
    case 'day':
      return BLOCK_COLORS.shiftDay;
    default:
      return BLOCK_COLORS.shiftDay;
  }
}

export default function DayDetail({
  date,
  shifts,
  planBlocks,
  onAddShift,
  onEditShift,
}: DayDetailProps) {
  const events = useMemo(() => {
    const result: TimelineEvent[] = [];

    // Add shifts for this day
    for (const shift of shifts) {
      if (isSameDay(shift.start, date) || isSameDay(shift.end, date)) {
        result.push({
          id: `shift-${shift.id}`,
          start: shift.start,
          end: shift.end,
          label: shift.title || `${shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)} Shift`,
          color: getShiftColor(shift.shiftType),
          emoji: getShiftEmoji(shift.shiftType),
          isShift: true,
          shift,
        });
      }
    }

    // Add plan blocks for this day
    for (const block of planBlocks) {
      if (isSameDay(block.start, date) || isSameDay(block.end, date)) {
        result.push({
          id: `block-${block.id}`,
          start: block.start,
          end: block.end,
          label: block.label,
          color: getBlockColor(block.type),
          emoji: getBlockEmoji(block.type),
          isShift: false,
        });
      }
    }

    // Sort chronologically by start time
    result.sort((a, b) => a.start.getTime() - b.start.getTime());

    return result;
  }, [date, shifts, planBlocks]);

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{format(date, 'EEEE, MMMM d')}</Text>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events scheduled</Text>
        </View>
      ) : (
        <View style={styles.eventList}>
          {events.map((event) => (
            <Card key={event.id} style={styles.eventCard} padding={false}>
              <View style={styles.eventRow}>
                {/* Color bar */}
                <View style={[styles.colorBar, { backgroundColor: event.color }]} />

                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventEmoji}>{event.emoji}</Text>
                    <Text style={styles.eventLabel} numberOfLines={1}>
                      {event.label}
                    </Text>
                  </View>
                  <Text style={styles.eventTime}>
                    {format(event.start, 'h:mma')} - {format(event.end, 'h:mma')}
                  </Text>
                </View>

                {/* Edit/delete for shifts */}
                {event.isShift && event.shift && (
                  <Pressable
                    onPress={() => onEditShift(event.shift!)}
                    style={styles.editButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${event.label}`}
                    hitSlop={8}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </Pressable>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.addButtonContainer}>
        <Button title="Add Shift" onPress={onAddShift} variant="secondary" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  dateTitle: {
    color: TEXT.primary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: TEXT.tertiary,
    fontSize: 15,
  },
  eventList: {
    gap: 8,
  },
  eventCard: {
    overflow: 'hidden',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  eventContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eventEmoji: {
    fontSize: 14,
  },
  eventLabel: {
    color: TEXT.primary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  eventTime: {
    color: TEXT.secondary,
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 20,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  editText: {
    color: ACCENT.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonContainer: {
    marginTop: 16,
  },
});
