import { defineConfig, devices } from '@playwright/test';

/*
 * E2E configuration. These tests drive the real Angular app against the real API,
 * so both have to be running. By default Playwright starts each of them itself
 * (see `webServer` below); `reuseExistingServer` means that if you already have
 * the Aspire AppHost — or a hand-started `dotnet run` / `npm run start` — up on the
 * expected ports, Playwright attaches to those instead of starting duplicates.
 */

const FRONTEND_URL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';
const API_URL = process.env['E2E_API_URL'] ?? 'http://localhost:5600';

/*
 * E2E runs against a dedicated database so a test run never touches dev data.
 * The API creates/migrates/seeds it on boot, so pointing at a database that
 * doesn't exist yet is fine. Override for a different SQL Server instance.
 */
const E2E_DB_CONNECTION = process.env['E2E_DB_CONNECTION']
  ?? 'Server=.\\SQLEXPRESS;Database=WorkoutTrackerE2E;Trusted_Connection=True;TrustServerCertificate=true';

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  //Unit tests are *.spec.ts (Vitest); E2E specs are *.e2e.ts so the two runners never overlap.
  testMatch: '**/*.e2e.ts',
  outputDir: './test-results',

  fullyParallel: false,
  //Single worker until the Phase 2 fixtures namespace test data per-worker.
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      name: 'api',
      command: 'dotnet run --project ../API/WorkoutTracker.API/WorkoutTracker.API.csproj',
      //The OpenAPI document is a cheap readiness probe that proves the app fully started.
      url: `${API_URL}/openapi/v1.json`,
      //Cold start includes a restore/build plus Database.Migrate() and EnsureSeedData().
      timeout: 240_000,
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: API_URL,
        ConnectionStrings__WorkoutTrackerDatabase: E2E_DB_CONNECTION,
      },
    },
    {
      name: 'frontend',
      command: 'npm run start',
      url: FRONTEND_URL,
      timeout: 240_000,
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        //Keeps proxy.conf.js pointed at the same API this config started.
        API_HTTP: API_URL,
      },
    },
  ],

  //globalSetup (E2E database reset, user provisioning, saved storageState) arrives in Phase 2.
});
