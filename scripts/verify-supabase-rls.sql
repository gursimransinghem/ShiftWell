\echo 'Running ShiftWell RLS assertions'

CREATE SCHEMA test;

CREATE OR REPLACE FUNCTION test.assert_true(condition BOOLEAN, label TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT condition THEN
    RAISE EXCEPTION 'assertion failed: %', label;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_eq(actual BIGINT, expected BIGINT, label TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'assertion failed: %, expected %, got %', label, expected, actual;
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA test TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO anon, authenticated, service_role;

\set user_a '00000000-0000-4000-8000-000000000001'
\set user_b '00000000-0000-4000-8000-000000000002'
\set user_c '00000000-0000-4000-8000-000000000003'

\echo 'Seeding users and cross-user rows as database owner'
INSERT INTO auth.users (id, email)
VALUES
  (:'user_a', 'a@example.test'),
  (:'user_b', 'b@example.test'),
  (:'user_c', 'c@example.test');

INSERT INTO users (id, email, display_name)
VALUES
  (:'user_a', 'a@example.test', 'User A'),
  (:'user_b', 'b@example.test', 'User B'),
  (:'user_c', 'c@example.test', 'User C');

INSERT INTO shifts (id, user_id, title, start_time, end_time, shift_type)
VALUES
  ('10000000-0000-4000-8000-000000000001', :'user_a', 'A night', '2026-06-01 19:00+00', '2026-06-02 07:00+00', 'night'),
  ('10000000-0000-4000-8000-000000000002', :'user_b', 'B day', '2026-06-01 07:00+00', '2026-06-01 19:00+00', 'day');

INSERT INTO personal_events (id, user_id, title, start_time, end_time)
VALUES
  ('20000000-0000-4000-8000-000000000001', :'user_a', 'A event', '2026-06-03 10:00+00', '2026-06-03 11:00+00'),
  ('20000000-0000-4000-8000-000000000002', :'user_b', 'B event', '2026-06-03 10:00+00', '2026-06-03 11:00+00');

INSERT INTO sleep_plans (id, user_id, plan_start_date, plan_end_date, plan_data)
VALUES
  ('30000000-0000-4000-8000-000000000001', :'user_a', '2026-06-01', '2026-06-07', '{"blocks":[]}'::jsonb),
  ('30000000-0000-4000-8000-000000000002', :'user_b', '2026-06-01', '2026-06-07', '{"blocks":[]}'::jsonb);

INSERT INTO health_data (id, user_id, date, actual_sleep_minutes, source)
VALUES
  ('40000000-0000-4000-8000-000000000001', :'user_a', '2026-06-01', 420, 'manual'),
  ('40000000-0000-4000-8000-000000000002', :'user_b', '2026-06-01', 390, 'manual');

INSERT INTO subscriptions (id, user_id, plan)
VALUES
  ('50000000-0000-4000-8000-000000000001', :'user_a', 'premium'),
  ('50000000-0000-4000-8000-000000000002', :'user_b', 'free');

\echo 'Verifying RLS catalog shape'
SELECT test.assert_eq(
  (
    SELECT COUNT(*) FROM pg_class
    WHERE relnamespace = 'public'::regnamespace
      AND relname IN (
        'users',
        'shifts',
        'personal_events',
        'sleep_plans',
        'health_data',
        'subscriptions',
        'ai_request_log',
        'audit_logs'
      )
      AND relrowsecurity
  ),
  8,
  'all app tables have row-level security enabled'
);

SELECT test.assert_true(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_request_log'
      AND policyname = 'Service role can insert AI logs'
      AND cmd = 'INSERT'
      AND 'service_role' = ANY (roles)
      AND NOT ('public' = ANY (roles))
  ),
  'ai_request_log insert policy is scoped to service_role'
);

SELECT test.assert_true(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sleep_plans'
      AND cmd = 'DELETE'
  ),
  'sleep_plans has a DELETE policy'
);

SELECT test.assert_true(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'health_data'
      AND cmd = 'DELETE'
  ),
  'health_data has a DELETE policy'
);

SELECT test.assert_eq(
  (
    SELECT COUNT(*) FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscriptions'
      AND cmd <> 'SELECT'
  ),
  0,
  'subscriptions has no client write policies'
);

\echo 'Verifying authenticated user isolation'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'user_a', false);

SELECT test.assert_eq((SELECT COUNT(*) FROM users), 1, 'user sees only own profile');
SELECT test.assert_eq((SELECT COUNT(*) FROM shifts), 1, 'user sees only own shifts');
SELECT test.assert_eq((SELECT COUNT(*) FROM personal_events), 1, 'user sees only own personal events');
SELECT test.assert_eq((SELECT COUNT(*) FROM sleep_plans), 1, 'user sees only own sleep plans');
SELECT test.assert_eq((SELECT COUNT(*) FROM health_data), 1, 'user sees only own health data');
SELECT test.assert_eq((SELECT COUNT(*) FROM subscriptions), 1, 'user sees only own subscription');
SELECT test.assert_eq((SELECT COUNT(*) FROM audit_logs WHERE user_id = :'user_b'), 0, 'user cannot see another audit trail');

