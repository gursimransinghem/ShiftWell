import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientMeshBackground } from '@/src/components/ui';
import { useAuthStore } from '@/src/store/auth-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { getPaywallVariant } from '@/src/lib/growth/paywall-experiment';
import { logExposure } from '@/src/lib/growth/ab-testing';
import { ACCENT, COLORS, RADIUS, SPACING, TEXT as TEXT_COLORS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanKey = 'monthly' | 'annual' | 'lifetime';

interface Plan {
  key: PlanKey;
  label: string;
  subtitle: string;
  price: string;
  period: string;
  perMonth?: string;
  badge?: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Data — Plans
// ---------------------------------------------------------------------------

const PLANS: Plan[] = [
  {
    key: 'monthly',
    label: 'Monthly',
    subtitle: 'Flexible access',
    price: '$6.99',
    period: '/mo',
    detail: 'Full premium tools with the freedom to stay month to month.',
  },
  {
    key: 'annual',
    label: 'Annual',
    subtitle: 'Best for rotating schedules',
    price: '$49.99',
    period: '/yr',
    perMonth: '$4.17/mo',
    badge: 'BEST VALUE · SAVE 40%',
    detail: 'Lowest recurring cost and the best fit if ShiftWell becomes part of your routine.',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    subtitle: 'One decision, no renewals',
    price: '$149.99',
    period: 'once',
    detail: 'Permanent access for people who know they are in this for the long haul.',
  },
];

// ---------------------------------------------------------------------------
// Data — Flagship differentiator cards (2×2 grid)
// ---------------------------------------------------------------------------

const FLAGSHIP = [
  {
    icon: 'calendar-sharp' as const,
    title: 'Smart Scheduling',
    desc: 'Optimal sleep windows calculated around every shift — automatically.',
    accent: '#60A5FA',
    tint: 'rgba(96,165,250,0.12)',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Calendar Export',
    desc: 'Push your sleep plan to Apple Calendar or Google Calendar in one tap.',
    accent: '#34D399',
    tint: 'rgba(52,211,153,0.12)',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'Activity Guide',
    desc: 'Meal timing, exercise windows, and light exposure — timed to your body clock.',
    accent: '#FB923C',
    tint: 'rgba(251,146,60,0.12)',
  },
  {
    icon: 'analytics-outline' as const,
    title: 'Sleep Insights',
    desc: '7-day trends, recovery patterns, and tips personalized to your chronotype.',
    accent: '#A78BFA',
    tint: 'rgba(167,139,250,0.12)',
  },
];

// ---------------------------------------------------------------------------
// Data — Full feature list
// ---------------------------------------------------------------------------

const FEATURES = [
  { icon: 'moon-outline' as const,           label: 'Circadian sleep plan',            free: true },
  { icon: 'add-circle-outline' as const,     label: 'Manual shift entry',              free: true },
  { icon: 'today-outline' as const,          label: 'Today view',                      free: true },
  { icon: 'calendar-sharp' as const,         label: 'Smart shift scheduling',          free: false },
  { icon: 'calendar-outline' as const,       label: 'Native calendar export',          free: false },
  { icon: 'fitness-outline' as const,        label: 'Circadian activity guide',        free: false },
  { icon: 'analytics-outline' as const,      label: 'Personal sleep insights',         free: false },
  { icon: 'restaurant-outline' as const,     label: 'Meal & caffeine timing',          free: false },
  { icon: 'bed-outline' as const,            label: 'Strategic nap placement',         free: false },
  { icon: 'sunny-outline' as const,          label: 'Light exposure protocol',         free: false },
  { icon: 'trophy-outline' as const,         label: 'Daily recovery score',            free: false },
  { icon: 'notifications-outline' as const,  label: 'Smart shift reminders',           free: false },
  { icon: 'star-outline' as const,           label: 'Night Sky Mode',                  free: false },
  { icon: 'phone-portrait-outline' as const, label: 'Live Activities (lock screen)',   free: false },
];

// ---------------------------------------------------------------------------
// Data — Trust signals
// ---------------------------------------------------------------------------

const TRUST = [
  { icon: 'flask-outline' as const, label: '10+ peer-reviewed papers' },
  { icon: 'medical-outline' as const, label: 'Built by an ER physician' },
  { icon: 'people-outline' as const, label: '700M shift workers worldwide' },
];

const HERO_METRICS = [
  { value: '14 days', label: 'risk-free trial' },
  { value: '1 tap', label: 'calendar export' },
  { value: '24/7', label: 'shift-aware planning' },
];

// ---------------------------------------------------------------------------
// Data — Science findings (key research hooks)
// ---------------------------------------------------------------------------

const SCIENCE = [
  {
    stat: '3%',
    color: '#A78BFA',
    finding: 'of night shift workers ever fully adapt circadianly.',
    insight: 'Most apps optimize for full adaptation. ShiftWell optimizes for minimal disruption and maximal recovery within your real rotation — a fundamentally different goal.',
    citation: 'Circadian Biology Research',
  },
  {
    stat: '2×',
    color: '#FF6B6B',
    finding: 'the cognitive impairment of two sleepless nights',
    insight: 'Just 6 hours/night for 14 days creates that deficit — and people don\'t feel as impaired as they are. ShiftWell tracks cumulative debt objectively.',
    citation: 'Van Dongen et al., 2003 · Walter Reed Army Institute',
  },
  {
    stat: '↓CVD',
    color: '#34D399',
    finding: 'Daytime-only eating reduces cardiovascular risk in night workers.',
    insight: 'ShiftWell\'s meal timing engine is built directly on this finding. Your eating windows auto-adjust with every shift change.',
    citation: 'Chellappa et al., 2021',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FlagshipCard({ item }: { item: typeof FLAGSHIP[0] }) {
  return (
    <View style={styles.flagshipCard}>
      <View style={[styles.flagshipIconWrap, { backgroundColor: item.tint }]}>
        <Ionicons name={item.icon} size={22} color={item.accent} />
      </View>
      <Text style={[styles.flagshipTitle, { color: item.accent }]}>{item.title}</Text>
      <Text style={styles.flagshipDesc}>{item.desc}</Text>
    </View>
  );
}

function FeatureRow({ icon, label, free }: typeof FEATURES[0]) {
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={icon}
        size={17}
        color={free ? COLORS.text.muted : COLORS.accent.primary}
        style={styles.featureIcon}
      />
      <Text style={[styles.featureLabel, free && styles.featureLabelFree]}>{label}</Text>
      {free ? (
        <Text style={styles.freeTag}>Free</Text>
      ) : (
        <Ionicons name="checkmark" size={15} color={COLORS.accent.primary} />
      )}
    </View>
  );
}

function ScienceStatCard({ item }: { item: typeof SCIENCE[0] }) {
  return (
    <View style={[styles.scienceCard, { borderLeftColor: item.color }]}>
      <View style={styles.scienceTop}>
        <Text style={[styles.scienceStat, { color: item.color }]}>{item.stat}</Text>
        <Text style={styles.scienceFinding}>{item.finding}</Text>
      </View>
      <Text style={styles.scienceInsight}>{item.insight}</Text>
      <Text style={styles.scienceCitation}>— {item.citation}</Text>
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.planHeader}>
        <View style={styles.planCopy}>
          <View style={styles.planLabelRow}>
            <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
              {plan.label}
            </Text>
            {plan.badge ? (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
        </View>
        <View style={[styles.planRadio, selected && styles.planRadioSelected]}>
          {selected ? <Ionicons name="checkmark" size={14} color="#0B0D16" /> : null}
        </View>
      </View>

      <View style={styles.planPricingRow}>
        <View>
          <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
            {plan.price}
            <Text style={styles.planPeriod}> {plan.period}</Text>
          </Text>
          {plan.perMonth ? (
            <Text style={[styles.planPerMonth, selected && styles.planPerMonthSelected]}>
              {plan.perMonth}
            </Text>
          ) : null}
        </View>
        <Text style={styles.planDetail}>{plan.detail}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getRevenueCatPackage(offerings: any, planKey: PlanKey) {
  const current = offerings?.current;

  if (!current) return null;

  if (planKey === 'monthly' && current.monthly) return current.monthly;
  if (planKey === 'annual' && current.annual) return current.annual;
  if (planKey === 'lifetime' && current.lifetime) return current.lifetime;

  return (
    current.availablePackages?.find((pkg: any) => {
      const identifier = `${pkg?.identifier ?? ''} ${pkg?.packageType ?? ''}`.toLowerCase();
      if (planKey === 'monthly') return identifier.includes('month');
      if (planKey === 'annual') return identifier.includes('annual') || identifier.includes('year');
      if (planKey === 'lifetime') return identifier.includes('lifetime');
      return false;
    }) ?? null
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');
  const userId = useAuthStore((s) => s.userId);
  const {
    purchase,
    restore,
    isLoading,
    offerings,
    loadOfferings,
  } = usePremiumStore();

  // Paywall pricing A/B experiment (GRO-04)
  const paywallVariant = getPaywallVariant(userId ?? 'anonymous');

  useEffect(() => {
    loadOfferings().catch(() => {
      // Keep the paywall usable in mocked/dev environments.
    });
  }, [loadOfferings]);

  // Override annual plan pricing based on experiment variant
  const experimentPlans: Plan[] = PLANS.map((p) => {
    if (p.key === 'annual') {
      return {
        ...p,
        price: paywallVariant.annualPrice,
        perMonth: paywallVariant.monthlyEquivalent,
      };
    }
    return p;
  });

  const currentPlan = experimentPlans.find((p) => p.key === selectedPlan)!;
  const currentPackage = useMemo(
    () => getRevenueCatPackage(offerings, selectedPlan),
    [offerings, selectedPlan],
  );

  const selectedPlanSummary = useMemo(() => {
    if (selectedPlan === 'annual') {
      return 'Most people choose annual because it keeps the app in the background of life while still protecting the hard weeks.';
    }
    if (selectedPlan === 'lifetime') {
      return 'Lifetime is best if shift work is likely to stay part of your career and you want one clean decision.';
    }
    return 'Monthly keeps the commitment light while you decide whether ShiftWell becomes part of your routine.';
  }, [selectedPlan]);

  async function handleStartTrial() {
    // Log paywall impression for experiment tracking
    if (!currentPackage) {
      Alert.alert(
        'Purchases unavailable',
        'Subscription packages are not available right now. Please try again in a moment.',
      );
      return;
    }

    if (userId) {
      logExposure('paywall-pricing-v1', paywallVariant.variantId === 'control' ? 'A' : 'B', userId).catch(() => {});
    }

    await purchase(currentPackage);
    router.back();
  }

  async function handleRestore() {
    await restore();
    router.back();
  }

  const disclaimerPeriod =
    selectedPlan === 'lifetime'
      ? 'one-time payment'
      : selectedPlan === 'annual'
      ? 'per year after trial'
      : 'per month after trial';

  function handleLegalPlaceholder(title: string) {
    Alert.alert(title, 'Link this action once the in-app legal screens or website pages are finalized.');
  }

  return (
    <GradientMeshBackground>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="star" size={11} color={COLORS.accent.primary} />
              <Text style={styles.heroBadgeText}>SHIFTWELL PRO</Text>
            </View>
            <Text style={styles.heroTitle}>Built for the weeks your body feels the cost.</Text>
            <Text style={styles.heroSub}>
              ShiftWell turns a chaotic schedule into a calmer recovery plan with sleep,
              nap, light, meal, and calendar-aware guidance that actually respects shift work.
            </Text>

            <View style={styles.metricsRow}>
              {HERO_METRICS.map((metric) => (
                <View key={metric.label} style={styles.metricCard}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.trustBar}>
              {TRUST.map((t) => (
                <View key={t.label} style={styles.trustPill}>
                  <Ionicons name={t.icon} size={13} color={COLORS.accent.primary} />
                  <Text style={styles.trustLabel}>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionLabel}>WHAT SETS US APART</Text>
          <View style={styles.flagshipGrid}>
            {FLAGSHIP.map((item) => (
              <FlagshipCard key={item.title} item={item} />
            ))}
          </View>

          <Text style={styles.sectionLabel}>EVERYTHING IN PRO</Text>
          <View style={styles.featureCard}>
            {FEATURES.map((f, i) => (
              <View key={f.label}>
                <FeatureRow {...f} />
                {i < FEATURES.length - 1 ? <View style={styles.featureDivider} /> : null}
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>THE RESEARCH</Text>
          <View style={styles.scienceList}>
            {SCIENCE.map((item) => (
              <ScienceStatCard key={item.stat} item={item} />
            ))}
          </View>

          <Text style={styles.sectionLabel}>CHOOSE YOUR PLAN</Text>
          <View style={styles.planList}>
            {experimentPlans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                selected={selectedPlan === plan.key}
                onSelect={() => setSelectedPlan(plan.key)}
              />
            ))}
          </View>

          <View style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryLabel}>Selected plan</Text>
            <Text style={styles.selectionSummaryTitle}>{currentPlan.label}</Text>
            <Text style={styles.selectionSummaryBody}>{selectedPlanSummary}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.cta,
              (isLoading || !currentPackage) && styles.ctaDisabled,
            ]}
            onPress={handleStartTrial}
            activeOpacity={0.88}
            disabled={isLoading || !currentPackage}
          >
            <Text style={styles.ctaText}>
              {isLoading ? 'Processing…' : 'Start 14-Day Free Trial'}
            </Text>
            <Text style={styles.ctaSubText}>
              Then {currentPlan.price} {disclaimerPeriod} · Cancel anytime
            </Text>
          </TouchableOpacity>

          {!currentPackage ? (
            <Text style={styles.availabilityNote}>
              Subscription packages are still loading. If this persists, restore purchases or
              reopen the paywall.
            </Text>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleRestore} hitSlop={8}>
              <Text style={styles.footerLink}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}>·</Text>
            <TouchableOpacity onPress={() => handleLegalPlaceholder('Privacy Policy')} hitSlop={8}>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}>·</Text>
            <TouchableOpacity onPress={() => handleLegalPlaceholder('Terms of Service')} hitSlop={8}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </GradientMeshBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = COLORS.accent.primary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(19,23,38,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingTop: 72,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['4xl'],
  },

  heroCard: {
    backgroundColor: 'rgba(15,19,33,0.94)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.xl,
    marginBottom: SPACING['2xl'],
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${GOLD}1A`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text.primary,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginBottom: SPACING.sm,
  },
  heroSub: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondaryBright,
    lineHeight: 22,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },

  flagshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  flagshipCard: {
    width: '48%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(19,23,38,0.88)',
  },
  flagshipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  flagshipTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  flagshipDesc: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },

  featureCard: {
    backgroundColor: 'rgba(19,23,38,0.9)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: SPACING['2xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
  },
  featureIcon: {
    width: 26,
    marginRight: 4,
  },
  featureLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  featureLabelFree: {
    color: COLORS.text.muted,
  },
  freeTag: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 46,
  },

  trustBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  trustLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },

  scienceList: {
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  scienceCard: {
    backgroundColor: 'rgba(19,23,38,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderLeftWidth: 3,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: 8,
  },
  scienceTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  scienceStat: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 30,
    minWidth: 52,
  },
  scienceFinding: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  scienceInsight: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  scienceCitation: {
    fontSize: 10,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },

  planList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: 'rgba(19,23,38,0.9)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  planCardSelected: {
    borderColor: ACCENT.purple,
    backgroundColor: 'rgba(123,97,255,0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  planCopy: {
    flex: 1,
  },
  planLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  planBadge: {
    backgroundColor: GOLD,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0B0D16',
    letterSpacing: 0.4,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planLabelSelected: {
    color: ACCENT.purple,
  },
  planSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  planRadioSelected: {
    backgroundColor: ACCENT.primary,
    borderColor: ACCENT.primary,
  },
  planPricingRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  planPriceSelected: {
    color: ACCENT.purple,
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  planPerMonth: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 4,
  },
  planPerMonthSelected: {
    color: ACCENT.primary,
  },
  planDetail: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text.secondary,
    textAlign: 'right',
    maxWidth: 170,
  },
  selectionSummary: {
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  selectionSummaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  selectionSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  selectionSummaryBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },

  cta: {
    borderRadius: RADIUS.xl,
    backgroundColor: ACCENT.purple,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
    shadowColor: ACCENT.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B0D16',
    letterSpacing: -0.2,
  },
  ctaSubText: {
    fontSize: 11,
    color: 'rgba(11,13,22,0.65)',
  },
  availabilityNote: {
    ...TYPOGRAPHY.caption,
    color: TEXT_COLORS.muted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  footerLink: {
    fontSize: 12,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
  footerSep: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
});
