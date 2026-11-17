import * as fs from 'node:fs/promises';
import { ApiClient } from './api-client';
import { AUTH_DIR, E2E_ADMIN, E2E_SETUP_CODE, E2E_USER, PROVISIONED_USERS_FILE } from './env';
import type { ProvisionedUser } from './env';
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

    //The admin has to be created first, through the one-time setup endpoint: creating any other
    //user requires an administrator.
    await anonymous.createFirstAdmin({
      userName: E2E_ADMIN.userName,
      emailAddress: E2E_ADMIN.emailAddress,
      password: E2E_ADMIN.password,
      setupCode: E2E_SETUP_CODE,
    });
  } finally {
    await anonymous.dispose();
  }

  //From here on the admin creates everything else, exactly as a real administrator would.
  const adminApi = await ApiClient.authenticateAs(E2E_ADMIN.userName, E2E_ADMIN.password);

  try {
    //The setup endpoint creates the account but returns nothing, so read it back for its real id and role.
    const adminSummary = (await adminApi.getUsers()).find(user => user.name === E2E_ADMIN.userName);
    if (!adminSummary) {
      throw new Error(`Created "${E2E_ADMIN.userName}" through the setup endpoint, but it is not in the user list.`);
    }

    const admin = await adminApi.getUser(adminSummary.publicId);
    if (admin.role !== UserRole.ADMINISTRATOR) {
      throw new Error(
        `Expected the first provisioned user to be an Administrator, but "${admin.name}" came back with role ${admin.role}.`
      );
    }

    const standard = await adminApi.createUser(E2E_USER);
    if (standard.role !== UserRole.STANDARD) {
      throw new Error(
        `Expected "${standard.name}" to be a standard user, but it came back with role ${standard.role}.`
      );
    }

    await writeProvisionedUsers(admin, standard);
  } finally {
    await adminApi.dispose();
  }

  await createBaselineExercises();

  console.log(`[e2e-setup] Provisioned "${E2E_ADMIN.userName}" (admin) and "${E2E_USER.userName}", and saved their sessions.`);
}

/*
 * Safety net. If the API we're talking to says setup is already complete, then it has users, so it is
 * not running against a freshly dropped database — most likely it attached to a pre-existing server
 * pointed at dev data. Better to stop than to start writing test data into someone's real database.
 */
async function assertDatabaseWasReset(api: ApiClient): Promise<void> {
  const { setupRequired } = await api.getSetupStatus();

  if (!setupRequired) {
    const existingUsers = await api.getUserProfiles();

    throw new Error(
      `Expected an empty E2E database, but the API reports setup is already complete ` +
      `(${existingUsers.length} existing user(s): ${existingUsers.map(u => u.name).join(', ')}).\n` +
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

async function writeProvisionedUsers(admin: ProvisionedUser, standard: ProvisionedUser): Promise<void> {
  //Only identifying fields are recorded, so the file never holds anything sensitive.
  const identify = ({ id, publicId, name, role }: ProvisionedUser): ProvisionedUser => ({ id, publicId, name, role });
  admin = identify(admin);
  standard = identify(standard);

  await fs.writeFile(PROVISIONED_USERS_FILE, JSON.stringify({ admin, standard }, null, 2), 'utf-8');
}
