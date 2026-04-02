/**
 * CalendarProviderCard
 *
 * Connection card for a calendar provider (Apple or Google).
 * Shows connection status, calendar count, and connect/manage actions.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ACCENT, BACKGROUND, BORDER, COLORS, RADIUS, SPACING, TEXT } from '@/src/theme';

interface CalendarProviderCardProps {
  provider: 'apple' | 'google';
  connected: boolean;
  calendarCount?: number;
  onConnect: () => void;
  onManage?: () => void;
  loading?: boolean;
}

export function CalendarProviderCard({
  provider,
  connected,
  calendarCount,
  onConnect,
  onManage,
  loading = false,
}: CalendarProviderCardProps) {
  const providerName = provider === 'apple' ? 'Apple Calendar' : 'Google Calendar';
  const providerIcon = provider === 'apple' ? '📅' : '📆';

  function handlePress() {
    if (connected && onManage) {
      onManage();
    } else if (!connected) {
      onConnect();
    }
  }

  return (
    <View style={styles.card}>
      {/* Provider icon */}
      <Text style={styles.icon}>{providerIcon}</Text>

      {/* Provider info */}
      <View style={styles.info}>
        <Text style={styles.providerName}>{providerName}</Text>
        {connected && (
          <View style={styles.connectedRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedText}>
              Connected
              {calendarCount !== undefined ? ` — ${calendarCount} calendar${calendarCount !== 1 ? 's' : ''}` : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Action */}
      {loading ? (
        <ActivityIndicator color={ACCENT.primary} size="small" />
      ) : connected ? (
        <Pressable onPress={onManage} style={styles.manageButton}>
          <Text style={styles.manageText}>Manage</Text>
        </Pressable>
      ) : (
        <Pressable onPress={handlePress} style={styles.connectButton}>
          <Text style={styles.connectText}>Connect</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: SPACING.xs,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.primary,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  connectedText: {
    fontSize: 13,
    color: TEXT.secondary,
  },
  connectButton: {
    backgroundColor: ACCENT.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  manageButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT.primary,
  },
});
