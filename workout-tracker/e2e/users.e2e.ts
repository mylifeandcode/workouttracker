import { E2E_ADMIN } from './support/env';
import { ApiClient } from './support/api-client';
import { expect, test } from './support/test-fixtures';
import { SetType, UserRole } from '../src/app/api/types.gen';

/*
 * Who may read, change and deactivate users. These talk to the API directly (like setup.e2e.ts), because the point is
 * what the API refuses, whatever a browser would or wouldn't let you click.
 *
 * Every test makes its own throwaway users through the administrator, and none of them demotes or deactivates the
 * shared E2E administrator.
 */
test.describe('user administration and authorization', () => {
  test.use({ authenticateAs: null });

  const PASSWORD = 'E2eThrowawayPassw0rd!';

  let clients: ApiClient[] = [];

  test.afterEach(async () => {
    await Promise.all(clients.map(client => client.dispose()));
    clients = [];
  });

  async function signIn(userName: string, password: string): Promise<ApiClient> {
    const client = await ApiClient.authenticateAs(userName, password);
    clients.push(client);
    return client;
  }

  async function anonymous(): Promise<ApiClient> {
    const client = await ApiClient.anonymous();
    clients.push(client);
    return client;
  }

  async function createStandardUser(admin: ApiClient, userName: string): Promise<{ name: string; publicId: string }> {
    const user = await admin.createUser({
      userName,
      emailAddress: `${userName}@workouttracker.test`,
      password: PASSWORD,
      role: UserRole.STANDARD,
    });

    return { name: userName, publicId: user.publicId };
  }

  test('a standard user can read themselves and save their own settings, and nobody else', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const bob = await createStandardUser(admin, uniqueName('bob'));
    const asAlice = await signIn(alice.name, PASSWORD);
    const bobsSettingsBefore = (await admin.getUser(bob.publicId)).settings;

    expect((await asAlice.tryGetUser(alice.publicId)).status()).toBe(200);
    expect((await asAlice.tryGetUser(bob.publicId)).status()).toBe(403);

    //The body also tries to smuggle in a role and an id. Neither is part of the contract, so both must be ignored.
    const saved = await asAlice.tryUpdateMySettings({
      recommendationsEnabled: true,
      lowestAcceptableRating: 2,
      repSettings: [{ id: 0, setType: SetType.REPETITION, minReps: 8, maxReps: 12 }],
      role: UserRole.ADMINISTRATOR,
      id: 1,
    });
    expect(saved.status()).toBe(204);

    const mine = await asAlice.getUser(alice.publicId);
    expect(mine.role).toBe(UserRole.STANDARD);
    expect(mine.settings.recommendationsEnabled).toBe(true);
    expect(mine.settings.repSettings).toHaveLength(1);
    expect(mine.settings.repSettings[0].maxReps).toBe(12);

    //Bob's settings are exactly as they were (new users start with a couple of default rep settings, which Alice's save replaced for her only).
    expect((await admin.getUser(bob.publicId)).settings).toEqual(bobsSettingsBefore);
  });

  test('a standard user cannot edit or deactivate anyone, or promote themselves', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const bob = await createStandardUser(admin, uniqueName('bob'));
    const asAlice = await signIn(alice.name, PASSWORD);

    const aliceAsAdmin = { userName: alice.name, emailAddress: `${alice.name}@workouttracker.test`, role: UserRole.ADMINISTRATOR };
    expect((await asAlice.tryUpdateUser(alice.publicId, aliceAsAdmin)).status()).toBe(403);
    expect((await asAlice.tryUpdateUser(bob.publicId, { ...aliceAsAdmin, userName: 'hijacked' })).status()).toBe(403);
    expect((await asAlice.tryDeactivateUser(bob.publicId)).status()).toBe(403);
    expect((await asAlice.tryDeactivateUser(alice.publicId)).status()).toBe(403);

    expect((await admin.getUser(alice.publicId)).role).toBe(UserRole.STANDARD);
    expect((await admin.getUser(bob.publicId)).name).toBe(bob.name);
    expect((await (await anonymous()).tryLogIn(bob.name, PASSWORD)).status()).toBe(200);
  });

  test('an administrator can rename a user and change their role, but only to a real role', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const renamed = uniqueName('renamed');

    await admin.updateUser(alice.publicId, { userName: renamed, emailAddress: 'renamed@workouttracker.test', role: UserRole.ADMINISTRATOR });

    const updated = await admin.getUser(alice.publicId);
    expect(updated.name).toBe(renamed);
    expect(updated.emailAddress).toBe('renamed@workouttracker.test');
    expect(updated.role).toBe(UserRole.ADMINISTRATOR);

    const unknownRole = await admin.tryUpdateUser(alice.publicId, { userName: renamed, emailAddress: 'renamed@workouttracker.test', role: 0 as UserRole });
    expect(unknownRole.status()).toBe(400);

    const reserved = await admin.tryUpdateUser(alice.publicId, { userName: 'SYSTEM', emailAddress: 'renamed@workouttracker.test', role: UserRole.STANDARD });
    expect(reserved.status()).toBe(400);

    //Put them back so the rest of the run still has exactly one administrator.
    await admin.updateUser(alice.publicId, { userName: renamed, emailAddress: 'renamed@workouttracker.test', role: UserRole.STANDARD });
    expect((await admin.getUser(alice.publicId)).role).toBe(UserRole.STANDARD);
  });

  test('an administrator cannot deactivate themselves', async () => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const self = (await admin.getUsers()).find(user => user.name === E2E_ADMIN.userName);

    const response = await admin.tryDeactivateUser(self!.publicId);

    expect(response.status()).toBe(409);
    expect((await admin.getUsers()).find(user => user.name === E2E_ADMIN.userName)?.isActive).toBe(true);
  });

  test('deactivating a user ends their access straight away, and reactivating restores it', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const anon = await anonymous();
    const tokens = await anon.logIn(alice.name, PASSWORD);
    const asAlice = await signIn(alice.name, PASSWORD);
    expect((await asAlice.tryGetUser(alice.publicId)).status()).toBe(200);

    await admin.deactivateUser(alice.publicId);

    //Her token is refused on the very next request, not when it would have expired.
    expect((await asAlice.tryGetUser(alice.publicId)).status()).toBe(401);
    //She can't trade her refresh token for a new session, or sign in again.
    expect((await anon.tryRefresh(tokens)).status()).toBe(401);
    expect((await anon.tryLogIn(alice.name, PASSWORD)).status()).toBe(401);
    //She's gone from the user picker, but not from the administrator's list, where she is marked inactive.
    expect(await anon.getProfileNames()).not.toContain(alice.name);
    expect((await admin.getUsers()).find(user => user.publicId === alice.publicId)?.isActive).toBe(false);

    await admin.reactivateUser(alice.publicId);

    expect((await anon.tryLogIn(alice.name, PASSWORD)).status()).toBe(200);
    expect(await anon.getProfileNames()).toContain(alice.name);
    expect((await admin.getUsers()).find(user => user.publicId === alice.publicId)?.isActive).toBe(true);
  });

  test('the old routes that took a whole user by numeric id no longer respond', async () => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);

    for (const method of ['get', 'put', 'delete'] as const) {
      const response = await admin.tryRequest(method, '/api/Users/1');

      expect([404, 405], `${method.toUpperCase()} /api/Users/1`).toContain(response.status());
    }
  });
});
