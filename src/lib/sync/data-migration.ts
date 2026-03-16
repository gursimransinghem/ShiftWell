/**
 * One-time migration of local AsyncStorage data to Supabase
 * when a Phase 1 user creates an account.
 *
 * Reads from the existing Zustand persist keys:
 * - 'nightshift-user' -> users table
 * - 'nightshift-shifts' -> shifts table
 * - nightshift plan data -> sleep_plans table
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase/client';

export interface MigrationResult {
  userMigrated: boolean;
  shiftsMigrated: number;
  sleepPlanMigrated: boolean;
  errors: string[];
}

/**
 * Check whether there is existing local data that needs migration.
 * Returns true if any of the Zustand persist keys contain data.
 */
export async function hasLocalData(): Promise<boolean> {
  const keys = ['nightshift-user', 'nightshift-shifts', 'nightshift-plan'];
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Migrate all locally stored ShiftWell data to the cloud for the given user.
 *
 * This is idempotent -- repeated calls will upsert (not duplicate) rows
 * because every record carries a stable `id`.
 */
export async function migrateLocalDataToCloud(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    userMigrated: false,
    shiftsMigrated: 0,
    sleepPlanMigrated: false,
    errors: [],
  };

  // --- 1. Migrate user profile ---
  try {
    const raw = await AsyncStorage.getItem('nightshift-user');
    if (raw) {
      const stored = JSON.parse(raw);
      // Zustand persist wraps state; unwrap if needed
      const profile = stored?.state ?? stored;

      const { error } = await supabase.from('users').upsert({
        id: userId,
        email: profile.email ?? '',
        display_name: profile.displayName ?? profile.display_name ?? null,
        chronotype: profile.chronotype ?? 'intermediate',
        sleep_hours_preferred: profile.sleepHoursPreferred ?? profile.sleep_hours_preferred ?? null,
        caffeine_sensitivity: profile.caffeineSensitivity ?? profile.caffeine_sensitivity ?? null,
        caffeine_half_life: profile.caffeineHalfLife ?? profile.caffeine_half_life ?? null,
        nap_preference: profile.napPreference ?? profile.nap_preference ?? false,
        household_size: profile.householdSize ?? profile.household_size ?? 1,
        has_young_children: profile.hasYoungChildren ?? profile.has_young_children ?? false,
        has_pets: profile.hasPets ?? profile.has_pets ?? false,
        commute_minutes: profile.commuteMinutes ?? profile.commute_minutes ?? 0,
        onboarding_complete: profile.onboardingComplete ?? profile.onboarding_complete ?? false,
      });
      if (error) throw error;
      result.userMigrated = true;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`User profile migration failed: ${message}`);
  }

  // --- 2. Migrate shifts ---
  try {
    const raw = await AsyncStorage.getItem('nightshift-shifts');
    if (raw) {
      const stored = JSON.parse(raw);
      // Zustand persist wraps state; unwrap if needed
      const shifts: Record<string, unknown>[] = stored?.state?.shifts ?? stored?.shifts ?? stored;

      if (Array.isArray(shifts) && shifts.length > 0) {
        const rows = shifts.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          user_id: userId,
          title: (s.title as string) ?? null,
          start_time: (s.startTime ?? s.start_time ?? s.start) as string,
          end_time: (s.endTime ?? s.end_time ?? s.end) as string,
          shift_type: (s.shiftType ?? s.shift_type ?? 'night') as string,
          source: (s.source ?? 'manual') as string,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('shifts').upsert(rows as any);
        if (error) throw error;
        result.shiftsMigrated = rows.length;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`Shifts migration failed: ${message}`);
  }

  // --- 3. Migrate sleep plan ---
  try {
    const raw = await AsyncStorage.getItem('nightshift-plan');
    if (raw) {
      const stored = JSON.parse(raw);
      const plan = stored?.state ?? stored;

      if (plan && (plan.planStartDate ?? plan.plan_start_date ?? plan.startDate)) {
        const { error } = await supabase.from('sleep_plans').upsert({
          id: plan.id ?? `${userId}-plan`,
          user_id: userId,
          plan_start_date: plan.planStartDate ?? plan.plan_start_date ?? plan.startDate,
          plan_end_date: plan.planEndDate ?? plan.plan_end_date ?? plan.endDate,
          plan_data: plan.planData ?? plan.plan_data ?? plan,
        });
        if (error) throw error;
        result.sleepPlanMigrated = true;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`Sleep plan migration failed: ${message}`);
  }

  return result;
}
