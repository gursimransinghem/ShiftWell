-- ShiftWell Phase 2 — Initial Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================================
-- HELPER: auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USERS TABLE
-- Extended profile beyond Supabase auth.users
-- Maps to UserProfile TypeScript type
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  chronotype TEXT CHECK (chronotype IN ('early', 'intermediate', 'late')) DEFAULT 'intermediate',
  sleep_hours_preferred NUMERIC(3,1) DEFAULT 7.5,
  caffeine_sensitivity TEXT CHECK (caffeine_sensitivity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  caffeine_half_life NUMERIC(3,1) DEFAULT 5.0,
  nap_preference BOOLEAN DEFAULT true,
  household_size INTEGER DEFAULT 1,
  has_young_children BOOLEAN DEFAULT false,
  has_pets BOOLEAN DEFAULT false,
  commute_minutes INTEGER DEFAULT 30,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SHIFTS TABLE
-- Maps to ShiftEvent in types.ts
-- ============================================================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Shift',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  shift_type TEXT CHECK (shift_type IN ('day', 'evening', 'night', 'extended')) NOT NULL,
  source TEXT CHECK (source IN ('manual', 'ics_import')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, start_time, end_time)
);

CREATE INDEX idx_shifts_user_date ON shifts (user_id, start_time);

-- ============================================================
-- PERSONAL EVENTS TABLE
-- Maps to PersonalEvent in types.ts
-- ============================================================
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personal_events_user_date ON personal_events (user_id, start_time);

-- ============================================================
-- SLEEP PLANS TABLE
-- Stores generated plans as JSONB (the full PlanBlock[] array)
-- ============================================================
CREATE TABLE sleep_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_start_date DATE NOT NULL,
  plan_end_date DATE NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, plan_start_date, plan_end_date)
);

CREATE INDEX idx_sleep_plans_user_date ON sleep_plans (user_id, plan_start_date);

-- ============================================================
-- HEALTH DATA TABLE
-- Actual sleep data from HealthKit or manual entry
-- ============================================================
CREATE TABLE health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  actual_sleep_start TIMESTAMPTZ,
  actual_sleep_end TIMESTAMPTZ,
  actual_sleep_minutes INTEGER,
  sleep_quality_score INTEGER CHECK (sleep_quality_score BETWEEN 1 AND 10),
  in_bed_start TIMESTAMPTZ,
  in_bed_end TIMESTAMPTZ,
  heart_rate_avg_sleeping NUMERIC(4,1),
  source TEXT CHECK (source IN ('healthkit', 'manual')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date, source)
);

CREATE INDEX idx_health_data_user_date ON health_data (user_id, date);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- Tracks premium status (RevenueCat is source of truth)
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('free', 'premium')) DEFAULT 'free',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revenue_cat_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY
-- Every user can only access their own data
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- SHIFTS
CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shifts"
  ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shifts"
  ON shifts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shifts"
  ON shifts FOR DELETE USING (auth.uid() = user_id);

-- PERSONAL EVENTS
CREATE POLICY "Users can view own personal events"
  ON personal_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personal events"
  ON personal_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personal events"
  ON personal_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own personal events"
  ON personal_events FOR DELETE USING (auth.uid() = user_id);

-- SLEEP PLANS
CREATE POLICY "Users can view own sleep plans"
  ON sleep_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep plans"
  ON sleep_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep plans"
  ON sleep_plans FOR UPDATE USING (auth.uid() = user_id);

-- HEALTH DATA
CREATE POLICY "Users can view own health data"
  ON health_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health data"
  ON health_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health data"
  ON health_data FOR UPDATE USING (auth.uid() = user_id);

-- SUBSCRIPTIONS (read only — Edge Functions handle writes)
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);