INSERT INTO shifts (user_id, title, start_time, end_time, shift_type)
VALUES (:'user_a', 'A self insert', '2026-06-04 19:00+00', '2026-06-05 07:00+00', 'night');

UPDATE shifts
SET title = 'A self update'
WHERE id = '10000000-0000-4000-8000-000000000001';
SELECT test.assert_eq(
  (SELECT COUNT(*) FROM shifts WHERE title = 'A self update'),
  1,
  'user can update own shift'
);

UPDATE shifts
SET title = 'A tried to update B'
WHERE id = '10000000-0000-4000-8000-000000000002';

RESET ROLE;
SELECT test.assert_eq(
  (
    SELECT COUNT(*) FROM shifts
    WHERE id = '10000000-0000-4000-8000-000000000002'
      AND title = 'B day'
  ),
  1,
  'user cannot update another user shift'
);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'user_a', false);

DELETE FROM sleep_plans
WHERE id = '30000000-0000-4000-8000-000000000001';
SELECT test.assert_eq(
  (SELECT COUNT(*) FROM sleep_plans WHERE id = '30000000-0000-4000-8000-000000000001'),
  0,
  'user can delete own sleep plan'
);

DELETE FROM health_data
WHERE id = '40000000-0000-4000-8000-000000000002';

RESET ROLE;
SELECT test.assert_eq(
  (SELECT COUNT(*) FROM health_data WHERE id = '40000000-0000-4000-8000-000000000002'),
  1,
  'user cannot delete another user health row'
);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'user_a', false);

DO $$
BEGIN
  BEGIN
    INSERT INTO shifts (user_id, title, start_time, end_time, shift_type)
    VALUES ('00000000-0000-4000-8000-000000000002', 'bad cross-user insert', '2026-06-06 07:00+00', '2026-06-06 19:00+00', 'day');
    RAISE EXCEPTION 'expected cross-user shift insert to fail';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO subscriptions (user_id, plan)
    VALUES ('00000000-0000-4000-8000-000000000001', 'free');
    RAISE EXCEPTION 'expected direct subscription insert to fail';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

UPDATE subscriptions
SET plan = 'free'
WHERE id = '50000000-0000-4000-8000-000000000001';
SELECT test.assert_eq(
  (
    SELECT COUNT(*) FROM subscriptions
    WHERE id = '50000000-0000-4000-8000-000000000001'
      AND plan = 'premium'
  ),
  1,
  'direct subscription update does not mutate data'
);

DO $$
BEGIN
  BEGIN
    INSERT INTO audit_logs (user_id, action, table_name)
    VALUES ('00000000-0000-4000-8000-000000000001', 'INSERT', 'audit_logs');
    RAISE EXCEPTION 'expected direct audit log insert to fail';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO ai_request_log (user_id, model, tokens_used)
    VALUES ('00000000-0000-4000-8000-000000000001', 'client-forged', 1);
    RAISE EXCEPTION 'expected authenticated AI log insert to fail';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

\echo 'Verifying anon cannot see user rows'
RESET ROLE;
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', false);

SELECT test.assert_eq((SELECT COUNT(*) FROM users), 0, 'anon sees no profiles');
SELECT test.assert_eq((SELECT COUNT(*) FROM shifts), 0, 'anon sees no shifts');

\echo 'Verifying service role AI log insert'
RESET ROLE;
SET ROLE service_role;
SELECT set_config('request.jwt.claim.sub', '', false);

INSERT INTO ai_request_log (user_id, model, tokens_used, duration_ms, success)
VALUES (:'user_b', 'edge-function', 123, 50, true);

RESET ROLE;
SELECT test.assert_eq(
  (SELECT COUNT(*) FROM ai_request_log WHERE user_id = :'user_b' AND model = 'edge-function'),
  1,
  'service role can insert AI logs'
);

\echo 'Verifying delete_user RPC cascades user-owned data and preserves audit record'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'user_c', false);
SELECT delete_user();

RESET ROLE;
SELECT test.assert_eq((SELECT COUNT(*) FROM auth.users WHERE id = :'user_c'), 0, 'delete_user removes auth user');
SELECT test.assert_eq((SELECT COUNT(*) FROM users WHERE id = :'user_c'), 0, 'delete_user cascades public user profile');
SELECT test.assert_true(
  EXISTS (
    SELECT 1 FROM audit_logs
    WHERE user_id = :'user_c'
      AND action = 'DELETE'
      AND table_name = 'auth.users'
  ),
  'delete_user writes durable audit log'
);

\echo 'RLS assertions complete'
