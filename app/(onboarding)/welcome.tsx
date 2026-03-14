import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';

const VALUE_POINTS = [
  { icon: '\u{1F4C5}', text: 'Import your shift schedule' },
  { icon: '\u{1F4A4}', text: 'Get personalized sleep plans' },
  { icon: '\u{1F4E4}', text: 'Export to your calendar' },
] as const;

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar currentStep={1} totalSteps={4} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.appName}>NightShift</Text>
          <Text style={styles.tagline}>
            Science-backed sleep optimization for shift workers
          </Text>
        </View>

        <View style={styles.valuePoints}>
          {VALUE_POINTS.map((point) => (
            <View key={point.text} style={styles.valueRow}>
              <Text style={styles.valueIcon}>{point.icon}</Text>
              <Text style={styles.valueText}>{point.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/chronotype')}
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
});
