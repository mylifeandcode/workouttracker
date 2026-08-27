import type { Page } from '@playwright/test';

/** Tracks how many requests a forced-failure route has actually intercepted. */
export interface ForcedFailures {
  /** Resolves once at least `count` matching requests have been failed. */
  waitFor(count: number): Promise<void>;
  readonly count: number;
}

/**
 * Makes every request matching `urlPattern` fail with a 500 carrying an ASP.NET Core
 * ProblemDetails body, without involving the real API.
 *
 * This is the suite's only use of request interception, and it exists for one reason:
 * error handling is the single behavior we can't arrange through the real backend. The
 * API has no endpoint that fails on demand, and the whole point is to verify what the
 * user sees when one does.
 *
 * @param detail Stands in for the exception text ASP.NET Core puts in ProblemDetails
 *               when running in Development mode. Tests assert this never reaches the
 *               user, only the console.
 */
export async function forceServerError(
  page: Page,
  urlPattern: string,
  detail = 'System.InvalidOperationException: secret server internals'
): Promise<ForcedFailures> {

  let count = 0;
  const waiters: { threshold: number; resolve: () => void }[] = [];

  await page.route(urlPattern, async route => {
    count++;
    for (let i = waiters.length - 1; i >= 0; i--) {
      if (count >= waiters[i].threshold) {
        waiters[i].resolve();
        waiters.splice(i, 1);
      }
    }

    await route.fulfill({
      status: 500,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        type: 'https://tools.ietf.org/html/rfc9110#section-15.6.1',
        title: 'An error occurred while processing your request.',
        status: 500,
        detail,
        traceId: '00-e2eforcedfailure-0000000000000000-01'
      })
    });
  });

  return {
    get count() { return count; },
    waitFor(threshold: number): Promise<void> {
      if (count >= threshold) return Promise.resolve();
      return new Promise<void>(resolve => waiters.push({ threshold, resolve }));
    }
  };
}
