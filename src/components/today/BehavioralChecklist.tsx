/**
 * BehavioralChecklist — Phase 22
 *
 * Renders a checkable list of behavioral prescriptions on the Today screen:
 *   - Pre-shift nap reminder (if shift within 8h)
 *   - Caffeine cutoff time
 *   - Light exposure recommendation
 *
 * Checkboxes persist daily via AsyncStorage and auto-reset each morning.
 * Dark mode first, gold accents per Blend design system.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { COLORS, SPACING, RADIUS } from '@/src/theme';
import {
  generatePreShiftNapReminder,
  calculateCaffeineCutoff,
  suggestLightExposure,
} from '@/src/lib/prescriptions/shift-prescriptions';
import type { ShiftEvent } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  completed: boolean;
}

interface Props {
  /** The next upcoming shift (used to compute nap and caffeine times) */
  nextShift: ShiftEvent | null;
  /** Planned main sleep start (used for caffeine cutoff) */
  plannedSleepISO: string | null;
  /** Today's dominant shift type for light exposure recommendations */
  shiftType?: 'day' | 'evening' | 'night' | 'off';
  /** Local sunrise time for light exposure advice */
  sunriseISO?: string;
  /** Local sunset time for light exposure advice */
  sunsetISO?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'behavioral-checklist';
const NAP_LEAD_HOURS = 8; // Only show nap reminder if shift is within 8 hours

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(isoString: string): string {
  try {
    return format(new Date(isoString), 'h:mm a');
  } catch {
    return '';
  }
}

function todayStorageKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${STORAGE_KEY_PREFIX}-${today}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BehavioralChecklist({
  nextShift,
  plannedSleepISO,
  shiftType = 'day',
  sunriseISO,
  sunsetISO,
}: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted checkbox state for today
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(todayStorageKey());
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          setCompletedIds(new Set(parsed));
        }
      } catch {
        // Ignore storage errors
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  // Persist checkbox changes
  const toggleItem = useCallback(async (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Persist async (fire-and-forget)
      AsyncStorage.setItem(todayStorageKey(), JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  // Build checklist items based on context
  const items: ChecklistItem[] = [];

  // 1. Pre-shift nap reminder — only if shift is within 8 hours
  if (nextShift) {
    const now = new Date();
    const hoursUntilShift = (nextShift.start.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilShift > 0 && hoursUntilShift <= NAP_LEAD_HOURS) {
      const napReminder = generatePreShiftNapReminder(nextShift.start.toISOString());
      const napTimeStr = formatTime(napReminder.napTime);
      const melatoninTimeStr = formatTime(
        new Date(new Date(napReminder.napTime).getTime() - napReminder.melatoninTimingMin * 60 * 1000).toISOString()
      );
      items.push({
        id: 'nap',
        icon: 'bed-outline',
        label: `90-min nap at ${napTimeStr}`,
        sublabel: `Melatonin ${napReminder.melatoninDoseMg}mg at ${melatoninTimeStr}`,
        completed: completedIds.has('nap'),
      });
    }
  }

  // 2. Caffeine cutoff
  if (plannedSleepISO) {
    const cutoffISO = calculateCaffeineCutoff(plannedSleepISO);
    const cutoffStr = formatTime(cutoffISO);
    items.push({
      id: 'caffeine',
      icon: 'cafe-outline',
      label: `Last caffeine by ${cutoffStr}`,
      sublabel: '2× half-life clearance rule',
      completed: completedIds.has('caffeine'),
    });
  }

  // 3. Light exposure
  const now = new Date();
  const defaultSunrise = new Date(now);
  defaultSunrise.setHours(6, 30, 0, 0);
  const defaultSunset = new Date(now);
  defaultSunset.setHours(19, 30, 0, 0);

  const lightRec = suggestLightExposure(
    shiftType,
    sunriseISO ?? defaultSunrise.toISOString(),
    sunsetISO ?? defaultSunset.toISOString(),
  );

  const lightIcon =
    lightRec.direction === 'bright' ? 'sunny-outline'
    : lightRec.direction === 'dim' ? 'partly-sunny-outline'
    : 'moon-outline';

  items.push({
    id: 'light',
    icon: lightIcon,
    label: `${lightRec.durationMin}min light: ${lightRec.direction === 'bright' ? 'bright' : lightRec.direction === 'dim' ? 'dim' : 'avoid'}`,
    sublabel: lightRec.timing,
    completed: completedIds.has('light'),
  });

  if (items.length === 0 || !isLoaded) return null;

  return (
    <View>
      <Text style={styles.sectionLabel}>TODAY'S PROTOCOLS</Text>

      <View style={styles.card}>
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => toggleItem(item.id)}
            style={[
              styles.row,
              index < items.length - 1 && styles.rowBorder,
            ]}
          >
            {/* Checkbox */}
            <View style={[styles.checkbox, item.completed && styles.checkboxDone]}>
              {item.completed && (
                <Ionicons name="checkmark" size={12} color="#0A0A0F" />
              )}
            </View>

            {/* Icon */}
            <View style={styles.iconCircle}>
              <Ionicons
                name={item.icon as any}
                size={15}
                color={item.completed ? COLORS.text.tertiary : COLORS.accent.primary}
              />
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
              <Text
                style={[
                  styles.itemLabel,
                  item.completed && styles.itemLabelDone,
                ]}
              >
                {item.label}
              </Text>
              {item.sublabel && (
                <Text style={styles.itemSublabel}>{item.sublabel}</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: SPACING.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border.subtle,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: COLORS.accent.primary,
    borderColor: COLORS.accent.primary,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  itemLabelDone: {
    color: COLORS.text.tertiary,
    textDecorationLine: 'line-through',
  },
  itemSublabel: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    lineHeight: 16,
    marginTop: 1,
  },
});
