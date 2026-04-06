/**
 * LightProtocolStrip — compact 3-cell light guidance row for the Today screen.
 *
 * Only renders during active light transition windows. Tapping navigates to
 * the full Circadian tab view.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/src/theme';
import type { PlanBlock } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEEK_COLOR = '#C8A84B';   // warm amber
const AVOID_COLOR = '#4361EE';  // deep blue

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentBlock(
  blocks: PlanBlock[],
  now: Date,
): PlanBlock | undefined {
  return blocks.find(
    (b) => b.start <= now && b.end > now,
  );
}

function getNextBlock(
  blocks: PlanBlock[],
  now: Date,
  currentBlock?: PlanBlock,
): PlanBlock | undefined {
  const sorted = [...blocks].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  if (currentBlock) {
    // Next block after the current one ends
    return sorted.find((b) => b.start >= currentBlock.end);
  }

  // No current block — find first upcoming
  return sorted.find((b) => b.start > now);
}

function getAfterNextBlock(
  blocks: PlanBlock[],
  nextBlock?: PlanBlock,
): PlanBlock | undefined {
  if (!nextBlock) return undefined;
  const sorted = [...blocks].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  return sorted.find((b) => b.start >= nextBlock.end);
}

function blockColor(block: PlanBlock): string {
  return block.type === 'light-seek' ? SEEK_COLOR : AVOID_COLOR;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LightProtocolStripProps {
  lightBlocks: PlanBlock[];
  onNavigateToFull?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LightProtocolStrip({
  lightBlocks,
  onNavigateToFull,
}: LightProtocolStripProps) {
  if (lightBlocks.length === 0) return null;

  const now = new Date();
  const currentBlock = getCurrentBlock(lightBlocks, now);
  const activeBlock = currentBlock ?? getNextBlock(lightBlocks, now);

  // Nothing to show if all blocks are in the past
  if (!activeBlock) return null;

  const nextBlock = getNextBlock(lightBlocks, now, currentBlock);
  const afterNextBlock = getAfterNextBlock(lightBlocks, nextBlock);

  // Cell 1 — what to do right now
  const cell1Label =
    activeBlock.type === 'light-seek' ? 'Light now' : 'Dark now';
  const cell1Value = activeBlock.label;
  const cell1Color = blockColor(activeBlock);

  // Cell 2 — next transition
  let cell2Label = 'Next';
  let cell2Value = '—';
  let cell2Color = COLORS.text.secondary;

  if (nextBlock) {
    cell2Label =
      nextBlock.type === 'light-avoid' ? 'Protect at' : 'Bright at';
    cell2Value = format(nextBlock.start, 'h:mm a');
    cell2Color = blockColor(nextBlock);
  }

  // Cell 3 — after that
  let cell3Label = 'After that';
  let cell3Value = '—';
  let cell3Color = COLORS.text.secondary;

  if (afterNextBlock) {
    cell3Label =
      afterNextBlock.type === 'light-seek' ? 'Bright at' : 'Protect at';
    cell3Value = format(afterNextBlock.start, 'h:mm a');
    cell3Color = blockColor(afterNextBlock);
  }

  return (
    <Pressable
      style={styles.card}
      onPress={onNavigateToFull}
      accessibilityLabel="Light protocol — tap to view full schedule"
      accessibilityRole="button"
    >
      {/* 3-cell row */}
      <View style={styles.cells}>
        {/* Cell 1 */}
        <View style={styles.cell}>
          <Text style={[styles.cellValue, { color: cell1Color }]}>
            {cell1Value}
          </Text>
          <Text style={styles.cellLabel}>{cell1Label}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Cell 2 */}
        <View style={styles.cell}>
          <Text style={[styles.cellValue, { color: cell2Color }]}>
            {cell2Value}
          </Text>
          <Text style={styles.cellLabel}>{cell2Label}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Cell 3 */}
        <View style={styles.cell}>
          <Text style={[styles.cellValue, { color: cell3Color }]}>
            {cell3Value}
          </Text>
          <Text style={styles.cellLabel}>{cell3Label}</Text>
        </View>
      </View>

      {/* Navigate arrow */}
      {onNavigateToFull !== undefined && (
        <View style={styles.arrow}>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.text.dim}
          />
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cells: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: SPACING.xs,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  cellLabel: {
    fontSize: 10,
    color: COLORS.text.dim,
    textAlign: 'center',
  },
  arrow: {
    marginLeft: SPACING.sm,
  },
});
