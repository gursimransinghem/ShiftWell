-- Migration 007: Restrict AI usage-log inserts to the service role.
--
-- 002_ai_request_log.sql intended service-role-only inserts, but the policy
-- had no role scope. In PostgreSQL RLS, an unscoped policy applies to PUBLIC.

DROP POLICY IF EXISTS "Service role can insert AI logs" ON ai_request_log;

CREATE POLICY "Service role can insert AI logs"
  ON ai_request_log FOR INSERT
  TO service_role
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON ai_request_log FROM anon, authenticated;
GRANT INSERT ON ai_request_log TO service_role;
