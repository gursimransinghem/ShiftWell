import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import ProgressBar from '@/src/components/ui/ProgressBar';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';

const VALUE_POINTS = [
  { icon: '\u{1F4A4}', text: 'Sleep on autopilot — set it and forget it' },
  { icon: '\u{1F4C5}', text: 'Syncs with your shift schedule automatically' },
  { icon: '\u2728',  text: 'Science-backed plans that adapt to your life' },
] as const;

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar currentStep={ONBOARDING_STEPS.welcome} totalSteps={ONBOARDING_TOTAL_STEPS} />
        </View>

        <AnimatedTransition delay={0} duration={300}>
          <View style={styles.hero}>
            <Text style={styles.appName}>ShiftWell</Text>
            <Text style={styles.tagline}>
              Sleep on autopilot for everyone who works against the clock
            </Text>
          </View>
        </AnimatedTransition>

        <View style={styles.valuePoints}>
          {VALUE_POINTS.map((point, index) => (
            <AnimatedTransition
              key={point.text}
              delay={index * 150}
              duration={250}
            >
              <View style={styles.valueRow}>
                <Text style={styles.valueIcon}>{point.icon}</Text>
                <Text style={styles.valueText}>{point.text}</Text>
              </View>
            </AnimatedTransition>
          ))}
        </View>

        <AnimatedTransition delay={450} duration={250}>
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ShiftWell provides general wellness information based on circadian science research. It is not medical advice and does not replace consultation with a healthcare provider. Always consult your doctor about sleep concerns.
            </Text>
          </View>
        </AnimatedTransition>

        <AnimatedTransition delay={450} duration={250}>
          <View style={styles.footer}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(onboarding)/chronotype')}
              size="lg"
              fullWidth
            />
          </View>
        </AnimatedTransition>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    marginTop: SPACING.lg,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  appName: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  valuePoints: {
    gap: SPACING.lg,
    marginBottom: SPACING['4xl'],
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    minHeight: 56,
  },
  valueIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  valueText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
  disclaimer: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
