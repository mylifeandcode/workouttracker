# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A two-part WorkoutTracker app intended for home use on a private network:

- `API/` — a .NET 10 solution (clean-architecture backend, ASP.NET Core Web API) plus a .NET Aspire AppHost.
- `workout-tracker/` — a standalone, zoneless Angular 21 frontend.

Two companion guides go deeper than this file; read them before working in their area:
- [workout-tracker/CLAUDE.md](workout-tracker/CLAUDE.md) — the authoritative frontend guide (architecture, startup ordering, services, conventions, testing).
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — cross-cutting conventions and guardrails for both backend and frontend. (Note: it says ".NET 9"; the solution actually targets `net10.0`.)

This file is the big-picture summary that connects the two halves. `README.md` is just screenshots.

## Commands

### Backend (run from `API/`)
- Build: `dotnet build WorkoutTracker.sln`
- Run API directly: `dotnet run --project WorkoutTracker.API/WorkoutTracker.API.csproj` (listens on `http://localhost:5600`)
- Run all tests: `dotnet test WorkoutTracker.Tests/WorkoutTracker.Tests.csproj`
- Run a single test: `dotnet test WorkoutTracker.Tests/WorkoutTracker.Tests.csproj --filter "FullyQualifiedName~WorkoutServiceTests"` (or `Name~SpecificTestMethod`)

### Aspire orchestration (run from `API/`)
- `dotnet run --project WorkoutTracker.AppHost/WorkoutTracker.AppHost.csproj` brings up the whole system: a SQL Server container, the API, and the Angular dev server (`npm run start`), wired together with service discovery. The `API/.claude/skills/aspire` skill covers driving the AppHost via the Aspire CLI.

### Frontend (run from `workout-tracker/`)
- See [workout-tracker/CLAUDE.md](workout-tracker/CLAUDE.md). In short: `npm install`, `npm run start` (proxies `/api` → `http://localhost:5600`), `npm run test`, `npm run lint`, `npm run build`.

## Backend architecture

**Clean-architecture layering with a strict dependency direction** (enforced by project references):
- `WorkoutTracker.API` — composition root: controllers (kept thin), `Mappers/` (entity↔DTO), `Auth/`, and all startup wiring in [Program.cs](API/WorkoutTracker.API/Program.cs). References Application + Domain + ServiceDefaults.
- `WorkoutTracker.Application` — use-case services, organized by feature (`Exercises`, `Resistances`, `Security`, `Users`, `Workouts`, `Shared`), each with `Interfaces/`, `Services/`, `Models/`. References Domain + Repository.
- `WorkoutTracker.Domain` — entities and business objects, by feature. No outward dependencies.
- `WorkoutTracker.Repository` — generic `Repository<T>` / `IRepository<T>` abstractions. References Data.
- `WorkoutTracker.Data` — EF Core `WorkoutsContext`, `EntitySetup/` (Fluent API config), `Migrations/`, and seed helpers.
- `WorkoutTracker.ServiceDefaults` — Aspire shared defaults (telemetry, health, service discovery).
- `WorkoutTracker.Tests` — MSTest + Moq + Shouldly, mirroring `Controllers/` and `Services/`, with builders under `TestHelpers/`.

Keep business rules in Application services, EF specifics in Repository/Data, and out of controllers. Prefer the existing `*Mapper` classes over ad-hoc DTO mapping.

**Dependency injection is convention-driven via Autofac** ([Program.cs](API/WorkoutTracker.API/Program.cs) `RegisterStuff`). Across all `Workout*` assemblies, types are auto-registered by suffix: `*Service` and `*Repository` → as their implemented interfaces; `*Mapper` → as interfaces, singletons. **When you add a new service/repository/mapper, follow the suffix naming or it won't be registered.** Closed `Repository<T>` registrations and a few parameterized services (`EmailService`, `UserService`) are wired explicitly.

**Startup is load-bearing** ([Program.cs](API/WorkoutTracker.API/Program.cs)): on boot it runs `context.Database.Migrate()` (wrapped in a retry loop that tolerates SQL Server still recovering from its data volume — important under Aspire/Docker) then `EnsureSeedData()`. Treat migration and startup changes carefully.

**Auth** is JWT bearer (issuer/audience/key from `Jwt:*` config). The matching frontend behavior (silent refresh, token replay) is documented in the frontend guide.

## The backend↔frontend contract

The frontend's API client is generated from the backend's OpenAPI document, so the two are coupled through that schema:
- The backend emits OpenAPI 3.1 at `http://localhost:5600/openapi/v1.json`, shaped by custom transformers in [Program.cs](API/WorkoutTracker.API/Program.cs) (`IntIsNoStringSchemaTransformer`, `NonNullableRequiredSchemaTransformer`, `EnumSchemaDocumentTransformer`) that fix integer/number typing, required-ness, and enum var-names.
- The frontend regenerates its typed client (`workout-tracker/src/app/api/**`, treated as generated — never hand-edited) via `npm run gen-api-models` against that document.

If you change a DTO, enum, or nullability on the backend, regenerate the frontend client rather than editing it. If you change the transformers, expect the generated client shape to change.

## Local environment notes
- The API connection string (`WorkoutTrackerDatabase` in `appsettings.json`) is machine-specific when running the API standalone; under the Aspire AppHost the SQL Server connection is injected automatically.
- Local HTTPS cert trust may be needed — see [DevCertInfo.txt](DevCertInfo.txt).
- Don't edit generated/artifact folders: `**/bin/**`, `**/obj/**`, `API/**/Logs/**`, `API/WorkoutTracker.Tests/TestResults/**`, and (frontend) `coverage/`, `dist/`, `src/app/api/**`.

## Change quality
- Prefer minimal diffs that preserve existing style and naming; don't refactor unrelated files in the same change.
- When a change spans both halves, build/test each side independently.
- Adjust or add tests when behavior changes.
