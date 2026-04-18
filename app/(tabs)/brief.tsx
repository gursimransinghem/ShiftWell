import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { usePlanStore } from '@/src/store/plan-store';
import { useUserStore } from '@/src/store/user-store';
import { COLORS, SPACING, PURPLE } from '@/src/theme';
import { Text } from '@/src/components/ui';
import type { AdaptiveContext } from '@/src/lib/adaptive/types';
import type { UserProfile } from '@/src/lib/circadian/types';

// ─── Science data ─────────────────────────────────────────────────────────────

const SCIENCE_BY_TRANSITION: Record<
  string,
  { stat: string; finding: string; citation: string }
> = {
  'day-to-night': {
    stat: '50%',
    finding:
      'Prophylactic pre-shift naps reduce errors and accidents by up to 50% in night-shift workers.',
    citation: 'Ruggiero & Redeker, 2014',
  },
  'night-to-day': {
    stat: '1h/day',
    finding:
      'The circadian clock can only re-advance approximately 1 hour per day with optimal morning bright light. Rushing re-entrainment worsens outcomes.',
    citation: 'Boivin & Boudreau, 2014',
  },
  'isolated-night': {
    stat: '3%',
    finding:
      'Only 3% of night shift workers fully adapt their circadian clock. For isolated night shifts, clock-shifting is counterproductive — nap strategy beats schedule change.',
    citation: 'Circadian Biology Research, 2023',
  },
  default: {
    stat: '32%',
    finding:
      '32% of healthcare shift workers report getting less than 6 hours of sleep. Even 30 minutes of proactive preparation per rotation is associated with significantly better outcomes.',
    citation: 'NIOSH Shift Work Research',
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function buildBriefNarrative(
  profile: UserProfile,
  transitionType: string,
): string {
  const parts: string[] = [];

  if (profile.hasYoungChildren && profile.householdSize > 1) {
    parts.push(
      'With young kids in the house, your morning window is your highest-friction point during night shifts. Getting ahead of this conversation now makes the difference between a manageable week and an exhausting one. Sit down with your partner tonight to divide the next few mornings.',
    );
  } else if (profile.hasYoungChildren) {
    parts.push(
      'With young children, plan your sleep window around school and care routines. Consider preparing meals and school bags the night before to minimize morning friction during your recovery hours.',
    );
  }

  if (profile.hasPets) {
    parts.push(
      'Move the dog walk to your evening routine during this stretch — mornings need to stay clear for sleep.',
    );
  }

  if (profile.commuteDuration >= 30) {
    parts.push(
      'Your commute is long enough to matter. Blue-blockers for the drive home help protect your melatonin — especially critical when coming off a night shift.',
    );
  }

  if (transitionType === 'day-to-night' && profile.householdSize > 1) {
    parts.push(
      "Ask your household to keep noise down during your sleep window. A 'Do Not Disturb' sign and headphone reminder goes a long way.",
    );
  }

  if (parts.length === 0) {
    parts.push(
      "Your schedule change is coming up. Follow the adjusted sleep windows below — they've been calibrated to your chronotype and rotation pattern.",
    );
  }

  return parts.join('\n\n');
}

function buildChecklist(
  profile: UserProfile,
  transitionType: string,
): string[] {
  const items: string[] = [];
  if (profile.householdSize > 1)
    items.push('Brief your household about your sleep schedule this week');
  if (profile.hasYoungChildren)
    items.push('Arrange morning coverage with your partner or family');
  if (profile.hasPets)
    items.push('Move pet care to evenings during your night shift stretch');
  if (profile.commuteDuration >= 20)
    items.push('Pack blue-blocker glasses for your commute home');
  items.push('Set up blackout curtains or sleep mask');
  items.push('Enable Do Not Disturb / sleep focus mode');
  if (transitionType === 'day-to-night')
    items.push('Meal prep for the first night — no cooking decisions at 2 PM');
  return items;
}

function getSituationSubtitle(
  transitionType: string | null,
  daysUntilTransition: number,
): string {
  const d = daysUntilTransition;
  const dayStr = `${d} day${d === 1 ? '' : 's'}`;
  switch (transitionType) {
    case 'day-to-night':
      return `Night shift stretch approaching in ${dayStr}. Prepare your clock now.`;
    case 'night-to-day':
      return `Returning to day schedule in ${dayStr}. Bridge sleep starts tonight.`;
    case 'isolated-night':
      return `Single night shift in ${dayStr}. No clock shift needed — nap strategy only.`;
    default:
      return `Schedule change in ${d} days. Your plan has been adjusted.`;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NumberBadge({ n }: { n: number }) {
  return (
    <View style={styles.badge}>
      <Text variant="caption" weight="700" style={styles.badgeText}>{n}</Text>
    </View>
  );
}

function BriefCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text variant="label" weight="700" color="primary">{children}</Text>;
}

// ─── All-Clear screen ─────────────────────────────────────────────────────────

function AllClearScreen({
  adaptiveContext,
}: {
  adaptiveContext: AdaptiveContext | null;
}) {
  return (
    <View style={styles.allClearContainer}>
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={40} color={COLORS.semantic.success} />
      </View>
      <Text variant="h3" weight="700" color="primary" style={styles.allClearTitle}>All Clear</Text>
      {adaptiveContext === null ? (
        <Text variant="body" color="secondary" align="center" style={styles.allClearSubtitle}>
          Building your sleep profile… Come back after a few days of use.
        </Text>
      ) : (
        <Text variant="body" color="secondary" align="center" style={styles.allClearSubtitle}>
          Your plan is optimized for your current rotation.
        </Text>
      )}

      {adaptiveContext !== null && (
        <View style={styles.metricsRow}>
          {adaptiveContext.recovery.zone !== null && (
            <MetricPill
              label="Recovery"
              value={adaptiveContext.recovery.zone.toUpperCase()}
              color={
                adaptiveContext.recovery.zone === 'green'
                  ? COLORS.semantic.success
                  : adaptiveContext.recovery.zone === 'yellow'
                    ? COLORS.semantic.warning
                    : COLORS.semantic.error
              }
            />
          )}
          <MetricPill
            label="Debt"
            value={
              adaptiveContext.debt.severity === 'none'
                ? 'None'
                : `${adaptiveContext.debt.rollingHours.toFixed(1)}h`
            }
            color={
              adaptiveContext.debt.severity === 'none'
                ? COLORS.semantic.success
                : adaptiveContext.debt.severity === 'mild'
                  ? COLORS.semantic.warning
                  : COLORS.semantic.error
            }
          />
          <MetricPill
            label="Days tracked"
            value={String(adaptiveContext.meta.daysTracked)}
            color={COLORS.accent.primary}
          />
        </View>
      )}
    </View>
  );
}

function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.metricPill}>
      <Text variant="body" weight="700" style={[styles.metricValue, { color }]}>{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </View>
  );
}

// ─── Full brief ───────────────────────────────────────────────────────────────

function FullBrief({
  adaptiveContext,
  profile,
}: {
  adaptiveContext: AdaptiveContext;
  profile: UserProfile;
}) {
  const { schedule, circadian, debt, recovery, meta } = adaptiveContext;
  const { transitionType, daysUntilTransition, bankingWindowOpen } = schedule;

  const transitionKey = transitionType ?? 'default';
  const science =
    SCIENCE_BY_TRANSITION[transitionKey] ?? SCIENCE_BY_TRANSITION.default;

  const narrative = buildBriefNarrative(profile, transitionKey);
  const checklistItems = buildChecklist(profile, transitionKey);
  const [checked, setChecked] = useState<boolean[]>(
    () => new Array(checklistItems.length).fill(false),
  );

  const dailyTargets = circadian.protocol?.dailyTargets ?? [];

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <>
      {/* Part 1: The Situation */}
      <BriefCard style={styles.situationCard}>
        <Text variant="h3" weight="700" color="primary" style={styles.briefTitle}>Your Brief</Text>
        <Text variant="bodySmall" color="secondaryBright" style={styles.situationSubtitle}>
          {getSituationSubtitle(transitionType, daysUntilTransition)}
        </Text>
        {bankingWindowOpen && (
          <View style={styles.bankingPill}>
            <Text variant="caption" weight="600" style={styles.bankingPillText}>
              Banking window open — extend sleep tonight
            </Text>
          </View>
        )}
      </BriefCard>

      {/* Part 2: Personalized Brief */}
      <BriefCard>
        <View style={styles.cardHeader}>
          <NumberBadge n={2} />
          <SectionTitle>Personalized Brief</SectionTitle>
        </View>
        <Text variant="bodySmall" color="secondaryBright" style={styles.narrativeText}>{narrative}</Text>
      </BriefCard>

      {/* Part 3: Sleep Schedule */}
      <BriefCard>
        <View style={styles.cardHeader}>
          <NumberBadge n={3} />
          <SectionTitle>Sleep Schedule</SectionTitle>
        </View>
        {dailyTargets.length === 0 ? (
          <Text variant="bodySmall" color="secondaryBright" style={styles.lineHeight}>
            Your sleep windows are already optimized for this transition.
          </Text>
        ) : (
          dailyTargets.map((target, i) => {
            const dateStr = format(target.date, 'EEE, MMM d');
            const adjustStr =
              target.bedtimeAdjustMinutes === 0
                ? 'No change'
                : target.bedtimeAdjustMinutes > 0
                  ? `+${target.bedtimeAdjustMinutes} min later`
                  : `${target.bedtimeAdjustMinutes} min earlier`;
            return (
              <View key={i} style={styles.scheduleRow}>
                <View style={styles.scheduleRowTop}>
                  <Text variant="label" weight="600" color="primary">{dateStr}</Text>
                  <Text
                    variant="label"
                    weight="600"
                    style={{
                      color:
                        target.bedtimeAdjustMinutes === 0
                          ? COLORS.text.muted
                          : COLORS.accent.primary,
                    }}
                  >
                    {adjustStr}
                  </Text>
                </View>
                <Text variant="caption" color="secondary" style={styles.scheduleGuidanceText}>
                  {target.lightGuidance}
                </Text>
                {target.napGuidance && (
                  <Text variant="caption" style={[styles.scheduleNapText, { color: PURPLE }]}>
                    {target.napGuidance}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </BriefCard>

      {/* Part 4: Household Prep Checklist */}
      <BriefCard>
        <View style={styles.cardHeader}>
          <NumberBadge n={4} />
          <SectionTitle>Household Prep</SectionTitle>
        </View>
        {checklistItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.checklistRow}
            onPress={() => toggleItem(i)}
            activeOpacity={0.7}
          >
            {checked[i] ? (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.semantic.success} />
            ) : (
              <Ionicons
                name="ellipse-outline"
                size={22}
                color={COLORS.text.dim}
              />
            )}
            <Text
              variant="bodySmall"
              color={checked[i] ? 'muted' : 'secondaryBright'}
              style={[styles.checklistTextBase, checked[i] && styles.checklistTextChecked]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </BriefCard>

      {/* Part 5: The Science */}
      <BriefCard>
        <View style={styles.cardHeader}>
          <NumberBadge n={5} />
          <SectionTitle>The Science</SectionTitle>
        </View>
        <Text variant="h2" weight="700" style={{ color: COLORS.accent.primary, marginBottom: 8 }}>
          {science.stat}
        </Text>
        <Text variant="bodySmall" color="secondaryBright" style={styles.lineHeight}>{science.finding}</Text>
        <Text variant="caption" color="muted" style={styles.scienceCitation}>{science.citation}</Text>
      </BriefCard>
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BriefScreen() {
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);
  const daysUntilTransition = usePlanStore((s) => s.daysUntilTransition);
  const profile = useUserStore((s) => s.profile);

  const showBrief =
    adaptiveContext !== null && daysUntilTransition <= 7;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h3" weight="700" style={[styles.screenHeader, { color: COLORS.accent.primary }]}>
          Pre-Shift Brief
        </Text>

        {showBrief ? (
          <FullBrief adaptiveContext={adaptiveContext} profile={profile} />
        ) : (
          <AllClearScreen adaptiveContext={adaptiveContext} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  screenHeader: {
    marginBottom: 16,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  // Badge
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.text.primary,
  },

  // Part 1 — Situation
  situationCard: {
    backgroundColor: 'rgba(200,168,75,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.18)',
  },
  briefTitle: {
    marginBottom: 6,
  },
  situationSubtitle: {
    lineHeight: 20,
  },
  bankingPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(200,168,75,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bankingPillText: {
    color: COLORS.accent.primary,
  },

  // Part 2 — Narrative
  narrativeText: {
    lineHeight: 22,
  },

  // Part 3 — Sleep Schedule
  scheduleRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  scheduleRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleGuidanceText: {
    lineHeight: 18,
  },
  scheduleNapText: {
    marginTop: 3,
    fontStyle: 'italic',
  },

  // Part 4 — Checklist
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checklistTextBase: {
    flex: 1,
    lineHeight: 20,
    paddingTop: 1,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
  },

  // Part 5 — Science
  scienceCitation: {
    fontStyle: 'italic',
    marginTop: 6,
  },
  lineHeight: {
    lineHeight: 21,
  },

  // All Clear
  allClearContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  allClearTitle: {
    marginBottom: 10,
  },
  allClearSubtitle: {
    lineHeight: 22,
    marginBottom: 28,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricPill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  metricValue: {
    marginBottom: 2,
  },
});
