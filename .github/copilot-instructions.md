# WorkoutTracker Workspace Instructions

## Purpose
Use these instructions to make safe, minimal, and architecture-consistent changes across the .NET backend and Angular frontend.

## Repository Map
- `API/WorkoutTracker.API`: ASP.NET Core API composition root, controllers, DTO mappers, auth, startup wiring.
- `API/WorkoutTracker.Application`: application services and use-case orchestration.
- `API/WorkoutTracker.Domain`: domain entities and core business objects.
- `API/WorkoutTracker.Repository`: generic repository abstractions and implementations.
- `API/WorkoutTracker.Data`: EF Core DbContext, migrations, and seed helpers.
- `API/WorkoutTracker.Tests`: MSTest unit/integration tests.
- `API/WorkoutTracker.BFF`: Backend-for-Frontend. Owns the browser's cookie session and the API's JWTs, and proxies `/api` to the API with the token attached. Not part of the clean-architecture layering; it references only ServiceDefaults.
- `API/WorkoutTracker.BFF.Tests`: MSTest tests for the BFF, including end-to-end tests of its real pipeline against an in-process fake API.
- `workout-tracker`: Angular frontend app.

## Build, Run, and Test

### Backend (.NET) from `API/`
- Restore: `dotnet restore WorkoutTracker.sln`
- Build solution: `dotnet build WorkoutTracker.sln`
- Build tests: `dotnet build WorkoutTracker.Tests/WorkoutTracker.Tests.csproj`
- Run tests: `dotnet test WorkoutTracker.Tests/WorkoutTracker.Tests.csproj`
- Run API: `dotnet run --project WorkoutTracker.API/WorkoutTracker.API.csproj`
- Run BFF (needs the API running): `dotnet run --project WorkoutTracker.BFF/WorkoutTracker.BFF.csproj`
- Run BFF tests: `dotnet test WorkoutTracker.BFF.Tests/WorkoutTracker.BFF.Tests.csproj`

### Frontend (Angular) from `workout-tracker/`
- Install dependencies: `npm ci`
- Dev server: `npm run start`
- Build: `npm run build`
- Unit tests: `npm run test`
- Lint: `npm run lint`
- Generate API client (the API itself must be running on localhost:5600; it reads the API directly, not the BFF): `npm run gen-api-models`

## Architecture and Boundaries
- Keep controller logic thin. Put business rules in application services.
- Keep domain logic in `WorkoutTracker.Domain`; avoid leaking API concerns into domain types.
- Keep data access in repository/data projects; do not move EF-specific behavior into controllers.
- Preserve dependency direction:
  - API -> Application, Domain
  - Application -> Domain, Repository
  - Repository -> Data
- Prefer existing mapper classes for DTO conversions instead of ad-hoc mapping in controllers.

## Backend Conventions
- The solution uses `.NET 10` with nullable reference types enabled.
- Dependency injection registration relies heavily on type suffixes in `Program.cs`:
  - `*Service` -> registered as implemented interfaces
  - `*Repository` -> registered as implemented interfaces
  - `*Mapper` -> registered as implemented interfaces (singletons)
- When adding new service/repository/mapper types, follow suffix naming so registration works automatically.
- `Program.cs` applies migrations and seed data on startup; treat startup and migration changes carefully.

## Frontend Conventions
- Angular app is standalone/lazy-route oriented and uses feature folders under `src/app`.
- Runtime API URL is loaded from `src/config.json`; avoid hardcoding API base URLs in feature code.
- Generated OpenAPI client lives in `src/app/api`; regenerate rather than hand-edit.
- Unit tests run through the Angular unit-test builder configured with Vitest (`src/vitest.config.ts`).

## Pitfalls and Local Environment Notes
- API connection string in `appsettings.json` is machine-specific; local overrides may be required.
- The frontend never calls the API directly: `proxy.conf.js` sends `/api` and `/bff` to the BFF (default `http://localhost:5610`, override with `BFF_HTTP`), and the BFF forwards to the API at `Api:BaseUrl` (default `http://localhost:5600`). Running by hand means starting the API, then the BFF, then `npm run start`.
- The browser holds no tokens, only an HttpOnly session cookie. Do not reintroduce tokens into `localStorage` or an `Authorization` header in the SPA, and remember that every non-GET request to `/api` or `/bff` needs the `X-CSRF: 1` header (the SPA's `AuthInterceptor` adds it).
- The BFF keeps hand-maintained copies of the API's auth DTOs and JWT claim names. If you change either in the API, update `WorkoutTracker.BFF` and its tests too; nothing else will flag it.
- HTTPS local cert trust may be required. See `DevCertInfo.txt`.
- Avoid editing generated or runtime artifact folders unless explicitly requested:
  - `**/bin/**`
  - `**/obj/**`
  - `API/TestResults/**`
  - `workout-tracker/coverage/**`
  - `workout-tracker/dist/**`
  - `workout-tracker/src/app/api/**`
  - `API/WorkoutTracker.API/Logs/**`

## Key References (Link, Do Not Duplicate)
- Product overview/screenshots: `README.md`
- Backend startup and DI: `API/WorkoutTracker.API/Program.cs`
- Frontend project scripts/dependencies: `workout-tracker/package.json`
- Frontend runtime config: `workout-tracker/src/config.json`
- OpenAPI generation config: `workout-tracker/openapi-ts.config.ts`
- Dev HTTPS cert setup: `DevCertInfo.txt`
- Frontend README (some sections are stale): `workout-tracker/README.md`

## Change Quality Expectations
- Prefer minimal diffs that preserve existing style and naming.
- Add/adjust tests when behavior changes.
- If both backend and frontend are touched, validate each side independently.
- Do not refactor unrelated files in the same change.

## Optional Next Step: Scoped Instruction Files
This repository is a good candidate for applyTo-scoped instruction files later:
- Backend API/controllers: `API/WorkoutTracker.API/**/*.cs`
- Backend application/domain/repository/data: `API/WorkoutTracker.{Application,Domain,Repository,Data}/**/*.cs`
- Backend tests: `API/WorkoutTracker.Tests/**/*.cs`
- Frontend app code: `workout-tracker/src/**/*.ts`
- Frontend templates/styles: `workout-tracker/src/**/*.{html,scss}`
- Frontend generated API client (read-only guidance): `workout-tracker/src/app/api/**/*.ts`