/**
 * SchedulePreview — forward-looking schedule intelligence for the Today screen.
 *
 * Reads plan.classifiedDays and lastResetAt to surface a single contextual
 * message about what's ahead. The flagship case: "3 nights ahead — pre-adapt
 * starting Thursday" tells shift workers exactly what to prepare for.
 *
 * Returns null (no render) when there is no meaningful message to show.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { startOfDay, differenceInHours, format } from 'date-fns';

import { detectPatterns } from '../../lib/circadian/classify-shifts';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import type { SleepPlan } from '../../lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchedulePreviewProps {
  plan: SleepPlan;
  lastResetAt: Date | null;
}

interface PreviewMessage {
  emoji: string;
  text: string;
  isCircadianReset: boolean;
}

// ---------------------------------------------------------------------------
// Message builder
// ---------------------------------------------------------------------------

export function buildPreviewMessage(
  plan: SleepPlan,
  lastResetAt: Date | null,
): PreviewMessage | null {
  const todayStart = startOfDay(new Date());
  const futureDays = plan.classifiedDays.filter(
    (d) => d.date >= todayStart,
  );

  // a) Circadian Reset — highest priority, check first
  if (lastResetAt !== null && differenceInHours(new Date(), lastResetAt) <= 48) {
    return {
      emoji: '\u2600\uFE0F',
      text: 'Circadian Reset \u2014 returning to day rhythm',
      isCircadianReset: true,
    };
  }

  if (futureDays.length === 0) {
    return null;
  }

  const nightCount = futureDays.filter((d) => d.dayType === 'work-night').length;

  // b) Transition to nights — upcoming night block with pre-adaptation
  if (nightCount > 0 && futureDays.some((d) => d.dayType === 'transition-to-nights')) {
    const transitionDay = futureDays.find((d) => d.dayType === 'transition-to-nights');
    const dayName = transitionDay ? format(transitionDay.date, 'EEEE') : 'soon';
    const nightLabel = nightCount === 1 ? 'night' : 'nights';
    return {
      emoji: '\u{1F319}',
      text: `${nightCount} ${nightLabel} ahead \u2014 pre-adapt starting ${dayName}`,
      isCircadianReset: false,
    };
  }

  // c) Upcoming nights with no transition day (already mid-stretch or direct nights)
  if (nightCount > 0) {
    const shiftLabel = nightCount === 1 ? 'night shift' : 'night shifts';
    return {
      emoji: '\u{1F30C}',
      text: `${nightCount} ${shiftLabel} in the next 2 weeks`,
      isCircadianReset: false,
    };
  }

  // d) Free days ahead — all future days are off or recovery
  const allFreeDays = futureDays.every(
    (d) => d.dayType === 'off' || d.dayType === 'recovery',
  );
  if (allFreeDays) {
    return {
      emoji: '\u{1F4A4}',
      text: 'Free days ahead \u2014 sleep in opportunity',
      isCircadianReset: false,
    };
  }

  // e) No matching condition
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SchedulePreview({ plan, lastResetAt }: SchedulePreviewProps) {
  const message = buildPreviewMessage(plan, lastResetAt);

  if (message === null) {
    return null;
  }

  const containerStyle = message.isCircadianReset
    ? [styles.container, styles.circadianResetContainer]
    : [styles.container, styles.defaultContainer];

  const textStyle = message.isCircadianReset
    ? [styles.text, styles.circadianResetText]
    : styles.text;

  return (
    <View style={containerStyle}>
      <Text style={styles.emoji}>{message.emoji}</Text>
      <Text style={textStyle}>{message.text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  defaultContainer: {
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  circadianResetContainer: {
    backgroundColor: COLORS.background.elevated,
    borderWidth: 1,
    borderColor: COLORS.accent.primary,
  },
  emoji: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    flex: 1,
  },
  circadianResetText: {
    color: COLORS.accent.primary,
  },
});
