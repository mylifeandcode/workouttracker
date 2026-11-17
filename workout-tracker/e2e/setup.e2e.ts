import { E2E_ADMIN, E2E_SETUP_CODE, E2E_USER } from './support/env';
import { ApiClient } from './support/api-client';
import { expect, test } from './support/test-fixtures';
import { UserRole } from '../src/app/api/types.gen';

/*
 * First-run setup. By the time any test runs, global-setup has already used the one-time setup code to
 * create the admin, so these tests cover what must be true *afterwards*: the setup door is shut, and
 * registration is no longer a way to mint an administrator.
 *
 * The first-run page itself (a fresh database showing /setup) can't be driven here, because the stack is
 * provisioned once for the whole run. It is covered by the SetupComponent and guard unit specs.
 */
test.describe('first-run setup, once complete', () => {
  test.use({ authenticateAs: null });

  const SECOND_ADMIN = {
    userName: 'e2e-second-admin',
    emailAddress: 'e2e-second-admin@workouttracker.test',
    password: 'E2eSecondAdminPassw0rd!',
  };

  test('reports that setup is no longer required', async () => {
    const anonymous = await ApiClient.anonymous();

    try {
      expect((await anonymous.getSetupStatus()).setupRequired).toBe(false);
    } finally {
      await anonymous.dispose();
    }
  });

  test('refuses to create another first administrator, even with the right code', async () => {
    const anonymous = await ApiClient.anonymous();

    try {
      const response = await anonymous.tryCreateFirstAdmin({ ...SECOND_ADMIN, setupCode: E2E_SETUP_CODE });

      expect(response.status()).toBe(409);
    } finally {
      await anonymous.dispose();
    }
  });

  test('does not let an anonymous caller register a user', async () => {
    const anonymous = await ApiClient.anonymous();

    try {
      const response = await anonymous.tryCreateUser({ ...SECOND_ADMIN, role: UserRole.ADMINISTRATOR });

      expect(response.status()).toBe(401);
    } finally {
      await anonymous.dispose();
    }
  });

  test('does not let a standard user create a user, least of all an administrator', async () => {
    const standard = await ApiClient.authenticateAs(E2E_USER.userName, E2E_USER.password);

    try {
      const response = await standard.tryCreateUser({ ...SECOND_ADMIN, role: UserRole.ADMINISTRATOR });

      expect(response.status()).toBe(403);
    } finally {
      await standard.dispose();
    }
  });

  test('lets an administrator create a standard user but not one named SYSTEM', async ({ uniqueName }) => {
    const admin = await ApiClient.authenticateAs(E2E_ADMIN.userName, E2E_ADMIN.password);

    try {
      const created = await admin.createUser({
        userName: uniqueName('setup-user'),
        emailAddress: 'setup-user@workouttracker.test',
        password: 'E2eSetupUserPassw0rd!',
        role: UserRole.STANDARD,
      });
      expect(created.role).toBe(UserRole.STANDARD);

      const reserved = await admin.tryCreateUser({
        userName: 'SYSTEM',
        emailAddress: 'system@workouttracker.test',
        password: 'E2eSystemPassw0rd!',
        role: UserRole.STANDARD,
      });
      expect(reserved.status()).toBe(400);
    } finally {
      await admin.dispose();
    }
  });

  test('sends a visit to /setup back to the sign-in screen', async ({ page }) => {
    await page.goto('/setup');

    await expect(page).toHaveURL(/\/user-select$/);
    await expect(page.getByRole('heading', { name: 'Who are you?' })).toBeVisible();
  });
});
