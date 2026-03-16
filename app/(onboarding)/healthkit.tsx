import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import {
  isAvailable,
  requestAuthorization,
} from '@/src/lib/healthkit/healthkit-service';

export default function HealthKitScreen() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setHealthkitConnected = useUserStore((s) => s.setHealthkitConnected);

  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAvailability() {
      const available = await isAvailable();
      if (!mounted) return;

      if (!available) {
        // HealthKit not available (iPad, Android) — skip to completion
        completeOnboarding();
        router.replace('/(tabs)');
        return;
      }

      setChecking(false);
    }

    checkAvailability();

    return () => {
      mounted = false;
    };
  }, [completeOnboarding]);

  function finishOnboarding() {
    completeOnboarding();
    router.replace('/(tabs)');
  }

  async function handleConnect() {
    setConnecting(true);
    setError(null);

    try {
      const success = await requestAuthorization();

      if (success) {
        setHealthkitConnected(true);
        setConnected(true);
        // Brief success state before navigating
        setTimeout(finishOnboarding, 800);
      } else {
        setError(
          'Could not connect to Apple Health. You can enable this later in Settings.',
        );
        setConnecting(false);
      }
    } catch {
      setError(
        'Something went wrong. You can connect Apple Health later in Settings.',
      );
      setConnecting(false);
    }
  }

  if (checking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.subtitle}>Checking device compatibility...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ProgressBar currentStep={5} totalSteps={5} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Connect Apple Health</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Optional</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          ShiftWell can read your sleep data to show how well your actual sleep
          matches the plan.
        </Text>
        <Text style={[styles.subtitle, styles.subtitleExtra]}>
          It can also set your planned sleep schedule in Health, which activates
          iOS Sleep Focus mode.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Track Recovery</Text>
          <Text style={styles.cardDescription}>
            See your adherence score and weekly trends based on real sleep data
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Auto Sleep Focus</Text>
          <Text style={styles.cardDescription}>
            Your iPhone automatically silences notifications during planned sleep
          </Text>
        </Card>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {connected && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Connected to Apple Health
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title={connected ? 'Connected!' : 'Connect Apple Health'}
            onPress={handleConnect}
            size="lg"
            fullWidth
            loading={connecting}
            disabled={connected}
          />
          <View style={styles.skipSpacer} />
          <Button
            title="Skip for Now"
            onPress={finishOnboarding}
            variant="ghost"
            size="md"
            fullWidth
            disabled={connecting || connected}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
  },
  optionalBadge: {
    backgroundColor: COLORS.background.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  optionalText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  subtitleExtra: {
    marginTop: SPACING.md,
    marginBottom: SPACING['3xl'],
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#EF4444',
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 10,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  successText: {
    ...TYPOGRAPHY.body,
    color: '#22C55E',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING['3xl'],
  },
  skipSpacer: {
    height: SPACING.md,
  },
});
