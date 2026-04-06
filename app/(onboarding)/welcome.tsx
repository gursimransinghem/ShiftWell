import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import AnimatedTransition from '@/src/components/ui/AnimatedTransition';
import { COLORS, SPACING } from '@/src/theme';

// ---------------------------------------------------------------------------
// Star field
// ---------------------------------------------------------------------------

// Pre-generated so positions stay stable across renders
const STARS = [
  { id: 0, x: 8, y: 6, size: 1.5, delay: 0, dur: 2200 },
  { id: 1, x: 22, y: 14, size: 1, delay: 400, dur: 1800 },
  { id: 2, x: 71, y: 4, size: 2, delay: 800, dur: 2600 },
  { id: 3, x: 88, y: 11, size: 1, delay: 200, dur: 2000 },
  { id: 4, x: 45, y: 8, size: 1.5, delay: 1000, dur: 1600 },
  { id: 5, x: 60, y: 18, size: 1, delay: 600, dur: 2400 },
  { id: 6, x: 33, y: 22, size: 2, delay: 1400, dur: 1900 },
  { id: 7, x: 78, y: 25, size: 1, delay: 300, dur: 2100 },
  { id: 8, x: 15, y: 35, size: 1.5, delay: 900, dur: 1700 },
  { id: 9, x: 93, y: 32, size: 1, delay: 700, dur: 2500 },
  { id: 10, x: 52, y: 40, size: 1, delay: 1200, dur: 2000 },
  { id: 11, x: 4, y: 55, size: 2, delay: 500, dur: 1800 },
  { id: 12, x: 68, y: 48, size: 1.5, delay: 1100, dur: 2300 },
  { id: 13, x: 38, y: 60, size: 1, delay: 1600, dur: 1500 },
  { id: 14, x: 84, y: 52, size: 2, delay: 100, dur: 2700 },
  { id: 15, x: 26, y: 70, size: 1, delay: 800, dur: 2000 },
  { id: 16, x: 57, y: 65, size: 1.5, delay: 1300, dur: 1900 },
  { id: 17, x: 12, y: 78, size: 1, delay: 400, dur: 2400 },
  { id: 18, x: 91, y: 72, size: 2, delay: 1500, dur: 1700 },
  { id: 19, x: 47, y: 82, size: 1, delay: 700, dur: 2200 },
  { id: 20, x: 76, y: 88, size: 1.5, delay: 200, dur: 1600 },
  { id: 21, x: 31, y: 90, size: 1, delay: 1000, dur: 2500 },
  { id: 22, x: 63, y: 93, size: 2, delay: 600, dur: 2000 },
  { id: 23, x: 18, y: 95, size: 1, delay: 1400, dur: 1800 },
  { id: 24, x: 82, y: 97, size: 1.5, delay: 900, dur: 2300 },
];

function TwinkleStar({ star }: { star: typeof STARS[0] }) {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withSequence(
          withTiming(0.05, { duration: star.dur }),
          withTiming(0.75, { duration: star.dur }),
        ),
        -1,
        false,
      ),
    );
  }, [opacity, star.delay, star.dur]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        animStyle,
      ]}
    />
  );
}

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
  {
    emoji: '\u{1F37D}\u{FE0F}',
    bgColor: 'rgba(52,211,153,0.12)',
    title: 'Eat with your clock',
    description: 'Timed meals shown to cut cardiovascular risk in shift workers',
  },
  {
    emoji: '\u{1FA7A}',
    bgColor: 'rgba(239,68,68,0.12)',
    title: 'Developed by an ER Physician',
    description: 'Built for the front lines, by someone on them',
  },
] as const;

// ---------------------------------------------------------------------------
// Dot indicators
// ---------------------------------------------------------------------------

function DotIndicators() {
  return (
    <View style={styles.dotsRow}>
      <View style={styles.dotActive} />
      {[1, 2, 3, 4, 5].map((i) => (
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
      {/* Star field — absolute background */}
      <View style={styles.starField} pointerEvents="none">
        {STARS.map((star) => (
          <TwinkleStar key={star.id} star={star} />
        ))}
      </View>

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

        {/* Stat hook — research finding */}
        <AnimatedTransition delay={300} duration={250}>
          <View style={styles.statBlock}>
            <View style={styles.statLeft}>
              <Text style={styles.statNumber}>3%</Text>
              <Text style={styles.statDivider}></Text>
            </View>
            <View style={styles.statRight}>
              <Text style={styles.statHeadline}>
                of night shift workers ever fully adapt circadianly.
              </Text>
              <Text style={styles.statBody}>
                Most apps chase that 3%. ShiftWell was built for the other 97% — optimizing recovery within your real schedule, not some impossible ideal.
              </Text>
            </View>
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
        <AnimatedTransition delay={600} duration={250}>
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
        <AnimatedTransition delay={700} duration={200}>
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

  // Star field
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
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

  /* Stat block */
  statBlock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(200,168,75,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.18)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
    gap: SPACING.lg,
    alignItems: 'flex-start',
  },
  statLeft: {
    alignItems: 'center',
    paddingTop: 2,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#C8A84B',
    letterSpacing: -1,
    lineHeight: 40,
  },
  statDivider: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(200,168,75,0.25)',
    marginTop: 6,
    borderRadius: 1,
    minHeight: 20,
  },
  statRight: {
    flex: 1,
    gap: 6,
  },
  statHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C8A84B',
    lineHeight: 18,
  },
  statBody: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
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
