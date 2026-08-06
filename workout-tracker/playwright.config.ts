import { defineConfig, devices } from '@playwright/test';
import { API_URL, E2E_DB_CONNECTION, FRONTEND_URL } from './e2e/support/env';

/*
 * E2E configuration. These tests drive the real Angular app against the real API and a real
 * SQL Server database, all of which Playwright starts itself.
 *
 * The whole stack is disposable and runs on its own ports (4201/5601, versus the dev stack's
 * 4200/5600) against its own database, which is dropped at the start of every run. That means
 * a run is always reproducible, and you can leave your dev servers — or the Aspire AppHost —
 * running while tests execute.
 *
 * Servers are deliberately never reused: an existing server would already be pointed at
 * whatever database it was started with, which would defeat the per-run reset.
 */

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  //Unit tests are *.spec.ts (Vitest); E2E specs are *.e2e.ts so the two runners never overlap.
  testMatch: '**/*.e2e.ts',
  outputDir: './test-results',

  globalSetup: './e2e/support/global-setup.ts',

  fullyParallel: false,
  //Single worker for now. Tests namespace their data via the `uniqueName` fixture, so raising
  //this is mostly a question of how much load the single API instance should take.
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: FRONTEND_URL,
    //Sessions are minted per test by the `authenticateAs` fixture option (default 'standard'),
    //not from a saved storageState file — see e2e/support/session.ts.
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
      /*
       * The database drop has to happen before the API starts, because the API migrates and
       * seeds on boot — and Playwright's globalSetup runs after webServer processes are up.
       * Chaining it into the start command is what guarantees the ordering.
       */
      /*
       * --no-launch-profile matters: launchSettings.json pins the API to port 5600 (the dev
       * port) via its applicationUrl, which would otherwise override the ASPNETCORE_URLS below
       * and quietly start the E2E API on top of the dev one.
       */
      command: 'node e2e/support/reset-database.mjs && dotnet run --verbosity quiet --no-launch-profile --project ../API/WorkoutTracker.API/WorkoutTracker.API.csproj',
      //The OpenAPI document is a cheap readiness probe that proves the app fully started.
      url: `${API_URL}/openapi/v1.json`,
      //Cold start includes a restore/build plus Database.Migrate() and EnsureSeedData().
      timeout: 240_000,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: API_URL,
        //reset-database.mjs reads this too, so the two can't disagree about which database.
        ConnectionStrings__WorkoutTrackerDatabase: E2E_DB_CONNECTION,
      },
    },
    {
      name: 'frontend',
      command: `npm run start -- --port ${new URL(FRONTEND_URL).port}`,
      url: FRONTEND_URL,
      timeout: 240_000,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        //Points proxy.conf.js at the API this config started, not the dev one.
        API_HTTP: API_URL,
      },
    },
  ],
});
