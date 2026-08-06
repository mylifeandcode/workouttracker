import * as fs from 'node:fs/promises';
import { ApiClient } from './api-client';
import {
  ADMIN_STORAGE_STATE,
  AUTH_DIR,
  E2E_ADMIN,
  E2E_USER,
  FRONTEND_URL,
  PROVISIONED_USERS_FILE,
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_STATE,
} from './env';
import type { AuthTokenResultDTO, ExerciseTargetAreaLink, User } from '../../src/app/api/types.gen';
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

    await writeStorageState(ADMIN_STORAGE_STATE, await anonymous.logIn(E2E_ADMIN.userName, E2E_ADMIN.password));
    await writeStorageState(USER_STORAGE_STATE, await anonymous.logIn(E2E_USER.userName, E2E_USER.password));
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
    const targetAreas = await api.getTargetAreas();
    const legs = targetAreas.find(area => area.name === 'Legs');
    const chest = targetAreas.find(area => area.name === 'Chest');

    if (!legs || !chest) {
      throw new Error(`Expected the seeded target areas to include Legs and Chest; got: ${targetAreas.map(a => a.name).join(', ')}`);
    }

    await api.createExercise({ name: 'E2E Baseline Squat', exerciseTargetAreaLinks: [targetAreaLink(legs.id)] });
    await api.createExercise({ name: 'E2E Baseline Bench Press', exerciseTargetAreaLinks: [targetAreaLink(chest.id)] });
  } finally {
    await api.dispose();
  }
}

function targetAreaLink(targetAreaId: number): ExerciseTargetAreaLink {
  return {
    id: 0,
    exerciseId: 0,
    targetAreaId,
    exercise: null,
    targetArea: null,
    createdByUserId: 0,
    createdDateTime: new Date(),
  };
}

async function writeStorageState(file: string, tokens: AuthTokenResultDTO): Promise<void> {
  /*
   * The Angular AuthService restores a session from localStorage during app initialization,
   * so seeding these two keys is equivalent to having logged in through the UI — and the
   * router still won't activate until the initializer settles.
   *
   * The values must be JSON.stringify'd: LocalStorageService round-trips everything through
   * JSON, so a bare token string makes JSON.parse throw during app init and the app hangs on
   * its "Loading..." placeholder.
   */
  const state = {
    cookies: [],
    origins: [
      {
        origin: FRONTEND_URL,
        localStorage: [
          { name: TOKEN_STORAGE_KEY, value: JSON.stringify(tokens.accessToken) },
          { name: REFRESH_TOKEN_STORAGE_KEY, value: JSON.stringify(tokens.refreshToken) },
        ],
      },
    ],
  };

  await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf-8');
}

async function writeProvisionedUsers(admin: User, standard: User): Promise<void> {
  await fs.writeFile(PROVISIONED_USERS_FILE, JSON.stringify({ admin, standard }, null, 2), 'utf-8');
}
