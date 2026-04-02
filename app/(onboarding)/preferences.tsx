import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import OptionCard from '@/src/components/ui/OptionCard';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';

const SLEEP_HOURS = [5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;

const CAFFEINE_OPTIONS = [
  { label: 'Low', description: '~3 hour half-life', halfLife: 3 },
  { label: 'Normal', description: '~5 hour half-life', halfLife: 5 },
  { label: 'High', description: '~7 hour half-life', halfLife: 7 },
] as const;

export default function PreferencesScreen() {
  const setProfile = useUserStore((s) => s.setProfile);

  const [sleepNeed, setSleepNeed] = useState(7.5);
  const [napPreference, setNapPreference] = useState(true);
  const [caffeineHalfLife, setCaffeineHalfLife] = useState(5);

  function handleComplete() {
    setProfile({
      sleepNeed,
      napPreference,
      caffeineHalfLife,
    });
    router.push('/(onboarding)/am-routine');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar
            currentStep={ONBOARDING_STEPS.preferences}
            totalSteps={ONBOARDING_TOTAL_STEPS}
          />
        </View>

        <Text style={styles.title}>Your Sleep Preferences</Text>
        <Text style={styles.subtitle}>
          We'll use these to generate your personalized sleep plan
        </Text>

        {/* Sleep need */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>
            How many hours of sleep do you need?
          </Text>
          <View style={styles.chipGrid}>
            {SLEEP_HOURS.map((hours) => (
              <View key={hours} style={styles.chipWrapper}>
                <OptionCard
                  title={`${hours}h`}
                  selected={sleepNeed === hours}
                  onPress={() => setSleepNeed(hours)}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Nap preference */}
        <Card style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.cardLabel}>
                Are you open to strategic naps?
              </Text>
              <Text style={styles.cardHint}>
                Short naps can help during shift transitions
              </Text>
            </View>
            <Switch
              value={napPreference}
              onValueChange={setNapPreference}
              trackColor={{
                false: COLORS.background.elevated,
                true: COLORS.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Caffeine sensitivity */}
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Caffeine sensitivity</Text>
          <View style={styles.optionList}>
            {CAFFEINE_OPTIONS.map((option) => (
              <OptionCard
                key={option.label}
                title={option.label}
                description={option.description}
                selected={caffeineHalfLife === option.halfLife}
                onPress={() => setCaffeineHalfLife(option.halfLife)}
              />
            ))}
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title="Next"
            onPress={handleComplete}
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
    marginBottom: SPACING.md,
  },
  cardHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chipWrapper: {
    width: '22%',
    minWidth: 72,
  },
  optionList: {
    gap: SPACING.sm,
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
