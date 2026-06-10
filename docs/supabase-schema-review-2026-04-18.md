# ShiftWell Supabase Database Schema Review

> **Status:** Deep schema audit — all tables, RLS policies, indexes, and gaps documented
> **Author:** Dr. Gursimran Singh, DO / Claude
> **Audience:** Founder, future backend engineers, compliance reviewers
> **Source of truth:** `supabase/migrations/001_initial_schema.sql` + `src/lib/supabase/database.types.ts`

---

## 1. Schema Overview

ShiftWell uses Supabase (hosted PostgreSQL) with 6 tables, all protected by Row-Level Security. The schema follows a clean star pattern: `users` is the central table, and all other tables reference it via `user_id` foreign key with `ON DELETE CASCADE`.

**Database functions:** One helper — `update_updated_at()` trigger function for automatic timestamp management.

**Edge Functions:** None deployed yet. The `subscriptions` table has a comment indicating Edge Functions will handle writes, but no function exists. The `delete_user` RPC referenced in `auth-store.ts` is also not defined in migrations.

**Views:** None.

**Enums:** None (CHECK constraints used instead — see Issue #5).

---

## 2. Table-by-Table Documentation

### 2.1 `users`

Profile data extending Supabase's built-in `auth.users`. One row per user.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | — | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | TEXT | YES | — | — |
| `display_name` | TEXT | YES | — | — |
| `chronotype` | TEXT | YES | `'intermediate'` | CHECK: `early`, `intermediate`, `late` |
| `sleep_hours_preferred` | NUMERIC(3,1) | YES | `7.5` | — |
| `caffeine_sensitivity` | TEXT | YES | `'medium'` | CHECK: `low`, `medium`, `high` |
| `caffeine_half_life` | NUMERIC(3,1) | YES | `5.0` | — |
| `nap_preference` | BOOLEAN | YES | `true` | — |
| `household_size` | INTEGER | YES | `1` | — |
| `has_young_children` | BOOLEAN | YES | `false` | — |
| `has_pets` | BOOLEAN | YES | `false` | — |
| `commute_minutes` | INTEGER | YES | `30` | — |
| `onboarding_complete` | BOOLEAN | YES | `false` | — |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Auto-updated via trigger |

**Indexes:** PK index only (on `id`).
**Trigger:** `users_updated_at` → calls `update_updated_at()` on every UPDATE.

**RLS Policies:**

| Policy | Operation | Rule |
|---|---|---|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| Users can insert own profile | INSERT | `auth.uid() = id` (WITH CHECK) |

**Notable:** No DELETE policy. Users cannot delete their own profile row directly — deletion cascades from `auth.users`. This is intentional but means the `delete_user` RPC (called in `auth-store.ts`) must operate with elevated privileges.

---

### 2.2 `shifts`

Work shift schedule entries. Many rows per user.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → `users(id)` ON DELETE CASCADE |
| `title` | TEXT | NO | `'Shift'` | — |
| `start_time` | TIMESTAMPTZ | NO | — | — |
| `end_time` | TIMESTAMPTZ | NO | — | — |
| `shift_type` | TEXT | NO | — | CHECK: `day`, `evening`, `night`, `extended` |
| `source` | TEXT | YES | `'manual'` | CHECK: `manual`, `ics_import` |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |

**Unique constraint:** `(user_id, start_time, end_time)` — prevents duplicate shifts.
**Indexes:** `idx_shifts_user_date` on `(user_id, start_time)`.

**RLS Policies:** Full CRUD — SELECT, INSERT, UPDATE, DELETE all restricted to `auth.uid() = user_id`.

**Missing:** No `updated_at` column or trigger. If a user edits a shift title or type, there's no record of when the change happened. This matters for sync conflict resolution (the sync engine uses last-write-wins).

---

### 2.3 `personal_events`

Non-work calendar events (appointments, errands, etc.). Many rows per user.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → `users(id)` ON DELETE CASCADE |
| `title` | TEXT | NO | — | — |
| `start_time` | TIMESTAMPTZ | NO | — | — |
| `end_time` | TIMESTAMPTZ | NO | — | — |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |

**Indexes:** `idx_personal_events_user_date` on `(user_id, start_time)`.

**RLS Policies:** Full CRUD — SELECT, INSERT, UPDATE, DELETE all restricted to `auth.uid() = user_id`.

**Missing:** No `updated_at`. Same sync issue as `shifts`. No `source` column (will matter when Google Calendar import is added). No unique constraint to prevent duplicate imports.

---

### 2.4 `sleep_plans`

Generated circadian optimization plans stored as JSONB blobs. Many rows per user.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → `users(id)` ON DELETE CASCADE |
| `plan_start_date` | DATE | NO | — | — |
| `plan_end_date` | DATE | NO | — | — |
| `plan_data` | JSONB | NO | — | — |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |

**Unique constraint:** `(user_id, plan_start_date, plan_end_date)` — one plan per date range per user.
**Indexes:** `idx_sleep_plans_user_date` on `(user_id, plan_start_date)`.

**RLS Policies:** SELECT, INSERT, UPDATE — no DELETE policy. Users cannot delete old plans. This may be intentional (data preservation) but limits user control over their own data.

**Missing:** No `updated_at`. No `algorithm_version` column to track which version of the circadian engine generated the plan. No index on `plan_end_date` for range queries.

---

### 2.5 `health_data`

Actual sleep metrics from HealthKit or manual entry. Many rows per user.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → `users(id)` ON DELETE CASCADE |
| `date` | DATE | NO | — | — |
| `actual_sleep_start` | TIMESTAMPTZ | YES | — | — |
| `actual_sleep_end` | TIMESTAMPTZ | YES | — | — |
| `actual_sleep_minutes` | INTEGER | YES | — | — |
| `sleep_quality_score` | INTEGER | YES | — | CHECK: 1–10 |
| `in_bed_start` | TIMESTAMPTZ | YES | — | — |
| `in_bed_end` | TIMESTAMPTZ | YES | — | — |
| `heart_rate_avg_sleeping` | NUMERIC(4,1) | YES | — | — |
| `source` | TEXT | YES | `'manual'` | CHECK: `healthkit`, `manual` |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |

**Unique constraint:** `(user_id, date, source)` — one entry per date per source per user.
**Indexes:** `idx_health_data_user_date` on `(user_id, date)`.

**RLS Policies:** SELECT, INSERT, UPDATE — no DELETE policy. Users cannot delete health records.

**Missing:** No `updated_at`. This is the most HIPAA-sensitive table (contains health metrics). No validation on `actual_sleep_minutes` (could be negative or impossibly large). No index covering date range queries that also filter by source.

---

### 2.6 `subscriptions`

Premium subscription tracking. One row per user. RevenueCat is the source of truth.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → `users(id)` ON DELETE CASCADE, UNIQUE |
| `plan` | TEXT | YES | `'free'` | CHECK: `free`, `premium` |
| `started_at` | TIMESTAMPTZ | YES | — | — |
| `expires_at` | TIMESTAMPTZ | YES | — | — |
| `revenue_cat_customer_id` | TEXT | YES | — | — |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Auto-updated via trigger |

**Unique constraint:** `(user_id)` — one subscription record per user.
**Indexes:** PK index + unique index on `user_id`.
**Trigger:** `subscriptions_updated_at` → calls `update_updated_at()`.

**RLS Policies:** SELECT only — users can view their own subscription. No INSERT/UPDATE/DELETE policies for users. The comment says "Edge Functions handle writes" but no Edge Function exists yet.

**Gap:** Without an Edge Function or service-role write path, there's no way to create or update subscription records after a RevenueCat webhook fires. This is a blocker for monetization.

---

## 3. Relationship Diagram

```
auth.users (Supabase built-in)
    │
    │ ON DELETE CASCADE
    ▼
┌─────────┐
│  users   │ ← 1:1 with auth.users
└────┬─────┘
     │ ON DELETE CASCADE (all child tables)
     │
     ├──→ shifts           (1:many)
     ├──→ personal_events  (1:many)
     ├──→ sleep_plans      (1:many)
     ├──→ health_data      (1:many)
     └──→ subscriptions    (1:1)
```

All foreign keys cascade on delete, meaning deleting from `auth.users` wipes everything. This is good for HIPAA account deletion — one delete propagates cleanly.

---

## 4. RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `users` | Own row | Own row | Own row | **None** |
| `shifts` | Own rows | Own rows | Own rows | Own rows |
| `personal_events` | Own rows | Own rows | Own rows | Own rows |
| `sleep_plans` | Own rows | Own rows | Own rows | **None** |
| `health_data` | Own rows | Own rows | Own rows | **None** |
| `subscriptions` | Own row | **None** | **None** | **None** |

All policies use `auth.uid()` comparison. No service-role bypass policies exist — if an Edge Function needs to write to `subscriptions`, it must use the service role key which bypasses RLS entirely.

**Gaps identified:**

1. **No DELETE on `sleep_plans` and `health_data`** — users can't delete their own data. For GDPR/CCPA "right to deletion" and general data ownership, users should be able to delete their sleep plans and health records.

2. **No write policies on `subscriptions`** — by design (server-managed), but the server-side write path doesn't exist yet.

3. **No admin/service policies** — no policies for a service role to read across users (needed for aggregate analytics, support tools, future enterprise dashboard).

---

## 5. Issues Identified

### Issue #1: Missing `updated_at` on 4 of 6 Tables — CRITICAL

**Affected tables:** `shifts`, `personal_events`, `sleep_plans`, `health_data`

Only `users` and `subscriptions` have `updated_at` columns with auto-update triggers. The sync engine uses last-write-wins conflict resolution but has no server-side timestamp to compare against on 4 tables. This means if two devices edit the same shift, there's no reliable way to determine which write is newer.

**Impact:** Data loss during sync conflicts. Breaks offline-first guarantees.

### Issue #2: Missing `delete_user` RPC Function — CRITICAL

The `auth-store.ts` calls `supabase.rpc('delete_user')` but this function is not defined in any migration. Account deletion silently falls back to sign-out only, leaving all user data in the database. This was flagged in the HIPAA checklist as "incomplete account deletion."

**Impact:** HIPAA non-compliance. App Store rejection risk (Apple requires functional account deletion).

### Issue #3: No Audit Log Table — HIGH

HIPAA requires logging access to PHI. There is no `audit_logs` table and no mechanism to record who accessed or modified what data and when. The HIPAA checklist flagged this.

**Impact:** Cannot pass a HIPAA audit. No forensic trail for security incidents.

### Issue #4: Missing `subscriptions` Write Path — HIGH

No Edge Function exists to handle RevenueCat webhook writes to the `subscriptions` table. RLS blocks all user-initiated writes. The subscription system is non-functional as deployed.

**Impact:** Monetization is blocked. Premium features cannot be activated.

### Issue #5: CHECK Constraints Instead of PostgreSQL ENUMs — MEDIUM

`chronotype`, `caffeine_sensitivity`, `shift_type`, `source`, and `plan` all use `TEXT` columns with `CHECK` constraints instead of proper `CREATE TYPE ... AS ENUM`. This works but has drawbacks: no centralized type definition, harder to add new values safely, no foreign key-like integrity, and the TypeScript types must be manually synchronized.

**Impact:** Maintenance burden increases as the app grows. Adding a new shift type (e.g., `rotating`) requires altering CHECK constraints instead of simple `ALTER TYPE ... ADD VALUE`.

### Issue #6: No Validation on Numeric Ranges — MEDIUM

`actual_sleep_minutes` in `health_data` has no range check. A value of `-500` or `99999` would be accepted. `commute_minutes` in `users` has no upper bound. `household_size` has no lower bound (0 or negative accepted). `sleep_hours_preferred` could be 0 or 99.9.

**Impact:** Garbage data from bugs or malicious input.

### Issue #7: Missing Composite Index for Date Range Queries — MEDIUM

The app frequently needs to fetch shifts and health data within a date range. The existing indexes cover `(user_id, start_time)` which supports `>= date` queries but not efficient `BETWEEN` range scans on both start and end. For `sleep_plans`, there's no index on `plan_end_date`.

**Impact:** Query performance degrades as data grows — especially for users with years of shift history.

### Issue #8: `plan_data` JSONB Blob Without Schema Validation — LOW

The `sleep_plans.plan_data` column stores the entire `PlanBlock[]` array as an unvalidated JSONB blob. No `CHECK` constraint or JSON Schema validation ensures the structure is correct. If a buggy app version writes malformed plan data, the database won't reject it.

**Impact:** Data corruption from client bugs. Harder to query plan contents directly in SQL.

### Issue #9: No Soft Delete Pattern — LOW

All deletes are hard deletes (or cascade deletes). For HIPAA audit trails and data recovery, a soft delete pattern (`deleted_at TIMESTAMPTZ NULL`) is preferable — it preserves records while hiding them from normal queries.

**Impact:** No data recovery after accidental deletion. Harder to maintain audit trail continuity.

### Issue #10: `email` Column Duplicated from `auth.users` — LOW

The `users.email` column duplicates `auth.users.email`. If a user changes their email via Supabase Auth, the `users` table is not automatically updated — these can drift out of sync.

**Impact:** Stale email addresses in the profile table. Not critical since `auth.users` is authoritative, but could cause confusion in support/admin queries.

---

## 6. Recommendations (Priority-Ranked)

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P0 | Add `updated_at` to shifts, personal_events, sleep_plans, health_data | Small | Fixes sync conflicts |
| P0 | Create `delete_user` RPC function | Small | Unblocks account deletion + HIPAA |
| P0 | Create `audit_logs` table | Medium | HIPAA requirement |
| P1 | Build RevenueCat webhook Edge Function for subscriptions | Medium | Unblocks monetization |
| P1 | Add DELETE policies to sleep_plans and health_data | Small | Data ownership / compliance |
| P2 | Add range CHECK constraints to numeric columns | Small | Data integrity |
| P2 | Add composite indexes for date range queries | Small | Query performance |
| P2 | Migrate TEXT+CHECK to PostgreSQL ENUMs | Medium | Type safety, maintainability |
| P3 | Add soft delete (`deleted_at`) pattern | Medium | Audit trail, data recovery |
| P3 | Add JSON schema validation for plan_data | Small | Data integrity |

---

## 7. Migration Scripts for Top 5 Fixes

### Migration 002: Add `updated_at` to All Tables

```sql
-- 002_add_updated_at.sql
-- Adds updated_at columns and triggers to tables missing them

ALTER TABLE shifts
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE personal_events
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE sleep_plans
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE health_data
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill: set updated_at = created_at for existing rows
UPDATE shifts SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE personal_events SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE sleep_plans SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE health_data SET updated_at = created_at WHERE updated_at IS NULL;

-- Add auto-update triggers
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
```

### Migration 003: Create `delete_user` RPC

```sql
-- 003_delete_user_rpc.sql
-- Secure account deletion function callable by authenticated users
-- Deletes the user's profile data, then removes from auth.users
-- CASCADE handles all child table cleanup automatically

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the authenticated user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Log the deletion event before wiping data (if audit_logs exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    INSERT INTO audit_logs (user_id, action, table_name, details)
    VALUES (
      current_user_id,
      'ACCOUNT_DELETED',
      'auth.users',
      jsonb_build_object('deleted_at', NOW())
    );
  END IF;

  -- Delete from auth.users — CASCADE handles all public tables
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
```

### Migration 004: Create `audit_logs` Table

```sql
-- 004_audit_logs.sql
-- HIPAA-required audit trail for data access and modifications
-- This table is append-only — no UPDATE or DELETE policies for users

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- No FK: must survive user deletion
  action TEXT NOT NULL,    -- e.g., 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ACCOUNT_DELETED'
  table_name TEXT NOT NULL,
  record_id UUID,          -- The specific row affected (nullable for bulk ops)
  details JSONB,           -- Changed fields, old/new values, request metadata
  ip_address INET,         -- Client IP if available
  user_agent TEXT,         -- Client identifier
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for querying by user (e.g., "show me all access to user X's data")
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id, created_at);

-- Index for querying by table (e.g., "all health_data access in the last 24h")
CREATE INDEX idx_audit_logs_table ON audit_logs (table_name, created_at);

-- Index for querying by action type
CREATE INDEX idx_audit_logs_action ON audit_logs (action, created_at);

-- RLS: users can view their own audit trail but cannot modify it
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for users
-- Inserts happen via SECURITY DEFINER functions or service role

-- Partition hint: for production, consider partitioning by month
-- CREATE TABLE audit_logs (...) PARTITION BY RANGE (created_at);
-- This keeps old audit data manageable without impacting query performance

COMMENT ON TABLE audit_logs IS 'HIPAA audit trail. Append-only. Retained per policy (minimum 6 years for HIPAA).';
```

### Migration 005: Add DELETE Policies + Numeric Constraints

```sql
-- 005_delete_policies_and_constraints.sql

-- Allow users to delete their own sleep plans
CREATE POLICY "Users can delete own sleep plans"
  ON sleep_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to delete their own health data
CREATE POLICY "Users can delete own health data"
  ON health_data FOR DELETE
  USING (auth.uid() = user_id);

-- Add range constraints to prevent garbage data
ALTER TABLE health_data
  ADD CONSTRAINT check_sleep_minutes
  CHECK (actual_sleep_minutes IS NULL OR (actual_sleep_minutes >= 0 AND actual_sleep_minutes <= 1440));

ALTER TABLE users
  ADD CONSTRAINT check_commute_minutes
  CHECK (commute_minutes IS NULL OR (commute_minutes >= 0 AND commute_minutes <= 480));

ALTER TABLE users
  ADD CONSTRAINT check_household_size
  CHECK (household_size IS NULL OR (household_size >= 1 AND household_size <= 20));

ALTER TABLE users
  ADD CONSTRAINT check_sleep_hours
  CHECK (sleep_hours_preferred IS NULL OR (sleep_hours_preferred >= 2.0 AND sleep_hours_preferred <= 14.0));
```

### Migration 006: Add Performance Indexes

```sql
-- 006_performance_indexes.sql

-- Composite index for shift date range queries
-- Covers: "get all shifts between date X and date Y for user Z"
CREATE INDEX idx_shifts_user_date_range
  ON shifts (user_id, start_time, end_time);

-- Sleep plans: add index on end date for range overlap queries
CREATE INDEX idx_sleep_plans_user_end_date
  ON sleep_plans (user_id, plan_end_date);

-- Health data: covering index for date range + source filtering
CREATE INDEX idx_health_data_user_date_source
  ON health_data (user_id, date, source);

-- Subscriptions: index for checking active premium status
-- Common query: "is this user's subscription active right now?"
CREATE INDEX idx_subscriptions_active
  ON subscriptions (user_id, plan, expires_at)
  WHERE plan = 'premium';

-- Shifts: index for shift_type filtering (analytics, night shift queries)
CREATE INDEX idx_shifts_user_type
  ON shifts (user_id, shift_type);
```

---

## 8. Audit Log Design (Expanded)

The `audit_logs` table in Migration 004 covers the HIPAA minimum. For production, add these enhancements:

**Automatic audit logging via triggers** — Rather than relying on application code to insert audit rows (which can be bypassed), use PostgreSQL triggers:

```sql
-- Example: auto-log all health_data changes
CREATE OR REPLACE FUNCTION log_health_data_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    'health_data',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
      'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER health_data_audit
  AFTER INSERT OR UPDATE OR DELETE ON health_data
  FOR EACH ROW EXECUTE FUNCTION log_health_data_changes();
```

Repeat this pattern for `users`, `shifts`, `sleep_plans`, and `subscriptions`. The `personal_events` table is lower sensitivity but should still be audited for completeness.

**Retention policy:** HIPAA requires 6-year minimum retention for audit logs. Set up a scheduled job or Supabase cron to archive logs older than 6 years to cold storage rather than deleting them.

---

## 9. Soft Delete Recommendation

For tables where data recovery matters (`shifts`, `sleep_plans`, `health_data`), add a soft delete column:

```sql
ALTER TABLE shifts ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE sleep_plans ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE health_data ADD COLUMN deleted_at TIMESTAMPTZ;
```

Then update RLS policies to filter out soft-deleted rows:

```sql
-- Replace existing SELECT policy
DROP POLICY "Users can view own shifts" ON shifts;
CREATE POLICY "Users can view own active shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
```

The `DELETE` operation becomes an `UPDATE` setting `deleted_at = NOW()`. A background job or manual process can hard-delete rows after the retention period.

**Trade-off:** Adds complexity to every query. For ShiftWell's current scale (single-user app, not millions of rows), hard delete + audit logging is simpler and still HIPAA-compliant. Consider soft delete only if you need user-facing "undo" or "trash" functionality.

**Recommendation:** Skip soft delete for now. The audit log table preserves the record of what existed. Implement soft delete only if a product requirement surfaces (e.g., "undo shift deletion").

---

## 10. TypeScript Type Sync Checklist

After running these migrations, update `src/lib/supabase/database.types.ts`:

1. Add `updated_at: string` to Row/Insert/Update types for `shifts`, `personal_events`, `sleep_plans`, `health_data`
2. Add the `audit_logs` table type definition
3. Re-run `supabase gen types typescript` if using the Supabase CLI to auto-generate types
4. Update the sync engine (`sync-engine.ts`) to use `updated_at` for conflict resolution instead of client-side timestamps

---

## 11. Cross-Reference: HIPAA Checklist Findings

| HIPAA Finding | Schema Impact | Migration Fix |
|---|---|---|
| Missing audit logging | No `audit_logs` table | Migration 004 |
| Incomplete account deletion | No `delete_user` RPC | Migration 003 |
| RLS enabled on all tables | Confirmed — all 6 tables | No action needed |
| No PHI encryption at rest | Supabase handles this at infrastructure level | No schema change needed |
| No breach notification mechanism | Not a schema issue | Application-level |
| Data retention policy undefined | Need retention + archival strategy | Scheduled job (post-launch) |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial deep schema audit. Reviewed 001_initial_schema.sql, database.types.ts, sync-engine.ts, auth-store.ts. Identified 10 issues, wrote 5 migration scripts, designed audit log table, cross-referenced HIPAA checklist.
