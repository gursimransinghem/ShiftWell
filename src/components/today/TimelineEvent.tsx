import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { format, differenceInMinutes } from 'date-fns';
import type { PlanBlock, SleepBlockType } from '@/src/lib/circadian/types';
import Card from '@/src/components/ui/Card';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
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

function contextualNote(type: SleepBlockType): string | null {
  switch (type) {
    case 'caffeine-cutoff':
      return 'No more caffeine after this time';
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
  const color = blockColor(block.type);
  const note = contextualNote(block.type);

  // Pulsing border opacity for active event
  const borderGlow = useRef(new Animated.Value(1)).current;
  // Breathing dot opacity for next event
  const dotBreathing = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlow, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(borderGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isActive, borderGlow]);

  useEffect(() => {
    if (!isNext) return;
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(dotBreathing, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(dotBreathing, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, [isNext, dotBreathing]);

  const containerOpacity: ViewStyle = isPast && !isActive ? { opacity: 0.45 } : {};
  const cardBorder: ViewStyle = isActive
    ? { borderColor: color, borderWidth: 1.5 }
    : isNext
      ? { borderColor: color, borderWidth: 1, opacity: 1 }
      : {};

  return (
    <View style={[styles.row, containerOpacity]}>
      {/* Left — time label */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{format(block.start, 'HH:mm')}</Text>
      </View>

      {/* Center — timeline spine */}
      <View style={styles.spine}>
        <View style={styles.lineTop} />
        {isNext ? (
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: color },
              styles.dotNext,
              { opacity: dotBreathing },
            ]}
          />
        ) : (
          <View
            style={[
              styles.dot,
              { backgroundColor: color },
              isActive && styles.dotActive,
            ]}
          />
        )}
        <View style={styles.lineBottom} />
      </View>

      {/* Right — content card */}
      <View style={styles.cardWrapper}>
        {isActive ? (
          <Animated.View style={{ opacity: borderGlow }}>
            <Card style={{ ...styles.card, ...cardBorder }}>
              {/* Color accent bar */}
              <View style={[styles.accentBar, { backgroundColor: color }]} />

              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text
                    style={[styles.blockLabel, { color }]}
                    numberOfLines={1}
                  >
                    {block.label}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>NOW</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.timeRange}>
                    {format(block.start, 'HH:mm')} – {format(block.end, 'HH:mm')}
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
          <Card style={{ ...styles.card, ...cardBorder }}>
            {/* Color accent bar */}
            <View style={[styles.accentBar, { backgroundColor: color }]} />

            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text
                  style={[styles.blockLabel]}
                  numberOfLines={1}
                >
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
                  {format(block.start, 'HH:mm')} – {format(block.end, 'HH:mm')}
                </Text>
                <Text style={styles.duration}>
                  {formatDuration(block.start, block.end)}
                </Text>
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

const DOT_SIZE = 12;
const DOT_ACTIVE_SIZE = 16;
const SPINE_WIDTH = 2;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },

  /* Time column */
  timeColumn: {
    width: 48,
    alignItems: 'flex-end',
    paddingTop: SPACING.lg,
    paddingRight: SPACING.sm,
  },
  timeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  /* Spine */
  spine: {
    width: 24,
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
    width: DOT_ACTIVE_SIZE,
    height: DOT_ACTIVE_SIZE,
    borderRadius: DOT_ACTIVE_SIZE / 2,
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
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  blockLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  duration: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
  },

  /* Note */
  note: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});
