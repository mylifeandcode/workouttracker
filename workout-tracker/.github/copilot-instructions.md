# Workout Tracker Workspace Instructions

## Project Snapshot

- Angular 21 standalone application bootstrapped with `bootstrapApplication` in [src/main.ts](../src/main.ts).
- App-wide providers and startup behavior live in [src/app/app.config.ts](../src/app/app.config.ts).
- Top-level routing lives in [src/app/app.routes.ts](../src/app/app.routes.ts) and lazy-loads feature route files for `admin`, `analytics`, `exercises`, `user`, and `workouts`.
- The generated API client and types live in [src/app/api](../src/app/api). Treat that folder as generated output unless a task explicitly asks to change generator output.

## Source Of Truth

- Prefer `package.json`, `angular.json`, and the source tree over `README.md`. The README still describes an older Angular CLI/Karma/Protractor setup and is not the current source of truth.
- There is no additional architecture or contributor documentation in this repo at the moment.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run start`
- Production build: `npm run build`
- Development watch build: `npm run watch`
- Unit tests: `npm run test`
- Lint: `npm run lint`
- Regenerate OpenAPI client: `npm run openapi-ts`

Notes:

- `npm run test` uses Angular's `@angular/build:unit-test` builder with [src/vitest.config.ts](../src/vitest.config.ts), not Karma.
- `npm run e2e` exists in `package.json` but there is no `e2e` target in [angular.json](../angular.json). Do not rely on it unless you also add the missing target.

## Architecture

- This repo uses standalone components rather than NgModules. Follow examples like [src/app/app.component.ts](../src/app/app.component.ts) and feature components under `src/app/**`.
- Routing is split by feature. Keep route changes inside the relevant `*.routes.ts` file.
- App initialization depends on runtime config loaded from [src/config.json](../src/config.json) inside [src/app/app.config.ts](../src/app/app.config.ts). Changes involving auth, user startup, or API roots must account for that initialization flow.
- Most CRUD-style services inherit from [src/app/core/_services/api-base/api-base.service.ts](../src/app/core/_services/api-base/api-base.service.ts) and use cached `all$` streams plus `invalidateCache()` after mutations.
- Some services intentionally do not follow the base CRUD pattern, for example [src/app/workouts/_services/workout.service.ts](../src/app/workouts/_services/workout.service.ts) and [src/app/analytics/_services/analytics.service.ts](../src/app/analytics/_services/analytics.service.ts).

## Conventions

- New Angular schematics default to `scss`, and generated Angular type suffixes omit the extra hyphen for services, guards, pipes, and related artifacts. See [angular.json](../angular.json).
- Component selectors use the `wt` prefix and kebab-case. Directive selectors use the `wt` prefix and camelCase. See [eslint.config.js](../eslint.config.js).
- Both single and double quotes are acceptable for TypeScript strings. Do not convert between them; preserve whichever style is already present in the file being edited.
- This codebase commonly uses:
  - typed reactive forms
  - Angular signals for component state
  - `inject()` instead of constructor injection for services and framework dependencies
  - standalone component `imports` arrays colocated with the component
- Feature folders often use underscored subfolders such as `_services`, `_guards`, `_models`, and `_pipes` to distinguish supporting code from component folders. The note in [src/app/shared/readme.txt](../src/app/shared/readme.txt) explains why `shared` is the exception.
- Unsaved-change workflows are built around [src/app/shared/components/check-for-unsaved-data.component.ts](../src/app/shared/components/check-for-unsaved-data.component.ts) plus [src/app/core/_guards/unsaved-changes/unsaved-changes.guard.ts](../src/app/core/_guards/unsaved-changes/unsaved-changes.guard.ts). Reuse that pattern for edit forms.

## Guardrails For Edits

- Do not hand-edit files in [src/app/api](../src/app/api) unless the task is explicitly about generated output. Prefer changing the OpenAPI source or [openapi-ts.config.ts](../openapi-ts.config.ts) and regenerating.
- Be careful with services that read config in constructors. Runtime config is loaded during app initialization, so changing constructor-time config access can create subtle startup ordering bugs.
- Preserve the existing route guard behavior. Several routes depend on `UserSelectedGuard`, `UserNotSelectedGuard`, `UserIsAdminGuard`, and `UnsavedChangesGuard`.
- The lint config globally ignores `src/app/api/**`. If a change belongs in generated code, do not expect lint to catch issues there.
- The app expects a backend at the `apiRoot` from [src/config.json](../src/config.json), which defaults to `http://localhost:5600/api/`. OpenAPI generation also expects Swagger at `http://localhost:5600/swagger/v1/swagger.json`.

## Key Files

- App bootstrap and initialization: [src/main.ts](../src/main.ts), [src/app/app.config.ts](../src/app/app.config.ts)
- Top-level routing: [src/app/app.routes.ts](../src/app/app.routes.ts)
- Example standalone root component: [src/app/app.component.ts](../src/app/app.component.ts)
- Shared CRUD service pattern: [src/app/core/_services/api-base/api-base.service.ts](../src/app/core/_services/api-base/api-base.service.ts)
- Auth header injection: [src/app/core/auth.interceptor.ts](../src/app/core/auth.interceptor.ts)
- Representative complex form components:
  - [src/app/exercises/exercise-edit/exercise-edit.component.ts](../src/app/exercises/exercise-edit/exercise-edit.component.ts)
  - [src/app/workouts/workout-edit/workout-edit.component.ts](../src/app/workouts/workout-edit/workout-edit.component.ts)
  - [src/app/workouts/workout/workout.component.ts](../src/app/workouts/workout/workout.component.ts)
  - [src/app/workouts/workout-plan/workout-plan.component.ts](../src/app/workouts/workout-plan/workout-plan.component.ts)

## Verification Expectations

- For code changes, prefer validating with the smallest relevant command first:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- If a change touches initialization, routing, or config-driven services, check for startup regressions rather than relying only on static analysis.

## Test Boundaries

- Do not cast Angular components to `any` in specs to reach `private` or `protected` members.
- Drive component state through public methods, bound inputs, router inputs, emitted events, or rendered DOM interactions instead.
- If a test cannot verify behavior without touching internals, refactor the test setup around the component's public surface before considering production code changes.
- Declare service mock variables using the concrete service type, not the mock class type. Use `useClass` rather than `useValue` when providing mocks to the TestBed, and obtain the injected instance via `TestBed.inject(ConcreteService)` after the component is created. Angular's DI ensures the mock class is used; the variable typed as the concrete service abstracts that detail. `useClass` creates a fresh mock instance per test, eliminating the need for cross-test mock state cleanup.
- Do not extract inline values in specs into named variables unless the value is genuinely reused or the name adds meaningful clarity. Constructing return values directly inside mock method implementations is the preferred style; pulling them out into module-level or `beforeEach`-level variables is an unnecessary refactor when the value is only used in one place.