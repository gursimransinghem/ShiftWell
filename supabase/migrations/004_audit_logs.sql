-- Migration 004: HIPAA audit log table + auto-logging triggers
-- Append-only: users can read their own logs but cannot write/modify/delete.
-- Triggers on users, health_data, subscriptions capture all PHI changes.
-- user_id has NO foreign key so audit records survive after account deletion.

CREATE TABLE audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  action      TEXT        NOT NULL,  -- INSERT | UPDATE | DELETE | ACCOUNT_DELETED
  table_name  TEXT        NOT NULL,
  record_id   UUID,                  -- PK of the affected row (NULL for bulk ops)
  old_data    JSONB,                 -- Row state before change (NULL for INSERT)
  new_data    JSONB,                 -- Row state after change  (NULL for DELETE)
  ip_address  INET,                  -- Client IP when available
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user    ON audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table   ON audit_logs (table_name, created_at DESC);
CREATE INDEX idx_audit_logs_action  ON audit_logs (action, created_at DESC);

-- RLS: users can view their own audit trail; no direct writes allowed.
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Generic audit trigger function
-- Logs INSERT / UPDATE / DELETE on any table it is attached to.
-- Uses SECURITY DEFINER so it can write to audit_logs regardless of
-- calling user's RLS context.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_user_id UUID;
  affected_record_id UUID;
BEGIN
  -- Derive user_id from the row (all audited tables have user_id or id=user_id)
  IF TG_OP = 'DELETE' THEN
    affected_user_id   := OLD.user_id;
    affected_record_id := OLD.id;
  ELSE
    affected_user_id   := NEW.user_id;
    affected_record_id := NEW.id;
  END IF;

  -- users table: id IS the user_id (1:1 with auth.users)
  IF TG_TABLE_NAME = 'users' THEN
    IF TG_OP = 'DELETE' THEN
      affected_user_id := OLD.id;
    ELSE
      affected_user_id := NEW.id;
    END IF;
  END IF;

  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    affected_user_id,
    TG_OP,
    TG_TABLE_NAME,
    affected_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  -- AFTER triggers: return value is ignored by PostgreSQL.
  RETURN NULL;
END;
$$;

-- ----------------------------------------------------------------
-- Apply audit trigger to sensitive tables
-- ----------------------------------------------------------------

-- users: profile changes (onboarding, chronotype, preferences)
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- health_data: most HIPAA-sensitive table (sleep metrics)
CREATE TRIGGER audit_health_data
  AFTER INSERT OR UPDATE OR DELETE ON health_data
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- subscriptions: billing / plan changes
CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

COMMENT ON TABLE audit_logs IS
  'HIPAA audit trail. Append-only via triggers. Retain minimum 6 years (45 CFR §164.530).';
