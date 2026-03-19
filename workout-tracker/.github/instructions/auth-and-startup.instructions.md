---
applyTo: "src/app/app.config.ts,src/app/app.routes.ts,src/app/core/**/*.ts,src/config.json"
---

# Auth And Startup Instructions

## Preserve App Initialization Order

- The app depends on runtime config from [src/config.json](../../src/config.json), loaded during startup in [src/app/app.config.ts](../../src/app/app.config.ts).
- Keep the startup sequence in `initializeApp(...)` coherent:
  1. load `config.json`
  2. `configService.init(config)`
  3. `authService.init()`
  4. `authService.restoreUserSessionIfApplicable()`
  5. `userService.init()`
- Do not reorder those steps casually. `AuthService` and `UserService` both depend on config values that are not safe to assume in their constructors.

## Be Careful With Config Access Timing

- [src/app/core/_services/config/config.service.ts](../../src/app/core/_services/config/config.service.ts) is populated at runtime, not compile time.
- Avoid moving config-dependent setup into service constructors unless you have verified startup ordering end to end.
- Existing code already documents this risk in services such as:
  - [src/app/core/_services/auth/auth.service.ts](../../src/app/core/_services/auth/auth.service.ts)
  - [src/app/core/_services/user/user.service.ts](../../src/app/core/_services/user/user.service.ts)
- If you add a new service that needs `apiRoot` or feature flags from config, prefer an explicit `init()` path or another mechanism that still respects the app initializer flow.

## AuthService Contract

- [src/app/core/_services/auth/auth.service.ts](../../src/app/core/_services/auth/auth.service.ts) owns:
  - auth API root construction
  - login route selection from `loginWithUserSelect`
  - token persistence and restoration
  - decoded JWT claim access for role and user identity
- Preserve `loginRoute` behavior. Guards and logout flow depend on it, so changing login routing requires coordinated updates across routes, guards, and auth screens.
- If you change claim names, token handling, or login response shape, update all dependent getters and guard behavior together.

## Guards Depend On Auth State Semantics

- [src/app/core/_guards/user-selected/user-selected.guard.ts](../../src/app/core/_guards/user-selected/user-selected.guard.ts) redirects unauthenticated users to `authService.loginRoute`.
- [src/app/core/_guards/user-not-selected/user-not-selected.guard.ts](../../src/app/core/_guards/user-not-selected/user-not-selected.guard.ts) redirects authenticated users to `home`.
- [src/app/admin/_guards/user-is-admin/user-is-admin.guard.ts](../../src/app/admin/_guards/user-is-admin/user-is-admin.guard.ts) relies on `AuthService.isUserAdmin` and routes failures to `denied`.
- When editing auth or route behavior, preserve these contracts unless the user is intentionally redesigning the login and authorization flow.

## Interceptor Expectations

- [src/app/core/auth.interceptor.ts](../../src/app/core/auth.interceptor.ts) adds the bearer token only when `AuthService.token` is present.
- Keep the interceptor registration in [src/app/app.config.ts](../../src/app/app.config.ts) aligned with `provideHttpClient(withInterceptorsFromDi())`.
- If you move auth state storage or token shape, make sure interceptor behavior still matches the active auth model.

## Local Storage And Session Restore

- [src/app/core/_services/local-storage/local-storage.service.ts](../../src/app/core/_services/local-storage/local-storage.service.ts) wraps `window.localStorage` and is used by `AuthService` for token persistence.
- `restoreUserSessionIfApplicable()` is part of startup behavior, not just an on-demand login helper. Changes there can alter first-load routing and guard behavior across the app.
- Do not introduce startup logic that assumes restored auth state is available before `authService.init()` runs.

## Routing Implications

- Top-level route access policy is defined in [src/app/app.routes.ts](../../src/app/app.routes.ts).
- The empty route, `user-select`, `new-user`, and `login` are part of the unauthenticated or not-yet-selected flow.
- `home`, feature routes, and admin access rely on the current guard setup. Avoid changing those defaults without checking the user-selection flow and admin-module behavior together.
- Keep the `admin` route using both `canLoad` and `canActivate` unless the auth model is intentionally changing. The double guard is there for a real post-load logout/login scenario.

## Verification Guidance

- If you change startup, auth, config loading, guards, or route redirects, prefer validating with more than lint.
- At minimum, run the smallest relevant test or build step that exercises startup behavior. For risky auth or initializer changes, `npm run test` or `npm run build` is more meaningful than lint alone.