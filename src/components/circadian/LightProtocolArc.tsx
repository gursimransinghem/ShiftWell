/**
 * LightProtocolArc — full-width 24-hour light guidance timeline.
 *
 * Renders on the Circadian tab. Displays light-seek and light-avoid blocks
 * across a horizontal bar representing 00:00–23:59, with a pulsing current-
 * time cursor and tap-to-expand block details.
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/src/theme';
import type { PlanBlock } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEEK_BG = 'rgba(200,168,75,0.35)';
const SEEK_BORDER = 'rgba(200,168,75,0.6)';
const AVOID_BG = 'rgba(67,97,238,0.35)';
const AVOID_BORDER = 'rgba(67,97,238,0.6)';
const SEEK_DOT = 'rgba(200,168,75,0.9)';
const AVOID_DOT = 'rgba(67,97,238,0.9)';
const CURSOR_COLOR = '#C8A84B';
const ARC_HEIGHT = 56;
const ICON_AREA_HEIGHT = 18; // space above arc for emoji icons

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPercent(date: Date): number {
  const h = date.getHours();
  const m = date.getMinutes();
  return ((h + m / 60) / 24) * 100;
}

function durationPercent(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  const diffMins = diffMs / 60000;
  return (diffMins / (24 * 60)) * 100;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PulsingCursor() {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const now = new Date();
  const leftPercent = toPercent(now);

  return (
    <Animated.View
      style={[
        styles.cursor,
        { left: `${leftPercent}%` as any },
        animStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LightProtocolArcProps {
  lightBlocks: PlanBlock[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LightProtocolArc({ lightBlocks }: LightProtocolArcProps) {
  const [selectedBlock, setSelectedBlock] = useState<PlanBlock | null>(null);

  const handleSegmentPress = (block: PlanBlock) => {
    setSelectedBlock((prev) => (prev?.id === block.id ? null : block));
  };

  return (
    <View style={styles.wrapper}>
      {/* Arc */}
      <Pressable
        style={styles.arcContainer}
        onPress={() => setSelectedBlock(null)}
        accessibilityLabel="24-hour light protocol timeline"
      >
        {/* Icon row above arc */}
        <View style={styles.iconRow}>
          {lightBlocks.map((block) => {
            const leftPercent = toPercent(block.start);
            const widthPercent = durationPercent(block.start, block.end);
            const centerPercent = leftPercent + widthPercent / 2;
            return (
              <Text
                key={`icon-${block.id}`}
                style={[styles.segmentIcon, { left: `${centerPercent}%` as any }]}
              >
                {block.type === 'light-seek' ? '☀️' : '🌙'}
              </Text>
            );
          })}
        </View>

        {/* Track */}
        <View style={styles.track}>
          {/* Segments */}
          {lightBlocks.map((block) => {
            const leftPercent = toPercent(block.start);
            const widthPercent = durationPercent(block.start, block.end);
            const isSeek = block.type === 'light-seek';
            const isSelected = selectedBlock?.id === block.id;

            return (
              <Pressable
                key={block.id}
                style={[
                  styles.segment,
                  {
                    left: `${leftPercent}%` as any,
                    width: `${widthPercent}%` as any,
                    backgroundColor: isSeek ? SEEK_BG : AVOID_BG,
                    borderColor: isSeek ? SEEK_BORDER : AVOID_BORDER,
                    opacity: isSelected ? 1 : 0.85,
                  },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleSegmentPress(block);
                }}
                accessibilityLabel={block.label}
                accessibilityHint={block.description}
              />
            );
          })}

          {/* Current time cursor */}
          <PulsingCursor />
        </View>
      </Pressable>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SEEK_DOT }]} />
          <Text style={styles.legendLabel}>Seek light</Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: SPACING.lg }]}>
          <View style={[styles.legendDot, { backgroundColor: AVOID_DOT }]} />
          <Text style={styles.legendLabel}>Protect</Text>
        </View>
      </View>

      {/* Expandable info row */}
      {selectedBlock !== null && (
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{selectedBlock.label}</Text>
            <Text style={styles.infoDesc}>{selectedBlock.description}</Text>
          </View>
          <Pressable
            onPress={() => setSelectedBlock(null)}
            hitSlop={8}
            accessibilityLabel="Dismiss"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={COLORS.text.dim}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  arcContainer: {
    width: '100%',
  },
  iconRow: {
    height: ICON_AREA_HEIGHT,
    position: 'relative',
    width: '100%',
  },
  segmentIcon: {
    position: 'absolute',
    fontSize: 10,
    top: 0,
    marginLeft: -6, // center on the icon
  },
  track: {
    width: '100%',
    height: ARC_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderWidth: 1,
    borderRadius: 6,
  },
  cursor: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 1.5,
    backgroundColor: CURSOR_COLOR,
    borderRadius: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoText: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 17,
  },
});
