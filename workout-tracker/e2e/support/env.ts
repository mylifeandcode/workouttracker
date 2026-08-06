import * as path from 'node:path';
import { UserRole } from '../../src/app/api/types.gen';

/*
 * Shared E2E environment. Imported by playwright.config.ts, the global setup and the
 * fixtures so there is exactly one definition of "where does the E2E stack live".
 *
 * The E2E stack deliberately runs on its own ports, separate from the dev stack
 * (4200 / 5600). That way an E2E run can never attach to a dev server that is pointed
 * at the dev database, and you can keep the dev stack (or the Aspire AppHost) running
 * while tests execute.
 */

export const FRONTEND_URL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4201';
export const API_URL = process.env['E2E_API_URL'] ?? 'http://localhost:5601';

/*
 * The E2E database is dropped and recreated on every run (see reset-database.mjs); the API
 * rebuilds it via Database.Migrate() + EnsureSeedData() as it boots. Never point this at a
 * database you care about — reset-database.mjs refuses names without "E2E" in them for exactly
 * that reason.
 */
export const E2E_DB_CONNECTION = process.env['E2E_DB_CONNECTION']
  ?? 'Server=.\\SQLEXPRESS;Database=WorkoutTrackerE2E;Trusted_Connection=True;TrustServerCertificate=true';

export const AUTH_DIR = path.join(__dirname, '..', '.auth');
export const PROVISIONED_USERS_FILE = path.join(AUTH_DIR, 'users.json');

/*
 * Accounts the global setup provisions into the freshly reset database.
 *
 * Order matters: the backend forces the first non-SYSTEM user to Administrator
 * (UserService.AddAsync), so the admin has to be created first. The global setup asserts
 * the role that came back rather than trusting that behavior silently.
 *
 * The API runs with SimpleLogin=true, which skips password verification altogether, so these
 * passwords are only meaningful if that setting is ever turned off for an E2E run.
 */
export const E2E_ADMIN = {
  userName: 'e2e-admin',
  emailAddress: 'e2e-admin@workouttracker.test',
  password: 'E2eAdminPassw0rd!',
  role: UserRole.ADMINISTRATOR,
};

export const E2E_USER = {
  userName: 'e2e-user',
  emailAddress: 'e2e-user@workouttracker.test',
  password: 'E2eUserPassw0rd!',
  role: UserRole.STANDARD,
};

/* localStorage keys the Angular AuthService reads on startup. */
export const TOKEN_STORAGE_KEY = 'WorkoutTrackerToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'WorkoutTrackerRefreshToken';
