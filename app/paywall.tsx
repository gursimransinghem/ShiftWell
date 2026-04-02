import React from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS as THEME } from '@/src/theme';

const C = {
  background: THEME.background.primary,
  card: THEME.background.surface,
  accent: THEME.accent.primary,
  text: THEME.text.primary,
  secondaryText: THEME.text.secondary,
  success: THEME.semantic.success,
  locked: THEME.text.secondary,
  divider: THEME.border.default,
  gold: THEME.accent.primary,
};

interface FeatureRow {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: 'Sleep plan generation', free: true, premium: true },
  { label: 'Shift calendar import', free: true, premium: true },
  { label: 'Basic circadian tracking', free: true, premium: true },
  { label: 'Cloud sync across devices', free: false, premium: true },
  { label: 'Advanced sleep analytics', free: false, premium: true },
  { label: 'Caffeine optimization', free: false, premium: true },
  { label: 'Nap scheduling', free: false, premium: true },
  { label: 'Light exposure guidance', free: false, premium: true },
  { label: 'Priority support', free: false, premium: true },
];

export default function PaywallScreen() {
  const handleStartTrial = () => {
    Alert.alert(
      'Coming Soon',
      'ShiftWell is currently 100% free. Premium features will be available in a future update. Thank you for your support!',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert(
      'No Purchases to Restore',
      'ShiftWell is currently 100% free — no purchase required.',
      [{ text: 'OK' }],
    );
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.premiumBadge}>★ PREMIUM</Text>
          <Text style={styles.headerTitle}>Unlock ShiftWell Pro</Text>
          <Text style={styles.headerSubtitle}>
            Get the full toolkit for healthier shift work
          </Text>
        </View>

        {/* Feature Comparison */}
        <View style={styles.comparisonCard}>
          {/* Column Headers */}
          <View style={styles.comparisonHeader}>
            <Text style={[styles.columnLabel, styles.featureColumn]}>Feature</Text>
            <Text style={styles.columnLabel}>Free</Text>
            <Text style={[styles.columnLabel, styles.proLabel]}>Pro</Text>
          </View>

          {/* Feature Rows */}
          {FEATURES.map((feature, index) => (
            <View
              key={feature.label}
              style={[
                styles.featureRow,
                index < FEATURES.length - 1 && styles.featureRowBorder,
              ]}
            >
              <Text style={[styles.featureLabel, styles.featureColumn]}>
                {feature.label}
              </Text>
              <Text style={styles.featureIcon}>
                {feature.free ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
              </Text>
              <Text style={styles.featureIcon}>
                <Text style={styles.checkIcon}>✓</Text>
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          {/* Monthly */}
          <TouchableOpacity style={styles.priceCard} activeOpacity={0.8}>
            <Text style={styles.priceLabel}>Monthly</Text>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>per month</Text>
          </TouchableOpacity>

          {/* Yearly */}
          <TouchableOpacity
            style={[styles.priceCard, styles.priceCardHighlighted]}
            activeOpacity={0.8}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 33%</Text>
            </View>
            <Text style={styles.priceLabel}>Yearly</Text>
            <Text style={styles.priceAmount}>$39.99</Text>
            <Text style={styles.pricePeriod}>per year</Text>
          </TouchableOpacity>
        </View>

        {/* Start Trial Button */}
        <TouchableOpacity
          style={styles.trialButton}
          onPress={handleStartTrial}
          activeOpacity={0.8}
        >
          <Text style={styles.trialButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.trialDisclaimer}>
          7-day free trial, then billed automatically. Cancel anytime.
        </Text>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreContainer}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: C.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  premiumBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: C.secondaryText,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    marginBottom: 4,
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondaryText,
    textAlign: 'center',
    width: 48,
  },
  featureColumn: {
    flex: 1,
    textAlign: 'left',
  },
  proLabel: {
    color: C.accent,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  featureLabel: {
    fontSize: 14,
    color: C.text,
  },
  featureIcon: {
    width: 48,
    textAlign: 'center',
    fontSize: 16,
  },
  checkIcon: {
    color: C.success,
    fontSize: 16,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 14,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priceCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.divider,
  },
  priceCardHighlighted: {
    borderColor: C.accent,
  },
  saveBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.5,
  },
  priceLabel: {
    fontSize: 14,
    color: C.secondaryText,
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
  },
  pricePeriod: {
    fontSize: 13,
    color: C.secondaryText,
    marginTop: 4,
  },
  trialButton: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  trialDisclaimer: {
    fontSize: 12,
    color: C.secondaryText,
    textAlign: 'center',
    marginTop: 12,
  },
  restoreContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  restoreText: {
    fontSize: 14,
    color: C.secondaryText,
    textDecorationLine: 'underline',
  },
});
