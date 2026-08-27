import { expect, test } from './support/test-fixtures';
import { forceServerError } from './support/force-server-error';

/*
 * Global HTTP error handling, end to end.
 *
 * This is the only place the real ng-zorro notification actually renders: the unit suite runs in
 * jsdom with NotificationService mocked, so nothing else proves the notification is visible,
 * on top of the page, and dismissible. It's also where the "never leak server internals" rule is
 * checked against a real ProblemDetails body rather than a hand-built one.
 */
test.describe('global HTTP error handling', () => {

  const notification = '.ant-notification-notice';

  test('a server error surfaces a dismissible notification', async ({ page }) => {
    await forceServerError(page, '**/api/analytics/**');

    await page.goto('/analytics');

    const notice = page.locator(notification);
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Couldn't load data");
    await expect(notice).toContainText("We couldn't load this data");

    await notice.locator('.ant-notification-notice-close').click();
    await expect(notice).toHaveCount(0);
  });

  test('the server exception detail never reaches the user', async ({ page }) => {
    await forceServerError(page, '**/api/analytics/**');

    await page.goto('/analytics');

    const notice = page.locator(notification);
    await expect(notice).toBeVisible();

    //ASP.NET Core in Development mode puts the exception text in ProblemDetails.detail.
    await expect(notice).not.toContainText('InvalidOperationException');
    await expect(page.locator('body')).not.toContainText('InvalidOperationException');
  });

  test('a burst of failures produces a single notification', async ({ page }) => {
    //The exercise list fires the exercises and target-areas requests in parallel.
    const failures = await forceServerError(page, '**/api/**');

    await page.goto('/exercises');

    await failures.waitFor(2);
    await expect(page.locator(notification)).toBeVisible();
    await expect(page.locator(notification)).toHaveCount(1);
  });

  test('an unreachable server says so rather than reporting a status code', async ({ page }) => {
    await page.route('**/api/analytics/**', route => route.abort('connectionrefused'));

    await page.goto('/analytics');

    const notice = page.locator(notification);
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Can't reach the server");
  });
});
