import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNightSkyMode } from '@/src/hooks/useNightSkyMode';
import { NightSkyOverlay } from '@/src/components/night-sky';
import { useRouter } from 'expo-router';
import { format, isWithinInterval, differenceInMinutes } from 'date-fns';

import { usePlanStore } from '@/src/store/plan-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useTodayPlan } from '@/src/hooks/useTodayPlan';
import { useRecoveryScore } from '@/src/hooks/useRecoveryScore';
import { useNotificationStore } from '@/src/store/notification-store';
import {
  StatusPill,
  HeroScore,
  CountdownRow,
  CollapsedPast,
  InsightLine,
  WindDownView,
  TimelineEvent,
} from '@/src/components/today';
import { GradientMeshBackground } from '@/src/components/ui';
import { useUserStore } from '@/src/store/user-store';
import { getTipOfTheDay } from '@/src/lib/tips/sleep-tips';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  TEXT as TEXT_COLORS,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// State determination
// ---------------------------------------------------------------------------

type TodayState = 'empty' | 'recovery' | 'on-shift' | 'wind-down' | 'night-sky';

function getTodayState(
  nightSky: { isActive: boolean; minutesUntilSleep: number },
  isEmpty: boolean,
  currentShift: unknown | null,
  windDownLeadMinutes: number,
): TodayState {
  if (nightSky.isActive) return 'night-sky';
  if (isEmpty && !currentShift) return 'empty';
  if (
    nightSky.minutesUntilSleep !== null &&
    nightSky.minutesUntilSleep !== Infinity &&
    nightSky.minutesUntilSleep <= windDownLeadMinutes &&
    nightSky.minutesUntilSleep > 0
  ) {
    return 'wind-down';
  }
  if (currentShift) return 'on-shift';
  return 'recovery';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format as H:MM for < 24h, e.g. "2:14" or "14:16". Matches V6 mockup style. */
function formatCountdownValue(targetTime: Date): string {
  const now = new Date();
  const mins = differenceInMinutes(targetTime, now);
  if (mins <= 0) return '0:00';
  if (mins < 60) return `0:${mins.toString().padStart(2, '0')}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------------------------------------------------------------------------
// Wind-down checklist items
// ---------------------------------------------------------------------------

const DEFAULT_WIND_DOWN_CHECKLIST = [
  { id: 'dim-lights', label: 'Dim the lights', completed: false },
  { id: 'screens-off', label: 'Screens off or night mode', completed: false },
  { id: 'set-alarm', label: 'Set your alarm', completed: false },
  { id: 'cool-room', label: 'Cool room temperature', completed: false },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const regeneratePlan = usePlanStore((s) => s.regeneratePlan);
  const isGenerating = usePlanStore((s) => s.isGenerating);
  const shifts = useShiftsStore((s) => s.shifts);

  const {
    todayBlocks,
    activeBlock,
    nextBlock,
    countdowns,
    currentShift,
    isEmpty,
  } = useTodayPlan();

  const plan = usePlanStore((s) => s.plan);
  const planError = usePlanStore((s) => s.error);
  const clearError = usePlanStore((s) => s.clearError);
  const profile = useUserStore((s) => s.profile);
  const canAccess = usePremiumStore((s) => s.canAccess);
  const windDownLeadMinutes = useNotificationStore((s) => s.windDownLeadMinutes);

  // Recovery score data
  const recovery = useRecoveryScore();
  const showRecovery =
    !recovery.isLoading &&
    canAccess('accuracy_tracking') &&
    (recovery.lastNight !== null ||
     recovery.weeklyAccuracy !== null ||
     recovery.adherenceScore !== null);

  const hasShifts = shifts.length > 0;
  const now = new Date();

  // Night Sky Mode detection
  const nightSky = useNightSkyMode();

  // Determine today state
  const todayState = getTodayState(nightSky, isEmpty, currentShift, windDownLeadMinutes);

  // Get today's day type for insight
  const todayDayType = plan?.classifiedDays?.find(
    (d) => d.date.toDateString() === now.toDateString()
  )?.dayType ?? 'off';

  // Past/future block split
  const [pastExpanded, setPastExpanded] = useState(false);
  const pastBlocks = useMemo(
    () => todayBlocks.filter((b) => b.end.getTime() < now.getTime() && activeBlock?.id !== b.id),
    [todayBlocks, now, activeBlock],
  );
  const futureBlocks = useMemo(
    () => todayBlocks.filter((b) => b.end.getTime() >= now.getTime() || activeBlock?.id === b.id),
    [todayBlocks, now, activeBlock],
  );

  // Wind-down checklist state
  const [windDownChecklist, setWindDownChecklist] = useState(DEFAULT_WIND_DOWN_CHECKLIST);
  const handleToggleCheckItem = useCallback((id: string) => {
    setWindDownChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    regeneratePlan();
  }, [regeneratePlan]);

  // Navigate to schedule tab
  const goToSchedule = () => {
    router.push('/(tabs)/schedule');
  };

  // -- Build status pill props --
  const statusPillProps = useMemo(() => {
    if (todayState === 'on-shift' && currentShift) {
      const shiftLabel =
        currentShift.shiftType === 'night'
          ? 'Night Shift'
          : currentShift.shiftType === 'evening'
            ? 'Evening Shift'
            : currentShift.shiftType === 'extended'
              ? 'Extended Shift'
              : 'Day Shift';
      return {
        state: 'on-shift' as const,
        primaryText: `${shiftLabel} Active`,
        secondaryText: `Ends at ${format(currentShift.end, 'h:mm a')}`,
      };
    }
    if (todayState === 'wind-down') {
      return {
        state: 'wind-down' as const,
        primaryText: 'Wind-down Active',
        secondaryText: `${nightSky.minutesUntilSleep > 0 ? Math.round(nightSky.minutesUntilSleep) : 0} min to bedtime`,
      };
    }
    return {
      state: 'recovery' as const,
      primaryText: 'Recovery Day',
      secondaryText: format(now, 'EEEE, MMMM d'),
    };
  }, [todayState, currentShift, nightSky.minutesUntilSleep, now]);

  // -- Build countdown cells from existing countdowns data --
  const countdownCells = useMemo(() => {
    return countdowns.map((c) => ({
      emoji: c.emoji,
      value: formatCountdownValue(c.targetTime),
      label: c.label,
      color: c.color,
    }));
  }, [countdowns]);

  // -- On-shift countdown cells --
  const onShiftCells = useMemo(() => {
    if (!currentShift) return [];
    const shiftEndMins = differenceInMinutes(currentShift.end, now);
    const sleepBlock = todayBlocks.find((b) => b.type === 'main-sleep' && b.start > now);
    const cells = [
      {
        emoji: '\u{23F1}',
        value: formatCountdownValue(currentShift.end),
        label: 'Shift ends',
        color: '#FF9F43',
      },
    ];
    if (sleepBlock) {
      cells.push({
        emoji: '\u{1F634}',
        value: formatCountdownValue(sleepBlock.start),
        label: 'Sleep window',
        color: BLOCK_COLORS.sleep,
      });
    }
    cells.push({
      emoji: '\u{1F3AF}',
      value: `${profile.sleepNeed ?? 7.5}h`,
      label: 'Target sleep',
      color: '#34D399',
    });
    return cells.slice(0, 3);
  }, [currentShift, now, todayBlocks, profile.sleepNeed]);

  // -- Kitchen closes: end of last upcoming meal-window block (circadian TRE) --
  const kitchenClosesCell = useMemo(() => {
    const nowMs = Date.now();
    // Prefer last meal-window block end (algorithm-computed TRE cutoff)
    const mealBlock = [...futureBlocks]
      .reverse()
      .find((b) => b.type === 'meal-window' && b.end.getTime() > nowMs);
    if (mealBlock) {
      return {
        emoji: '\u{1F37D}\u{FE0F}', // 🍽️
        value: formatCountdownValue(mealBlock.end),
        label: 'Kitchen closes',
        color: '#F59E0B',
      };
    }
    // Fallback: 3h before main sleep (circadian TRE standard — Manoogian et al. 2022)
    const sleepBlock = futureBlocks.find((b) => b.type === 'main-sleep');
    if (!sleepBlock) return null;
    const kitchenClose = new Date(sleepBlock.start.getTime() - 3 * 60 * 60 * 1000);
    if (kitchenClose.getTime() <= nowMs) return null; // window already closed
    return {
      emoji: '\u{1F37D}\u{FE0F}', // 🍽️
      value: formatCountdownValue(kitchenClose),
      label: 'Kitchen closes',
      color: '#F59E0B',
    };
  }, [futureBlocks]);

  // -- Recovery countdown cells: Caffeine + Wind-down + Sleep + Kitchen Closes --
  const recoveryCells = useMemo(() => {
    const base = countdowns.map((c) => ({
      emoji: c.emoji,
      value: formatCountdownValue(c.targetTime),
      label: c.label,
      color: c.color,
    }));
    if (kitchenClosesCell) {
      // Insert Kitchen Closes as first cell (most actionable during daytime)
      return [kitchenClosesCell, ...base].slice(0, 4);
    }
    return base;
  }, [countdowns, kitchenClosesCell]);

  // -- Recovery score for HeroScore --
  const heroScoreData = useMemo(() => {
    const score =
      recovery.weeklyAccuracy?.overallScore ??
      recovery.lastNight?.adherenceScore ??
      recovery.adherenceScore ?? 0;
    const weeklyScores = (
      recovery.dailyScores.length > 0
        ? recovery.dailyScores
        : recovery.adherenceDailyScores
    ).map((d) => d.score ?? 0);
    // Pad to 7 if needed
    while (weeklyScores.length < 7) weeklyScores.unshift(0);
    const prevDayScore = weeklyScores.length >= 2 ? weeklyScores[weeklyScores.length - 2] : 0;
    const trend = score - prevDayScore;
    return {
      score: Math.round(score),
      sleepHours: recovery.lastNight?.actual?.totalHours ?? profile.sleepNeed ?? 7.5,
      targetHours: profile.sleepNeed ?? 7.5,
      weeklyScores: weeklyScores.slice(-7),
      trend: Math.round(trend),
    };
  }, [recovery, profile.sleepNeed]);

  // -- Insight text --
  const insightText = useMemo(() => {
    if (todayState === 'on-shift') {
      return 'Wear sunglasses on your commute home to protect your circadian rhythm.';
    }
    if (todayState === 'wind-down') {
      return `Target: ${profile.sleepNeed ?? 7.5}h of sleep tonight. Start winding down now.`;
    }
    if (recovery.weeklyAccuracy?.insight) {
      return recovery.weeklyAccuracy.insight;
    }
    const tip = getTipOfTheDay(todayDayType, profile);
    return tip?.text ?? 'Stay consistent with your sleep schedule for best results.';
  }, [todayState, recovery.weeklyAccuracy?.insight, todayDayType, profile]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <GradientMeshBackground>
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Animated.ScrollView
            ref={scrollRef}
            style={styles.screen}
            contentContainerStyle={styles.content}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={isGenerating}
                onRefresh={onRefresh}
                tintColor={COLORS.accent.primary}
                progressBackgroundColor={COLORS.background.surface}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Error banner */}
            {planError && (
              <Pressable
                onPress={() => {
                  clearError();
                  regeneratePlan();
                }}
                style={styles.errorBanner}
              >
                <Text style={styles.errorText}>
                  Plan generation failed. Tap to retry.
                </Text>
              </Pressable>
            )}

            {/* ============================================================ */}
            {/* HEADER: Greeting + Date (all states except empty)           */}
            {/* ============================================================ */}
            {todayState !== 'empty' && todayState !== 'night-sky' && (
              <View style={styles.header}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.dateHeadline}>{format(now, 'EEEE, MMMM d')}</Text>
              </View>
            )}

            {/* ============================================================ */}
            {/* STATE: Empty                                                  */}
            {/* ============================================================ */}
            {todayState === 'empty' && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{'\u{1F680}'}</Text>
                <Text style={styles.emptyTitle}>Let&apos;s Get Started</Text>
                <Text style={styles.emptyBody}>
                  Import or add your shifts to get a personalized sleep plan
                  built around your schedule.
                </Text>
                <Pressable onPress={goToSchedule} style={styles.gradientButton}>
                  <Text style={styles.gradientButtonText}>Add Your Shifts</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/import')}>
                  <Text style={styles.importLink}>Import from calendar</Text>
                </Pressable>
              </View>
            )}

            {/* ============================================================ */}
            {/* STATE: Recovery                                               */}
            {/* ============================================================ */}
            {todayState === 'recovery' && (
              <View>
                {/* Status Pill */}
                <View style={styles.section}>
                  <StatusPill {...statusPillProps} />
                </View>

                {/* Hero Score */}
                {showRecovery && (
                  <View style={styles.section}>
                    <HeroScore {...heroScoreData} scrollOffset={scrollY} />
                  </View>
                )}

                {/* Countdown Row */}
                {recoveryCells.length > 0 && (
                  <View style={styles.section}>
                    <CountdownRow cells={recoveryCells} />
                  </View>
                )}

                {/* Timeline */}
                {todayBlocks.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>TODAY'S PLAN</Text>
                    {/* Collapsed past */}
                    {pastBlocks.length > 0 && (
                      <CollapsedPast
                        events={pastBlocks.map((b) => ({ type: b.type }))}
                        onExpand={() => setPastExpanded(!pastExpanded)}
                        isExpanded={pastExpanded}
                      />
                    )}

                    {/* Expanded past blocks */}
                    {pastExpanded &&
                      pastBlocks.map((block) => (
                        <TimelineEvent
                          key={block.id}
                          block={block}
                          isActive={false}
                          isNext={false}
                          isPast
                        />
                      ))}

                    {/* Future + active blocks */}
                    {futureBlocks.map((block) => {
                      const isActive = activeBlock?.id === block.id;
                      const isNext = nextBlock?.id === block.id;
                      return (
                        <TimelineEvent
                          key={block.id}
                          block={block}
                          isActive={isActive}
                          isNext={isNext}
                          isPast={false}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Insight Line */}
                <InsightLine text={insightText} />
              </View>
            )}

            {/* ============================================================ */}
            {/* STATE: On Shift                                               */}
            {/* ============================================================ */}
            {todayState === 'on-shift' && (
              <View>
                {/* Status Pill */}
                <View style={styles.section}>
                  <StatusPill {...statusPillProps} />
                </View>

                {/* Countdown Row */}
                {onShiftCells.length > 0 && (
                  <View style={styles.section}>
                    <CountdownRow cells={onShiftCells} />
                  </View>
                )}

                {/* Warning Insight */}
                <View style={styles.section}>
                  <InsightLine text={insightText} />
                </View>

                {/* Timeline: after-shift events */}
                {futureBlocks.length > 0 && (
                  <View style={styles.section}>
                    {futureBlocks.map((block) => {
                      const isActive = activeBlock?.id === block.id;
                      const isNext = nextBlock?.id === block.id;
                      return (
                        <TimelineEvent
                          key={block.id}
                          block={block}
                          isActive={isActive}
                          isNext={isNext}
                          isPast={false}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ============================================================ */}
            {/* STATE: Wind-down                                              */}
            {/* ============================================================ */}
            {todayState === 'wind-down' && (
              <View>
                {/* Status Pill */}
                <View style={styles.section}>
                  <StatusPill {...statusPillProps} />
                </View>

                {/* Wind Down View */}
                <WindDownView
                  minutesUntilBedtime={
                    nightSky.minutesUntilSleep > 0
                      ? Math.round(nightSky.minutesUntilSleep)
                      : 0
                  }
                  sleepTime={nightSky.alarmTime ?? new Date()}
                  checklist={windDownChecklist}
                  onToggleItem={handleToggleCheckItem}
                  insight={insightText}
                />
              </View>
            )}
          </Animated.ScrollView>
        </SafeAreaView>

        {/* Night Sky Mode overlay */}
        {todayState === 'night-sky' && nightSky.alarmTime && nightSky.latestWakeTime && (
          <NightSkyOverlay
            alarmTime={nightSky.alarmTime}
            latestWakeTime={nightSky.latestWakeTime}
            tomorrowSchedule={nightSky.tomorrowSchedule}
            fillFraction={nightSky.fillFraction}
            onDismiss={() => {}}
          />
        )}
      </View>
    </GradientMeshBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['3xl'] + 80, // extra for floating tab bar
  },

  /* Error */
  errorBanner: {
    backgroundColor: COLORS.semantic.errorMuted,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.semantic.error,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.semantic.error,
    textAlign: 'center',
  },

  /* Sections */
  section: {
    marginBottom: SPACING['2xl'],
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    flex: 1,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyBody: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: SPACING['2xl'],
  },
  gradientButton: {
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginBottom: SPACING.lg,
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  importLink: {
    fontSize: 12,
    color: TEXT_COLORS.muted,
    textDecorationLine: 'underline',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 15,
    color: COLORS.text.tertiary,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  dateHeadline: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    marginTop: 3,
  },
});
