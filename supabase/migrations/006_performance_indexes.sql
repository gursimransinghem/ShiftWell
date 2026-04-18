-- Migration 006: Performance indexes for common query patterns
-- All indexes are partial or composite to match real app access patterns.

-- ----------------------------------------------------------------
-- shifts: date range queries (most common — "show me this week's shifts")
-- Covers: WHERE user_id = $1 AND start_time >= $2 AND end_time <= $3
-- Drop the narrower idx_shifts_user_date (user_id, start_time) from 001
-- — it is fully redundant once this wider index exists.
-- ----------------------------------------------------------------
DROP INDEX IF EXISTS idx_shifts_user_date;

CREATE INDEX idx_shifts_user_date_range
  ON shifts (user_id, start_time, end_time);

-- shifts: filter by type for analytics ("how many night shifts this month?")
CREATE INDEX idx_shifts_user_type
  ON shifts (user_id, shift_type);

-- ----------------------------------------------------------------
-- sleep_plans: range overlap queries need both boundary columns indexed
-- Covers: WHERE user_id = $1 AND plan_start_date <= $2 AND plan_end_date >= $2
-- ----------------------------------------------------------------
CREATE INDEX idx_sleep_plans_user_end_date
  ON sleep_plans (user_id, plan_end_date);

-- ----------------------------------------------------------------
-- health_data: covering index for date range + source filter
-- Covers: WHERE user_id = $1 AND date BETWEEN $2 AND $3 AND source = $4
-- ----------------------------------------------------------------
CREATE INDEX idx_health_data_user_date_source
  ON health_data (user_id, date, source);

-- ----------------------------------------------------------------
-- subscriptions: partial index for premium status check
-- The app hot-path query is: "is this user currently premium?"
-- Partial index (plan = 'premium') keeps it tiny and fast.
-- ----------------------------------------------------------------
CREATE INDEX idx_subscriptions_active_premium
  ON subscriptions (user_id, expires_at)
  WHERE plan = 'premium';

-- ----------------------------------------------------------------
-- personal_events: range queries (same pattern as shifts)
-- ----------------------------------------------------------------
CREATE INDEX idx_personal_events_user_date_range
  ON personal_events (user_id, start_time, end_time);
