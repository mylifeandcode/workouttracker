import * as fs from 'node:fs/promises';
import { ApiClient } from './api-client';
import { AUTH_DIR, E2E_ADMIN, E2E_USER, PROVISIONED_USERS_FILE } from './env';
import type { User } from '../../src/app/api/types.gen';
import { UserRole } from '../../src/app/api/types.gen';

/*
 * Runs once, after the webServer processes are up and before any test.
 *
 * The database drop happens earlier still — see reset-database.mjs, which runs as part of the
 * API's start command, because by the time this file executes the API has already migrated
 * and seeded. So what arrives here is a database containing only what EnsureSeedData() creates:
 * the SYSTEM user (which the API hides from GET /api/Users) and nine target areas.
 */
export default async function globalSetup(): Promise<void> {
  await fs.mkdir(AUTH_DIR, { recursive: true });

  const anonymous = await ApiClient.anonymous();

  try {
    await assertDatabaseWasReset(anonymous);

    /*
     * The admin has to be created first: UserService.AddAsync forces the first non-SYSTEM
     * user to Administrator regardless of the role requested. Assert rather than assume, so
     * this fails loudly if that behavior ever changes.
     */
    const admin = await anonymous.createUser(E2E_ADMIN);
    if (admin.role !== UserRole.ADMINISTRATOR) {
      throw new Error(
        `Expected the first provisioned user to be an Administrator, but "${admin.name}" came back with role ${admin.role}.`
      );
    }

    const standard = await anonymous.createUser(E2E_USER);
    if (standard.role !== UserRole.STANDARD) {
      throw new Error(
        `Expected "${standard.name}" to be a standard user, but it came back with role ${standard.role}.`
      );
    }

    await writeProvisionedUsers(admin, standard);
  } finally {
    await anonymous.dispose();
  }

  await createBaselineExercises();

  console.log(`[e2e-setup] Provisioned "${E2E_ADMIN.userName}" (admin) and "${E2E_USER.userName}", and saved their sessions.`);
}

/*
 * Safety net. If the API we're talking to already has users, then it is not running against a
 * freshly dropped database — most likely it attached to a pre-existing server pointed at dev
 * data. Better to stop than to start writing test data into someone's real database.
 */
async function assertDatabaseWasReset(api: ApiClient): Promise<void> {
  const existingUsers = await api.getUsers();

  if (existingUsers.length > 0) {
    throw new Error(
      `Expected an empty E2E database, but the API returned ${existingUsers.length} existing user(s): ` +
      `${existingUsers.map(u => u.name).join(', ')}.\n` +
      `  This usually means the API under test is not running against the freshly reset E2E database.\n` +
      `  Check E2E_DB_CONNECTION and make sure nothing else is already listening on the API's port.`
    );
  }
}

/*
 * A couple of exercises every test can rely on existing. Tests that need their own data should
 * create it through the `api` fixture with a unique name rather than adding to this list —
 * the more shared state lives here, the more tests can affect each other.
 */
async function createBaselineExercises(): Promise<void> {
  const api = await ApiClient.authenticateAs(E2E_ADMIN.userName, E2E_ADMIN.password);

  try {
    await api.createExerciseWithTargetAreas('E2E Baseline Squat', ['Legs']);
    await api.createExerciseWithTargetAreas('E2E Baseline Bench Press', ['Chest']);
  } finally {
    await api.dispose();
  }
}

async function writeProvisionedUsers(admin: User, standard: User): Promise<void> {
  await fs.writeFile(PROVISIONED_USERS_FILE, JSON.stringify({ admin, standard }, null, 2), 'utf-8');
}
