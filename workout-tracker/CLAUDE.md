# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the Angular 22 frontend for WorkoutTracker. The .NET backend (and Aspire AppHost) lives in a sibling solution at `../API/WorkoutTracker.sln`.

A detailed companion guide exists at [.github/copilot-instructions.md](.github/copilot-instructions.md) covering conventions, guardrails, and test boundaries. Read it for specifics; this file is the big-picture summary. Note: `README.md` is intentionally minimal — prefer `package.json`, `angular.json`, and the source tree for specifics.

## Commands

- Install: `npm install`
- Dev server: `npm run start` (serves at `http://localhost:4200`, proxies `/api` → backend)
- Production build: `npm run build`
- Watch build: `npm run watch`
- Unit tests: `npm run test` (Vitest via `@angular/build:unit-test`, config at [src/vitest.config.ts](src/vitest.config.ts))
- Test UI dashboard: `npm run test-dash`
- E2E tests: `npm run e2e` (Playwright — see [E2E tests](#e2e-tests) below; also `e2e-ui`, `e2e-headed`, `e2e-report`)
- Lint: `npm run lint`
- Regenerate OpenAPI client: `npm run gen-api-models` (requires backend running)

Running a single unit test: pass a Vitest filter through the runner, e.g. `npm run test -- --test-name-pattern "describe text"` or restrict by path.

## Backend dependency

The app talks to a backend at `apiRoot` from [src/config.json](src/config.json), which defaults to `/api/`. [proxy.conf.js](proxy.conf.js) forwards `/api` to `http://localhost:5600` (override with `API_HTTP`/`API_HTTPS` env vars). OpenAPI client generation reads the schema from `http://localhost:5600/openapi/v1.json` (see [openapi-ts.config.ts](openapi-ts.config.ts)).

## Architecture

**Standalone, zoneless Angular 22.** No NgModules. Bootstrapped via `bootstrapApplication` in [src/main.ts](src/main.ts); app-wide providers in [src/app/app.config.ts](src/app/app.config.ts). Uses `provideZonelessChangeDetection()`, signals for component state, typed reactive forms, and `inject()` over constructor injection.

**Startup ordering is load-bearing.** `provideAppInitializer` in [app.config.ts](src/app/app.config.ts) fetches `config.json`, then initializes `ConfigService` → `AuthService` → restores the user session (including token refresh) → `UserService`, all before the router activates any route. This guarantees guards never run against unsettled auth state. Be careful changing anything that reads config in a constructor (e.g. services that build `apiRoot` in their ctor) — it depends on this sequence having completed.

**Routing is split by feature** ([src/app/app.routes.ts](src/app/app.routes.ts)) and lazy-loads `admin`, `analytics`, `exercises`, `user`, and `workouts` via their own `*.routes.ts` files. Keep route changes inside the relevant feature route file. Several routes depend on `UserSelectedGuard`, `UserNotSelectedGuard`, `UserIsAdminGuard`, and `UnsavedChangesGuard` — preserve their behavior. The `admin` route uses both `canLoad` and `canActivate` deliberately (so a non-admin can't enter after an admin logs out post-load).

**Auth** is JWT bearer with silent refresh. [src/app/core/auth.interceptor.ts](src/app/core/auth.interceptor.ts) attaches the token and, on a 401 (except for `/auth/login` and `/auth/refresh`), refreshes the access token once and replays queued requests, logging out if refresh fails.

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

Playwright drives the real app against the real API and a real SQL Server database — nothing is mocked. Specs live in [e2e/](e2e), configured by [playwright.config.ts](playwright.config.ts). Requires the .NET SDK and `sqlcmd` on `PATH`; Docker is not involved.

- Run everything: `npm run e2e`. Also `npm run e2e-ui` (Playwright UI), `npm run e2e-headed`, `npm run e2e-report` (last HTML report).
- Run one file or one test: `npx playwright test e2e/auth.e2e.ts`, or `npx playwright test -g "logging off"`.

**Playwright starts the whole stack itself** — nothing needs to be running first. Each run drops the E2E database ([reset-database.mjs](e2e/support/reset-database.mjs)), starts the API on **:5601** (which recreates, migrates and seeds that database on boot), starts a dev server on **:4201** proxied to it, then runs [global-setup.ts](e2e/support/global-setup.ts) to provision accounts and baseline data.

Those ports are deliberately not the dev stack's (4200/5600), and the database is its own, so you can leave your dev servers — or the Aspire AppHost — running while tests execute. Servers are never reused: an existing one is already pointed at whatever database it was started with, which would defeat the per-run reset.

**The database is disposable.** `WorkoutTrackerE2E` is dropped at the start of every run. `reset-database.mjs` refuses to drop any database whose name lacks "E2E" unless `E2E_ALLOW_UNSAFE_DB_RESET=1`, so a mistyped connection string can't take out your dev data. Override targets with `E2E_DB_CONNECTION`, `E2E_BASE_URL`, `E2E_API_URL`.

**Fixtures** ([test-fixtures.ts](e2e/support/test-fixtures.ts)):
- `authenticateAs` — an option, not a fixture: `'standard'` (default), `'admin'`, or `null` for logged out. Set it per file or test with `test.use({ authenticateAs: 'admin' })`.
- `api` — typed API client authenticated as *the same account the browser is using*. Arrange and verify state with it; assert the user-visible outcome through the UI.
- `users` — the accounts global setup provisioned, including their real ids.
- `uniqueName(prefix)` — namespaces anything written to the database.

**Sessions are minted per test, never shared.** Restoring a session always calls `/auth/refresh`, which *rotates* the refresh token, so a reused storage-state file would present an already-revoked token and the app would silently drop to logged out. See [session.ts](e2e/support/session.ts).

**Page objects** live in [e2e/support/pages](e2e/support/pages), one per screen, exposing locators plus small task methods. Prefer role/label/placeholder locators — the app has no `data-testid` attributes and hasn't needed any.

### App behaviors the suite has to work around

Each of these cost a debugging cycle; check them before assuming a new test is wrong.

- **Workouts and executed workouts are user-scoped server-side.** `WorkoutController` filters by `GetUserID()` and refuses to return another user's workout, so data arranged as one user is invisible to a page browsing as another. Exercises and target areas are shared, which hides the mismatch until you touch workouts.
- **`window.confirm` dialogs** (unsaved-changes guard, retire/reactivate) — Playwright auto-dismisses unhandled dialogs, which silently *cancels* the action rather than doing nothing. Register `page.on('dialog', ...)`.
- **Retiring a workout removes it from the list** — the Status column filters to "Active Only" by default; clear that filter to see retired workouts.
- **Exercises and workouts cannot be deleted** — the API's DELETE throws `NotImplementedException`. Everything a run creates lives until the next reset, which is what `uniqueName` is for.
- **localStorage values are JSON-encoded.** `LocalStorageService` round-trips through JSON, so seeding a bare token string makes app initialization throw and the app hangs on its `Loading...` placeholder with no visible error.
- **The API must start with `--no-launch-profile`**, or `launchSettings.json` pins it to port 5600 and silently overrides `ASPNETCORE_URLS`.
- **Plans saved "for later"** appear only via `GET /api/ExecutedWorkout/planned`, not the main executed-workout list.
- **The exercise-select modal** pages at ten rows and does *not* close when an exercise is picked — filter its (debounced) name box, then close the modal explicitly.

## Verification

For code changes, validate with the smallest relevant command first: `npm run lint`, then `npm run test`, then `npm run build`. Changes touching initialization, routing, or config-driven services warrant a check for startup regressions beyond static analysis — `npm run e2e` is the strongest such check, since it exercises the real startup sequence against a real backend.
