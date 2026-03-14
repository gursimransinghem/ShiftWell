/**
 * InsightBanner — contextual insight shown at the top of the Today screen.
 *
 * Displays a situation-aware message based on the current day type,
 * plan statistics, and user profile. Dismissible per-day.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import type { DayType, PlanStats, UserProfile } from '../../lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InsightBannerProps {
  dayType: DayType;
  stats: PlanStats;
  profile: UserProfile;
  /** Optional: override the anchor nap time for display (e.g. "3:00 PM") */
  anchorNapTime?: string;
  /** Night index within a stretch, e.g. 2 of 3 */
  nightIndex?: number;
  nightStretchLength?: number;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

interface InsightContent {
  emoji: string;
  message: string;
  gradientStart: string;
  gradientEnd: string;
}

// ---------------------------------------------------------------------------
// Insight message generator
// ---------------------------------------------------------------------------

function getInsightContent(
  dayType: DayType,
  stats: PlanStats,
  profile: UserProfile,
  anchorNapTime?: string,
  nightIndex?: number,
  nightStretchLength?: number,
): InsightContent {
  // High circadian debt overrides other messages when score is critical
  if (stats.circadianDebtScore >= 70) {
    return {
      emoji: '\u{26A0}\uFE0F',
      message: `Your circadian debt score is ${stats.circadianDebtScore}/100. Prioritize every sleep window this week \u2014 even short naps help reduce accumulated debt.`,
      gradientStart: COLORS.semantic.warningMuted,
      gradientEnd: COLORS.background.surface,
    };
  }

  switch (dayType) {
    case 'transition-to-nights':
      return {
        emoji: '\u{1F319}',
        message: anchorNapTime
          ? `Pre-night shift: Your anchor nap at ${anchorNapTime} is critical for tonight's performance. Protect it like your main sleep.`
          : `Pre-night shift: Take a strategic nap this afternoon (90 min ideal). This pre-loads sleep pressure and boosts your first night.`,
        gradientStart: '#1A1040',
        gradientEnd: COLORS.background.surface,
      };

    case 'work-night':
    case 'work-extended':
      if (nightIndex != null && nightStretchLength != null && nightStretchLength > 1) {
        return {
          emoji: '\u{1F30C}',
          message: `Night ${nightIndex}/${nightStretchLength}: ${
            nightIndex >= 2
              ? 'Your circadian debt is building. Protect tomorrow\'s sleep window and avoid extra caffeine in the last 4 hours of shift.'
              : 'First night is usually the hardest. Use bright light in the first half of your shift to boost alertness.'
          }`,
          gradientStart: '#0F1A3D',
          gradientEnd: COLORS.background.surface,
        };
      }
      return {
        emoji: '\u{1F30C}',
        message: 'Night shift mode: Bright light early in your shift, blue-blocking glasses on your commute home. Your body will thank you.',
        gradientStart: '#0F1A3D',
        gradientEnd: COLORS.background.surface,
      };

    case 'recovery':
      return {
        emoji: '\u{1F6CC}',
        message: `Recovery mode: Today's split sleep strategy will bridge you back to normal. A morning recovery nap + early bedtime is the plan.`,
        gradientStart: '#1A0F3D',
        gradientEnd: COLORS.background.surface,
      };

    case 'transition-to-days':
      return {
        emoji: '\u{1F305}',
        message: 'Transition day: Start delaying your bedtime by 2 hours tonight. Seek bright light when you wake to accelerate your clock shift.',
        gradientStart: '#2D1A0F',
        gradientEnd: COLORS.background.surface,
      };

    case 'work-day':
      if (stats.avgSleepHours < profile.sleepNeed - 1) {
        return {
          emoji: '\u{1F4CA}',
          message: `You're averaging ${stats.avgSleepHours.toFixed(1)}h sleep \u2014 ${(profile.sleepNeed - stats.avgSleepHours).toFixed(1)}h below your ${profile.sleepNeed}h target. Prioritize your wind-down routine tonight.`,
          gradientStart: COLORS.semantic.infoMuted,
          gradientEnd: COLORS.background.surface,
        };
      }
      return {
        emoji: '\u{2600}\uFE0F',
        message: 'Day shift: Stick to your regular sleep schedule tonight. Consistency is the foundation of good circadian health.',
        gradientStart: '#0F2A1A',
        gradientEnd: COLORS.background.surface,
      };

    case 'work-evening':
      return {
        emoji: '\u{1F306}',
        message: 'Evening shift: Avoid bright overhead lights after you get home. A warm-down routine will help you fall asleep despite the late hour.',
        gradientStart: '#2D1A0F',
        gradientEnd: COLORS.background.surface,
      };

    case 'off':
    default:
      if (stats.nightShiftCount > 0 && stats.circadianDebtScore >= 40) {
        return {
          emoji: '\u{1F3AF}',
          message: `Day off with ${stats.nightShiftCount} night shifts this period. Use today to build sleep reserves \u2014 a short nap won't hurt.`,
          gradientStart: COLORS.semantic.infoMuted,
          gradientEnd: COLORS.background.surface,
        };
      }
      return {
        emoji: '\u{2705}',
        message: 'Day off: Enjoy it! Keep your wake time within 1 hour of your usual time to maintain circadian stability.',
        gradientStart: COLORS.semantic.successMuted,
        gradientEnd: COLORS.background.surface,
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InsightBanner({
  dayType,
  stats,
  profile,
  anchorNapTime,
  nightIndex,
  nightStretchLength,
  onDismiss,
}: InsightBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const insight = useMemo(
    () =>
      getInsightContent(
        dayType,
        stats,
        profile,
        anchorNapTime,
        nightIndex,
        nightStretchLength,
      ),
    [dayType, stats, profile, anchorNapTime, nightIndex, nightStretchLength],
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (dismissed) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: insight.gradientStart },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{insight.emoji}</Text>
        <Text style={styles.message}>{insight.message}</Text>
      </View>

      <Pressable
        onPress={handleDismiss}
        style={styles.dismissButton}
        accessibilityRole="button"
        accessibilityLabel="Dismiss insight"
        hitSlop={8}
      >
        <Text style={styles.dismissText}>{'\u00D7'}</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 1,
  },
  message: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  dismissText: {
    fontSize: 20,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: 22,
  },
});
