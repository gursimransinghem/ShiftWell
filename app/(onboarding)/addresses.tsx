import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ProgressBar } from '@/src/components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import { estimateCommuteDuration } from '@/src/utils/commute';
import { ONBOARDING_TOTAL_STEPS, ONBOARDING_STEPS } from '@/src/constants/onboarding';

export default function AddressesScreen() {
  const setProfile = useUserStore((s) => s.setProfile);

  const [workAddress, setWorkAddress] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  async function handleCalculate() {
    setCalculating(true);
    const minutes = await estimateCommuteDuration(workAddress, homeAddress);
    setEstimatedMinutes(minutes);
    setCalculating(false);
  }

  function handleNext() {
    setProfile({
      workAddress,
      homeAddress,
      commuteDuration: estimatedMinutes ?? 30,
    });
    router.push('/(onboarding)/healthkit');
  }

  function handleSkip() {
    setProfile({
      workAddress: '',
      homeAddress: '',
      commuteDuration: 30,
    });
    router.push('/(onboarding)/healthkit');
  }

  const canCalculate = workAddress.trim().length > 0 && homeAddress.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ProgressBar
              currentStep={ONBOARDING_STEPS.addresses}
              totalSteps={ONBOARDING_TOTAL_STEPS}
            />
          </View>

          <Text style={styles.title}>Your Commute</Text>
          <Text style={styles.subtitle}>
            Enter your work and home addresses so we can factor in commute time
          </Text>

          <Card style={styles.card}>
            <Text style={styles.fieldLabel}>Work address</Text>
            <TextInput
              style={styles.textInput}
              value={workAddress}
              onChangeText={setWorkAddress}
              placeholder="e.g. 123 Main St, Tampa, FL"
              placeholderTextColor={COLORS.text.tertiary}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Work address"
            />

            <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>Home address</Text>
            <TextInput
              style={styles.textInput}
              value={homeAddress}
              onChangeText={setHomeAddress}
              placeholder="e.g. 456 Oak Ave, Tampa, FL"
              placeholderTextColor={COLORS.text.tertiary}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Home address"
            />
          </Card>

          <Button
            title={calculating ? 'Calculating...' : 'Calculate Commute'}
            onPress={handleCalculate}
            variant="secondary"
            size="md"
            fullWidth
            disabled={!canCalculate || calculating}
            loading={calculating}
          />

          {estimatedMinutes !== null && (
            <Card style={styles.resultCard}>
              <Text style={styles.resultText}>
                Estimated commute: {estimatedMinutes} minutes
              </Text>
              <Text style={styles.resultNote}>
                This is a rough estimate based on distance. You can adjust it later in Settings.
              </Text>
            </Card>
          )}

          <View style={styles.footer}>
            <Button
              title="Next"
              onPress={handleNext}
              size="lg"
              fullWidth
            />
            <Button
              title="Skip — I'll set this up later"
              onPress={handleSkip}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardView: {
    flex: 1,
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
  fieldLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  fieldLabelSpacing: {
    marginTop: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text.primary,
    ...TYPOGRAPHY.body,
  },
  resultCard: {
    marginTop: SPACING.lg,
  },
  resultText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  resultNote: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING['3xl'],
    gap: SPACING.sm,
  },
});
