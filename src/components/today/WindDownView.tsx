import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BACKGROUND, TEXT, BORDER, sectionLabel } from '@/src/theme';
import { InsightLine } from './InsightLine';
import { tapSuccess } from '@/src/lib/haptics/haptic-service';
import { playChecklistDone } from '@/src/lib/audio/sound-service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface WindDownViewProps {
  minutesUntilBedtime: number;
  sleepTime: Date;
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  insight: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const paddedMins = mins.toString().padStart(2, '0');
  return `${hours}:${paddedMins}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WindDownView({
  minutesUntilBedtime,
  checklist,
  onToggleItem,
  insight,
}: WindDownViewProps) {
  const handleToggle = async (id: string) => {
    const item = checklist.find((c) => c.id === id);
    onToggleItem(id);
    await tapSuccess();
    if (item && !item.completed) {
      playChecklistDone();
    }
  };

  return (
    <View style={styles.container}>
      {/* Large countdown */}
      <View style={styles.countdownBlock}>
        <Text style={styles.countdown}>
          {formatMinutes(minutesUntilBedtime)}
        </Text>
        <Text style={styles.countdownLabel}>until bedtime</Text>
      </View>

      {/* Section header */}
      <Text style={[styles.sectionHeader, sectionLabel]}>CHECKLIST</Text>

      {/* Checklist items */}
      <View style={styles.checklist}>
        {checklist.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleToggle(item.id)}
            style={styles.checkItem}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.completed }}
          >
            <Text style={styles.checkIcon}>
              {item.completed ? '✅' : '⬜'}
            </Text>
            <Text
              style={[
                styles.checkLabel,
                item.completed && styles.checkLabelDone,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Insight at bottom */}
      <InsightLine text={insight} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  countdownBlock: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  countdown: {
    fontSize: 52,
    fontWeight: '700',
    color: '#818CF8',
    textShadowColor: 'rgba(129,140,248,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: 12,
    color: TEXT.muted,
    marginTop: 4,
  },
  sectionHeader: {
    color: TEXT.dim,
    marginBottom: 8,
  },
  checklist: {
    gap: 6,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND.surface,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  checkLabel: {
    fontSize: 14,
    color: TEXT.primary,
    flex: 1,
  },
  checkLabelDone: {
    textDecorationLine: 'line-through',
    color: TEXT.dim,
  },
});
