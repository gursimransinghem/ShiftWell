import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Feature cards
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    emoji: '\u{1F4A4}',
    bgColor: 'rgba(129,140,248,0.12)',
    title: 'Sleep on autopilot',
    description: 'Set it and forget it',
  },
  {
    emoji: '\u{1F4C5}',
    bgColor: 'rgba(52,211,153,0.12)',
    title: 'Calendar-aware',
    description: 'Syncs with your shift schedule',
  },
  {
    emoji: '\u{2728}',
    bgColor: 'rgba(200,168,75,0.12)',
    title: 'Science-backed',
    description: 'Plans that adapt to your life',
  },
] as const;

// ---------------------------------------------------------------------------
// Dot indicators
// ---------------------------------------------------------------------------

function DotIndicators() {
  return (
    <View style={styles.dotsRow}>
      {/* Active dot (pill) */}
      <View style={styles.dotActive} />
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.dotInactive} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dot indicators */}
        <View style={styles.header}>
          <DotIndicators />
        </View>

        {/* Hero */}
        <AnimatedTransition delay={0} duration={300}>
          <View style={styles.hero}>
            <Text style={styles.moonEmoji}>{'\u{1F319}'}</Text>
            <Text style={styles.headline}>Sleep on Autopilot</Text>
            <Text style={styles.tagline}>
              For everyone who works against the clock
            </Text>
          </View>
        </AnimatedTransition>

        {/* Feature cards */}
        <View style={styles.featureCards}>
          {FEATURES.map((feature, index) => (
            <AnimatedTransition
              key={feature.title}
              delay={index * 150}
              duration={250}
            >
              <View style={styles.featureCard}>
                <View style={[styles.featureIconCircle, { backgroundColor: feature.bgColor }]}>
                  <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
              </View>
            </AnimatedTransition>
          ))}
        </View>

        {/* CTA */}
        <AnimatedTransition delay={450} duration={250}>
          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push('/(onboarding)/chronotype')}
              style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ctaText}>Get Started</Text>
            </Pressable>
          </View>
        </AnimatedTransition>

        {/* Legal */}
        <AnimatedTransition delay={500} duration={200}>
          <Text style={styles.legal}>
            ShiftWell provides general wellness information based on circadian
            science research. It is not medical advice. Always consult your
            doctor about sleep concerns.
          </Text>
        </AnimatedTransition>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    alignItems: 'center',
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotActive: {
    width: 20,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7B61FF',
  },
  dotInactive: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1F2937',
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  moonEmoji: {
    fontSize: 44,
    marginBottom: SPACING.lg,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#C8A84B',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  /* Feature cards */
  featureCards: {
    gap: SPACING.md,
    marginBottom: SPACING['4xl'],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: SPACING.lg,
    minHeight: 64,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },

  /* CTA */
  footer: {
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    backgroundColor: '#7B61FF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Legal */
  legal: {
    fontSize: 9,
    color: COLORS.text.dim,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: SPACING.lg,
  },
});
