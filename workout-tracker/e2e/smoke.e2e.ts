import { expect, test } from '@playwright/test';

/*
 * Scaffolding smoke test: proves the whole rig is wired up — Playwright starts the API
 * and the dev server, the Angular app boots (app initializer, config.json, auth restore),
 * and the proxied /api call to load users succeeds.
 *
 * With loginWithUserSelect=true the default route renders the user-select screen, and its
 * heading only appears once the users request has come back — so this failing usually means
 * the API or database side of the stack is unhealthy, not the UI.
 */
test('app boots and reaches the API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Who are you?' })).toBeVisible();
});
