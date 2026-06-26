# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the Angular 21 frontend for WorkoutTracker. The .NET backend (and Aspire AppHost) lives in a sibling solution at `../API/WorkoutTracker.sln`.

A detailed companion guide exists at [.github/copilot-instructions.md](.github/copilot-instructions.md) covering conventions, guardrails, and test boundaries. Read it for specifics; this file is the big-picture summary. Note: `README.md` is intentionally minimal — prefer `package.json`, `angular.json`, and the source tree for specifics.

## Commands

- Install: `npm install`
- Dev server: `npm run start` (serves at `http://localhost:4200`, proxies `/api` → backend)
- Production build: `npm run build`
- Watch build: `npm run watch`
- Unit tests: `npm run test` (Vitest via `@angular/build:unit-test`, config at [src/vitest.config.ts](src/vitest.config.ts))
- Test UI dashboard: `npm run test-dash`
- Lint: `npm run lint`
- Regenerate OpenAPI client: `npm run gen-api-models` (requires backend running)

Running a single test: pass a Vitest filter through the runner, e.g. `npm run test -- --test-name-pattern "describe text"` or restrict by path. There is no working `e2e` target — the `e2e` script exists in `package.json` but `angular.json` defines no `e2e` architect target, so it will fail.

## Backend dependency

The app talks to a backend at `apiRoot` from [src/config.json](src/config.json), which defaults to `/api/`. [proxy.conf.js](proxy.conf.js) forwards `/api` to `http://localhost:5600` (override with `API_HTTP`/`API_HTTPS` env vars). OpenAPI client generation reads the schema from `http://localhost:5600/openapi/v1.json` (see [openapi-ts.config.ts](openapi-ts.config.ts)).

## Architecture

**Standalone, zoneless Angular 21.** No NgModules. Bootstrapped via `bootstrapApplication` in [src/main.ts](src/main.ts); app-wide providers in [src/app/app.config.ts](src/app/app.config.ts). Uses `provideZonelessChangeDetection()`, signals for component state, typed reactive forms, and `inject()` over constructor injection.

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

## Verification

For code changes, validate with the smallest relevant command first: `npm run lint`, then `npm run test`, then `npm run build`. Changes touching initialization, routing, or config-driven services warrant a check for startup regressions beyond static analysis.
