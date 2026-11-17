import type { APIResponse } from '@playwright/test';
import { E2E_ADMIN, E2E_PASSWORD_RESET_PERMIT_LIMIT } from './support/env';
import { ApiClient } from './support/api-client';
import { expect, test } from './support/test-fixtures';
import { UserRole } from '../src/app/api/types.gen';

/*
 * Password reset. These talk to the API directly (like setup.e2e.ts and users.e2e.ts), because the point is what the API
 * will and won't do, not how a page looks.
 *
 * The E2E stack has no SMTP server, so the emailed link can't be followed here (the unit tests cover it). The path that
 * hands a token out without email, an administrator creating one, exercises everything after that: validating the
 * token, resetting with it, and what a reset does to the account.
 *
 * Every test makes its own throwaway users, and none of them touches the shared E2E administrator.
 *
 * The anonymous reset endpoints share a per-IP rate limit (E2E_PASSWORD_RESET_PERMIT_LIMIT requests in a window). The
 * tests before the last one use a dozen between them; the last one deliberately uses the rest up, so it has to stay last.
 */
test.describe('password reset', () => {
  test.use({ authenticateAs: null });

  const PASSWORD = 'E2eThrowawayPassw0rd!';
  const NEW_PASSWORD = 'E2eBrandNewPassw0rd!';

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

  async function createStandardUser(admin: ApiClient, userName: string): Promise<{ name: string; email: string; publicId: string }> {
    const email = `${userName}@workouttracker.test`;
    const user = await admin.createUser({ userName, emailAddress: email, password: PASSWORD, role: UserRole.STANDARD });

    return { name: userName, email, publicId: user.publicId };
  }

  async function detailOf(response: APIResponse): Promise<string | undefined> {
    return ((await response.json()) as { detail?: string }).detail;
  }

  test('an administrator can create a one-time reset that lets a user choose a new password', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const anon = await anonymous();
    const existingSession = await anon.logIn(alice.name, PASSWORD);

    const reset = await admin.createPasswordReset(alice.publicId);

    //A long, URL-safe, random token, with a future expiry.
    expect(reset.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(new Date(reset.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(await anon.validateResetToken(reset.token)).toBe(true);

    //A password that breaks the rule is refused, says why, and does not spend the token.
    const weak = await anon.tryResetPassword(reset.token, 'short');
    expect(weak.status()).toBe(400);
    expect(await detailOf(weak)).toContain('at least 12 characters');
    expect(await anon.validateResetToken(reset.token)).toBe(true);

    const done = await anon.tryResetPassword(reset.token, NEW_PASSWORD);
    expect(done.status()).toBe(204);

    //Whoever was signed in as her, including anyone who had got into the account, has to sign in again.
    expect((await anon.tryRefresh(existingSession)).status()).toBe(401);

    //The token works once.
    const again = await anon.tryResetPassword(reset.token, 'E2eAnotherNewPassw0rd!');
    expect(again.status()).toBe(400);
    expect(await anon.validateResetToken(reset.token)).toBe(false);
  });

  test('only an administrator can create a reset, and only for a real user', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const bob = await createStandardUser(admin, uniqueName('bob'));
    const asAlice = await signIn(alice.name, PASSWORD);
    const anon = await anonymous();

    expect((await asAlice.tryCreatePasswordReset(bob.publicId)).status()).toBe(403);
    expect((await asAlice.tryCreatePasswordReset(alice.publicId)).status()).toBe(403);
    expect((await anon.tryCreatePasswordReset(bob.publicId)).status()).toBe(401);
    expect((await admin.tryCreatePasswordReset('11111111-2222-3333-4444-555555555555')).status()).toBe(404);
  });

  test('the public request answers the same empty 204 whether or not the address has an account', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const anon = await anonymous();

    const known = await anon.tryRequestPasswordReset(alice.email);
    const unknown = await anon.tryRequestPasswordReset(`nobody-${uniqueName('x')}@workouttracker.test`);

    //Nothing in the response tells a stranger which of the two it was, and no token or code comes back to anyone.
    expect(known.status()).toBe(204);
    expect(unknown.status()).toBe(204);
    expect(await known.text()).toBe('');
    expect(await unknown.text()).toBe('');
  });

  test('an unknown or made-up token gets one generic answer', async () => {
    const anon = await anonymous();

    expect(await anon.validateResetToken('definitely-not-a-real-token')).toBe(false);

    const response = await anon.tryResetPassword('definitely-not-a-real-token', NEW_PASSWORD);
    expect(response.status()).toBe(400);
    expect(await detailOf(response)).toBe('This reset link is invalid or has expired.');
  });

  test('a deactivated user cannot use a reset that was created before they were deactivated', async ({ uniqueName }) => {
    const admin = await signIn(E2E_ADMIN.userName, E2E_ADMIN.password);
    const alice = await createStandardUser(admin, uniqueName('alice'));
    const anon = await anonymous();
    const reset = await admin.createPasswordReset(alice.publicId);

    await admin.deactivateUser(alice.publicId);

    expect(await anon.validateResetToken(reset.token)).toBe(false);
    expect((await anon.tryResetPassword(reset.token, NEW_PASSWORD)).status()).toBe(400);

    //And no new reset can be created for them either.
    expect((await admin.tryCreatePasswordReset(alice.publicId)).status()).toBe(404);
  });

  //Keep this last: it uses up the rate limit for the anonymous reset endpoints.
  test('the anonymous reset endpoints are rate limited, and nothing else is', async () => {
    const anon = await anonymous();
    let limited: APIResponse | undefined;

    for (let attempt = 0; attempt < E2E_PASSWORD_RESET_PERMIT_LIMIT + 5; attempt++) {
      const response = await anon.tryRequestPasswordReset('nobody@workouttracker.test');

      if (response.status() === 429) {
        limited = response;
        break;
      }

      expect(response.status()).toBe(204);
    }

    expect(limited, 'a 429 should appear once the limit is used up').toBeDefined();

    //The limit is per endpoint group, not a lockout of the whole API.
    expect((await anon.tryLogIn(E2E_ADMIN.userName, E2E_ADMIN.password)).status()).toBe(200);
  });
});
