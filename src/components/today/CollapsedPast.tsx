import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BLOCK_COLORS, TEXT, V6_LAYOUT } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollapsedPastProps {
  events: Array<{ type: string }>;
  onExpand: () => void;
  isExpanded: boolean;
}

// ---------------------------------------------------------------------------
// Color helper
// ---------------------------------------------------------------------------

function colorForType(type: string): string {
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
    case 'light-avoid':
      return BLOCK_COLORS.lightProtocol;
    default:
      return BLOCK_COLORS.shiftDay;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollapsedPast({ events, onExpand, isExpanded }: CollapsedPastProps) {
  return (
    <Pressable onPress={onExpand} style={styles.row}>
      {/* Empty time column */}
      <View style={styles.timeColumn} />

      {/* Spine column (empty spacer) */}
      <View style={styles.spineColumn} />

      {/* Content */}
      <View style={styles.content}>
        {/* Colored dots */}
        {events.slice(0, 8).map((event, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: colorForType(event.type) },
            ]}
          />
        ))}

        {/* Count text */}
        <Text style={styles.countText}>{events.length} completed</Text>

        {/* Chevron */}
        <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: V6_LAYOUT.timelineEventGap,
    paddingVertical: 6,
  },
  timeColumn: {
    width: V6_LAYOUT.timeColumn,
  },
  spineColumn: {
    width: V6_LAYOUT.spineColumn,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.4,
  },
  countText: {
    fontSize: 12,
    color: TEXT.dim,
    marginLeft: 4,
  },
  chevron: {
    fontSize: 9,
    color: TEXT.dim,
    marginLeft: 4,
  },
});
