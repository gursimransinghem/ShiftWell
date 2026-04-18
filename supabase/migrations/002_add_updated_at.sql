-- Migration 002: Add updated_at to tables missing it
-- Affected: shifts, personal_events, sleep_plans, health_data
-- users and subscriptions already have updated_at from migration 001
-- The update_updated_at() trigger function already exists from migration 001

-- Step 1: Add columns with DEFAULT NULL so existing rows are physically NULL.
-- In PG11+ ADD COLUMN with a non-null DEFAULT is a metadata operation — existing
-- rows logically see the DEFAULT, so WHERE updated_at IS NULL would match nothing.
-- Using NULL default ensures the UPDATE backfill actually runs.
ALTER TABLE shifts         ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE personal_events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE sleep_plans    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE health_data    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NULL;

-- Step 2: Backfill existing rows with their creation time.
UPDATE shifts          SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE personal_events SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE sleep_plans     SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE health_data     SET updated_at = created_at WHERE updated_at IS NULL;

-- Step 3: Switch the column default to NOW() for all future inserts.
ALTER TABLE shifts         ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE personal_events ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE sleep_plans    ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE health_data    ALTER COLUMN updated_at SET DEFAULT NOW();

-- Auto-update triggers (reuse function from migration 001)
CREATE TRIGGER shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personal_events_updated_at
  BEFORE UPDATE ON personal_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sleep_plans_updated_at
  BEFORE UPDATE ON sleep_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER health_data_updated_at
  BEFORE UPDATE ON health_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
