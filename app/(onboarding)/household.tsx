import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';

const MIN_HOUSEHOLD = 1;
const MAX_HOUSEHOLD = 8;

export default function HouseholdScreen() {
  const setProfile = useUserStore((s) => s.setProfile);

  const [householdSize, setHouseholdSize] = useState(1);
  const [hasYoungChildren, setHasYoungChildren] = useState(false);
  const [hasPets, setHasPets] = useState(false);

  function increment() {
    setHouseholdSize((prev) => Math.min(prev + 1, MAX_HOUSEHOLD));
  }

  function decrement() {
    setHouseholdSize((prev) => Math.max(prev - 1, MIN_HOUSEHOLD));
  }

  function handleContinue() {
    setProfile({ householdSize, hasYoungChildren, hasPets });
    router.push('/(onboarding)/preferences');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar currentStep={3} totalSteps={5} />
        </View>

        <Text style={styles.title}>Tell us about your household</Text>
        <Text style={styles.subtitle}>
          This helps us create realistic sleep windows for your situation
        </Text>

        {/* Household size */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>
            How many people in your household?
          </Text>
          <View style={styles.counterRow}>
            <Pressable
              onPress={decrement}
              style={[
                styles.counterButton,
                householdSize <= MIN_HOUSEHOLD && styles.counterButtonDisabled,
              ]}
              disabled={householdSize <= MIN_HOUSEHOLD}
              accessibilityRole="button"
              accessibilityLabel="Decrease household size"
            >
              <Text
                style={[
                  styles.counterButtonText,
                  householdSize <= MIN_HOUSEHOLD &&
                    styles.counterButtonTextDisabled,
                ]}
              >
                \u2212
              </Text>
            </Pressable>
            <Text style={styles.counterValue}>{householdSize}</Text>
            <Pressable
              onPress={increment}
              style={[
                styles.counterButton,
                householdSize >= MAX_HOUSEHOLD && styles.counterButtonDisabled,
              ]}
              disabled={householdSize >= MAX_HOUSEHOLD}
              accessibilityRole="button"
              accessibilityLabel="Increase household size"
            >
              <Text
                style={[
                  styles.counterButtonText,
                  householdSize >= MAX_HOUSEHOLD &&
                    styles.counterButtonTextDisabled,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Young children toggle */}
        <Card style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.cardLabel}>
                Do you have children under 6?
              </Text>
              <Text style={styles.cardHint}>
                Young children may interrupt sleep
              </Text>
            </View>
            <Switch
              value={hasYoungChildren}
              onValueChange={setHasYoungChildren}
              trackColor={{
                false: COLORS.background.elevated,
                true: COLORS.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Pets toggle */}
        <Card style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.cardLabel}>
                Do you have pets that may wake you?
              </Text>
              <Text style={styles.cardHint}>
                Early morning pet needs can affect sleep
              </Text>
            </View>
            <Switch
              value={hasPets}
              onValueChange={setHasPets}
              trackColor={{
                false: COLORS.background.elevated,
                true: COLORS.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </View>
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
    marginBottom: SPACING['3xl'],
  },
  title: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING['3xl'],
    lineHeight: 22,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  cardHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING['2xl'],
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterButtonText: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  counterButtonTextDisabled: {
    color: COLORS.text.tertiary,
  },
  counterValue: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.accent.primary,
    minWidth: 48,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING['3xl'],
  },
});
