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
import Button from '@/src/components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useOnboardingStore } from '@/src/store/onboarding-store';
import { useUserStore } from '@/src/store/user-store';
import { trackOnboardingScreenViewed, trackOnboardingSkipped } from '@/src/lib/analytics/onboarding-events';

// ---------------------------------------------------------------------------
// Star field
// ---------------------------------------------------------------------------

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
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { label: 'Physician-built' },
  { label: 'Research-informed' },
  { label: 'For shift schedules' },
] as const;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function WelcomeScreen() {
  const { startOnboarding, onboardingStartedAt } = useOnboardingStore();
  const { completeOnboarding } = useUserStore();

  useEffect(() => {
    startOnboarding();
    trackOnboardingScreenViewed('welcome', onboardingStartedAt ?? Date.now());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSkip() {
    trackOnboardingSkipped();
    completeOnboarding();
    router.replace('/(tabs)');
  }

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
        {/* Skip link */}
        <View style={styles.skipRow}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Explore app {'\u2192'}</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <AnimatedTransition delay={0} duration={300}>
          <View style={styles.hero}>
            <Text style={styles.moonEmoji}>{'\u{1F319}'}</Text>
            <Text style={styles.headline}>Your sleep fights back.</Text>
            <Text style={styles.tagline}>
              Two-minute setup for everyone who works against the clock
            </Text>
          </View>
        </AnimatedTransition>

        {/* Stat hook */}
        <AnimatedTransition delay={200} duration={250}>
          <View style={styles.statBlock}>
            <View style={styles.statLeft}>
              <Text style={styles.statNumber}>3%</Text>
              <Text style={styles.statDivider} />
            </View>
            <View style={styles.statRight}>
              <Text style={styles.statHeadline}>
                of night workers in field studies fully adapted their body clock.
              </Text>
              <Text style={styles.statBody}>
                ShiftWell is built for practical recovery inside your real
                rotation, not an ideal schedule you cannot actually work.
              </Text>
            </View>
          </View>
        </AnimatedTransition>

        {/* Trust badges */}
        <AnimatedTransition delay={350} duration={250}>
          <View style={styles.badgesRow}>
            {TRUST_BADGES.map((b) => (
              <View key={b.label} style={styles.badge}>
                <Text style={styles.badgeText}>{b.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedTransition>

        {/* CTA */}
        <AnimatedTransition delay={500} duration={250}>
          <View style={styles.footer}>
            <Button
              title="Let's get started"
              onPress={() => router.push('/(onboarding)/chronotype')}
              size="lg"
              fullWidth
            />
          </View>
        </AnimatedTransition>

        {/* Medical disclaimer */}
        <AnimatedTransition delay={600} duration={200}>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerLabel}>Medical Disclaimer</Text>
            <Text style={styles.legal}>
              Not a substitute for medical advice. ShiftWell provides general
              wellness information based on circadian science research. Consult
              your physician before changing your sleep, diet, or work schedule
              — especially if you have a health condition or take medications.
            </Text>
          </View>
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

  /* Skip */
  skipRow: {
    alignItems: 'flex-end',
    marginTop: SPACING.lg,
  },
  skipBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
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
    fontSize: 30,
    fontWeight: '800',
    color: '#C8A84B',
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

  /* Trust badges */
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
  },
  badge: {
    backgroundColor: 'rgba(123,97,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B61FF',
  },

  /* CTA */
  footer: {
    marginBottom: SPACING.xl,
  },

  /* Medical disclaimer */
  disclaimerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  disclaimerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.muted,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  legal: {
    fontSize: 11,
    color: COLORS.text.dim,
    textAlign: 'center',
    lineHeight: 16,
  },
});
