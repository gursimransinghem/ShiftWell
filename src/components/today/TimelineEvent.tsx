import React, { useEffect } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useUserStore } from '@/src/store/user-store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { format, differenceInMinutes } from 'date-fns';
import type { PlanBlock, SleepBlockType } from '@/src/lib/circadian/types';
import Card from '@/src/components/ui/Card';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  V6_LAYOUT,
  V6_RADIUS,
  timestamp,
  cardTitle,
  meta,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TimelineEventProps {
  block: PlanBlock;
  isActive: boolean;
  isNext: boolean;
  isPast: boolean;
}

// ---------------------------------------------------------------------------
// Block type -> color mapping
// ---------------------------------------------------------------------------

function blockColor(type: SleepBlockType): string {
  switch (type) {
    case 'main-sleep':
      return BLOCK_COLORS.sleep;
    case 'nap':
      return BLOCK_COLORS.nap;
    case 'wind-down':
      return BLOCK_COLORS.windDown;
    case 'wake':
      return BLOCK_COLORS.shiftDay;
    case 'caffeine-cutoff':
      return BLOCK_COLORS.caffeineCutoff;
    case 'meal-window':
      return BLOCK_COLORS.meal;
    case 'light-seek':
      return BLOCK_COLORS.lightProtocol;
    case 'light-avoid':
      return BLOCK_COLORS.lightProtocol;
    default:
      return COLORS.accent.primary;
  }
}

// ---------------------------------------------------------------------------
// Contextual notes for certain block types
// ---------------------------------------------------------------------------

