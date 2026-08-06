import type { Page } from '@playwright/test';
import { E2E_ADMIN, E2E_USER, TOKEN_STORAGE_KEY } from './support/env';
import { expect, test } from './support/test-fixtures';
import { LoginPage, NavPage, UserSelectPage } from './support/pages';

test.describe('authentication', () => {

  test.describe('starting logged out', () => {
    test.use({ authenticateAs: null });

    test('picking a user on the user-select screen logs in and lands on home', async ({ page, users }) => {
      const userSelect = new UserSelectPage(page);
      const nav = new NavPage(page);

      await userSelect.goto();
      await userSelect.selectUser(users.standard.name);

      await expect(page).toHaveURL(/\/home$/);
      //The nav only renders its menus for a logged-in user, so this proves auth state, not just routing.
      await expect(nav.greeting(users.standard.name)).toBeVisible();
    });

    test('an unknown username is rejected on the login form', async ({ page }) => {
      const login = new LoginPage(page);

      await login.goto();
      await login.logIn('nobody-by-this-name', 'whatever');

      await expect(login.loginFailedMessage).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('a known username is accepted on the login form', async ({ page, users }) => {
      const login = new LoginPage(page);

      /*
       * The API runs with SimpleLogin=true, which skips password verification entirely — so the
       * password here is deliberately wrong and the login still succeeds. That is the configured
       * behavior for this app, not an oversight in the test.
       */
      await login.goto();
      await login.logIn(users.standard.name, 'not-the-real-password');

      await expect(page).toHaveURL(/\/home$/);
    });

    test('the login button stays disabled until both fields are filled', async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();

      await expect(login.loginButton).toBeDisabled();

      await login.username.fill(E2E_USER.userName);
      await expect(login.loginButton).toBeDisabled();

      await login.password.fill('anything');
      await expect(login.loginButton).toBeEnabled();
    });

    test('a protected route redirects to user-select', async ({ page }) => {
      await page.goto('/exercises');

      await expect(page).toHaveURL(/\/user-select$/);
    });
  });

  test.describe('with a restored session', () => {

    test('a saved token lands straight on home without showing user-select', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL(/\/home$/);
    });

    test('a reload keeps the user logged in', async ({ page, users }) => {
      const nav = new NavPage(page);

      await page.goto('/home');
      await expect(nav.greeting(users.standard.name)).toBeVisible();

      await page.reload();

      await expect(page).toHaveURL(/\/home$/);
      await expect(nav.greeting(users.standard.name)).toBeVisible();
    });

    test('logging off clears the stored token and returns to user-select', async ({ page }) => {
      const nav = new NavPage(page);

      await page.goto('/home');
      await nav.logOff();

      await expect(page).toHaveURL(/\/user-select$/);
      expect(await storedToken(page)).toBeNull();
    });
  });

  test.describe('roles', () => {

    test('a standard user cannot reach the admin area', async ({ page }) => {
      await page.goto('/admin');

      await expect(page).toHaveURL(/\/denied$/);
    });

    test('a standard user sees no Admin link in the nav', async ({ page }) => {
      const nav = new NavPage(page);
      await page.goto('/home');

      await expect(nav.logOffLink).toBeVisible();
      await expect(nav.adminLink).toHaveCount(0);
    });

    test.describe('as an administrator', () => {
      test.use({ authenticateAs: 'admin' });

      test('an admin sees the Admin link and can reach the admin area', async ({ page }) => {
        const nav = new NavPage(page);
        await page.goto('/home');

        await expect(nav.greeting(E2E_ADMIN.userName)).toBeVisible();
        await expect(nav.adminLink).toBeVisible();

        await nav.adminLink.click();
        await expect(page).toHaveURL(/\/admin$/);
      });
    });
  });
});

async function storedToken(page: Page): Promise<string | null> {
  return page.evaluate(key => window.localStorage.getItem(key), TOKEN_STORAGE_KEY);
}
