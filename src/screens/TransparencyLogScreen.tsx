/**
 * TransparencyLogScreen — Phase 34 (30-Day Autopilot)
 *
 * Full-screen log of all autopilot decisions. Shows accepted changes (green),
 * bounds rejections (orange), and system events (blue). Every entry has a
 * human-readable explanation.
 *
 * Access: tap "Autopilot On" badge on Today screen, or Settings > Autopilot > View History
 * Route: app/autopilot-log.tsx
 */

import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import { useAutopilotStore, type TransparencyLogEntry } from '@/src/store/autopilot-store';

// ─── Type colors ──────────────────────────────────────────────────────────────

const ENTRY_COLORS: Record<TransparencyLogEntry['type'], string> = {
  activation: '#4A90D9',       // blue — system event
  plan_change: '#34D399',      // green — accepted change
  user_disabled: '#9CA3AF',    // gray — user action
  bounds_rejection: '#F59E0B', // orange — rejected change
};

const ENTRY_ICONS: Record<TransparencyLogEntry['type'], keyof typeof Ionicons.glyphMap> = {
  activation: 'information-circle-outline',
  plan_change: 'checkmark-circle-outline',
  user_disabled: 'close-circle-outline',
  bounds_rejection: 'warning-outline',
};

// ─── Log Entry Component ──────────────────────────────────────────────────────

interface LogEntryProps {
  item: TransparencyLogEntry;
}

function LogEntry({ item }: LogEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const color = ENTRY_COLORS[item.type];
  const iconName = ENTRY_ICONS[item.type];

  const relativeTime = formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true });
  const absoluteTime = format(parseISO(item.timestamp), 'MMM d, yyyy h:mm a');
  const isRejection = item.type === 'bounds_rejection';
  const isAccepted = item.type === 'plan_change' && item.accepted;

  return (
    <Pressable style={styles.entry} onPress={() => setExpanded((v) => !v)}>
      {/* Icon column */}
      <View style={[styles.entryIconCircle, { backgroundColor: `${color}18` }]}>
        <Ionicons name={iconName} size={16} color={color} />
      </View>

      {/* Content column */}
      <View style={styles.entryContent}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTime}>{relativeTime}</Text>
          {item.accepted ? (
            <View style={[styles.pill, { backgroundColor: '#34D39920' }]}>
              <Text style={[styles.pillText, { color: '#34D399' }]}>Applied</Text>
            </View>
          ) : isRejection ? (
            <View style={[styles.pill, { backgroundColor: '#F59E0B20' }]}>
              <Text style={[styles.pillText, { color: '#F59E0B' }]}>Rejected</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.entryDescription}>{item.description}</Text>

        {/* Change detail */}
        {item.proposedChange && (
          <Text
            style={[
              styles.changeDetail,
              isRejection ? styles.changeDetailRejected : styles.changeDetailAccepted,
            ]}
          >
            {item.proposedChange.field}: {item.proposedChange.from} → {item.proposedChange.to}
          </Text>
        )}

        {/* Bounds violations (expanded or always visible for rejections) */}
        {item.boundsViolations && item.boundsViolations.length > 0 && (
          <View style={styles.violationsBlock}>
            {item.boundsViolations.map((v, i) => (
              <Text key={i} style={styles.violation}>
                Rejected: {v}
              </Text>
            ))}
          </View>
        )}

        {/* Expanded: absolute timestamp */}
        {expanded && (
          <Text style={styles.absoluteTime}>{absoluteTime}</Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyLog() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="speedometer-outline" size={40} color={COLORS.text.dim} />
      <Text style={styles.emptyTitle}>No autopilot activity yet</Text>
      <Text style={styles.emptyBody}>
        Enable autopilot to let ShiftWell make small, science-backed adjustments automatically.
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

interface Props {
  /** Called when the back/close button is pressed */
  onClose?: () => void;
}

export function TransparencyLogScreen({ onClose }: Props) {
  const { enabled, transparencyLog, enable, disable } = useAutopilotStore();

  // Reverse so newest entries appear first
  const sortedLog = [...transparencyLog].reverse();

  const handleToggle = useCallback(
    (value: boolean) => {
      if (value) {
        enable();
      } else {
        disable();
      }
    },
    [enable, disable],
  );

  const handleExport = useCallback(async () => {
    if (sortedLog.length === 0) return;
    const text = sortedLog
      .map((entry) => {
        const date = format(parseISO(entry.timestamp), 'MMM d yyyy h:mm a');
        const status = entry.accepted ? 'APPLIED' : 'REJECTED';
        let line = `[${date}] ${status}: ${entry.description}`;
        if (entry.proposedChange) {
          line += `\n  Change: ${entry.proposedChange.field} ${entry.proposedChange.from} → ${entry.proposedChange.to}`;
        }
        if (entry.boundsViolations?.length) {
          line += `\n  Violations: ${entry.boundsViolations.join('; ')}`;
        }
        return line;
      })
      .join('\n\n');

    const header = `ShiftWell Autopilot Log\nExported: ${format(new Date(), 'MMM d yyyy')}\n${'─'.repeat(40)}\n\n`;
    await Share.share({ message: header + text });
  }, [sortedLog]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransparencyLogEntry>) => (
      <LogEntry item={item} />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation header */}
      <View style={styles.navHeader}>
        <Pressable onPress={onClose} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.navTitle}>Autopilot Log</Text>
        <Pressable onPress={handleExport} style={styles.exportButton} hitSlop={12}>
          <Ionicons name="share-outline" size={20} color={COLORS.text.secondary} />
        </Pressable>
      </View>

      {/* Status row */}
      <View style={styles.statusRow}>
        <View style={[styles.statusChip, { backgroundColor: enabled ? '#34D39920' : '#9CA3AF20' }]}>
          <View style={[styles.statusDot, { backgroundColor: enabled ? '#34D399' : '#9CA3AF' }]} />
          <Text style={[styles.statusText, { color: enabled ? '#34D399' : '#9CA3AF' }]}>
            {enabled ? 'Autopilot ON' : 'Autopilot OFF'}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: COLORS.border.default, true: COLORS.accent.primary }}
          thumbColor={COLORS.text.primary}
        />
      </View>

      {/* Log list */}
      <FlatList
        data={sortedLog}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          sortedLog.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={EmptyLog}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      {sortedLog.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All changes are within bounds defined by sleep science research.
            Maximum adjustment: 30 minutes per cycle.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  exportButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING['2xl'],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  entry: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  entryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  entryContent: {
    flex: 1,
    gap: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  entryTime: {
    fontSize: 11,
    color: COLORS.text.dim,
    flex: 1,
  },
  pill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  entryDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  changeDetail: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  changeDetailAccepted: {
    color: '#34D399',
  },
  changeDetailRejected: {
    color: '#F59E0B',
    textDecorationLine: 'line-through',
  },
  violationsBlock: {
    marginTop: 3,
    gap: 2,
  },
  violation: {
    fontSize: 11,
    color: '#F59E0B',
    lineHeight: 16,
  },
  absoluteTime: {
    fontSize: 10,
    color: COLORS.text.dim,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.text.dim,
    textAlign: 'center',
    lineHeight: 16,
  },
});
