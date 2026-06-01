import {
  adminClient,
  cleanupTestUsers,
  createTestUser,
  seedUserProfile,
  signInAs,
} from '../../test-utils/rls-helpers';

describe('users RLS sentinel', () => {
  afterAll(async () => {
    await cleanupTestUsers();
  });

  it('users SELECT — own row only', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    await seedUserProfile(userA, 'User A');
    await seedUserProfile(userB, 'User B');

    const { client: userBClient } = await signInAs(userB.email, userB.password);

    const ownRead = await userBClient.from('users').select('id,email').eq('id', userB.id);
    expect(ownRead.error).toBeNull();
    expect(ownRead.data).toHaveLength(1);
    expect(ownRead.data?.[0].id).toBe(userB.id);

    const crossUserRead = await userBClient.from('users').select('id,email').eq('id', userA.id);
    expect(crossUserRead.error).toBeNull();
    expect(crossUserRead.data).toEqual([]);

    const serviceRoleRead = await adminClient.from('users').select('id').eq('id', userA.id);
    expect(serviceRoleRead.data).toHaveLength(1);
  });
});
