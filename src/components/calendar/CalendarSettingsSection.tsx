/**
 * CalendarSettingsSection
 *
 * Full calendar management section for the Settings screen.
 * Provides: provider connection cards, calendar toggles, Work Schedule tag,
 * write preferences (D-11, D-12), change notification mode (D-15), and
 * disconnect options.
 *
 * Accessible from Settings at any time — including for users who skipped
 * calendar setup during onboarding (D-01).
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  requestCalendarAccess,
  fetchAppleCalendars,
  getOrCreateShiftWellCalendar,
} from '@/src/lib/calendar/calendar-service';
import { fetchGoogleCalendarList } from '@/src/lib/calendar/google-calendar-api';
import {
  unregisterCalendarBackgroundSync,
} from '@/src/lib/calendar/background-sync';
import { useCalendarStore } from '@/src/lib/calendar/calendar-store';
import { CalendarProviderCard } from './CalendarProviderCard';
import { CalendarToggleList } from './CalendarToggleList';
import {
  ACCENT,
  BACKGROUND,
  BORDER,
  RADIUS,
  SEMANTIC,
  SPACING,
  TEXT,
  body,
  bodySmall,
  caption,
  heading3,
} from '@/src/theme';
import type { ChangeNotificationMode } from '@/src/lib/calendar/calendar-types';
import type { CalendarMeta } from '@/src/lib/calendar/calendar-types';

// ─────────────────────────────────────────────────────────────────────────────
// Notification mode options
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_OPTIONS: Array<{ mode: ChangeNotificationMode; label: string }> = [
  { mode: 'silent', label: 'Silent' },
  { mode: 'badge', label: 'Badge' },
  { mode: 'push', label: 'Push' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Target Calendar Picker Modal
// ─────────────────────────────────────────────────────────────────────────────

interface CalendarPickerModalProps {
  visible: boolean;
  calendars: CalendarMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function CalendarPickerModal({
  visible,
  calendars,
  selectedId,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  const writable = calendars.filter((c) => c.allowsModifications);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Write Sleep Blocks To</Text>
          <Text style={styles.modalSubtitle}>Choose which calendar receives sleep events</Text>

          {writable.length === 0 ? (
            <Text style={styles.modalEmpty}>No writable calendars found.</Text>
          ) : (
            writable.map((cal) => (
              <Pressable
                key={cal.id}
                style={[
                  styles.calendarOption,
                  cal.id === selectedId && styles.calendarOptionSelected,
                ]}
                onPress={() => {
                  onSelect(cal.id);
                  onClose();
                }}
              >
                <View style={[styles.calOptionDot, { backgroundColor: cal.color || BORDER.strong }]} />
                <Text style={styles.calOptionName} numberOfLines={1}>
                  {cal.title}
                </Text>
                {cal.id === selectedId && (
                  <Text style={styles.calOptionCheck}>✓</Text>
                )}
              </Pressable>
            ))
          )}

          <Pressable style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function CalendarSettingsSection() {
  // Store state
  const appleConnected = useCalendarStore((s) => s.appleConnected);
  const googleConnected = useCalendarStore((s) => s.googleConnected);
  const appleCalendars = useCalendarStore((s) => s.appleCalendars);
  const googleCalendars = useCalendarStore((s) => s.googleCalendars);
  const workCalendarId = useCalendarStore((s) => s.workCalendarId);
  const writeToNativeCalendar = useCalendarStore((s) => s.writeToNativeCalendar);
  const nativeWriteCalendarId = useCalendarStore((s) => s.nativeWriteCalendarId);
  const changeNotificationMode = useCalendarStore((s) => s.changeNotificationMode);
  const lastSyncedAt = useCalendarStore((s) => s.lastSyncedAt);

  // Store actions
  const connectApple = useCalendarStore((s) => s.connectApple);
  const disconnectApple = useCalendarStore((s) => s.disconnectApple);
  const connectGoogle = useCalendarStore((s) => s.connectGoogle);
  const disconnectGoogle = useCalendarStore((s) => s.disconnectGoogle);
  const toggleCalendar = useCalendarStore((s) => s.toggleCalendar);
  const setWorkCalendarId = useCalendarStore((s) => s.setWorkCalendarId);
  const setWriteToNativeCalendar = useCalendarStore((s) => s.setWriteToNativeCalendar);
  const setNativeWriteCalendarId = useCalendarStore((s) => s.setNativeWriteCalendarId);
  const setChangeNotificationMode = useCalendarStore((s) => s.setChangeNotificationMode);

  // Local UI state
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showToggles, setShowToggles] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  const anyConnected = appleConnected || googleConnected;
  const allCalendars: CalendarMeta[] = [...appleCalendars, ...googleCalendars];

  // Resolve target calendar name
  const targetCalendar = nativeWriteCalendarId
    ? allCalendars.find((c) => c.id === nativeWriteCalendarId)
    : null;

  // Last synced relative time
  const lastSyncedText = lastSyncedAt
    ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })
    : null;

  // ── Apple connect ───────────────────────────────────────────────────────────

  async function handleConnectApple() {
    setAppleLoading(true);
    try {
      const granted = await requestCalendarAccess();
      if (!granted) {
        Alert.alert(
          'Calendar Access Denied',
          'Enable Calendar access in iOS Settings to connect Apple Calendar.',
        );
        return;
      }
      const [calendars, shiftWellCalId] = await Promise.all([
        fetchAppleCalendars(),
        getOrCreateShiftWellCalendar(),
      ]);
      connectApple(calendars, shiftWellCalId);
      setShowToggles(true);
    } catch {
      Alert.alert('Connection Failed', 'Could not access Apple Calendar. Please try again.');
    } finally {
      setAppleLoading(false);
    }
  }

  // ── Google connect ──────────────────────────────────────────────────────────

  async function handleConnectGoogle() {
    setGoogleLoading(true);
    try {
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const { accessToken } = tokens;
      const calendars = await fetchGoogleCalendarList(accessToken);
      connectGoogle(calendars, accessToken, Date.now() + 3600000);
      setShowToggles(true);
    } catch {
      Alert.alert('Sign-In Failed', 'Google sign-in failed. Try again or skip for now.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── Disconnect handlers ─────────────────────────────────────────────────────

  function handleDisconnectApple() {
    Alert.alert(
      'Disconnect Apple Calendar',
      'ShiftWell will stop reading your Apple Calendar and writing sleep blocks. You can reconnect at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            disconnectApple();
            if (!googleConnected) {
              await unregisterCalendarBackgroundSync();
            }
          },
        },
      ],
    );
  }

  function handleDisconnectGoogle() {
    Alert.alert(
      'Disconnect Google Calendar',
      'ShiftWell will stop reading your Google Calendar and writing sleep blocks. You can reconnect at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            disconnectGoogle();
            try {
              await GoogleSignin.signOut();
            } catch {
              // Ignore sign-out errors — store is already cleared
            }
            if (!appleConnected) {
              await unregisterCalendarBackgroundSync();
            }
          },
        },
      ],
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View>
      {/* Section header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Calendar Sync</Text>
        {lastSyncedText && (
          <Text style={styles.lastSynced}>Synced {lastSyncedText}</Text>
        )}
      </View>

      {/* Provider cards (D-04) */}
      <View style={styles.providerCards}>
        <CalendarProviderCard
          provider="apple"
          connected={appleConnected}
          calendarCount={appleCalendars.length}
          onConnect={handleConnectApple}
          onManage={() => setShowToggles((prev) => !prev)}
          loading={appleLoading}
        />

        <CalendarProviderCard
          provider="google"
          connected={googleConnected}
          calendarCount={googleCalendars.length}
          onConnect={handleConnectGoogle}
          onManage={() => setShowToggles((prev) => !prev)}
          loading={googleLoading}
        />
      </View>

      {/* Calendar toggles (D-03, D-07) */}
      {(showToggles || anyConnected) && allCalendars.length > 0 && (
        <View style={styles.toggleContainer}>
          <CalendarToggleList
            calendars={allCalendars}
            workCalendarId={workCalendarId}
            onToggle={toggleCalendar}
            onSetWorkCalendar={setWorkCalendarId}
          />
        </View>
      )}

      {/* Write preferences (D-11, D-12) */}
      {anyConnected && (
        <View style={styles.prefsSection}>
          <Text style={styles.prefsSectionTitle}>WRITE PREFERENCES</Text>

          {/* D-11: Write sleep blocks to native calendar */}
          <View style={styles.prefRow}>
            <View style={styles.prefLabelBlock}>
              <Text style={styles.prefLabel}>Write sleep blocks to native calendar</Text>
              <Text style={styles.prefSubtext}>
                Sleep windows and naps appear in your regular calendar app
              </Text>
            </View>
            <Switch
              value={writeToNativeCalendar}
              onValueChange={setWriteToNativeCalendar}
              trackColor={{ false: BORDER.strong, true: ACCENT.primaryMuted }}
              thumbColor={writeToNativeCalendar ? ACCENT.primary : TEXT.tertiary}
            />
          </View>

          {/* D-12: Target calendar */}
          {writeToNativeCalendar && (
            <Pressable
              style={styles.prefRow}
              onPress={() => setShowCalendarPicker(true)}
            >
              <Text style={styles.prefLabel}>Target calendar</Text>
              <View style={styles.prefValueRow}>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {targetCalendar ? targetCalendar.title : 'Default'}
                </Text>
                <Text style={styles.prefChevron}>›</Text>
              </View>
            </Pressable>
          )}
        </View>
      )}

      {/* Change notification mode (D-15) */}
      {anyConnected && (
        <View style={styles.prefsSection}>
          <Text style={styles.prefsSectionTitle}>WHEN SHIFTS CHANGE</Text>

          <View style={styles.notifPillsRow}>
            {NOTIFICATION_OPTIONS.map(({ mode, label }) => (
              <Pressable
                key={mode}
                style={[
                  styles.notifPill,
                  changeNotificationMode === mode && styles.notifPillActive,
                ]}
                onPress={() => setChangeNotificationMode(mode)}
              >
                <Text
                  style={[
                    styles.notifPillText,
                    changeNotificationMode === mode && styles.notifPillTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Disconnect options */}
      {(appleConnected || googleConnected) && (
        <View style={styles.disconnectSection}>
          {appleConnected && (
            <Pressable onPress={handleDisconnectApple} style={styles.disconnectRow}>
              <Text style={styles.disconnectText}>Disconnect Apple Calendar</Text>
            </Pressable>
          )}
          {googleConnected && (
            <Pressable onPress={handleDisconnectGoogle} style={styles.disconnectRow}>
              <Text style={styles.disconnectText}>Disconnect Google Calendar</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Target calendar picker modal */}
      <CalendarPickerModal
        visible={showCalendarPicker}
        calendars={allCalendars}
        selectedId={nativeWriteCalendarId}
        onSelect={setNativeWriteCalendarId}
        onClose={() => setShowCalendarPicker(false)}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Section header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...heading3,
    color: TEXT.primary,
  },
  lastSynced: {
    ...caption,
    color: TEXT.secondary,
  },

  // Provider cards
  providerCards: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },

  // Calendar toggle area
  toggleContainer: {
    maxHeight: 320,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: BACKGROUND.surface,
  },

  // Preferences section
  prefsSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  prefsSectionTitle: {
    ...caption,
    color: TEXT.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.subtle,
    gap: SPACING.md,
  },
  prefLabelBlock: {
    flex: 1,
    gap: 3,
  },
  prefLabel: {
    ...body,
    color: TEXT.primary,
  },
  prefSubtext: {
    ...bodySmall,
    color: TEXT.secondary,
  },
  prefValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  prefValue: {
    ...body,
    color: TEXT.secondary,
    maxWidth: 140,
  },
  prefChevron: {
    fontSize: 18,
    color: TEXT.tertiary,
    fontWeight: '300',
  },

  // Notification pills
  notifPillsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  notifPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: BORDER.strong,
    backgroundColor: BACKGROUND.surface,
  },
  notifPillActive: {
    backgroundColor: ACCENT.primaryMuted,
    borderColor: ACCENT.primary,
  },
  notifPillText: {
    ...caption,
    color: TEXT.secondary,
    fontWeight: '600',
  },
  notifPillTextActive: {
    color: ACCENT.primary,
  },

  // Disconnect section
  disconnectSection: {
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  disconnectRow: {
    paddingVertical: SPACING.md,
  },
  disconnectText: {
    ...body,
    color: SEMANTIC.error,
    fontWeight: '500',
  },

  // Calendar picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: BACKGROUND.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    paddingBottom: SPACING['4xl'],
  },
  modalTitle: {
    ...heading3,
    color: TEXT.primary,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    ...caption,
    color: TEXT.secondary,
    marginBottom: SPACING.xl,
  },
  modalEmpty: {
    ...body,
    color: TEXT.secondary,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
  calendarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: BORDER.subtle,
    marginBottom: SPACING.sm,
  },
  calendarOptionSelected: {
    borderColor: ACCENT.primary,
    backgroundColor: BACKGROUND.elevated,
  },
  calOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  calOptionName: {
    ...body,
    color: TEXT.primary,
    flex: 1,
  },
  calOptionCheck: {
    fontSize: 16,
    color: ACCENT.primary,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalCancelText: {
    ...body,
    color: TEXT.secondary,
  },
});
