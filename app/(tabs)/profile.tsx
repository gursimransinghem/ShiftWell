import React, { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useUserStore } from '@/src/store/user-store';
import { useAuthStore } from '@/src/store/auth-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useShiftsStore } from '@/src/store/shifts-store';
import { usePlanStore } from '@/src/store/plan-store';
import { useExport } from '@/src/hooks/useExport';
import { DEFAULT_EXPORT_OPTIONS } from '@/src/lib/calendar/ics-generator';
import { useNotificationStore } from '@/src/store/notification-store';
import { useRecoveryScore } from '@/src/hooks/useRecoveryScore';
import { GradientMeshBackground } from '@/src/components/ui';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  TEXT as TEXT_COLORS,
  BORDER,
  ACCENT,
  BACKGROUND,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHRONOTYPE_LABELS: Record<string, string> = {
  early: 'Early Bird',
  intermediate: 'Intermediate',
  late: 'Night Owl',
};

// ---------------------------------------------------------------------------
// Glass Card helper
// ---------------------------------------------------------------------------

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

function CardRow({
  label,
  value,
  valueColor,
  onPress,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.cardRow}>
      <Text style={styles.cardRowLabel}>{label}</Text>
      {value != null && (
        <Text style={[styles.cardRowValue, valueColor ? { color: valueColor } : undefined]}>
          {value}
        </Text>
      )}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

function CardDivider() {
  return <View style={styles.divider} />;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const profile = useUserStore((s) => s.profile);
  const resetOnboarding = useUserStore((s) => s.resetOnboarding);
  const clearShifts = useShiftsStore((s) => s.clearShifts);
  const shiftCount = useShiftsStore((s) => s.shifts.length);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);

  const isPremium = usePremiumStore((s) => s.isPremium);
  const canAccess = usePremiumStore((s) => s.canAccess);
  const plan = usePlanStore((s) => s.plan);

  const { exportPlan, isExporting } = useExport();
  const windDownEnabled = useNotificationStore((s) => s.windDownEnabled);
  const caffeineCutoffEnabled = useNotificationStore((s) => s.caffeineCutoffEnabled);
  const morningBriefEnabled = useNotificationStore((s) => s.morningBriefEnabled);

  const recovery = useRecoveryScore();

  // Compute stats
  const avgScore = recovery.weeklyAccuracy?.overallScore
    ?? recovery.adherenceScore
    ?? null;
  const streak = recovery.weeklyAccuracy?.streakDays ?? 0;
  const avgSleep = recovery.lastNight?.actual
    ? recovery.lastNight.actual.durationMinutes / 60
    : (profile.sleepNeed ?? 7.5);

  // Count enabled notifications
  const notifCount = [windDownEnabled, caffeineCutoffEnabled, morningBriefEnabled].filter(Boolean).length;

  // Handlers
  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  }, [signOut]);

  const handleExport = useCallback(async () => {
    if (!canAccess('ics_export')) {
      router.push('/paywall');
      return;
    }
    await exportPlan(DEFAULT_EXPORT_OPTIONS);
  }, [exportPlan, canAccess]);

  const handleImport = useCallback(() => {
    if (!canAccess('ics_import')) {
      router.push('/paywall');
      return;
    }
    router.push('/import');
  }, [canAccess]);

  const userName = email?.split('@')[0] ?? 'Shift Worker';

  return (
    <GradientMeshBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Settings gear */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(tabs)/settings')}
          hitSlop={12}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.text.muted} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---- Avatar Header ---- */}
          <View style={styles.avatarHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{'\u{1F31F}'}</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userMeta}>
              {CHRONOTYPE_LABELS[profile.chronotype] ?? profile.chronotype} {'\u00B7'} {profile.sleepNeed}h sleep
            </Text>
            <View style={[styles.planBadge, isPremium ? styles.planBadgePremium : styles.planBadgeFree]}>
              <Text style={[styles.planBadgeText, isPremium ? { color: '#C8A84B' } : { color: TEXT_COLORS.secondary }]}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>

          {/* ---- Stats Row ---- */}
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { color: '#34D399' }]}>
                {avgScore !== null ? Math.round(avgScore) : '--'}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <Text style={[styles.statValue, { color: '#818CF8' }]}>
                {typeof avgSleep === 'number' ? avgSleep.toFixed(1) : '--'}h
              </Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </View>
          </View>

          {/* ---- Preferences ---- */}
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <GlassCard>
            <CardRow label="Notifications" value={`${notifCount} active`} />
            <CardDivider />
            <CardRow label="Strategic naps" value={profile.napPreference ? 'Yes' : 'No'} />
            <CardDivider />
            <CardRow label="Caffeine half-life" value={`${profile.caffeineHalfLife}h`} />
            <CardDivider />
            <CardRow
              label="Edit preferences"
              onPress={() => router.push('/(tabs)/settings')}
            />
          </GlassCard>

          {/* ---- Data ---- */}
          <Text style={styles.sectionLabel}>DATA</Text>
          <GlassCard>
            <CardRow
              label="Export schedule"
              value={plan ? `${shiftCount} shifts` : 'No plan'}
              onPress={handleExport}
            />
            <CardDivider />
            <CardRow
              label="Import shifts"
              onPress={handleImport}
            />
            <CardDivider />
            <CardRow
              label="HealthKit"
              value={recovery.isAvailable ? 'Available' : 'Not available'}
              valueColor={recovery.isAvailable ? '#34D399' : TEXT_COLORS.tertiary}
            />
          </GlassCard>

          {/* ---- Account ---- */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <GlassCard>
            {!isPremium && (
              <>
                <Pressable onPress={() => router.push('/paywall')} style={styles.upgradeRow}>
                  <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                  <Text style={styles.upgradeArrow}>{'\u2192'}</Text>
                </Pressable>
                <CardDivider />
              </>
            )}
            {isAuthenticated ? (
              <Pressable onPress={handleSignOut}>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardRowLabel, { color: COLORS.semantic.error }]}>Sign Out</Text>
                </View>
              </Pressable>
            ) : (
              <CardRow
                label="Sign In"
                onPress={() => router.push('/(auth)/sign-in')}
              />
            )}
          </GlassCard>

          <View style={{ height: SPACING['4xl'] }} />
        </ScrollView>
      </SafeAreaView>
    </GradientMeshBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  settingsBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'] + 80,
  },

  /* Avatar header */
  avatarHeader: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(123,97,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(200,168,75,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 11,
    color: TEXT_COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  planBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  planBadgeFree: {
    backgroundColor: BORDER.strong,
  },
  planBadgePremium: {
    backgroundColor: 'rgba(200,168,75,0.15)',
  },
  planBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: SPACING['2xl'],
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.04)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_COLORS.muted,
  },

  /* Section label */
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: TEXT_COLORS.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },

  /* Glass card */
  glassCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  cardRowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  cardRowValue: {
    ...TYPOGRAPHY.body,
    color: TEXT_COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: SPACING.lg,
  },

  /* Upgrade row */
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C8A84B',
  },
  upgradeArrow: {
    fontSize: 18,
    color: '#C8A84B',
  },
});
