import { execFileSync } from 'child_process';
import { localSupabaseConfig } from '../../test-utils/rls-helpers';

function psqlScalar(sql: string): string {
  return execFileSync('psql', [
    localSupabaseConfig().dbUrl,
    '-v',
    'ON_ERROR_STOP=1',
    '-Atc',
    sql,
  ], {
    encoding: 'utf8',
  }).trim();
}

describe('RLS catalog shape', () => {
  it.each([
    'users',
    'shifts',
    'personal_events',
    'sleep_plans',
    'health_data',
    'subscriptions',
    'ai_request_log',
    'audit_logs',
  ])('%s has row-level security enabled', (tableName) => {
    expect(
      psqlScalar(`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
          AND relname = '${tableName}';
      `),
    ).toBe('t');
  });

  it.each([
    ['users', 'SELECT'],
    ['users', 'INSERT'],
    ['users', 'UPDATE'],
    ['shifts', 'SELECT'],
    ['shifts', 'INSERT'],
    ['shifts', 'UPDATE'],
    ['shifts', 'DELETE'],
    ['personal_events', 'SELECT'],
    ['personal_events', 'INSERT'],
    ['personal_events', 'UPDATE'],
    ['personal_events', 'DELETE'],
    ['sleep_plans', 'SELECT'],
    ['sleep_plans', 'INSERT'],
    ['sleep_plans', 'UPDATE'],
    ['sleep_plans', 'DELETE'],
    ['health_data', 'SELECT'],
    ['health_data', 'INSERT'],
    ['health_data', 'UPDATE'],
    ['health_data', 'DELETE'],
    ['subscriptions', 'SELECT'],
    ['ai_request_log', 'SELECT'],
    ['ai_request_log', 'INSERT'],
    ['audit_logs', 'SELECT'],
  ])('%s has expected %s policy', (tableName, command) => {
    expect(
      Number(
        psqlScalar(`
          SELECT COUNT(*)
          FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename = '${tableName}'
            AND cmd = '${command}';
        `),
      ),
    ).toBeGreaterThan(0);
  });

  it('ai_request_log INSERT policy is scoped only to service_role', () => {
    expect(
      psqlScalar(`
        SELECT roles::text
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'ai_request_log'
          AND cmd = 'INSERT';
      `),
    ).toBe('{service_role}');
  });

  it('subscriptions exposes no authenticated client write policy', () => {
    expect(
      psqlScalar(`
        SELECT COUNT(*)
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'subscriptions'
          AND cmd <> 'SELECT';
      `),
    ).toBe('0');
  });
});
