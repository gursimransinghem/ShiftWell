-- Migration 003: Secure account deletion RPC
-- Called by auth-store.ts via supabase.rpc('delete_user')
-- SECURITY DEFINER runs as the function owner (postgres) so it can delete
-- from auth.users. CASCADE on auth.users → public.users → all child tables
-- handles full data cleanup automatically.

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Write audit log before wiping data so the deletion is traceable.
  -- Conditional: audit_logs is created in migration 004; this guard keeps
  -- the function safe if migrations are applied out of order or partially.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      current_user_id,
      'DELETE',
      'auth.users',
      current_user_id,
      jsonb_build_object('user_id', current_user_id, 'deleted_at', NOW()),
      NULL
    );
  END IF;

  -- Deleting from auth.users cascades to public.users, which cascades
  -- to shifts, personal_events, sleep_plans, health_data, subscriptions.
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Revoke from public/anon first, then grant only to authenticated.
-- Without REVOKE, the default public execute privilege on new functions
-- would allow unauthenticated callers to invoke this.
REVOKE ALL ON FUNCTION delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
