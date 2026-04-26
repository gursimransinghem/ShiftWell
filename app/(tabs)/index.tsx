import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, isWithinInterval } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlanStore } from '@/src/store/plan-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useTrackingStore } from '@/src/store/tracking-store';
import { useTodayPlan } from '@/src/hooks/useTodayPlan';
import { useRecoveryScore } from '@/src/hooks/useRecoveryScore';
import { useLiveActivity } from '@/src/hooks/useLiveActivity';
import { TimelineEvent, CountdownCard, TipCard, InsightBanner } from '@/src/components/today';
import { RecoveryScoreCard, SleepComparisonCard, WeeklyTrendChart } from '@/src/components/recovery';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import { useUserStore } from '@/src/store/user-store';
import { getTipOfTheDay } from '@/src/lib/tips/sleep-tips';
import {
  COLORS,
  BLOCK_COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// Greeting helper
// ---------------------------------------------------------------------------

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

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

  // Live Activity (Lock Screen plan preview)
  useLiveActivity();

  // Debrief prompt: show if a main-sleep block ended in the last 2 hours and no debrief logged today
  const getDebriefForDate = useTrackingStore((s) => s.getDebriefForDate);
  const showDebrief = React.useMemo(() => {
    if (!plan) return false;
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const recentSleep = plan.blocks.find(
      (b) =>
        b.type === 'main-sleep' &&
        b.end.getTime() < now.getTime() &&
        b.end.getTime() > twoHoursAgo.getTime(),
    );
    if (!recentSleep) return false;
    return !getDebriefForDate(now);
  }, [plan, now, getDebriefForDate]);

  // Recovery score data (from HealthKit)
  const recovery = useRecoveryScore();
  const showRecovery =
    recovery.isAvailable &&
    !recovery.isLoading &&
    canAccess('accuracy_tracking') &&
    (recovery.lastNight !== null || recovery.weeklyAccuracy !== null);

  const hasShifts = shifts.length > 0;
  const now = new Date();

  // Get today's day type and tip
  const todayDayType = plan?.classifiedDays?.find(
    (d) => d.date.toDateString() === now.toDateString()
  )?.dayType ?? 'off';
  const tipOfTheDay = getTipOfTheDay(todayDayType, profile);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    regeneratePlan();
  }, [regeneratePlan]);

  // -- Status header text --
  let statusTitle: string;
  let statusSubtitle: string | null = null;

  if (
    currentShift &&
    isWithinInterval(now, { start: currentShift.start, end: currentShift.end })
  ) {
    const shiftLabel =
      currentShift.shiftType === 'night'
        ? 'Night Shift'
        : currentShift.shiftType === 'evening'
          ? 'Evening Shift'
          : currentShift.shiftType === 'extended'
            ? 'Extended Shift'
            : 'Day Shift';
    statusTitle = `On Shift \u2014 ${shiftLabel}`;
    statusSubtitle = `Ends at ${format(currentShift.end, 'HH:mm')}`;
  } else if (activeBlock && activeBlock.type === 'main-sleep') {
    statusTitle = 'Sleep Window';
    statusSubtitle = 'Rest well';
  } else if (activeBlock && activeBlock.type === 'nap') {
    statusTitle = 'Nap Time';
    statusSubtitle = 'Quick recharge';
  } else {
    statusTitle = greeting();
    statusSubtitle = format(now, 'EEEE, MMM d');
  }

  // Navigation
  const goToSchedule = () => router.push('/(tabs)/schedule');
  const goToCaffeine = () => router.push('/caffeine');
  const goToLight = () => router.push('/light');
  const goToDebrief = () => router.push('/debrief');

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SPACING['3xl'] },
      ]}
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
      {/* ------------------------------------------------------------------ */}
      {/* Status header                                                       */}
      {/* ------------------------------------------------------------------ */}
      <View style={styles.header}>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        {statusSubtitle && (
          <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Error banner                                                         */}
      {/* ------------------------------------------------------------------ */}
      {planError && (
        <Pressable onPress={() => { clearError(); regeneratePlan(); }} style={styles.errorBanner}>
          <Text style={styles.errorText}>
            ⚠ Plan generation failed. Tap to retry.
          </Text>
        </Pressable>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Recovery Score section (HealthKit data)                              */}
      {/* ------------------------------------------------------------------ */}
      {showRecovery && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECOVERY</Text>
          <RecoveryScoreCard
            score={recovery.weeklyAccuracy?.overallScore ?? recovery.lastNight?.adherenceScore ?? null}
            insight={recovery.weeklyAccuracy?.insight ?? recovery.lastNight?.insight ?? ''}
            streakDays={recovery.weeklyAccuracy?.streakDays ?? 0}
            weeklyTrend={recovery.weeklyAccuracy?.weeklyTrend ?? 'stable'}
          />
          {recovery.lastNight && (
            <View style={{ marginTop: SPACING.md }}>
              <SleepComparisonCard comparison={recovery.lastNight} />
            </View>
          )}
          {recovery.dailyScores.length > 0 && (
            <View style={{ marginTop: SPACING.md }}>
              <WeeklyTrendChart dailyScores={recovery.dailyScores} />
            </View>
          )}
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Countdown section                                                   */}
      {/* ------------------------------------------------------------------ */}
      {countdowns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMING UP</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.countdownRow}
          >
            {countdowns.map((c, i) => (
              <CountdownCard
                key={`${c.label}-${i}`}
                label={c.label}
                targetTime={c.targetTime}
                color={c.color}
                emoji={c.emoji}
                isUrgent={i === 0}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Insight banner                                                      */}
      {/* ------------------------------------------------------------------ */}
      {plan && hasShifts && (
        <View style={styles.section}>
          <InsightBanner
            dayType={todayDayType}
            stats={plan.stats}
            profile={profile}
          />
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Debrief prompt                                                      */}
      {/* ------------------------------------------------------------------ */}
      {showDebrief && (
        <Pressable onPress={goToDebrief} style={styles.debriefBanner}>
          <Text style={styles.debriefEmoji}>{'\u{1F4DD}'}</Text>
          <View style={styles.debriefContent}>
            <Text style={styles.debriefTitle}>How did you sleep?</Text>
            <Text style={styles.debriefBody}>Quick debrief helps track your recovery</Text>
          </View>
          <Text style={styles.debriefArrow}>{'\u{203A}'}</Text>
        </Pressable>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Tracking quick-access                                               */}
      {/* ------------------------------------------------------------------ */}
      {hasShifts && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRACK</Text>
          <View style={styles.trackRow}>
            <Pressable onPress={goToCaffeine} style={styles.trackCard}>
              <Text style={styles.trackEmoji}>{'\u{2615}'}</Text>
              <Text style={styles.trackLabel}>Caffeine</Text>
            </Pressable>
            <Pressable onPress={goToLight} style={styles.trackCard}>
              <Text style={styles.trackEmoji}>{'\u{2600}'}</Text>
              <Text style={styles.trackLabel}>Light</Text>
            </Pressable>
            <Pressable onPress={goToDebrief} style={styles.trackCard}>
              <Text style={styles.trackEmoji}>{'\u{1F4DD}'}</Text>
              <Text style={styles.trackLabel}>Debrief</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Tip of the day                                                      */}
      {/* ------------------------------------------------------------------ */}
      {tipOfTheDay && hasShifts && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TIP OF THE DAY</Text>
          <TipCard tip={tipOfTheDay} />
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Timeline section                                                    */}
      {/* ------------------------------------------------------------------ */}
      {!isEmpty && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TODAY&apos;S PLAN</Text>
          {todayBlocks.map((block) => {
            const isActive = activeBlock?.id === block.id;
            const isNext = nextBlock?.id === block.id;
            const isPast =
              !isActive && !isNext && block.end.getTime() < now.getTime();

            return (
              <TimelineEvent
                key={block.id}
                block={block}
                isActive={isActive}
                isNext={isNext}
                isPast={isPast}
              />
            );
          })}
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty state — no plan but has shifts                                */}
      {/* ------------------------------------------------------------------ */}
      {isEmpty && hasShifts && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>{'\u{1F4CB}'}</Text>
          <Text style={styles.emptyTitle}>No plan for today</Text>
          <Text style={styles.emptyBody}>
            Your upcoming shifts are scheduled but there are no plan blocks for
            today. Pull down to regenerate.
          </Text>
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty state — no shifts at all                                      */}
      {/* ------------------------------------------------------------------ */}
      {!hasShifts && (
        <View style={styles.ctaContainer}>
          <Card style={styles.ctaCard}>
            <Text style={styles.ctaEmoji}>{'\u{1F680}'}</Text>
            <Text style={styles.ctaTitle}>Get started</Text>
            <Text style={styles.ctaBody}>
              Import or add your shifts to get a personalized sleep plan built
              around your schedule.
            </Text>
            <View style={styles.ctaButton}>
              <Button
                title="Add Shifts"
                onPress={goToSchedule}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </Card>
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Subtle CTA when plan exists but no shifts entered                   */}
      {/* ------------------------------------------------------------------ */}
      {isEmpty && !hasShifts && (
        <Card style={styles.bottomCta}>
          <Text style={styles.bottomCtaText}>
            Add shifts to see your optimized plan
          </Text>
          <Button
            title="Go to Schedule"
            onPress={goToSchedule}
            variant="ghost"
            size="sm"
          />
        </Card>
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  /* Header */
  header: {
    marginBottom: SPACING['2xl'],
  },
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
  statusTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
  },
  statusSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },

  /* Sections */
  section: {
    marginBottom: SPACING['2xl'],
  },
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },

  /* Countdown row */
  countdownRow: {
    paddingRight: SPACING.lg,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  /* CTA card (no shifts at all) */
  ctaContainer: {
    marginTop: SPACING['3xl'],
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  ctaEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  ctaTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ctaBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    maxWidth: 280,
  },
  ctaButton: {
    width: '100%',
  },

  /* Bottom CTA */
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  bottomCtaText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    flex: 1,
  },

  /* Debrief prompt */
  debriefBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.accent.primary,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  debriefEmoji: { fontSize: 28, marginRight: SPACING.md },
  debriefContent: { flex: 1 },
  debriefTitle: { ...TYPOGRAPHY.label, color: COLORS.text.primary },
  debriefBody: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginTop: 2 },
  debriefArrow: { ...TYPOGRAPHY.heading2, color: COLORS.text.tertiary },

  /* Tracking quick-access */
  trackRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  trackCard: {
    flex: 1,
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 44,
  },
  trackEmoji: { fontSize: 22, marginBottom: SPACING.xs },
  trackLabel: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary },
});
