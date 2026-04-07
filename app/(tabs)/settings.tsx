import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/user-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ---------------------------------------------------------------------------
// Stepper control
// ---------------------------------------------------------------------------

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChangeValue: (v: number) => void;
}

function Stepper({ label, unit, value, min, max, step, onChangeValue }: StepperProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.max(min, +(value - step).toFixed(1)))}
          disabled={value <= min}
          hitSlop={8}
        >
          <Ionicons name="remove" size={18} color={value <= min ? COLORS.text.muted : COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {value}
          <Text style={styles.stepperUnit}> {unit}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          onPress={() => onChangeValue(Math.min(max, +(value + step).toFixed(1)))}
          disabled={value >= max}
          hitSlop={8}
        >
          <Ionicons name="add" size={18} color={value >= max ? COLORS.text.muted : COLORS.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Row with chevron
// ---------------------------------------------------------------------------

function LinkRow({ label, value, onPress, destructive }: {
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { profile, setProfile } = useUserStore();
  const { isPremium, isInTrial, trialDaysLeft, plan } = usePremiumStore();

  const [sleepNeed, setSleepNeed] = useState(profile.sleepNeed ?? 7.5);
  const [caffeineHalfLife, setCaffeineHalfLife] = useState(profile.caffeineHalfLife ?? 5);
  const [commuteMinutes, setCommuteMinutes] = useState(profile.commuteDuration ?? 15);
  const [napMinutes, setNapMinutes] = useState(
    typeof profile.napPreference === 'number' ? profile.napPreference : 20,
  );
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setProfile({ sleepNeed, caffeineHalfLife, commuteDuration: commuteMinutes, napPreference: napMinutes > 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReferral() {
    Alert.alert(
      'Spread the Sleep \uD83C\uDF19',
      'Share ShiftWell with a colleague who works shifts. Every shift worker deserves better sleep.',
      [
        { text: 'Copy Link', onPress: () => {} },
        { text: 'Done', style: 'cancel' },
      ],
    );
  }

  const subscriptionLabel = isPremium
    ? `Pro \u2014 ${plan}`
    : isInTrial
    ? `Trial \u2014 ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`
    : 'Free';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Subscription */}
        <SectionHeader title="SUBSCRIPTION" />
        <View style={styles.card}>
          <LinkRow
            label="ShiftWell Pro"
            value={subscriptionLabel}
            onPress={() => router.push('/paywall')}
          />
        </View>

        {/* Sleep preferences */}
        <SectionHeader title="SLEEP PREFERENCES" />
        <View style={styles.card}>
          <Stepper label="Sleep need" unit="hrs" value={sleepNeed} min={5} max={10} step={0.5} onChangeValue={setSleepNeed} />
          <View style={styles.divider} />
          <Stepper label="Caffeine half-life" unit="hrs" value={caffeineHalfLife} min={3} max={9} step={0.5} onChangeValue={setCaffeineHalfLife} />
          <View style={styles.divider} />
          <Stepper label="Nap length" unit="min" value={napMinutes} min={10} max={90} step={5} onChangeValue={setNapMinutes} />
          <View style={styles.divider} />
          <Stepper label="Commute time" unit="min" value={commuteMinutes} min={0} max={120} step={5} onChangeValue={setCommuteMinutes} />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saved ? '\u2713 Saved' : 'Save Changes'}</Text>
        </TouchableOpacity>

        {/* Community */}
        <SectionHeader title="COMMUNITY" />
        <View style={styles.card}>
          <LinkRow label={'Spread the Sleep \uD83C\uDF19'} value="Refer a colleague" onPress={handleReferral} />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <LinkRow label="Privacy Policy" onPress={() => {}} />
          <View style={styles.divider} />
          <LinkRow label="Terms of Service" onPress={() => {}} />
        </View>

        <Text style={styles.legal}>
          ShiftWell provides general wellness information based on circadian science research.
          It is not medical advice. Always consult your doctor about sleep concerns.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.text.primary,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  destructiveLabel: {
    color: '#FF6B6B',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 52,
    textAlign: 'center',
  },
  stepperUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text.muted,
  },

  // Save button
  saveBtn: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  saveBtnDone: {
    backgroundColor: '#34D399',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B0D16',
  },

  // Legal
  legal: {
    fontSize: 10,
    color: COLORS.text.dim,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
});
