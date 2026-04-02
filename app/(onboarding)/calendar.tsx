/**
 * Calendar onboarding screen.
 *
 * Three-phase flow:
 *   1. connect  — Connect Apple Calendar or Google Calendar (D-01, D-02)
 *   2. calendars — Select which calendars to include (D-03)
 *   3. review   — Review detected shifts and confirm (D-05)
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDays } from 'date-fns';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Button from '@/src/components/ui/Button';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { CalendarProviderCard } from '@/src/components/calendar/CalendarProviderCard';
import { CalendarToggleList } from '@/src/components/calendar/CalendarToggleList';
import { ShiftReviewList } from '@/src/components/calendar/ShiftReviewList';
import {
  requestCalendarAccess,
  fetchAppleCalendars,
  fetchAppleEvents,
  getOrCreateShiftWellCalendar,
} from '@/src/lib/calendar/calendar-service';
import { fetchGoogleCalendarList, fetchGoogleEvents } from '@/src/lib/calendar/google-calendar-api';
import { useCalendarStore } from '@/src/lib/calendar/calendar-store';
import { shiftConfidence } from '@/src/lib/calendar/shift-detector';
import { useShiftsStore } from '@/src/store/shifts-store';
import type { RawCalendarEvent, CalendarMeta } from '@/src/lib/calendar/calendar-types';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';

type Phase = 'connect' | 'calendars' | 'review';

interface ScoredEvent extends RawCalendarEvent {
  confidence: number;
}

export default function CalendarScreen() {
  const [phase, setPhase] = useState<Phase>('connect');

  // Provider loading states
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Error messages
  const [appleError, setAppleError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Review phase state
  const [reviewEvents, setReviewEvents] = useState<ScoredEvent[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [confirmedShiftIds, setConfirmedShiftIds] = useState<Set<string>>(new Set());

  const calendarStore = useCalendarStore();
  const addShift = useShiftsStore((s) => s.addShift);

  const allCalendars: CalendarMeta[] = [
    ...calendarStore.appleCalendars,
    ...calendarStore.googleCalendars,
  ];

  // ─── Navigation ────────────────────────────────────────────────────────────

  function finishOnboarding() {
    router.replace('/(tabs)');
  }

  // ─── Apple Calendar connection ──────────────────────────────────────────────

  async function handleConnectApple() {
    setAppleLoading(true);
    setAppleError(null);

    try {
      const granted = await requestCalendarAccess();

      if (!granted) {
        setAppleError(
          'Calendar access denied. You can enable it in Settings.',
        );
        setAppleLoading(false);
        return;
      }

      const [calendars, shiftWellCalId] = await Promise.all([
        fetchAppleCalendars(),
        getOrCreateShiftWellCalendar(),
      ]);

      useCalendarStore.getState().connectApple(calendars, shiftWellCalId);
      setPhase('calendars');
    } catch {
      setAppleError('Could not access Apple Calendar. Please try again.');
    } finally {
      setAppleLoading(false);
    }
  }

  // ─── Google Calendar connection ─────────────────────────────────────────────

  async function handleConnectGoogle() {
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const { accessToken } = tokens;

      const googleCalendars = await fetchGoogleCalendarList(accessToken);
      useCalendarStore.getState().connectGoogle(
        googleCalendars,
        accessToken,
        Date.now() + 3600000,
      );
      setPhase('calendars');
    } catch {
      setGoogleError('Google sign-in failed. Try again or skip for now.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // ─── Calendar phase → Review phase ─────────────────────────────────────────

  async function handleContinueToReview() {
    setPhase('review');
    setReviewLoading(true);

    try {
      const store = useCalendarStore.getState();
      const now = new Date();
      const endDate = addDays(now, 28);
      const allEvents: RawCalendarEvent[] = [];

      if (store.appleConnected) {
        const appleIds = store.getEnabledAppleCalendarIds();
        if (appleIds.length > 0) {
          const appleEvents = await fetchAppleEvents(appleIds, now, endDate);
          allEvents.push(...appleEvents);
        }
      }

      if (store.googleConnected && store.googleAccessToken) {
        const googleIds = store.getEnabledGoogleCalendarIds();
        if (googleIds.length > 0) {
          const googleEvents = await fetchGoogleEvents(
            googleIds,
            store.googleAccessToken,
            now,
            endDate,
          );
          allEvents.push(...googleEvents);
        }
      }

      const workCalId = store.workCalendarId;
      const scored: ScoredEvent[] = allEvents.map((evt) => ({
        ...evt,
        confidence: shiftConfidence(
          evt.title,
          (evt.end.getTime() - evt.start.getTime()) / (1000 * 3600),
          { isWorkCalendar: !!workCalId && evt.calendarId === workCalId },
        ),
      }));

      // Filter to events with some chance of being a shift
      const candidates = scored.filter((e) => e.confidence > 0);

      setReviewEvents(candidates);

      // Pre-populate confirmed IDs based on confidence threshold
      const preChecked = new Set<string>();
      for (const evt of candidates) {
        if (evt.confidence >= 0.50) {
          preChecked.add(evt.id);
        }
      }
      setConfirmedShiftIds(preChecked);
    } catch {
      // Non-blocking — user can still confirm with empty list
      setReviewEvents([]);
    } finally {
      setReviewLoading(false);
    }
  }

  // ─── Toggle shifts in review ────────────────────────────────────────────────

  function handleToggleShift(eventId: string, isShift: boolean) {
    setConfirmedShiftIds((prev) => {
      const next = new Set(prev);
      if (isShift) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  }

  // ─── Confirm shifts → navigate to main app ──────────────────────────────────

  function handleConfirmShifts() {
    for (const evt of reviewEvents) {
      if (confirmedShiftIds.has(evt.id)) {
        addShift({
          title: evt.title,
          start: evt.start,
          end: evt.end,
          shiftType: 'day',
          source: 'calendar',
        } as Parameters<typeof addShift>[0]);
      }
    }
    finishOnboarding();
  }

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const anyConnected = calendarStore.appleConnected || calendarStore.googleConnected;

  // ─── Phase: connect ─────────────────────────────────────────────────────────

  if (phase === 'connect') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ProgressBar currentStep={6} totalSteps={6} />
          </View>

          <Text style={styles.title}>Connect Your Calendar</Text>
          <Text style={styles.subtitle}>
            ShiftWell reads your shifts and writes your sleep plan back
          </Text>

          <View style={styles.cardsContainer}>
            <CalendarProviderCard
              provider="apple"
              connected={calendarStore.appleConnected}
              calendarCount={calendarStore.appleCalendars.length}
              onConnect={handleConnectApple}
              onManage={() => setPhase('calendars')}
              loading={appleLoading}
            />

            {appleError && (
              <View style={styles.inlineError}>
                <Text style={styles.errorText}>{appleError}</Text>
                {appleError.includes('Settings') && (
                  <Pressable onPress={() => Linking.openSettings()}>
                    <Text style={styles.errorLink}>Open Settings</Text>
                  </Pressable>
                )}
              </View>
            )}

            <CalendarProviderCard
              provider="google"
              connected={calendarStore.googleConnected}
              calendarCount={calendarStore.googleCalendars.length}
              onConnect={handleConnectGoogle}
              onManage={() => setPhase('calendars')}
              loading={googleLoading}
            />

            {googleError && (
              <View style={styles.inlineError}>
                <Text style={styles.errorText}>{googleError}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {anyConnected && (
              <>
                <Button
                  title="Continue"
                  onPress={() => setPhase('calendars')}
                  size="lg"
                  fullWidth
                />
                <View style={styles.skipSpacer} />
              </>
            )}
            <Button
              title="Skip for now"
              onPress={finishOnboarding}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Phase: calendars ───────────────────────────────────────────────────────

  if (phase === 'calendars') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ProgressBar currentStep={6} totalSteps={6} />
          </View>

          <Text style={styles.title}>Your Calendars</Text>
          <Text style={styles.subtitle}>
            All calendars are included by default. Toggle off any you want to exclude.
          </Text>

          <View style={styles.listContainer}>
            <CalendarToggleList
              calendars={allCalendars}
              workCalendarId={calendarStore.workCalendarId}
              onToggle={calendarStore.toggleCalendar}
              onSetWorkCalendar={calendarStore.setWorkCalendarId}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinueToReview}
              size="lg"
              fullWidth
            />
            <View style={styles.skipSpacer} />
            <Button
              title="Skip for now"
              onPress={finishOnboarding}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Phase: review ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ProgressBar currentStep={6} totalSteps={6} />
        </View>

        {reviewLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.accent.primary} size="large" />
            <Text style={styles.loadingText}>Scanning your calendar…</Text>
          </View>
        ) : (
          <>
            <View style={styles.listContainer}>
              <ShiftReviewList
                events={reviewEvents}
                onToggleShift={handleToggleShift}
                loading={false}
              />
            </View>

            <View style={styles.footer}>
              <Button
                title="Confirm Shifts"
                onPress={handleConfirmShifts}
                size="lg"
                fullWidth
              />
              <View style={styles.skipSpacer} />
              <Button
                title="Skip for now"
                onPress={finishOnboarding}
                variant="ghost"
                size="md"
                fullWidth
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  title: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING['3xl'],
  },
  cardsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  listContainer: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  inlineError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#EF4444',
    lineHeight: 20,
  },
  errorLink: {
    ...TYPOGRAPHY.bodySmall,
    color: '#EF4444',
    textDecorationLine: 'underline',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING['2xl'],
  },
  skipSpacer: {
    height: SPACING.md,
  },
});
