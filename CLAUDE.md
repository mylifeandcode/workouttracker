# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A two-part WorkoutTracker app intended for home use on a private network:

- `API/` — a .NET 10 solution: a clean-architecture ASP.NET Core Web API, a **BFF** (Backend-for-Frontend) in front of it, and a .NET Aspire AppHost.
- `workout-tracker/` — a standalone, zoneless Angular 22 frontend.

**Request path.** The browser never talks to the API and never holds a token. It holds one HttpOnly session cookie, and the BFF keeps the JWTs server-side:

```
Browser --(HttpOnly cookie, same origin)--> Angular dev server / nginx --> BFF (:5610) --(Bearer JWT)--> API (:5600) --> SQL Server
```

The BFF was added as a learning exercise in the BFF pattern (hand-rolled ASP.NET Core + YARP, deliberately not Duende); the API itself is unchanged by it.

Two companion guides go deeper than this file; read them before working in their area:
- [workout-tracker/CLAUDE.md](workout-tracker/CLAUDE.md) — the authoritative frontend guide (architecture, startup ordering, services, conventions, testing).
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — cross-cutting conventions and guardrails for both backend and frontend. (Note: it says ".NET 9"; the solution actually targets `net10.0`.)

This file is the big-picture summary that connects the two halves. `README.md` is just screenshots.

## Commands

### Backend (run from `API/`)
- Build: `dotnet build WorkoutTracker.sln`
- Run API directly: `dotnet run --project WorkoutTracker.API/WorkoutTracker.API.csproj` (listens on `http://localhost:5600`)
- Run the BFF directly: `dotnet run --project WorkoutTracker.BFF/WorkoutTracker.BFF.csproj` (listens on `http://localhost:5610`; forwards to the API at `Api:BaseUrl`, default `http://localhost:5600`, so the API must be running for login to work). Running the app by hand therefore takes three processes: API, BFF, and the Angular dev server.
- Run all API tests: `dotnet test WorkoutTracker.Tests/WorkoutTracker.Tests.csproj`
- Run a single test: `dotnet test WorkoutTracker.Tests/WorkoutTracker.Tests.csproj --filter "FullyQualifiedName~WorkoutServiceTests"` (or `Name~SpecificTestMethod`)
- Run the BFF tests: `dotnet test WorkoutTracker.BFF.Tests/WorkoutTracker.BFF.Tests.csproj` (unit tests plus end-to-end tests of the real BFF pipeline against an in-process fake API; needs no database or running servers).

### Aspire orchestration (run from `API/`)
- `dotnet run --project WorkoutTracker.AppHost/WorkoutTracker.AppHost.csproj` brings up the whole system: a SQL Server container, the API, the BFF, and the Angular dev server (`npm run start`), wired together by the AppHost. The BFF learns the API's address from `Api__BaseUrl` and the dev server learns the BFF's from `BFF_HTTP`. Only the frontend is exposed externally; the API and BFF are internal. The `API/.claude/skills/aspire` skill covers driving the AppHost via the Aspire CLI.

