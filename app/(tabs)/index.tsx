import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import { usePredictionStore } from '@/src/store/prediction-store';
import { useTodayPlan } from '@/src/hooks/useTodayPlan';
import { useRecoveryScore } from '@/src/hooks/useRecoveryScore';
import { useAdaptivePlan } from '@/src/hooks/useAdaptivePlan';
import { useSleepFeedback } from '@/src/hooks/useSleepFeedback';
import { useNotificationStore } from '@/src/store/notification-store';
import {
  StatusPill,
  HeroScore,
  CountdownRow,
  CollapsedPast,
  InsightLine,
  WindDownView,
  TimelineEvent,
  SleepDebtCard,
  ScoreBreakdownCard,
  ScienceInsightCard,
  NapCalculatorModal,
  PatternAlertCard,
  AdaptiveInsightCard,
  WeeklyBriefCard,
  CircadianForecastCard,
} from '@/src/components/today';
import { useBriefStore } from '@/src/store/brief-store';
import { useWeeklyBrief } from '@/src/hooks/useWeeklyBrief';
import { GradientMeshBackground } from '@/src/components/ui';
import { LightProtocolStrip } from '@/src/components/circadian/LightProtocolStrip';
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
// PremiumFeatureGate — locked card shown when adaptive_brain is not accessible
// ---------------------------------------------------------------------------

interface PremiumFeatureGateProps {
  title: string;
  description: string;
  onUpgrade: () => void;
}

function PremiumFeatureGate({ title, description, onUpgrade }: PremiumFeatureGateProps) {
  return (
    <Pressable onPress={onUpgrade} style={gateStyles.card}>
      <View style={gateStyles.lockRow}>
        <Text style={gateStyles.lockIcon}>{'\u{1F512}'}</Text>
        <Text style={gateStyles.title}>{title}</Text>
      </View>
      <Text style={gateStyles.description}>{description}</Text>
      <View style={gateStyles.cta}>
        <Text style={gateStyles.ctaText}>Unlock Premium</Text>
      </View>
    </Pressable>
  );
}

const gateStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(200, 168, 75, 0.06)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200, 168, 75, 0.3)',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  lockIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});

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
  const canUseAdaptiveBrain = canAccess('adaptive_brain');
  const windDownLeadMinutes = useNotificationStore((s) => s.windDownLeadMinutes);

  // Adaptive Brain — assembles HealthKit context on mount, triggers plan adjustment
  const { context: adaptiveContext, changes: adaptiveChanges } = useAdaptivePlan();

  // Sleep Feedback — runs after adaptive brain, records plan-vs-actual discrepancy
  useSleepFeedback();

  // Weekly Brief — checks if today is Monday and triggers Claude API if needed
  useWeeklyBrief();

  // Predictive Calendar Engine — refresh predictions daily (Phase 22)
  const refreshPredictions = usePredictionStore((s) => s.refreshPredictions);
  const adaptiveContextForPrediction = usePlanStore((s) => s.adaptiveContext);
  useEffect(() => {
    if (shifts.length === 0) return;

    const predictionShifts = shifts.slice(0, 28).map((s) => ({
      date: s.start.toISOString().slice(0, 10),
      startHour: s.start.getHours(),
      endHour: s.end.getHours(),
      type: (s.shiftType === 'extended' ? 'night' : s.shiftType) as 'day' | 'evening' | 'night' | 'off',
    }));

    const sleepDebt = adaptiveContextForPrediction?.debt.rollingHours ?? 0;
    const baselineMidsleep = 2.5; // default intermediate chronotype

    refreshPredictions({
      shifts: predictionShifts,
      currentSleepDebt: Math.max(0, sleepDebt),
      baselineMidsleep,
      lookAheadDays: 14,
    });
  }, [shifts, refreshPredictions, adaptiveContextForPrediction]);

  const currentBrief = useBriefStore((s) => s.currentBrief);
  const briefEnabled = useBriefStore((s) => s.enabled);
  const dismissBrief = useBriefStore((s) => s.dismissCurrentBrief);
  const showBriefCard = briefEnabled && currentBrief !== null;
  const undoPlan = usePlanStore((s) => s.undoPlan);
  const dismissChanges = usePlanStore((s) => s.dismissChanges);
  const debtContext = usePlanStore((s) => s.adaptiveContext?.debt);
  const showDebtCard = debtContext
    ? (debtContext.severity !== 'none' || debtContext.bankHours > 0)
    : true; // fallback: show when no context yet

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

  // Light protocol blocks for LightProtocolStrip
  const lightBlocks = useMemo(
    () => todayBlocks.filter((b) => b.type === 'light-seek' || b.type === 'light-avoid'),
    [todayBlocks],
  );

  const isTransitionDay = useMemo(
    () =>
      todayDayType === 'transition-to-nights' ||
      todayDayType === 'transition-to-days' ||
      todayDayType === 'recovery',
    [todayDayType],
  );

  const goToCircadian = useCallback(() => {
    router.push('/(tabs)/circadian');
  }, [router]);

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

  // Nap Calculator modal state
  const [showNapCalc, setShowNapCalc] = useState(false);

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

  // -- On-shift countdown cells (Feature 4 polish) --
  const onShiftCells = useMemo(() => {
    if (!currentShift) return [];
    const shiftDurationMs = currentShift.end.getTime() - currentShift.start.getTime();
    const sleepBlock = todayBlocks.find((b) => b.type === 'main-sleep' && b.start > now);

    // Shift end cell (always first)
    const cells: Array<{ emoji: string; value: string; label: string; color: string }> = [
      {
        emoji: '\u{23F1}',
        value: formatCountdownValue(currentShift.end),
        label: 'Shift ends',
        color: '#FF9F43',
      },
    ];

    // Mid-shift nap window: optimal at 40% into shift (avoids post-shift lag)
    const napWindowStart = new Date(currentShift.start.getTime() + shiftDurationMs * 0.4);
    const napWindowEnd = new Date(napWindowStart.getTime() + 20 * 60 * 1000);
    if (napWindowEnd > now && napWindowStart < currentShift.end) {
      if (napWindowStart <= now && now <= napWindowEnd) {
        cells.push({ emoji: '\u{1F4A4}', value: 'NOW', label: 'Nap window', color: '#34D399' });
      } else if (napWindowStart > now) {
        cells.push({
          emoji: '\u{1F4A4}',
          value: formatCountdownValue(napWindowStart),
          label: 'Nap window',
          color: '#A78BFA',
        });
      }
    }

    // Caffeine cutoff: halfway into shift = last effective caffeine time
    const caffeineEnd = new Date(currentShift.start.getTime() + shiftDurationMs / 2);
    if (caffeineEnd > now && caffeineEnd < currentShift.end) {
      cells.push({
        emoji: '\u2615',
        value: formatCountdownValue(caffeineEnd),
        label: 'Last caffeine',
        color: '#FB923C',
      });
    } else if (sleepBlock) {
      cells.push({
        emoji: '\u{1F634}',
        value: formatCountdownValue(sleepBlock.start),
        label: 'Sleep window',
        color: BLOCK_COLORS.sleep,
      });
    }

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
      sleepHours: recovery.lastNight?.actual
        ? recovery.lastNight.actual.durationMinutes / 60
        : (profile.sleepNeed ?? 7.5),
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
    return tip?.body ?? 'Stay consistent with your sleep schedule for best results.';
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

                {/* Adaptive Insight Card — premium gate (adaptive_brain) */}
                {canUseAdaptiveBrain ? (
                  adaptiveContext && adaptiveChanges.length > 0 && (
                    <View style={styles.section}>
                      <AdaptiveInsightCard
                        changes={adaptiveChanges}
                        context={adaptiveContext}
                        onUndo={undoPlan}
                        onDismiss={dismissChanges}
                      />
                    </View>
                  )
                ) : (
                  <View style={styles.section}>
                    <PremiumFeatureGate
                      title="Adaptive Brain"
                      description="Your plan adapts automatically to your sleep debt and circadian phase."
                      onUpgrade={() => router.push('/paywall')}
                    />
                  </View>
                )}

                {/* Weekly Sleep Brief (Phase 20) — Mondays only, until dismissed */}
                {showBriefCard && currentBrief && (
                  <View style={styles.section}>
                    <WeeklyBriefCard
                      brief={currentBrief}
                      onDismiss={dismissBrief}
                    />
                  </View>
                )}

                {/* Pattern Alerts (Feature 6) */}
                <View style={styles.section}>
                  <PatternAlertCard />
                </View>

                {/* Light Protocol Strip — transition days only */}
                {isTransitionDay && lightBlocks.length > 0 && (
                  <View style={styles.section}>
                    <LightProtocolStrip
                      lightBlocks={lightBlocks}
                      onNavigateToFull={goToCircadian}
                    />
                  </View>
                )}

                {/* Hero Score */}
                {showRecovery && (
                  <View style={styles.section}>
                    <HeroScore {...heroScoreData} scrollOffset={scrollY} />
                  </View>
                )}

                {/* Score Breakdown (Feature 5) */}
                {showRecovery && heroScoreData.score > 0 && (
                  <View style={styles.section}>
                    <ScoreBreakdownCard score={heroScoreData.score} />
                  </View>
                )}

                {/* Sleep Debt Tracker (Feature 1) — premium gate (adaptive_brain) */}
                {canUseAdaptiveBrain && showDebtCard && (
                  <View style={styles.section}>
                    <SleepDebtCard />
                  </View>
                )}

                {/* Circadian Forecast Card (Phase 22) — upcoming transitions */}
                <View style={styles.section}>
                  <CircadianForecastCard />
                </View>

                {/* Countdown Row */}
                {recoveryCells.length > 0 && (
                  <View style={styles.section}>
                    <CountdownRow cells={recoveryCells} />
                  </View>
                )}

                {/* Nap Calculator button (Feature 2) */}
                <View style={styles.section}>
                  <Pressable
                    onPress={() => setShowNapCalc(true)}
                    style={styles.napCalcButton}
                  >
                    <Text style={styles.napCalcEmoji}>{'\u{1F4A4}'}</Text>
                    <View style={styles.napCalcText}>
                      <Text style={styles.napCalcTitle}>Nap Calculator</Text>
                      <Text style={styles.napCalcSub}>Find your optimal nap duration</Text>
                    </View>
                    <Text style={styles.napCalcChevron}>›</Text>
                  </Pressable>
                </View>

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

                {/* Science Insight Card (Feature 3) */}
                <View style={styles.section}>
                  <ScienceInsightCard dayType={todayDayType} />
                </View>
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

                {/* Adaptive Insight Card — premium gate (adaptive_brain) */}
                {canUseAdaptiveBrain && adaptiveContext && adaptiveChanges.length > 0 && (
                  <View style={styles.section}>
                    <AdaptiveInsightCard
                      changes={adaptiveChanges}
                      context={adaptiveContext}
                      onUndo={undoPlan}
                      onDismiss={dismissChanges}
                    />
                  </View>
                )}

                {/* Pattern Alerts (Feature 6) */}
                <View style={styles.section}>
                  <PatternAlertCard />
                </View>

                {/* Light Protocol Strip — transition days only */}
                {isTransitionDay && lightBlocks.length > 0 && (
                  <View style={styles.section}>
                    <LightProtocolStrip
                      lightBlocks={lightBlocks}
                      onNavigateToFull={goToCircadian}
                    />
                  </View>
                )}

                {/* Countdown Row (Feature 4: now includes nap window + caffeine) */}
                {onShiftCells.length > 0 && (
                  <View style={styles.section}>
                    <CountdownRow cells={onShiftCells} />
                  </View>
                )}

                {/* Nap Calculator button (Feature 2) */}
                <View style={styles.section}>
                  <Pressable
                    onPress={() => setShowNapCalc(true)}
                    style={styles.napCalcButton}
                  >
                    <Text style={styles.napCalcEmoji}>{'\u{1F4A4}'}</Text>
                    <View style={styles.napCalcText}>
                      <Text style={styles.napCalcTitle}>Nap Calculator</Text>
                      <Text style={styles.napCalcSub}>Find your optimal nap duration</Text>
                    </View>
                    <Text style={styles.napCalcChevron}>›</Text>
                  </Pressable>
                </View>

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

                {/* Science Insight Card (Feature 3) */}
                <View style={styles.section}>
                  <ScienceInsightCard dayType="work-day" />
                </View>
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

        {/* Nap Calculator Modal (Feature 2) */}
        <NapCalculatorModal
          visible={showNapCalc}
          onClose={() => setShowNapCalc(false)}
        />
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

  /* Nap Calculator button */
  napCalcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  napCalcEmoji: {
    fontSize: 24,
  },
  napCalcText: {
    flex: 1,
  },
  napCalcTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  napCalcSub: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  napCalcChevron: {
    fontSize: 20,
    color: COLORS.text.muted,
    fontWeight: '300',
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
