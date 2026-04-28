import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TEXT, V6_RADIUS, countdownValue } from '@/src/theme';
import { countdownZeroHaptic } from '@/src/lib/haptics/haptic-service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CountdownCell {
  emoji: string;
  value: string;
  label: string;
  color: string;
  isActive?: boolean;
}

export interface CountdownRowProps {
  cells: CountdownCell[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CountdownRow({ cells }: CountdownRowProps) {
  useEffect(() => {
    const hasZero = cells.some(
      (cell) => cell.value === '0m' || cell.value === '0h' || cell.value === '0:00',
    );
    if (hasZero) {
      countdownZeroHaptic();
    }
  }, [cells]);

  return (
    <View style={styles.container}>
      {cells.map((cell, index) => (
        <View
          key={index}
          style={[
            styles.cell,
            index > 0 && styles.cellBorder,
            cell.isActive && {
              backgroundColor: `${cell.color}14`,
            },
          ]}
        >
          {/* Top accent dot */}
          <View
            style={[
              styles.topAccent,
              { backgroundColor: cell.color },
              cell.isActive && styles.topAccentActive,
            ]}
          />
          <Text style={styles.emoji}>{cell.emoji}</Text>
          <Text
            style={[
              styles.value,
              { color: cell.color },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {cell.value}
          </Text>
          <Text style={styles.label} numberOfLines={1}>{cell.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: V6_RADIUS.countdown,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  cellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    height: 2,
    width: 22,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.55,
  },
  topAccentActive: {
    opacity: 1,
    width: 30,
  },
  emoji: {
    fontSize: 18,
    marginBottom: 6,
    marginTop: 2,
  },
  value: {
    ...countdownValue,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 11,
    color: TEXT.muted,
    marginTop: 4,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
});
