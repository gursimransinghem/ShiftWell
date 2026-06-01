import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  adminClient,
  cleanupTestUsers,
  createAnonClient,
  createTestUser,
  seedUserProfile,
  signInAs,
  type TestUser,
} from '../../test-utils/rls-helpers';
import type { Database } from '../../src/lib/supabase/database.types';

type SignedInUser = TestUser & {
  client: SupabaseClient<Database>;
};

let minuteOffset = 0;

function at(hour: number): string {
  const date = new Date(Date.UTC(2026, 5, 1, hour, minuteOffset++));
  return date.toISOString();
}

function dateOnly(): string {
  const date = new Date(Date.UTC(2026, 5, 1 + minuteOffset++));
  return date.toISOString().slice(0, 10);
}

function expectBlockedByRls(result: { error: unknown; data?: unknown[] | null }): void {
  if (result.error) {
    expect(result.error).toBeTruthy();
  } else {
    expect(result.data ?? []).toEqual([]);
  }
}

async function signedInUser(label: string): Promise<SignedInUser> {
  const user = await createTestUser();
  await seedUserProfile(user, label);
  const { client } = await signInAs(user.email, user.password);
  return { ...user, client };
}

describe('Supabase RLS policies', () => {
  let userA: SignedInUser;
  let userB: SignedInUser;

  beforeAll(async () => {
    userA = await signedInUser('RLS User A');
    userB = await signedInUser('RLS User B');
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  it('users INSERT allows own profile and blocks mismatched ids', async () => {
    const ownUser = await createTestUser();
    const otherUser = await createTestUser();
    const { client } = await signInAs(ownUser.email, ownUser.password);

    const ownInsert = await client
      .from('users')
      .insert({ id: ownUser.id, email: ownUser.email, display_name: 'Own insert' })
      .select('id');
    expect(ownInsert.error).toBeNull();
    expect(ownInsert.data).toHaveLength(1);

    const crossInsert = await client
      .from('users')
      .insert({ id: otherUser.id, email: otherUser.email, display_name: 'Cross insert' })
      .select('id');
    expectBlockedByRls(crossInsert);
  });

  it('users UPDATE allows own profile and blocks another profile', async () => {
    const ownUpdate = await userA.client
      .from('users')
      .update({ display_name: 'A updated self' })
      .eq('id', userA.id)
      .select('display_name');
    expect(ownUpdate.error).toBeNull();
    expect(ownUpdate.data?.[0].display_name).toBe('A updated self');

    const crossUpdate = await userA.client
      .from('users')
      .update({ display_name: 'A tried to update B' })
      .eq('id', userB.id)
      .select('id');
    expectBlockedByRls(crossUpdate);

    const serviceRead = await adminClient
      .from('users')
      .select('display_name')
      .eq('id', userB.id)
      .single();
    expect(serviceRead.data?.display_name).toBe('RLS User B');
  });

  it('shifts policies isolate SELECT, INSERT, UPDATE, and DELETE by owner', async () => {
    const aShift = await adminClient
      .from('shifts')
      .insert({
        user_id: userA.id,
        title: 'A night',
        start_time: at(19),
        end_time: at(7),
        shift_type: 'night',
      })
      .select('id')
      .single();
    const bShift = await adminClient
      .from('shifts')
      .insert({
        user_id: userB.id,
        title: 'B day',
        start_time: at(7),
        end_time: at(15),
        shift_type: 'day',
      })
      .select('id')
      .single();

    const selectOwn = await userA.client.from('shifts').select('id,title');
    expect(selectOwn.error).toBeNull();
    expect(selectOwn.data?.map((row) => row.id)).toContain(aShift.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(bShift.data!.id);

    const ownInsert = await userA.client
      .from('shifts')
      .insert({
        user_id: userA.id,
        title: 'A insert',
        start_time: at(19),
        end_time: at(7),
        shift_type: 'night',
      })
      .select('id');
    expect(ownInsert.error).toBeNull();
    expect(ownInsert.data).toHaveLength(1);

    const crossInsert = await userA.client
      .from('shifts')
      .insert({
        user_id: userB.id,
        title: 'Cross insert',
        start_time: at(19),
        end_time: at(7),
        shift_type: 'night',
      })
      .select('id');
    expectBlockedByRls(crossInsert);

    const ownUpdate = await userA.client
      .from('shifts')
      .update({ title: 'A updated own shift' })
      .eq('id', aShift.data!.id)
      .select('title');
    expect(ownUpdate.data?.[0].title).toBe('A updated own shift');

    const crossUpdate = await userA.client
      .from('shifts')
      .update({ title: 'A tried B shift' })
      .eq('id', bShift.data!.id)
      .select('id');
    expectBlockedByRls(crossUpdate);

    const crossDelete = await userA.client
      .from('shifts')
      .delete()
      .eq('id', bShift.data!.id)
      .select('id');
    expectBlockedByRls(crossDelete);

    const ownDelete = await userA.client
      .from('shifts')
      .delete()
      .eq('id', aShift.data!.id)
      .select('id');
    expect(ownDelete.error).toBeNull();
    expect(ownDelete.data).toHaveLength(1);
  });

  it('personal_events policies isolate SELECT, INSERT, UPDATE, and DELETE by owner', async () => {
    const bEvent = await adminClient
      .from('personal_events')
      .insert({
        user_id: userB.id,
        title: 'B event',
        start_time: at(10),
        end_time: at(11),
      })
      .select('id')
      .single();

    const ownInsert = await userA.client
      .from('personal_events')
      .insert({
        user_id: userA.id,
        title: 'A event',
        start_time: at(12),
        end_time: at(13),
      })
      .select('id,title')
      .single();
    expect(ownInsert.error).toBeNull();

    const selectOwn = await userA.client.from('personal_events').select('id');
    expect(selectOwn.data?.map((row) => row.id)).toContain(ownInsert.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(bEvent.data!.id);

    const crossInsert = await userA.client
      .from('personal_events')
      .insert({
        user_id: userB.id,
        title: 'Cross event',
        start_time: at(14),
        end_time: at(15),
      })
      .select('id');
    expectBlockedByRls(crossInsert);

    const ownUpdate = await userA.client
      .from('personal_events')
      .update({ title: 'A updated event' })
      .eq('id', ownInsert.data!.id)
      .select('title');
    expect(ownUpdate.data?.[0].title).toBe('A updated event');

    const crossUpdate = await userA.client
      .from('personal_events')
      .update({ title: 'A tried B event' })
      .eq('id', bEvent.data!.id)
      .select('id');
    expectBlockedByRls(crossUpdate);

    const crossDelete = await userA.client
      .from('personal_events')
      .delete()
      .eq('id', bEvent.data!.id)
      .select('id');
    expectBlockedByRls(crossDelete);

    const ownDelete = await userA.client
      .from('personal_events')
      .delete()
      .eq('id', ownInsert.data!.id)
      .select('id');
    expect(ownDelete.data).toHaveLength(1);
  });

  it('sleep_plans policies isolate SELECT, INSERT, UPDATE, and DELETE by owner', async () => {
    const bPlan = await adminClient
      .from('sleep_plans')
      .insert({
        user_id: userB.id,
        plan_start_date: dateOnly(),
        plan_end_date: dateOnly(),
        plan_data: { blocks: [] },
      })
      .select('id')
      .single();

    const ownInsert = await userA.client
      .from('sleep_plans')
      .insert({
        user_id: userA.id,
        plan_start_date: dateOnly(),
        plan_end_date: dateOnly(),
        plan_data: { blocks: ['sleep'] },
      })
      .select('id,plan_data')
      .single();
    expect(ownInsert.error).toBeNull();

    const selectOwn = await userA.client.from('sleep_plans').select('id');
    expect(selectOwn.data?.map((row) => row.id)).toContain(ownInsert.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(bPlan.data!.id);

    const crossInsert = await userA.client
      .from('sleep_plans')
      .insert({
        user_id: userB.id,
        plan_start_date: dateOnly(),
        plan_end_date: dateOnly(),
        plan_data: { blocks: [] },
      })
      .select('id');
    expectBlockedByRls(crossInsert);

    const ownUpdate = await userA.client
      .from('sleep_plans')
      .update({ plan_data: { blocks: ['updated'] } })
      .eq('id', ownInsert.data!.id)
      .select('id');
    expect(ownUpdate.data).toHaveLength(1);

    const crossUpdate = await userA.client
      .from('sleep_plans')
      .update({ plan_data: { blocks: ['cross'] } })
      .eq('id', bPlan.data!.id)
      .select('id');
    expectBlockedByRls(crossUpdate);

    const crossDelete = await userA.client
      .from('sleep_plans')
      .delete()
      .eq('id', bPlan.data!.id)
      .select('id');
    expectBlockedByRls(crossDelete);

    const ownDelete = await userA.client
      .from('sleep_plans')
      .delete()
      .eq('id', ownInsert.data!.id)
      .select('id');
    expect(ownDelete.data).toHaveLength(1);
  });

  it('health_data policies isolate SELECT, INSERT, UPDATE, and DELETE by owner', async () => {
    const bHealth = await adminClient
      .from('health_data')
      .insert({
        user_id: userB.id,
        date: dateOnly(),
        actual_sleep_minutes: 390,
        source: 'manual',
      })
      .select('id')
      .single();

    const ownInsert = await userA.client
      .from('health_data')
      .insert({
        user_id: userA.id,
        date: dateOnly(),
        actual_sleep_minutes: 420,
        source: 'manual',
      })
      .select('id,actual_sleep_minutes')
      .single();
    expect(ownInsert.error).toBeNull();

    const selectOwn = await userA.client.from('health_data').select('id');
    expect(selectOwn.data?.map((row) => row.id)).toContain(ownInsert.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(bHealth.data!.id);

    const crossInsert = await userA.client
      .from('health_data')
      .insert({
        user_id: userB.id,
        date: dateOnly(),
        actual_sleep_minutes: 300,
        source: 'manual',
      })
      .select('id');
    expectBlockedByRls(crossInsert);

    const ownUpdate = await userA.client
      .from('health_data')
      .update({ actual_sleep_minutes: 430 })
      .eq('id', ownInsert.data!.id)
      .select('actual_sleep_minutes');
    expect(ownUpdate.data?.[0].actual_sleep_minutes).toBe(430);

    const crossUpdate = await userA.client
      .from('health_data')
      .update({ actual_sleep_minutes: 1 })
      .eq('id', bHealth.data!.id)
      .select('id');
    expectBlockedByRls(crossUpdate);

    const crossDelete = await userA.client
      .from('health_data')
      .delete()
      .eq('id', bHealth.data!.id)
      .select('id');
    expectBlockedByRls(crossDelete);

    const ownDelete = await userA.client
      .from('health_data')
      .delete()
      .eq('id', ownInsert.data!.id)
      .select('id');
    expect(ownDelete.data).toHaveLength(1);
  });

  it('subscriptions are readable by owner but not client-writable', async () => {
    const subscriptionId = randomUUID();
    const bSubscriptionId = randomUUID();
    await adminClient.from('subscriptions').insert([
      { id: subscriptionId, user_id: userA.id, plan: 'premium' },
      { id: bSubscriptionId, user_id: userB.id, plan: 'free' },
    ]);

    const selectOwn = await userA.client.from('subscriptions').select('id,plan');
    expect(selectOwn.data?.map((row) => row.id)).toContain(subscriptionId);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(bSubscriptionId);

    const clientInsert = await userA.client
      .from('subscriptions')
      .insert({ user_id: userA.id, plan: 'free' })
      .select('id');
    expectBlockedByRls(clientInsert);

    const clientUpdate = await userA.client
      .from('subscriptions')
      .update({ plan: 'free' })
      .eq('id', subscriptionId)
      .select('id');
    expectBlockedByRls(clientUpdate);

    const clientDelete = await userA.client
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .select('id');
    expectBlockedByRls(clientDelete);
  });

  it('ai_request_log is service-role writable and owner-readable only', async () => {
    const ownLog = await adminClient
      .from('ai_request_log')
      .insert({
        user_id: userA.id,
        model: 'edge-function',
        tokens_used: 100,
        duration_ms: 40,
        success: true,
      })
      .select('id')
      .single();
    const otherLog = await adminClient
      .from('ai_request_log')
      .insert({
        user_id: userB.id,
        model: 'edge-function',
        tokens_used: 50,
        duration_ms: 30,
        success: true,
      })
      .select('id')
      .single();

    const selectOwn = await userA.client.from('ai_request_log').select('id');
    expect(selectOwn.data?.map((row) => row.id)).toContain(ownLog.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(otherLog.data!.id);

    const clientInsert = await userA.client
      .from('ai_request_log')
      .insert({
        user_id: userA.id,
        model: 'client-forged',
        tokens_used: 1,
        duration_ms: 1,
        success: true,
      })
      .select('id');
    expectBlockedByRls(clientInsert);
  });

  it('audit_logs are owner-readable and append-only to clients', async () => {
    const ownAudit = await adminClient
      .from('audit_logs')
      .insert({
        user_id: userA.id,
        action: 'UPDATE',
        table_name: 'users',
      })
      .select('id')
      .single();
    const otherAudit = await adminClient
      .from('audit_logs')
      .insert({
        user_id: userB.id,
        action: 'UPDATE',
        table_name: 'users',
      })
      .select('id')
      .single();

    const selectOwn = await userA.client.from('audit_logs').select('id');
    expect(selectOwn.data?.map((row) => row.id)).toContain(ownAudit.data!.id);
    expect(selectOwn.data?.map((row) => row.id)).not.toContain(otherAudit.data!.id);

    const clientInsert = await userA.client
      .from('audit_logs')
      .insert({
        user_id: userA.id,
        action: 'INSERT',
        table_name: 'audit_logs',
      })
      .select('id');
    expectBlockedByRls(clientInsert);

    const clientUpdate = await userA.client
      .from('audit_logs')
      .update({ action: 'DELETE' })
      .eq('id', ownAudit.data!.id)
      .select('id');
    expectBlockedByRls(clientUpdate);

    const clientDelete = await userA.client
      .from('audit_logs')
      .delete()
      .eq('id', ownAudit.data!.id)
      .select('id');
    expectBlockedByRls(clientDelete);
  });

  it('delete_user RPC requires auth and cascades user-owned data while preserving audit', async () => {
    const doomed = await signedInUser('Delete RPC User');
    const shift = await adminClient
      .from('shifts')
      .insert({
        user_id: doomed.id,
        title: 'Doomed shift',
        start_time: at(19),
        end_time: at(7),
        shift_type: 'night',
      })
      .select('id')
      .single();

    const anon = createAnonClient();
    const anonDelete = await anon.rpc('delete_user');
    expect(anonDelete.error).toBeTruthy();

    const deleteResult = await doomed.client.rpc('delete_user');
    expect(deleteResult.error).toBeNull();

    const profileRead = await adminClient.from('users').select('id').eq('id', doomed.id);
    expect(profileRead.data).toEqual([]);

    const shiftRead = await adminClient.from('shifts').select('id').eq('id', shift.data!.id);
    expect(shiftRead.data).toEqual([]);

    const auditRead = await adminClient
      .from('audit_logs')
      .select('id,table_name')
      .eq('user_id', doomed.id)
      .eq('table_name', 'auth.users');
    expect(auditRead.data?.length).toBeGreaterThan(0);
  });
});
