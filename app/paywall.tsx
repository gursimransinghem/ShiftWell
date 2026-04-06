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
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanKey = 'monthly' | 'annual' | 'lifetime';

interface Plan {
  key: PlanKey;
  label: string;
  price: string;
  period: string;
  badge?: string;
  highlight: boolean;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PLANS: Plan[] = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '$6.99',
    period: '/mo',
    highlight: false,
  },
  {
    key: 'annual',
    label: 'Annual',
    price: '$49.99',
    period: '/yr',
    badge: 'BEST VALUE · SAVE 40%',
    highlight: true,
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    price: '$149.99',
    period: 'one-time',
    highlight: false,
  },
];

interface FeatureItem {
  icon: string;
  label: string;
  free: boolean;
}

const FEATURES: FeatureItem[] = [
  { icon: 'calendar-outline', label: 'Shift calendar import', free: true },
  { icon: 'moon-outline', label: 'Basic sleep plan', free: true },
  { icon: 'today-outline', label: 'Today view', free: true },
  { icon: 'analytics-outline', label: 'Recovery Score + trends', free: false },
  { icon: 'cafe-outline', label: 'Caffeine + meal timing', free: false },
  { icon: 'bed-outline', label: 'Strategic nap scheduling', free: false },
  { icon: 'sunny-outline', label: 'Light exposure protocols', free: false },
  { icon: 'notifications-outline', label: 'Smart reminders', free: false },
  { icon: 'star-outline', label: 'Night Sky Mode', free: false },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');
  const { purchase, restore, isLoading } = usePremiumStore();

  const handleStartTrial = async () => {
    const plan = PLANS.find((p) => p.key === selectedPlan);
    await purchase(plan);
    router.back();
  };

  const handleRestore = async () => {
    await restore();
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★ SHIFTWELL PRO</Text>
          </View>
          <Text style={styles.title}>Sleep smarter,{'\n'}every shift.</Text>
          <Text style={styles.subtitle}>
            Science-backed tools for everyone who works against the clock.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Ionicons
                name={f.icon as any}
                size={18}
                color={f.free ? COLORS.text.tertiary : COLORS.accent.primary}
                style={styles.featureIcon}
              />
              <Text style={[styles.featureLabel, f.free && styles.featureLabelFree]}>
                {f.label}
              </Text>
              {f.free ? (
                <Text style={styles.featureFreeTag}>Free</Text>
              ) : (
                <Ionicons name="checkmark" size={16} color={COLORS.accent.primary} />
              )}
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.key}
              style={[
                styles.planCard,
                plan.highlight && styles.planCardHighlight,
                selectedPlan === plan.key && styles.planCardSelected,
                selectedPlan === plan.key && plan.highlight && styles.planCardSelectedHighlight,
              ]}
              onPress={() => setSelectedPlan(plan.key)}
              activeOpacity={0.8}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <Text style={[
                styles.planLabel,
                selectedPlan === plan.key && styles.planLabelSelected,
              ]}>
                {plan.label}
              </Text>
              <Text style={[
                styles.planPrice,
                selectedPlan === plan.key && styles.planPriceSelected,
              ]}>
                {plan.price}
              </Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, isLoading && styles.ctaLoading]}
          onPress={handleStartTrial}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.ctaText}>
            {isLoading ? 'Processing…' : 'Start 14-Day Free Trial'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          14-day free trial, then {PLANS.find((p) => p.key === selectedPlan)?.price}{' '}
          {selectedPlan === 'lifetime' ? 'one-time' : selectedPlan === 'annual' ? '/year' : '/month'}.
          Cancel anytime before trial ends — no charge.
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  closeButton: {
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
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: `${COLORS.accent.primary}22`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.accent.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features
  featureList: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 4,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 28,
  },
  featureLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  featureLabelFree: {
    color: COLORS.text.tertiary,
  },
  featureFreeTag: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },

  // Plan cards
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
  },
  planCardHighlight: {
    borderColor: `${COLORS.accent.primary}44`,
    backgroundColor: `${COLORS.accent.primary}0A`,
  },
  planCardSelected: {
    borderColor: COLORS.accent.primary,
  },
  planCardSelectedHighlight: {
    backgroundColor: `${COLORS.accent.primary}15`,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0B0D16',
    letterSpacing: 0.3,
  },
  planLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 4,
    marginTop: 6,
  },
  planLabelSelected: {
    color: COLORS.accent.primary,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planPriceSelected: {
    color: COLORS.accent.primary,
  },
  planPeriod: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 2,
  },

  // CTA
  cta: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaLoading: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B0D16',
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
  footerDot: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
});
