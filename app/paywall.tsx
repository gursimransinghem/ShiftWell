import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumStore } from '@/src/store/premium-store';
import { COLORS, SPACING, RADIUS, PURPLE } from '@/src/theme';
import { PLAN_LIST, TRIAL_DAYS, type PricingPlan } from '@/src/lib/premium/pricing';
import { PRIVACY_SUMMARY, HEALTH_DISCLAIMER, TERMS_SUMMARY } from '@/src/content/legal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanKey = PricingPlan['key'];
type Plan = PricingPlan;
type LegalModal = 'privacy' | 'health' | 'terms';

// ---------------------------------------------------------------------------
// Data — Plans (source: src/lib/premium/pricing.ts)
// ---------------------------------------------------------------------------

const PLANS: Plan[] = PLAN_LIST;

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
  { icon: 'calendar-sharp' as const,         label: 'Shift import and calendar export', free: true },
  { icon: 'restaurant-outline' as const,     label: 'Meal, caffeine, nap, and light timing', free: true },
  { icon: 'notifications-outline' as const,  label: 'Core reminders',                  free: true },
  { icon: 'analytics-outline' as const,      label: 'Adaptive Brain plan adjustments', free: false },
  { icon: 'chatbubbles-outline' as const,    label: 'Personalized weekly coaching',    free: false },
  { icon: 'trending-up-outline' as const,    label: 'Pattern recognition and predictions', free: false },
  { icon: 'shield-checkmark-outline' as const, label: 'Cloud backup and sync',          free: false },
];

// ---------------------------------------------------------------------------
// Data — Trust signals
// ---------------------------------------------------------------------------

const TRUST = [
  { icon: 'flask-outline' as const, label: 'Research-informed' },
  { icon: 'medical-outline' as const, label: 'Built by an ER physician' },
  { icon: 'people-outline' as const, label: 'Built for shift schedules' },
];

// ---------------------------------------------------------------------------
// Data — Science findings (key research hooks)
// ---------------------------------------------------------------------------

const SCIENCE = [
  {
    stat: '3%',
    color: '#A78BFA',
    finding: 'of night shift workers ever fully adapt circadianly.',
    insight: 'ShiftWell is designed around practical recovery within real rotations rather than assuming full circadian adaptation.',
    citation: 'Eastman & Burgess, 2009',
  },
  {
    stat: '2×',
    color: '#FF6B6B',
    finding: 'the cognitive impairment of two sleepless nights',
    insight: 'Repeated short sleep can create meaningful performance deficits. ShiftWell helps you see and protect recovery windows.',
    citation: 'Van Dongen et al., 2003 · Walter Reed Army Institute',
  },
  {
    stat: '↓CVD',
    color: '#34D399',
    finding: 'Daytime-only eating reduces cardiovascular risk in night workers.',
    insight: 'ShiftWell meal timing is informed by emerging research on eating windows during night work.',
    citation: 'Chellappa et al., 2021',
  },
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
  const [legalModal, setLegalModal] = useState<null | LegalModal>(null);
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
    selectedPlan === 'annual' ? 'per year after trial' : 'per month after trial';

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
            Built by an ER physician for people whose work hours do not fit
            generic sleep advice.
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

        {/* ── Research findings ────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>THE RESEARCH</Text>
        <View style={styles.scienceList}>
          {SCIENCE.map((item) => (
            <ScienceStatCard key={item.stat} item={item} />
          ))}
        </View>

        {/* ── Honest outcome block ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>TRACKABLE FROM DAY ONE</Text>
        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeLine}>Recovery score every morning.</Text>
          <Text style={styles.outcomeLine}>See your trend by day 14.</Text>
          <Text style={styles.outcomeNote}>
            No outcome promises until the data earns them. Your score and trend are
            computed locally from your actual sleep records.
          </Text>
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
            {isLoading ? 'Processing...' : `Start ${TRIAL_DAYS}-Day Free Trial`}
          </Text>
          <Text style={styles.ctaSubText}>
            Then {currentPlan.price} {disclaimerPeriod} · Cancel anytime
          </Text>
          <Text style={styles.ctaCancelNote}>
            Apple confirms the final price before purchase.
          </Text>
        </TouchableOpacity>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore} hitSlop={8}>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}>·</Text>
          <TouchableOpacity hitSlop={8} onPress={() => setLegalModal('privacy')}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}>·</Text>
          <TouchableOpacity hitSlop={8} onPress={() => setLegalModal('terms')}>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}>·</Text>
          <TouchableOpacity hitSlop={8} onPress={() => setLegalModal('health')}>
            <Text style={styles.footerLink}>Health</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Legal modal ─────────────────────────────────────────────── */}
      <Modal
        visible={legalModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalModal(null)}
      >
        <View style={styles.legalContainer}>
          <View style={styles.legalHeader}>
            <Text style={styles.legalTitle}>
              {legalModal === 'privacy'
                ? 'Privacy'
                : legalModal === 'terms'
                  ? 'Terms'
                  : 'Health Disclaimer'}
            </Text>
            <Pressable
              onPress={() => setLegalModal(null)}
              hitSlop={12}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={COLORS.text.secondary} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.legalScroll}>
            <Text style={styles.legalBody}>
              {legalModal === 'privacy'
                ? PRIVACY_SUMMARY
                : legalModal === 'terms'
                  ? TERMS_SUMMARY
                  : HEALTH_DISCLAIMER}
            </Text>
          </ScrollView>
        </View>
      </Modal>
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

  // ── Science research cards
  scienceList: {
    gap: 10,
    marginBottom: 28,
  },
  scienceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 16,
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
    borderColor: PURPLE,
    backgroundColor: 'rgba(123,97,255,0.07)',
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
    color: PURPLE,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planPriceSelected: {
    color: PURPLE,
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
    backgroundColor: PURPLE,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    shadowColor: PURPLE,
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
  ctaCancelNote: {
    fontSize: 11,
    color: 'rgba(11,13,22,0.55)',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // ── Outcome block
  outcomeCard: {
    backgroundColor: 'rgba(200,168,75,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.18)',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 24,
    gap: 2,
  },
  outcomeLine: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  outcomeNote: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginTop: 8,
  },

  // ── Legal modal
  legalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border.default,
  },
  legalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  legalScroll: {
    padding: 20,
    paddingBottom: 48,
  },
  legalBody: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text.secondary,
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