### Frontend (run from `workout-tracker/`)
- See [workout-tracker/CLAUDE.md](workout-tracker/CLAUDE.md). In short: `npm install`, `npm run start` (proxies `/api` and `/bff` → the BFF at `http://localhost:5610`), `npm run test`, `npm run lint`, `npm run build`.
- End-to-end tests: `npm run e2e` (Playwright). It starts its own full stack — API on `:5601`, BFF on `:5602` and dev server on `:4201` against a disposable `WorkoutTrackerE2E` database that is dropped and rebuilt every run — so it needs nothing running first and won't collide with the dev stack or the Aspire AppHost. Details in the frontend guide's [E2E tests](workout-tracker/CLAUDE.md#e2e-tests) section.

## Backend architecture

**Clean-architecture layering with a strict dependency direction** (enforced by project references):
- `WorkoutTracker.API` — composition root: controllers (kept thin), `Mappers/` (entity↔DTO), `Auth/`, and all startup wiring in [Program.cs](API/WorkoutTracker.API/Program.cs). References Application + Domain + ServiceDefaults.
- `WorkoutTracker.Application` — use-case services, organized by feature (`Exercises`, `Resistances`, `Security`, `Users`, `Workouts`, `Shared`), each with `Interfaces/`, `Services/`, `Models/`. References Domain + Repository.
- `WorkoutTracker.Domain` — entities and business objects, by feature. No outward dependencies.
- `WorkoutTracker.Repository` — generic `Repository<T>` / `IRepository<T>` abstractions. References Data.
- `WorkoutTracker.Data` — EF Core `WorkoutsContext`, `EntitySetup/` (Fluent API config), `Migrations/`, and seed helpers.
- `WorkoutTracker.ServiceDefaults` — Aspire shared defaults (telemetry, health, service discovery).
- `WorkoutTracker.Tests` — MSTest + Moq + Shouldly, mirroring `Controllers/` and `Services/`, with builders under `TestHelpers/`.
- `WorkoutTracker.BFF` — the Backend-for-Frontend (see **Auth** below). **Not** part of the clean-architecture layering: it references only ServiceDefaults, deliberately not the API, Application or Domain, because it knows the API purely through its HTTP contract. It does not use Autofac, so the `*Service` suffix convention below does not apply to it; its few services are registered explicitly in its `Program.cs`. Layout: `Endpoints/` (`/bff/login|user|logout`), `Session/` (server-side session store, single-flight token refresh), `Middleware/` (CSRF check, refresh-before-forward), `Proxy/` (YARP routes and the token-attaching transform), `Auth/` (`ApiAuthClient`, its back-channel client for the API's auth endpoints).
- `WorkoutTracker.BFF.Tests` — MSTest + Shouldly. A separate project from `WorkoutTracker.Tests` because the API and BFF both have a top-level `Program` class, so one test project referencing both would make `WebApplicationFactory<Program>` ambiguous. Its end-to-end tests host the real BFF pipeline against `TestHelpers/FakeApiServer` (a tiny in-process API on a real local port, since YARP forwards over real sockets) and assert on what that fake API received.

Keep business rules in Application services, EF specifics in Repository/Data, and out of controllers. Prefer the existing `*Mapper` classes over ad-hoc DTO mapping.

**Dependency injection is convention-driven via Autofac** ([Program.cs](API/WorkoutTracker.API/Program.cs) `RegisterStuff`). Across all `Workout*` assemblies, types are auto-registered by suffix: `*Service` and `*Repository` → as their implemented interfaces; `*Mapper` → as interfaces, singletons. **When you add a new service/repository/mapper, follow the suffix naming or it won't be registered.** Closed `Repository<T>` registrations and a few parameterized services (`EmailService`, `UserService`) are wired explicitly.

**Startup is load-bearing** ([Program.cs](API/WorkoutTracker.API/Program.cs)): on boot it runs `context.Database.Migrate()` (wrapped in a retry loop that tolerates SQL Server still recovering from its data volume — important under Aspire/Docker) then `EnsureSeedData()`. Treat migration and startup changes carefully.

**Auth** has two layers.

- **The API** is unchanged and still a plain JWT resource server (issuer/audience/key from `Jwt:*` config). `/api/auth/login|refresh|revoke` issue and rotate an access token and a refresh token; presenting an already-rotated refresh token is treated as a replay and revokes the whole chain.
- **The BFF** makes those calls on the browser's behalf and keeps the tokens. The browser holds only an HttpOnly, `SameSite=Strict` `wt.session` cookie that names a server-side session (`MemoryTicketStore`). Sessions live in BFF memory, so restarting the BFF signs everyone out. The SPA side is documented in the frontend guide.

Invariants that break the app *silently* if changed, so check them before touching `WorkoutTracker.BFF`:
- **Refresh must be single-flight per session** (`RefreshLocks` + `TokenRefreshService`). Two overlapping refreshes with the same refresh token make the API see a replay and revoke the chain, signing the user out. For the same reason `Program.cs` disables HTTP retries for POSTs: a retried `/auth/refresh` is a replay.
- **`MemoryTicketStore.RenewAsync` must take only the lifetime from the ticket it is handed.** The cookie handler passes the ticket it loaded at the start of the request; taking its tokens would roll back to a refresh token the API has already rotated away.
- **CSRF.** Cookies are sent automatically, so every non-GET request to `/api` or `/bff` must carry `X-CSRF: 1` (`CsrfProtectionMiddleware`). The SPA's `AuthInterceptor` adds it; so does the E2E `ApiClient`.
- **The proxy** strips the `Cookie` header and replaces any browser-supplied `Authorization` header before forwarding, and the BFF returns 404 for the API's own `/api/auth/login|refresh|revoke` so the browser cannot reach them. Anonymous routes are an explicit allow-list in `Proxy/ProxyConfig.cs`; everything else under `/api` requires a session. Add a new anonymous API endpoint there, or it will 401.
- **The BFF must not be exposed externally.** It trusts `X-Forwarded-*` from anything that can reach it (home network, nginx in front); the AppHost deliberately does not mark it external. (The generated Docker Compose output was not regenerated or inspected when the BFF was added, so check that the BFF has no published host port after the next `aspire deploy`.)
- **Known edge:** the API's `change-password` revokes all of a user's refresh tokens, so their BFF session is signed out when its current access token expires (up to `Jwt:AccessTokenLifetimeMinutes`, 120 by default).

## The backend↔frontend contract

The frontend's API client is generated from the backend's OpenAPI document, so the two are coupled through that schema:
- The backend emits OpenAPI 3.1 at `http://localhost:5600/openapi/v1.json`, shaped by custom transformers in [Program.cs](API/WorkoutTracker.API/Program.cs) (`IntIsNoStringSchemaTransformer`, `NonNullableRequiredSchemaTransformer`, `EnumSchemaDocumentTransformer`) that fix integer/number typing, required-ness, and enum var-names.
- The frontend regenerates its typed client (`workout-tracker/src/app/api/**`, treated as generated — never hand-edited) via `npm run gen-api-models` against that document.

If you change a DTO, enum, or nullability on the backend, regenerate the frontend client rather than editing it. If you change the transformers, expect the generated client shape to change.

**Two contracts are NOT covered by regeneration**, because they are hand-maintained copies:
- **The BFF's view of the API's auth contract.** `WorkoutTracker.BFF/Models/AuthModels.cs` mirrors the API's `AuthTokenResultDTO`, `RefreshTokenRequestDTO` and `UserCredentialsDTO`, and `Session/SessionPrincipalFactory.cs` reads the claim names written by `WorkoutTracker.API/Auth/TokenService.cs` (`ClaimTypes.Name`, `ClaimTypes.Role`, `UserID`, `UserPublicID`). If you change the API's auth DTOs, claim names or role values, update those BFF files and `WorkoutTracker.BFF.Tests` (its `TestJwt` helper builds tokens with the same claim names) — nothing else will warn you, and login will simply start failing.
- **The BFF's own `/bff/*` contract with the SPA.** `GET /bff/user` and a successful `POST /bff/login` return `BffUser`; it is not in the API's OpenAPI document, so the frontend has a hand-written copy in `workout-tracker/src/app/core/_services/auth/bff-user.ts`. Change both together.

## Local environment notes
- The API connection string (`WorkoutTrackerDatabase` in `appsettings.json`) is machine-specific when running the API standalone; under the Aspire AppHost the SQL Server connection is injected automatically.
- The BFF finds the API through `Api:BaseUrl` (`appsettings.json`, default `http://localhost:5600`); the AppHost and Playwright override it with `Api__BaseUrl`. It is the one place the API's address lives, including for the YARP proxy.
- **The session cookie `wt.session` is scoped by host, not port.** Browsers ignore ports for cookies, so signing in to the dev stack at `localhost:4200` and the E2E stack at `localhost:4201` in the *same normal browser* overwrite each other's session. Playwright isolates its contexts, so tests are unaffected.
- Local HTTPS cert trust may be needed — see [DevCertInfo.txt](DevCertInfo.txt).
- Don't edit generated/artifact folders: `**/bin/**`, `**/obj/**`, `API/**/Logs/**`, `API/WorkoutTracker.Tests/TestResults/**`, and (frontend) `coverage/`, `dist/`, `src/app/api/**`.

## Change quality
- Prefer minimal diffs that preserve existing style and naming; don't refactor unrelated files in the same change.
- When a change spans both halves, build/test each side independently.
- Adjust or add tests when behavior changes.
