/**
 * WeeklyBriefToggle — settings row for enabling/disabling the Monday morning
 * AI-generated sleep brief.
 *
 * Bound to useUserStore.weeklyBriefEnabled. Matches existing ToggleRow visual style
 * from the Settings screen (dark background, left label, right Switch).
 */

import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useUserStore } from '../../store/user-store';
import {
  ACCENT,
  BORDER,
  SPACING,
  TEXT,
} from '../../theme';
import { body, caption } from '../../theme';

export function WeeklyBriefToggle() {
  const weeklyBriefEnabled = useUserStore((s) => s.weeklyBriefEnabled);
  const setWeeklyBriefEnabled = useUserStore((s) => s.setWeeklyBriefEnabled);

  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Weekly Sleep Brief</Text>
        <Text style={styles.sublabel}>AI-generated Monday morning summary</Text>
      </View>
      <Switch
        value={weeklyBriefEnabled}
        onValueChange={setWeeklyBriefEnabled}
        trackColor={{ false: BORDER.strong, true: ACCENT.primaryMuted }}
        thumbColor={weeklyBriefEnabled ? ACCENT.primary : TEXT.tertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  labelContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  label: {
    ...body,
    color: TEXT.primary,
  },
  sublabel: {
    ...caption,
    color: TEXT.tertiary,
    marginTop: 2,
  },
});
