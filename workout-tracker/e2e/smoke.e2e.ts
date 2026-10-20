import { expect, test } from './support/test-fixtures';
import { UserSelectPage } from './support/pages';

/*
 * Scaffolding smoke test: proves the whole rig is wired up — Playwright resets the database and
 * starts the API, the BFF and the dev server, the global setup provisions accounts over HTTP, and
 * the Angular app boots (app initializer, config.json, auth restore) and reaches the API through
 * the dev server's proxy and the BFF.
 */
test.describe('stack smoke test', () => {
  test.describe('logged out', () => {
    test.use({ authenticateAs: null });

    test('shows the provisioned users on the user-select screen', async ({ page, users }) => {
      const userSelect = new UserSelectPage(page);
      await userSelect.goto();

      await expect(userSelect.heading).toBeVisible();
      await expect(userSelect.userButton(users.admin.name)).toBeVisible();
      await expect(userSelect.userButton(users.standard.name)).toBeVisible();
    });
  });

  test('a saved session lands straight on the home page', async ({ page }) => {
    //The session cookie is recognised during app initialization (GET /bff/user), so UserNotSelectedGuard
    //redirects away from user-select before it ever renders.
    await page.goto('/');

    await expect(page).toHaveURL(/\/home$/);
  });

  test('the seeded target areas are present', async ({ api }) => {
    const targetAreas = await api.getTargetAreas();

    expect(targetAreas.map(area => area.name)).toContain('Legs');
  });
});
