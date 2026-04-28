import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumStore } from '@/src/store/premium-store';
import { useUserStore } from '@/src/store/user-store';
import { getPaywallVariant } from '@/src/lib/growth/paywall-experiment';
import { logExposure } from '@/src/lib/growth/ab-testing';
import { Button, Card, GradientMeshBackground } from '@/src/components/ui';
import {
  COLORS,
  RADIUS,
  SPACING,
  TEXT,
  TYPOGRAPHY,
  captionSmall,
} from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanKey = 'monthly' | 'annual' | 'lifetime';

interface Plan {
  key: PlanKey;
  label: string;
  price: string;
  period: string;
  perMonth?: string;
  badge?: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Data — Plans
// ---------------------------------------------------------------------------

const PLANS: Plan[] = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '$6.99',
    period: '/mo',
    description: 'Best if you want maximum flexibility and a lighter upfront commitment.',
  },
  {
    key: 'annual',
    label: 'Annual',
    price: '$49.99',
    period: '/yr',
    perMonth: '$4.17/mo',
    badge: 'BEST VALUE · SAVE 40%',
    description: 'Built for recurring rotations and frequent shift changes throughout the year.',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    price: '$149.99',
    period: 'once',
    description: 'One purchase for long-term shift work, residency, or years of rotating call.',
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
    gradient: ['#1E3A5F', '#0D2137'] as const,
    accent: '#60A5FA',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Calendar Export',
    desc: 'Push your sleep plan to Apple Calendar or Google Calendar in one tap.',
    gradient: ['#1A3D2F', '#0D2118'] as const,
    accent: '#34D399',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'Activity Guide',
    desc: 'Meal timing, exercise windows, and light exposure — timed to your body clock.',
    gradient: ['#3D2A10', '#211506'] as const,
    accent: '#FB923C',
  },
  {
    icon: 'analytics-outline' as const,
    title: 'Sleep Insights',
    desc: '7-day trends, recovery patterns, and tips personalized to your chronotype.',
    gradient: ['#2D1B4E', '#180D2B'] as const,
    accent: '#A78BFA',
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
    <Card
      padding={false}
      style={[styles.flagshipCard, { backgroundColor: item.gradient[1] }]}
    >
      <View style={[styles.flagshipIconWrap, { backgroundColor: `${item.accent}22` }]}>
        <Ionicons name={item.icon} size={22} color={item.accent} />
      </View>
      <Text style={[styles.flagshipTitle, { color: item.accent }]}>{item.title}</Text>
      <Text style={styles.flagshipDesc}>{item.desc}</Text>
    </Card>
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
    <Card
      padding={false}
      style={[styles.scienceCard, { borderLeftColor: item.color }]}
    >
      <View style={styles.scienceTop}>
        <Text style={[styles.scienceStat, { color: item.color }]}>{item.stat}</Text>
        <Text style={styles.scienceFinding}>{item.finding}</Text>
      </View>
      <Text style={styles.scienceInsight}>{item.insight}</Text>
      <Text style={styles.scienceCitation}>— {item.citation}</Text>
    </Card>
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
      <View style={styles.planHeaderRow}>
        <View style={styles.planSelectionRow}>
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected ? <View style={styles.radioInner} /> : null}
          </View>
          <View style={styles.planCopy}>
            <View style={styles.planTitleRow}>
              <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
                {plan.label}
              </Text>
              {plan.badge ? (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>
            {plan.perMonth ? (
              <Text
                style={[
                  styles.planPerMonth,
                  selected && styles.planPerMonthSelected,
                ]}
              >
                {plan.perMonth}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.planPriceColumn}>
          <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
            {plan.price}
          </Text>
          <Text style={styles.planPeriod}>{plan.period}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');
  const { purchase, restore, isLoading } = usePremiumStore();
  const profile = useUserStore((s) => s.profile);
  const paywallBucketKey = [
    profile.chronotype,
    profile.sleepNeed,
    profile.caffeineHalfLife,
    profile.napPreference ? 'nap-on' : 'nap-off',
    profile.commuteDuration ?? 0,
  ].join(':');

  // Paywall pricing A/B experiment (GRO-04)
  const paywallVariant = getPaywallVariant(paywallBucketKey);

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

  async function handleStartTrial() {
    // Log paywall impression for experiment tracking
    logExposure(
      'paywall-pricing-v1',
      paywallVariant.variantId === 'control' ? 'A' : 'B',
      paywallBucketKey,
    ).catch(() => {});
    await purchase(currentPlan);
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

  return (
    <GradientMeshBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <View style={styles.heroShell}>
            <Card style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <Ionicons name="star" size={11} color={COLORS.accent.primary} />
                <Text style={styles.heroBadgeText}>SHIFTWELL PRO</Text>
              </View>
              <Text style={styles.heroTitle}>Work any shift.{'\n'}Recover with a real plan.</Text>
              <Text style={styles.heroSub}>
                A calmer, smarter sleep system for people whose schedules move every week.
              </Text>

              <View style={styles.heroStatsRow}>
                {TRUST.map((item) => (
                  <View key={item.label} style={styles.heroStatPill}>
                    <Ionicons
                      name={item.icon}
                      size={13}
                      color={COLORS.accent.primary}
                    />
                    <Text style={styles.heroStatText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          <Card style={styles.valueCard}>
            <Text style={styles.sectionLabel}>WHY PEOPLE UPGRADE</Text>
            <Text style={styles.valueTitle}>
              Your schedule changes. Your sleep plan should too.
            </Text>
            <Text style={styles.valueBody}>
              ShiftWell Pro adds adaptive planning, recovery insights, and calendar-ready
              execution so the app feels like a system, not just a tracker.
            </Text>
          </Card>

          <Text style={styles.sectionLabel}>WHAT SETS US APART</Text>
          <View style={styles.flagshipGrid}>
            {FLAGSHIP.map((item) => (
              <FlagshipCard key={item.title} item={item} />
            ))}
          </View>

          <Text style={styles.sectionLabel}>EVERYTHING IN PRO</Text>
          <Card padding={false} style={styles.featureCard}>
            {FEATURES.map((f, i) => (
              <View key={f.label}>
                <FeatureRow {...f} />
                {i < FEATURES.length - 1 && <View style={styles.featureDivider} />}
              </View>
            ))}
          </Card>

          <Text style={styles.sectionLabel}>THE RESEARCH</Text>
          <View style={styles.scienceList}>
            {SCIENCE.map((item) => (
              <ScienceStatCard key={item.stat} item={item} />
            ))}
          </View>

          <Text style={styles.sectionLabel}>CHOOSE YOUR PLAN</Text>
          <View style={styles.planStack}>
            {experimentPlans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                selected={selectedPlan === plan.key}
                onSelect={() => setSelectedPlan(plan.key)}
              />
            ))}
          </View>

          <Card style={styles.ctaCard}>
            <View style={styles.ctaHeader}>
              <Text style={styles.ctaEyebrow}>
                {selectedPlan === 'lifetime' ? 'ONE-TIME ACCESS' : '14-DAY FREE TRIAL'}
              </Text>
              <Text style={styles.ctaTitle}>
                {selectedPlan === 'lifetime'
                  ? 'Unlock ShiftWell Pro for good'
                  : `Start free, then ${currentPlan.price} ${disclaimerPeriod}`}
              </Text>
              <Text style={styles.ctaBody}>
                {selectedPlan === 'lifetime'
                  ? 'Pay once and keep the full sleep optimization toolkit available for every future rotation.'
                  : 'Try the full experience first. Cancel anytime during the trial if it is not right for your workflow.'}
              </Text>
            </View>

            <Button
              onPress={handleStartTrial}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              {selectedPlan === 'lifetime' ? 'Unlock Lifetime Access' : 'Start Free Trial'}
            </Button>

            <Text style={styles.ctaFinePrint}>
              Secure billing through Apple. Your plan renews automatically unless cancelled.
            </Text>
          </Card>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleRestore} hitSlop={8}>
              <Text style={styles.footerLink}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}>·</Text>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}>·</Text>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.xl,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(19,23,38,0.92)',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingTop: 72,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['4xl'],
  },
  heroShell: {
    marginBottom: SPACING['2xl'],
  },
  heroCard: {
    backgroundColor: 'rgba(19,23,38,0.96)',
    borderColor: 'rgba(123,97,255,0.22)',
    shadowColor: COLORS.accent.purple,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: `${GOLD}1A`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.lg,
  },
  heroBadgeText: {
    ...TYPOGRAPHY.label,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 1.2,
  },
  heroTitle: {
    ...TYPOGRAPHY.heading2,
    fontWeight: '800',
    color: COLORS.text.primary,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  heroSub: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    maxWidth: 320,
    marginBottom: SPACING.lg,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  heroStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  heroStatText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondaryBright,
  },
  valueCard: {
    marginBottom: SPACING['2xl'],
  },
  valueTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  valueBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  flagshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  flagshipCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
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
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: 6,
  },
  flagshipDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  featureCard: {
    overflow: 'hidden',
    marginBottom: SPACING['2xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 26,
    marginRight: 4,
  },
  featureLabel: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  featureLabelFree: {
    color: COLORS.text.muted,
  },
  freeTag: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border.default,
    marginLeft: 46,
  },
  scienceList: {
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  scienceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderLeftWidth: 3,
    gap: SPACING.sm,
  },
  scienceTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.md,
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
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  scienceInsight: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  scienceCitation: {
    ...captionSmall,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
  planStack: {
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  planCard: {
    backgroundColor: 'rgba(19,23,38,0.92)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
  },
  planCardSelected: {
    borderColor: COLORS.accent.purple,
    backgroundColor: 'rgba(123,97,255,0.07)',
    shadowColor: COLORS.accent.purple,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  planSelectionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: COLORS.accent.purple,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent.purple,
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planBadge: {
    backgroundColor: GOLD,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  planBadgeText: {
    ...captionSmall,
    fontWeight: '800',
    color: COLORS.text.inverse,
    letterSpacing: 0.4,
  },
  planLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planLabelSelected: {
    color: COLORS.accent.purple,
  },
  planDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  planPriceColumn: {
    alignItems: 'flex-end',
    minWidth: 84,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planPriceSelected: {
    color: COLORS.accent.purple,
  },
  planPeriod: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  planPerMonth: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  planPerMonthSelected: {
    color: COLORS.accent.primary,
  },
  ctaCard: {
    marginBottom: SPACING['2xl'],
    borderColor: 'rgba(200,168,75,0.18)',
    backgroundColor: 'rgba(19,23,38,0.96)',
  },
  ctaHeader: {
    marginBottom: SPACING.lg,
  },
  ctaEyebrow: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: COLORS.accent.primary,
    letterSpacing: 1.1,
    marginBottom: SPACING.xs,
  },
  ctaTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ctaBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  ctaFinePrint: {
    ...TYPOGRAPHY.caption,
    color: TEXT.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  footerLink: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
  footerSep: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
});
