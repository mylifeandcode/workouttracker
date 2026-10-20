import { E2E_ADMIN, E2E_USER, SESSION_COOKIE_NAME } from './support/env';
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

    test('an existing session lands straight on home without showing user-select', async ({ page }) => {
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

    test('logging off ends the session on the server, not just in the browser', async ({ page, context }) => {
      const nav = new NavPage(page);

      await page.goto('/home');
      const sessionCookie = (await context.cookies()).find(cookie => cookie.name === SESSION_COOKIE_NAME);
      expect(sessionCookie, 'expected a session cookie after signing in').toBeDefined();

      //The SPA fires /bff/logout without waiting and navigates at once, so wait for the response before inspecting cookies.
      const loggedOut = page.waitForResponse(response => response.url().includes('/bff/logout'));
      await nav.logOff();
      await loggedOut;

      await expect(page).toHaveURL(/\/user-select$/);
      expect((await context.cookies()).some(cookie => cookie.name === SESSION_COOKIE_NAME)).toBe(false);

      //Clearing the browser's cookie proves little: a copied cookie must be useless too. Replay the old one.
      await context.addCookies([sessionCookie!]);
      const replay = await page.request.get('/bff/user');
      expect(replay.status()).toBe(401);
    });

    test('losing the server session mid-use sends the user back to user-select', async ({ page, context }) => {
      const nav = new NavPage(page);

      //The home page makes its own data call shortly after rendering. Let it finish first: a cookie cleared while it is in
      //flight would make that call the 401 that ends the session, and the nav would vanish before this test clicks it.
      const homeDataLoaded = page.waitForResponse(response => response.url().includes('/api/users/overview'));
      await page.goto('/home');
      await expect(nav.greeting(E2E_USER.userName)).toBeVisible();
      await homeDataLoaded;

      //Simulates the BFF ending the session behind the SPA's back (the SPA still believes it is signed in).
      await context.clearCookies();
      await nav.navigateTo('Exercises', 'Manage Exercises');

      //The data call comes back 401, and AuthInterceptor ends the local session and redirects.
      await expect(page).toHaveURL(/\/user-select$/);
    });
  });

  /*
   * The reason the BFF exists. Before it, both JWTs sat in localStorage where any script could read them. These tests
   * pin down that the browser now holds nothing worth stealing.
   */
  test.describe('token isolation', () => {

    test('the browser stores no token, and the session cookie is HttpOnly and SameSite=Strict', async ({ page, context }) => {
      const nav = new NavPage(page);
      await page.goto('/home');
      await expect(nav.greeting(E2E_USER.userName)).toBeVisible();

      const visibleToScripts = await page.evaluate(() => ({
        local: Object.entries(window.localStorage),
        session: Object.entries(window.sessionStorage),
        cookie: document.cookie,
      }));

      //Not just "empty": no key looks like a token and no value looks like a JWT (they all start "eyJ").
      for (const [key, value] of [...visibleToScripts.local, ...visibleToScripts.session]) {
        expect(key.toLowerCase()).not.toContain('token');
        expect(value).not.toMatch(/eyJ/);
      }
      expect(visibleToScripts.cookie).not.toContain(SESSION_COOKIE_NAME);

      const sessionCookie = (await context.cookies()).find(cookie => cookie.name === SESSION_COOKIE_NAME);
      expect(sessionCookie).toMatchObject({ httpOnly: true, sameSite: 'Strict' });
      //The cookie only names a server-side session; it must not itself be a JWT.
      expect(sessionCookie!.value).not.toMatch(/eyJ/);
    });

    test('data calls carry no Authorization header: the BFF attaches the token server-side', async ({ page }) => {
      const apiRequests: { url: string; authorization: string | undefined }[] = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push({ url: request.url(), authorization: request.headers()['authorization'] });
        }
      });

      const firstApiResponse = page.waitForResponse(response => response.url().includes('/api/'));
      await page.goto('/exercises');
      await firstApiResponse;

      expect(apiRequests.length, 'the page should have made at least one data call').toBeGreaterThan(0);
      expect(apiRequests.filter(r => r.authorization !== undefined)).toEqual([]);
    });
  });

  /*
   * Cookies are sent automatically, so (unlike the old bearer-token setup) the app needs its own CSRF defence: the BFF
   * rejects state-changing requests that lack the custom header the SPA's AuthInterceptor adds.
   */
  test.describe('CSRF protection', () => {

    test('a state-changing request without the CSRF header is rejected, and the session survives', async ({ page }) => {
      await page.goto('/home');

      //page.request shares the browser's cookies but, unlike the SPA, does not add the CSRF header.
      const rejected = await page.request.post('/bff/logout');
      expect(rejected.status()).toBe(403);

      const stillSignedIn = await page.request.get('/bff/user');
      expect(stillSignedIn.status()).toBe(200);
    });

    test('the same request is honoured when it carries the CSRF header', async ({ page }) => {
      await page.goto('/home');

      const accepted = await page.request.post('/bff/logout', { headers: { 'X-CSRF': '1' } });
      expect(accepted.status()).toBe(204);

      const signedOut = await page.request.get('/bff/user');
      expect(signedOut.status()).toBe(401);
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
