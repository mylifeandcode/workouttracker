# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the Angular 22 frontend for WorkoutTracker. The .NET backend (and Aspire AppHost) lives in a sibling solution at `../API/WorkoutTracker.sln`.

A detailed companion guide exists at [.github/copilot-instructions.md](.github/copilot-instructions.md) covering conventions, guardrails, and test boundaries. Read it for specifics; this file is the big-picture summary. Note: `README.md` is intentionally minimal — prefer `package.json`, `angular.json`, and the source tree for specifics.

## Commands

- Install: `npm install`
- Dev server: `npm run start` (serves at `http://localhost:4200`, proxies `/api` and `/bff` → the BFF, which needs the API running behind it)
- Production build: `npm run build`
- Watch build: `npm run watch`
- Unit tests: `npm run test` (Vitest via `@angular/build:unit-test`, config at [src/vitest.config.ts](src/vitest.config.ts))
- Test UI dashboard: `npm run test-dash`
- E2E tests: `npm run e2e` (Playwright — see [E2E tests](#e2e-tests) below; also `e2e-ui`, `e2e-headed`, `e2e-report`)
- Lint: `npm run lint`
- Regenerate OpenAPI client: `npm run gen-api-models` (requires the **API** running on `:5600`; it reads the API directly, not through the BFF)

Running a single unit test: pass a Vitest filter through the runner, e.g. `npm run test -- --test-name-pattern "describe text"` or restrict by path.

## Backend dependency

The app never talks to the API directly. It talks to a **BFF** (Backend-for-Frontend, `API/WorkoutTracker.BFF`) on its own origin: data calls go to `apiRoot` from [src/config.json](src/config.json) (default `/api/`), and the cookie session endpoints (`login`, `logout`, `user`) go to `bffRoot` (default `/bff/`, with the same fallback in code if a deployed `config.json` predates it). [proxy.conf.js](proxy.conf.js) forwards both `/api` and `/bff` to the BFF at `http://localhost:5610` (override with `BFF_HTTP`/`BFF_HTTPS` env vars; the Aspire AppHost and Playwright both set `BFF_HTTP`). The BFF forwards `/api` on to the API, attaching the access token itself. Everything is same-origin, so the session cookie works without CORS or `withCredentials`. OpenAPI client generation still reads the schema straight from the API at `http://localhost:5600/openapi/v1.json` (see [openapi-ts.config.ts](openapi-ts.config.ts)).

## Architecture

**Standalone, zoneless Angular 22.** No NgModules. Bootstrapped via `bootstrapApplication` in [src/main.ts](src/main.ts); app-wide providers in [src/app/app.config.ts](src/app/app.config.ts). Uses `provideZonelessChangeDetection()`, signals for component state, typed reactive forms, and `inject()` over constructor injection.

**Startup ordering is load-bearing.** `provideAppInitializer` in [app.config.ts](src/app/app.config.ts) fetches `config.json`, then initializes `ConfigService` → `AuthService` → restores the user session (asks the BFF `GET /bff/user` whether the browser's cookie belongs to a live session) → `UserService`, all before the router activates any route. This guarantees guards never run against unsettled auth state. Be careful changing anything that reads config in a constructor (e.g. services that build `apiRoot` in their ctor) — it depends on this sequence having completed.

**Routing is split by feature** ([src/app/app.routes.ts](src/app/app.routes.ts)) and lazy-loads `admin`, `analytics`, `exercises`, `user`, and `workouts` via their own `*.routes.ts` files. Keep route changes inside the relevant feature route file. Several routes depend on `UserSelectedGuard`, `UserNotSelectedGuard`, `UserIsAdminGuard`, and `UnsavedChangesGuard` — preserve their behavior. The `admin` route uses both `canLoad` and `canActivate` deliberately (so a non-admin can't enter after an admin logs out post-load).

**Auth is a cookie session owned by the BFF; the browser holds no token.** [auth.service.ts](src/app/core/_services/auth/auth.service.ts) only tracks *who* the BFF says is signed in, in a single `user` signal (`BffUser`, hand-written in [bff-user.ts](src/app/core/_services/auth/bff-user.ts) because the BFF's contract is not in the generated client). `logIn` posts to `{bffRoot}login`, `logOut` to `{bffRoot}logout`, and the startup restore calls `GET {bffRoot}user`; `isUserLoggedIn`, `isUserAdmin`, `userPublicId` and `currentUserName` are all derived from that signal. The HttpOnly `wt.session` cookie is invisible to JavaScript, so there is no JWT to decode, store or refresh here. Token refresh, bearer headers and replay-after-401 all happen server-side (see the **Auth** section of the root [CLAUDE.md](../CLAUDE.md) for the BFF invariants).

[auth.interceptor.ts](src/app/core/auth.interceptor.ts) has exactly two jobs:
- **CSRF header.** Cookies are sent automatically, so the BFF rejects any non-GET request lacking `X-CSRF: 1`. The interceptor adds it to same-origin (relative-URL) requests only, never to third parties. If you ever send a mutating request outside `HttpClient` (a raw `fetch`, say), you must add this header yourself.
- **Session loss.** A 401 from an `/api/` call while signed in means the BFF ended the session, so it calls `AuthService.handleSessionExpired()` (clears local state and goes to the login route, without calling `/bff/logout`) and rethrows. 401s from `/bff/*` are deliberately ignored: from `/bff/login` it is just a failed login, and from `/bff/user` it is the normal "not signed in" answer during startup.

There is no refresh, no replay and no queued-request coordination in the browser any more.

**Global HTTP error handling** — [global-http-error.interceptor.ts](src/app/core/global-http-error.interceptor.ts) reports every unhandled API failure to the user once, via [NotificationService](src/app/core/_services/notification/notification.service.ts) (ng-zorro notifications for errors, messages for successes, with time-window dedupe). [global-error-handler.ts](src/app/core/global-error-handler.ts) covers everything else, paired with `provideBrowserGlobalErrorListeners()`. Three rules matter when touching any of this:

- **Interceptor order in [app.config.ts](src/app/app.config.ts) no longer matters** (Angular builds the chain with `reduceRight`, so the first `HTTP_INTERCEPTORS` entry is outermost). It used to be load-bearing: the old `AuthInterceptor` swallowed a 401, refreshed the token in the browser and replayed the request, so `GlobalHttpErrorInterceptor` had to wrap it or every silent refresh raised a spurious error notification. `AuthInterceptor` now never swallows an error, so both orders give the same result (one "session expired" notification for a 401 from a data call, and the local session ended). [global-http-error.interceptor.spec.ts](src/app/core/global-http-error.interceptor.spec.ts) asserts that for both orders. The current order is kept only because it reads naturally.
- **Opt out with `selfHandled()`** from [_http/http-error-context.ts](src/app/core/_http/http-error-context.ts), passed as the request's options. A downstream `catchError` *cannot* opt out: the interceptor's error operator runs upstream of anything a service or component appends, so it has already notified by then. Reserve this for callers that genuinely own the presentation (`AuthService`'s login, logout and session-restore calls do).
- **The interceptor uses `tap({error})`, never `catchError`.** It must not swallow the failure or replace the error object; every existing `error:` callback, `catchError` and `finalize()` keeps working unchanged.

[_http/app-error.mapper.ts](src/app/core/_http/app-error.mapper.ts) holds the message policy, including the rule that **server text is surfaced for 4xx only, never 5xx** (ASP.NET Core puts exception text in `ProblemDetails.detail` in Development mode). Prefer `toAppError()` over reading `HttpErrorResponse.message`, which is always a truthy `"Http failure response for <url>: 500 ..."` template string — which is why hand-written `error.message ? error.message : friendlyDefault` fallbacks are dead code.

**Data services** — most CRUD services extend [ApiBaseService](src/app/core/_services/api-base/api-base.service.ts), which exposes a cached `all$` stream (`shareReplay(1)` over a `BehaviorSubject` trigger) and calls `invalidateCache()` after add/update/delete. Some services intentionally deviate from this pattern, e.g. [workout.service.ts](src/app/workouts/_services/workout.service.ts) (pagination/filtering) and [analytics.service.ts](src/app/analytics/_services/analytics.service.ts).

**Generated API client** lives in [src/app/api](src/app/api) (`@hey-api/openapi-ts` output: `index.ts`, `types.gen.ts`, `transformers.gen.ts`). Treat it as generated — do not hand-edit. Change the backend OpenAPI schema or `openapi-ts.config.ts` and regenerate. Lint globally ignores `src/app/api/**`.

**Unsaved-changes workflow** — edit forms extend [check-for-unsaved-data.component.ts](src/app/shared/components/check-for-unsaved-data.component.ts) paired with the [unsaved-changes.guard.ts](src/app/core/_guards/unsaved-changes/unsaved-changes.guard.ts). Reuse this pattern for new edit forms.

## Conventions

- Component selectors: `wt` prefix, kebab-case. Directive selectors: `wt` prefix, camelCase ([eslint.config.js](eslint.config.js)).
- Default style is `scss`; schematic type separators are configured in [angular.json](angular.json).
- Feature folders use underscored subfolders (`_services`, `_guards`, `_models`, `_pipes`) to separate supporting code from component folders. `shared` is the exception (no underscores) — see [src/app/shared/readme.txt](src/app/shared/readme.txt).
- Both single and double quotes appear in the codebase; preserve whichever style a file already uses rather than converting.

## Testing conventions

- Don't cast components to `any` in specs to reach private/protected members — drive behavior through the public surface (inputs, outputs, DOM, public methods).
- Mock services as `Partial<Mocked<ConcreteService>>` created in `beforeEach`, provided via `useValue`, retrieved with `TestBed.inject`. Type methods with `vi.fn<ConcreteService['methodName']>()`. Canonical example: [src/app/core/welcome/welcome.component.spec.ts](src/app/core/welcome/welcome.component.spec.ts).
- Before refactoring a component, read its `.spec.ts` and flag what the change is likely to break.

## E2E tests

Playwright drives the real app against the real BFF, the real API and a real SQL Server database — nothing is mocked. Specs live in [e2e/](e2e), configured by [playwright.config.ts](playwright.config.ts). Requires the .NET SDK and `sqlcmd` on `PATH`; Docker is not involved.

- Run everything: `npm run e2e`. Also `npm run e2e-ui` (Playwright UI), `npm run e2e-headed`, `npm run e2e-report` (last HTML report).
- Run one file or one test: `npx playwright test e2e/auth.e2e.ts`, or `npx playwright test -g "logging off"`.

**Playwright starts the whole stack itself** — nothing needs to be running first. Each run drops the E2E database ([reset-database.mjs](e2e/support/reset-database.mjs)), starts the API on **:5601** (which recreates, migrates and seeds that database on boot), then the BFF on **:5602** pointed at that API, then a dev server on **:4201** proxied to the BFF (the `webServer` entries are listed in that order, and in the logs each server's output begins only after the previous one's), then runs [global-setup.ts](e2e/support/global-setup.ts) to provision accounts and baseline data.

Those ports are deliberately not the dev stack's (4200/5610/5600), and the database is its own, so you can leave your dev servers — or the Aspire AppHost — running while tests execute. Servers are never reused: an existing one is already pointed at whatever database it was started with, which would defeat the per-run reset.

**The database is disposable.** `WorkoutTrackerE2E` is dropped at the start of every run. `reset-database.mjs` refuses to drop any database whose name lacks "E2E" unless `E2E_ALLOW_UNSAFE_DB_RESET=1`, so a mistyped connection string can't take out your dev data. Override targets with `E2E_DB_CONNECTION`, `E2E_BASE_URL`, `E2E_API_URL`, `E2E_BFF_URL`.

**Fixtures** ([test-fixtures.ts](e2e/support/test-fixtures.ts)):
- `authenticateAs` — an option, not a fixture: `'standard'` (default), `'admin'`, or `null` for logged out. Set it per file or test with `test.use({ authenticateAs: 'admin' })`.
- `api` — typed API client signed in as *the same account the browser is using*. It goes through the BFF exactly as the browser does: it holds the session cookie in its own cookie jar and sends the `X-CSRF` header, and no token ever appears in test code. Arrange and verify state with it; assert the user-visible outcome through the UI.
- `users` — the accounts global setup provisioned, including their real ids.
- `uniqueName(prefix)` — namespaces anything written to the database.

**Sessions are minted per test, never shared.** A test's session is one cookie: `createSessionState` signs in through the BFF and hands the resulting `wt.session` cookie to the browser as its storage state (cookies are scoped by host, not port, so a cookie the BFF set for `:5602` is also sent to the dev server on `:4201`). It is per-test because logging off ends the session on the server, so a state shared by several tests would die the moment one of them tested logout. See [session.ts](e2e/support/session.ts). (Before the BFF the reason was different: refresh rotated the refresh token, so a reused state presented a revoked one.)

**Page objects** live in [e2e/support/pages](e2e/support/pages), one per screen, exposing locators plus small task methods. Prefer role/label/placeholder locators — the app has no `data-testid` attributes and hasn't needed any.

**Request interception** is used in exactly one place: [http-errors.e2e.ts](e2e/http-errors.e2e.ts), via the [forceServerError](e2e/support/force-server-error.ts) helper. Error handling is the one behavior the real backend can't arrange (no endpoint fails on demand), and this is the only place the real ng-zorro notification renders — the unit suite mocks it. Everything else should keep going through the real API.

### App behaviors the suite has to work around

Each of these cost a debugging cycle; check them before assuming a new test is wrong.

- **Workouts and executed workouts are user-scoped server-side.** `WorkoutController` filters by `GetUserID()` and refuses to return another user's workout, so data arranged as one user is invisible to a page browsing as another. Exercises and target areas are shared, which hides the mismatch until you touch workouts.
- **`window.confirm` dialogs** (unsaved-changes guard, retire/reactivate) — Playwright auto-dismisses unhandled dialogs, which silently *cancels* the action rather than doing nothing. Register `page.on('dialog', ...)`.
- **Retiring a workout removes it from the list** — the Status column filters to "Active Only" by default; clear that filter to see retired workouts.
- **Exercises and workouts cannot be deleted** — the API's DELETE throws `NotImplementedException`. Everything a run creates lives until the next reset, which is what `uniqueName` is for.
- **Mutating requests need the `X-CSRF: 1` header.** The BFF answers 403 to any non-GET `/api` or `/bff` request without it. The SPA's `AuthInterceptor` and the `api` fixture add it, but `page.request` (which shares the browser's cookies, and is handy for poking the BFF directly) does not, so pass `{ headers: { 'X-CSRF': '1' } }` yourself.
- **The session cookie is HttpOnly**, so `document.cookie` cannot see it. Inspect it with `context.cookies()`, and to simulate losing the session use `context.clearCookies()`.
- **Wait for the page's own data calls before provoking a 401.** Pages (Home, for one) fetch data shortly after rendering. If you clear the session while one is in flight, *that* call is the 401 that ends the session and the nav disappears before your next click. Await the page's response (`page.waitForResponse`) first.
- **The list filters have no Search button.** The name filter on the exercise and workout lists searches by itself ~300 ms after typing stops (a `debounced` signal), so `searchByName` waits for the `nameContains=` response instead of clicking anything.
- **A `**/api/**` route does not catch `/bff/*`.** Session restore now goes to `/bff/user`, so a forced-failure route on `/api/` no longer breaks startup the way it once did to `/api/auth/refresh`; the page really reaches the screen under test.
- **The API and the BFF must both start with `--no-launch-profile`**, or `launchSettings.json` pins them to their dev ports (5600 and 5610) and silently overrides `ASPNETCORE_URLS`.
- **Plans saved "for later"** appear only via `GET /api/ExecutedWorkout/planned`, not the main executed-workout list.
- **The exercise-select modal** pages at ten rows and does *not* close when an exercise is picked — filter its (debounced) name box, then close the modal explicitly.

## Verification

For code changes, validate with the smallest relevant command first: `npm run lint`, then `npm run test`, then `npm run build`. Changes touching initialization, routing, or config-driven services warrant a check for startup regressions beyond static analysis — `npm run e2e` is the strongest such check, since it exercises the real startup sequence against a real backend.