function contextualNote(type: SleepBlockType, caffeineHalfLife: number): string | null {
  switch (type) {
    case 'caffeine-cutoff':
      return `Any caffeine beyond this point takes ${caffeineHalfLife}h from your sleep`;
    case 'wind-down':
      return 'Dim lights, avoid screens';
    case 'light-seek':
      return 'Get bright light exposure';
    case 'light-avoid':
      return 'Wear blue-blockers or stay in dim light';
    case 'nap':
      return 'Set an alarm — keep it short';
    case 'meal-window':
      return 'Eat a balanced meal before your shift';
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Duration formatter
// ---------------------------------------------------------------------------

function formatDuration(start: Date, end: Date): string {
  const mins = differenceInMinutes(end, start);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TimelineEvent({
  block,
  isActive,
  isNext,
  isPast,
}: TimelineEventProps) {
  const caffeineHalfLife = useUserStore((s) => s.profile.caffeineHalfLife ?? 5);
  const color = blockColor(block.type);
  const note = contextualNote(block.type, caffeineHalfLife);

  // Pulsing border opacity for active event (reanimated)
  const borderGlow = useSharedValue(1);
  // Breathing dot opacity for next event (reanimated)
  const dotBreathing = useSharedValue(1);

  useEffect(() => {
    if (!isActive) return;
    borderGlow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      false,
    );
    return () => {
      borderGlow.value = 1;
    };
  }, [isActive, borderGlow]);

  useEffect(() => {
    if (!isNext) return;
    dotBreathing.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
    return () => {
      dotBreathing.value = 1;
    };
  }, [isNext, dotBreathing]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: borderGlow.value,
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: dotBreathing.value,
  }));

  // Countdown to start for non-active future events
  const minsUntilStart = differenceInMinutes(block.start, new Date());
  const countdownToStart = (() => {
    if (isActive || minsUntilStart <= 0) return null;
    if (minsUntilStart < 60) return `${minsUntilStart}m`;
    const h = Math.floor(minsUntilStart / 60);
    const m = minsUntilStart % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  })();

  const containerOpacity: ViewStyle = isPast && !isActive ? { opacity: 0.35 } : {};
  const cardBorderActive: ViewStyle = isActive
    ? { borderColor: `${color}4D`, borderWidth: 1 } // rgba(color, 0.3)
    : {};
  const cardBorderNext: ViewStyle = isNext
    ? { borderColor: `${color}40`, borderWidth: 1 } // rgba(color, 0.25)
    : {};
  const cardBgActive: ViewStyle = isActive
    ? { backgroundColor: `${color}12` } // rgba(color, 0.07) approx
    : {};

  const dotSize = isActive ? DOT_ACTIVE_SIZE : DOT_SIZE;

  return (
    <View style={[styles.row, containerOpacity]}>
      {/* Left — time label */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{format(block.start, 'h:mma')}</Text>
      </View>

      {/* Center — timeline spine */}
      <View style={styles.spine}>
        <View style={styles.lineTop} />
        {isNext ? (
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: color, width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
              styles.dotNext,
              animatedDotStyle,
            ]}
          />
        ) : (
          <View
            style={[
              styles.dot,
              { backgroundColor: color, width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
              isActive && styles.dotActive,
            ]}
          />
        )}
        <View style={styles.lineBottom} />
      </View>

      {/* Right — content card */}
      <View style={styles.cardWrapper}>
        {isActive ? (
          <Animated.View style={animatedBorderStyle}>
            <Card style={[styles.card, cardBorderActive, cardBgActive]}>
              {/* Color accent bar */}
              <View style={[styles.accentBar, { backgroundColor: color }]} />

              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={[styles.blockLabel, { color }]} numberOfLines={1}>
                    {block.label}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>NOW</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.timeRange}>
                    {format(block.start, 'h:mma')} – {format(block.end, 'h:mma')}
                  </Text>
                  <Text style={styles.duration}>
                    {formatDuration(block.start, block.end)}
                  </Text>
                </View>

                {note && <Text style={styles.note}>{note}</Text>}
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Card style={[styles.card, cardBorderNext]} padding={false}>
            {/* Color accent bar */}
            <View style={[styles.accentBar, { backgroundColor: color }]} />

            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text style={styles.blockLabel} numberOfLines={1}>
                  {block.label}
                </Text>
                {isNext && (
                  <View style={[styles.badge, { backgroundColor: `${color}33` }]}>
                    <Text style={[styles.badgeText, { color }]}>NEXT</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.timeRange}>
                  {format(block.start, 'h:mma')} – {format(block.end, 'h:mma')}
                </Text>
                {countdownToStart ? (
                  <Text style={[styles.duration, { color, fontWeight: '600' }]}>
                    {countdownToStart}
                  </Text>
                ) : (
                  <Text style={styles.duration}>
                    {formatDuration(block.start, block.end)}
                  </Text>
                )}
              </View>

              {note && <Text style={styles.note}>{note}</Text>}
            </View>
          </Card>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const DOT_SIZE = 10;
const DOT_ACTIVE_SIZE = 12;
const SPINE_WIDTH = 1.5;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: V6_LAYOUT.timelineEventGap,
  },

  /* Time column */
  timeColumn: {
    width: V6_LAYOUT.timeColumn,
    alignItems: 'flex-end',
    paddingTop: 11,
    paddingRight: 4,
  },
  timeText: {
    ...timestamp,
    color: COLORS.text.muted,
    fontVariant: ['tabular-nums'],
  },

  /* Spine */
  spine: {
    width: V6_LAYOUT.spineColumn,
    alignItems: 'center',
  },
  lineTop: {
    width: SPINE_WIDTH,
    height: SPACING.lg,
    backgroundColor: COLORS.border.default,
  },
  lineBottom: {
    flex: 1,
    width: SPINE_WIDTH,
    backgroundColor: COLORS.border.default,
    minHeight: SPACING.lg,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotActive: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  dotNext: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Card */
  cardWrapper: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    borderRadius: V6_RADIUS.timelineCard,
    marginBottom: 0,
  },
  accentBar: {
    width: V6_LAYOUT.accentBar,
    borderTopLeftRadius: V6_RADIUS.timelineCard,
    borderBottomLeftRadius: V6_RADIUS.timelineCard,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  blockLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.onAccent,
  },

  /* Meta */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  timeRange: {
    ...meta,
    color: COLORS.text.muted,
  },
  duration: {
    ...meta,
    color: COLORS.text.muted,
  },

  /* Note */
  note: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});
