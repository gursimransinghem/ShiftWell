-- Migration 005: Missing DELETE policies + numeric range CHECK constraints
-- Gives users GDPR/CCPA "right to deletion" over sleep_plans and health_data.
-- Adds CHECK constraints to reject obviously invalid numeric inputs at the DB layer.

-- ----------------------------------------------------------------
-- DELETE policies — tables that were missing them (per RLS audit)
-- ----------------------------------------------------------------

CREATE POLICY "Users can delete own sleep plans"
  ON sleep_plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health data"
  ON health_data FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Numeric range CHECK constraints
-- All constraints are NULL-safe (NULL values pass — columns are nullable)
-- ----------------------------------------------------------------

-- sleep minutes: 0 (no sleep tracked) to 1440 (full 24-hour day)
ALTER TABLE health_data
  ADD CONSTRAINT chk_health_data_sleep_minutes
  CHECK (actual_sleep_minutes IS NULL
      OR (actual_sleep_minutes >= 0 AND actual_sleep_minutes <= 1440));

-- commute time: 0 (work from home) to 480 minutes (8-hour edge case)
ALTER TABLE users
  ADD CONSTRAINT chk_users_commute_minutes
  CHECK (commute_minutes IS NULL
      OR (commute_minutes >= 0 AND commute_minutes <= 480));

-- household size: at least 1 (the user), capped at 20
ALTER TABLE users
  ADD CONSTRAINT chk_users_household_size
  CHECK (household_size IS NULL
      OR (household_size >= 1 AND household_size <= 20));

-- preferred sleep duration: 2.0–14.0 hours (covers medical extremes)
ALTER TABLE users
  ADD CONSTRAINT chk_users_sleep_hours_preferred
  CHECK (sleep_hours_preferred IS NULL
      OR (sleep_hours_preferred >= 2.0 AND sleep_hours_preferred <= 14.0));

-- caffeine half-life: 1.0–12.0 hours (published physiological range)
ALTER TABLE users
  ADD CONSTRAINT chk_users_caffeine_half_life
  CHECK (caffeine_half_life IS NULL
      OR (caffeine_half_life >= 1.0 AND caffeine_half_life <= 12.0));
