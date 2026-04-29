import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import { TRIAL_DAYS, PRICING } from '@/src/lib/premium/pricing';

// ---------------------------------------------------------------------------
// Data — Premium features lost on downgrade
// ---------------------------------------------------------------------------

const PREMIUM_FEATURES = [
  { icon: 'analytics-outline' as const,       label: 'Adaptive Brain plan adjustments' },
  { icon: 'chatbubbles-outline' as const,     label: 'Personalized weekly coaching' },
  { icon: 'trending-up-outline' as const,     label: 'Pattern recognition and predictions' },
  { icon: 'shield-checkmark-outline' as const, label: 'Cloud backup and sync' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeatureRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={icon}
        size={17}
        color={COLORS.accent.primary}
        style={styles.featureIcon}
      />
      <Text style={styles.featureLabel}>{label}</Text>
      <Ionicons name="lock-closed-outline" size={14} color={COLORS.text.muted} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DowngradeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="hourglass-outline" size={36} color={COLORS.accent.primary} />
          </View>
          <Text style={styles.title}>Your Trial Has Ended</Text>
          <Text style={styles.subtitle}>
            Your {TRIAL_DAYS}-day ShiftWell Pro trial is over. Upgrade to keep
            adaptive features — or continue with the free core plan.
          </Text>
        </View>

        {/* ── Feature summary ──────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>WHAT PRO ADDS</Text>
        <View style={styles.featureCard}>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={f.label}>
              <FeatureRow icon={f.icon} label={f.label} />
              {i < PREMIUM_FEATURES.length - 1 && (
                <View style={styles.featureDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.replace('/paywall')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to ShiftWell Pro"
        >
          <Text style={styles.ctaText}>Upgrade to ShiftWell Pro</Text>
          <Text style={styles.ctaSubText}>From {PRICING.annual.perMonth} · Cancel anytime</Text>
        </TouchableOpacity>

        {/* ── Secondary link ───────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.freeLink}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Continue with free features"
        >
          <Text style={styles.freeLinkText}>Continue with free features</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = COLORS.accent.primary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  scroll: {
    paddingTop: 72,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 48,
  },

  // ── Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${GOLD}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
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

  // ── Feature card
  featureCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border.default,
    marginLeft: 46,
  },

  // ── CTA
  cta: {
    borderRadius: RADIUS.lg,
    backgroundColor: GOLD,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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

  // ── Free link
  freeLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  freeLinkText: {
    fontSize: 14,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
});
