-- Migration 007: Harden ai_request_log INSERT policy
-- Surfaced by the 2026-05-23 A/B stress-test security audit.
--
-- PROBLEM
-- Migration 002_ai_request_log created the INSERT policy
-- "Service role can insert AI logs" with `WITH CHECK (true)`. The comment said
-- "service role can insert", but WITH CHECK (true) lets ANY authenticated user
-- INSERT rows into ai_request_log — including rows carrying another user's
-- user_id. Because checkRateLimit() counts a user's rows in this table, an
-- attacker could forge log rows under a victim's user_id and rate-limit that
-- victim out of the AI feature, and pollute the cost-monitoring data.
--
-- FIX
-- The claude-proxy Edge Function writes this table with the service-role key,
-- which BYPASSES row-level security entirely — so no INSERT policy is required
-- for legitimate writes. Authenticated end users have no legitimate reason to
-- write to this audit table directly. Dropping the over-permissive policy
-- closes the hole with zero loss of functionality.
--
-- The existing SELECT policy ("Users can read own AI logs") is correct and is
-- intentionally left in place so users can still see their own usage.

DROP POLICY IF EXISTS "Service role can insert AI logs" ON ai_request_log;

-- (Intentionally no replacement INSERT policy: with RLS enabled and no INSERT
--  policy in place, the authenticated and anon roles cannot INSERT, while the
--  service role continues to INSERT because it bypasses RLS.)

COMMENT ON TABLE ai_request_log IS
  'Tracks AI API usage per user for rate limiting, cost monitoring, and debugging. '
  'INSERTs are service-role only (RLS bypass); end users have SELECT on their own rows only.';
