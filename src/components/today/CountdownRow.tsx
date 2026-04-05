import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TEXT, V6_RADIUS, countdownValue } from '@/src/theme';

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
  return (
    <View style={styles.container}>
      {cells.map((cell, index) => (
        <View
          key={index}
          style={[
            styles.cell,
            index > 0 && styles.cellBorder,
            cell.isActive && {
              backgroundColor: `${cell.color}0F`, // rgba(cellColor, 0.06) approx
            },
          ]}
        >
          <Text style={styles.emoji}>{cell.emoji}</Text>
          <Text
            style={[
              styles.value,
              { color: cell.color },
            ]}
          >
            {cell.value}
          </Text>
          <Text style={styles.label}>{cell.label}</Text>
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
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.04)',
  },
  emoji: {
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    ...countdownValue,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 11,
    color: TEXT.muted,
    marginTop: 3,
  },
});
