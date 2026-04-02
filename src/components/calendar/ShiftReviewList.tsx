/**
 * ShiftReviewList
 *
 * Displays a list of detected calendar events scored by shiftConfidence().
 * Events are pre-checked based on confidence thresholds (D-05).
 * Shows skeleton placeholders while loading (not a single spinner — per RESEARCH.md).
 */

import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ACCENT, BACKGROUND, BORDER, RADIUS, SPACING, TEXT } from '@/src/theme';
import type { RawCalendarEvent } from '@/src/lib/calendar/calendar-types';

interface ShiftReviewListProps {
  events: Array<RawCalendarEvent & { confidence: number }>;
  onToggleShift: (eventId: string, isShift: boolean) => void;
  loading?: boolean;
}

/** Confidence threshold for pre-checking — D-05 */
const HIGH_CONFIDENCE = 0.80;
const MED_CONFIDENCE = 0.50;

/** Color for confidence dots */
const CONFIDENCE_GREEN = '#34C759';
const CONFIDENCE_AMBER = '#F5A623';
const CONFIDENCE_GRAY = BORDER.strong;

function getConfidenceColor(confidence: number): string {
  if (confidence >= HIGH_CONFIDENCE) return CONFIDENCE_GREEN;
  if (confidence >= MED_CONFIDENCE) return CONFIDENCE_AMBER;
  return CONFIDENCE_GRAY;
}

function formatDateRange(start: Date, end: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[start.getDay()];
  const month = months[start.getMonth()];
  const date = start.getDate();

  function formatTime(d: Date): string {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mm = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
    return `${h}${mm} ${ampm}`;
  }

  return `${dayName}, ${month} ${date} · ${formatTime(start)} – ${formatTime(end)}`;
}

/** Skeleton row that pulses between 0.3 and 0.7 opacity */
function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={styles.skeletonCheckbox} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
      <View style={styles.skeletonDot} />
    </Animated.View>
  );
}

interface ShiftRowProps {
  event: RawCalendarEvent & { confidence: number };
  checked: boolean;
  onToggle: () => void;
}

function ShiftRow({ event, checked, onToggle }: ShiftRowProps) {
  const dotColor = getConfidenceColor(event.confidence);
  const isMedium = event.confidence >= MED_CONFIDENCE && event.confidence < HIGH_CONFIDENCE;

  return (
    <Pressable style={styles.row} onPress={onToggle}>
      {/* Checkbox */}
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <>
            <Text style={styles.checkmark}>✓</Text>
            {isMedium && <View style={styles.amberDot} />}
          </>
        )}
      </View>

      {/* Event details */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventTime}>
          {formatDateRange(event.start, event.end)}
        </Text>
      </View>

      {/* Confidence dot */}
      <View style={[styles.confidenceDot, { backgroundColor: dotColor }]} />
    </Pressable>
  );
}

export function ShiftReviewList({
  events,
  onToggleShift,
  loading = false,
}: ShiftReviewListProps) {
  // Track checked state locally — pre-populate based on confidence
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const event of events) {
      if (event.confidence >= MED_CONFIDENCE) {
        initial.add(event.id);
      }
    }
    return initial;
  });

  // Sync when events change (e.g., on load)
  useEffect(() => {
    const initial = new Set<string>();
    for (const event of events) {
      if (event.confidence >= MED_CONFIDENCE) {
        initial.add(event.id);
      }
    }
    setCheckedIds(initial);
  }, [events]);

  function handleToggle(eventId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        onToggleShift(eventId, false);
      } else {
        next.add(eventId);
        onToggleShift(eventId, true);
      }
      return next;
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.heading}>These look like your shifts</Text>
      <Text style={styles.subheading}>Confirm or adjust — tap to toggle</Text>

      {/* Confidence legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CONFIDENCE_GREEN }]} />
          <Text style={styles.legendText}>High confidence</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CONFIDENCE_AMBER }]} />
          <Text style={styles.legendText}>Review suggested</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No potential shifts found in the next 28 days.
          </Text>
          <Text style={styles.emptySubtext}>
            You can add shifts manually from the calendar.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {events.map((event) => (
            <ShiftRow
              key={event.id}
              event={event}
              checked={checkedIds.has(event.id)}
              onToggle={() => handleToggle(event.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT.primary,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: 14,
    color: TEXT.secondary,
    marginBottom: SPACING.lg,
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: TEXT.secondary,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.subtle,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: BORDER.strong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: ACCENT.primary,
    borderColor: ACCENT.primary,
  },
  checkmark: {
    color: TEXT.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  amberDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
    borderWidth: 1,
    borderColor: BACKGROUND.primary,
  },
  eventInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT.primary,
  },
  eventTime: {
    fontSize: 13,
    color: TEXT.secondary,
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  empty: {
    paddingVertical: SPACING['3xl'],
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    color: TEXT.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: TEXT.tertiary,
    textAlign: 'center',
  },
  // Skeleton styles
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.subtle,
  },
  skeletonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    backgroundColor: BACKGROUND.elevated,
  },
  skeletonContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  skeletonTitle: {
    height: 14,
    borderRadius: RADIUS.sm,
    backgroundColor: BACKGROUND.elevated,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: BACKGROUND.elevated,
    width: '50%',
  },
  skeletonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BACKGROUND.elevated,
  },
});
