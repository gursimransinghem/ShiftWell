import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumStore } from '@/src/store/premium-store';
import { COLORS, SPACING, RADIUS } from '@/src/theme';

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
  },
  {
    key: 'annual',
    label: 'Annual',
    price: '$49.99',
    period: '/yr',
    perMonth: '$4.17/mo',
    badge: 'BEST VALUE · SAVE 40%',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    price: '$149.99',
    period: 'once',
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
// Sub-components
// ---------------------------------------------------------------------------

function FlagshipCard({ item }: { item: typeof FLAGSHIP[0] }) {
  return (
    <View style={[styles.flagshipCard, { backgroundColor: item.gradient[1] }]}>
      <View style={[styles.flagshipIconWrap, { backgroundColor: `${item.accent}22` }]}>
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
      {plan.badge && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}
      <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
        {plan.label}
      </Text>
      <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
        {plan.price}
      </Text>
      <Text style={styles.planPeriod}>{plan.period}</Text>
      {plan.perMonth && (
        <Text style={[styles.planPerMonth, selected && { color: COLORS.accent.primary }]}>
          {plan.perMonth}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');
  const { purchase, restore, isLoading } = usePremiumStore();

  const currentPlan = PLANS.find((p) => p.key === selectedPlan)!;

  async function handleStartTrial() {
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
    <View style={styles.container}>
      {/* Close */}
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
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={11} color={COLORS.accent.primary} />
            <Text style={styles.heroBadgeText}>SHIFTWELL PRO</Text>
          </View>
          <Text style={styles.heroTitle}>Work any shift.{'\n'}Sleep like a champion.</Text>
          <Text style={styles.heroSub}>
            The only sleep app built by an ER physician, for the 700 million people
            who work against the clock.
          </Text>
        </View>

        {/* ── Flagship 2×2 grid ────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>WHAT SETS US APART</Text>
        <View style={styles.flagshipGrid}>
          {FLAGSHIP.map((item) => (
            <FlagshipCard key={item.title} item={item} />
          ))}
        </View>

        {/* ── Full feature list ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>EVERYTHING IN PRO</Text>
        <View style={styles.featureCard}>
          {FEATURES.map((f, i) => (
            <View key={f.label}>
              <FeatureRow {...f} />
              {i < FEATURES.length - 1 && <View style={styles.featureDivider} />}
            </View>
          ))}
        </View>

        {/* ── Trust bar ────────────────────────────────────────────── */}
        <View style={styles.trustBar}>
          {TRUST.map((t, i) => (
            <View key={t.label} style={styles.trustItem}>
              <Ionicons name={t.icon} size={14} color={COLORS.accent.primary} />
              <Text style={styles.trustLabel}>{t.label}</Text>
              {i < TRUST.length - 1 && <View style={styles.trustDot} />}
            </View>
          ))}
        </View>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>CHOOSE YOUR PLAN</Text>
        <View style={styles.planRow}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              selected={selectedPlan === plan.key}
              onSelect={() => setSelectedPlan(plan.key)}
            />
          ))}
        </View>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.cta, isLoading && styles.ctaDisabled]}
          onPress={handleStartTrial}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.ctaText}>
            {isLoading ? 'Processing…' : 'Start 14-Day Free Trial'}
          </Text>
          <Text style={styles.ctaSubText}>
            Then {currentPlan.price} {disclaimerPeriod} · Cancel anytime
          </Text>
        </TouchableOpacity>

        {/* ── Footer ───────────────────────────────────────────────── */}
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = COLORS.accent.primary; // #C8A84B

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // ── Hero
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${GOLD}1A`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },

  // ── Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.muted,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // ── Flagship grid
  flagshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  flagshipCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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

  // ── Feature list
  featureCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 20,
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
    backgroundColor: COLORS.border.default,
    marginLeft: 46,
  },

  // ── Trust bar
  trustBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.text.muted,
    marginLeft: 8,
  },

  // ── Plan cards
  planRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    minHeight: 100,
    justifyContent: 'center',
  },
  planCardSelected: {
    borderColor: GOLD,
    backgroundColor: `${GOLD}0D`,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: GOLD,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'center',
  },
  planBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#0B0D16',
    letterSpacing: 0.3,
  },
  planLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginBottom: 4,
    marginTop: 6,
  },
  planLabelSelected: {
    color: GOLD,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planPriceSelected: {
    color: GOLD,
  },
  planPeriod: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  planPerMonth: {
    fontSize: 10,
    color: COLORS.text.muted,
    marginTop: 3,
  },

  // ── CTA
  cta: {
    borderRadius: RADIUS.lg,
    backgroundColor: GOLD,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
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

  // ── Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
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
