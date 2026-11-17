import { APIRequestContext, APIResponse, expect, request } from '@playwright/test';
import { API_URL } from './env';
import type {
  AuthTokenResultDTO,
  Exercise,
  ExerciseTargetAreaLink,
  FirstAdminRequestDTO,
  PaginatedResultsOfExecutedWorkoutSummaryDTO,
  PaginatedResultsOfExerciseDTO,
  PaginatedResultsOfWorkoutDTO,
  SetupStatusDTO,
  TargetArea,
  User,
  UserDTO,
  UserNewDTO,
  UserProfileDTO,
  UserSettingsUpdateDTO,
  UserSummaryDTO,
  UserUpdateDTO,
  Workout,
} from '../../src/app/api/types.gen';
import { ResistanceType, SetType } from '../../src/app/api/types.gen';
import { EMPTY_GUID } from '../../src/app/shared/constants/feature-agnostic-constants';

/** The parts of an exercise-in-workout a test actually cares about; the rest is boilerplate. */
export interface WorkoutExerciseSpec {
  exerciseId: number;
  numberOfSets?: number;
  setType?: SetType;
}

/*
 * Thin, typed wrapper over Playwright's request context for talking to the WorkoutTracker API
 * directly. Used to arrange and verify state around UI tests — set data up over HTTP (fast,
 * reliable), assert the outcome through the UI, then confirm it landed via the API.
 *
 * Types come from the generated client so this breaks loudly when a DTO changes shape, which
 * is the point: the schema is the contract between the two halves of the app.
 */
export class ApiClient {
  constructor(private readonly context: APIRequestContext) {}

  /**
   * Builds a client authenticated as the given user. The API runs with SimpleLogin=true, so
   * the password is not actually verified — but it is still sent, so this keeps working if
   * that setting is ever turned off.
   */
  static async authenticateAs(username: string, password: string): Promise<ApiClient> {
    const anonymous = new ApiClient(await request.newContext({ baseURL: API_URL }));
    const tokens = await anonymous.logIn(username, password);
    await anonymous.dispose();

    return new ApiClient(await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
    }));
  }

  static async anonymous(): Promise<ApiClient> {
    return new ApiClient(await request.newContext({ baseURL: API_URL }));
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  //AUTH ///////////////////////////////////////////////////////////////////////

  async logIn(username: string, password: string): Promise<AuthTokenResultDTO> {
    const response = await this.tryLogIn(username, password);

    expect(response, `Login failed for "${username}"`).toBeOK();
    return response.json() as Promise<AuthTokenResultDTO>;
  }

  /** Like `logIn`, but returns the raw response so a test can assert on a refusal. */
  async tryLogIn(username: string, password: string): Promise<APIResponse> {
    return this.context.post('/api/auth/login', { data: { username, password } });
  }

  /** Exchanges a session's tokens for new ones; returns the raw response. */
  async tryRefresh(tokens: AuthTokenResultDTO): Promise<APIResponse> {
    return this.context.post('/api/auth/refresh', {
      data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  }

  /** Anonymous: the list the pre-login user picker shows, as raw JSON. */
  async getProfileNames(): Promise<string[]> {
    return (await this.getUserProfiles()).map(profile => profile.name);
  }

  //USERS //////////////////////////////////////////////////////////////////////

  /**
   * Admin-only. Note: the API filters the seeded SYSTEM user out of this list, and returns summaries
   * (id, publicId, name) rather than whole users.
   */
  async getUsers(): Promise<UserSummaryDTO[]> {
    const response = await this.context.get('/api/Users');
    expect(response, 'Could not load users').toBeOK();
    return response.json() as Promise<UserSummaryDTO[]>;
  }

  /** One user in full (role, email address, settings), by public id. */
  async getUser(publicId: string): Promise<UserDTO> {
    const response = await this.tryGetUser(publicId);
    expect(response, `Could not load user ${publicId}`).toBeOK();
    return response.json() as Promise<UserDTO>;
  }

  /** Like `getUser`, but returns the raw response so a test can assert on a refusal (401/403/404). */
  async tryGetUser(publicId: string): Promise<APIResponse> {
    return this.context.get(`/api/Users/${publicId}`);
  }

  /** Administrator-only: changes a user's name, email address and role. */
  async updateUser(publicId: string, update: UserUpdateDTO): Promise<void> {
    const response = await this.tryUpdateUser(publicId, update);
    expect(response, `Could not update user ${publicId}`).toBeOK();
  }

  async tryUpdateUser(publicId: string, update: UserUpdateDTO): Promise<APIResponse> {
    return this.context.put(`/api/Users/${publicId}`, { data: update });
  }

  /**
   * Saves the signed-in user's own settings. Extra properties are sent as given, so a test can try to smuggle in a
   * role or a user id and confirm the API ignores them.
   */
  async tryUpdateMySettings(settings: UserSettingsUpdateDTO | Record<string, unknown>): Promise<APIResponse> {
    return this.context.put('/api/Users/me/settings', { data: settings });
  }

  /** Administrator-only: the "delete" of a user. */
  async deactivateUser(publicId: string): Promise<void> {
    const response = await this.tryDeactivateUser(publicId);
    expect(response, `Could not deactivate user ${publicId}`).toBeOK();
  }

  async tryDeactivateUser(publicId: string): Promise<APIResponse> {
    return this.context.put(`/api/Users/${publicId}/deactivate`);
  }

  async reactivateUser(publicId: string): Promise<void> {
    const response = await this.context.put(`/api/Users/${publicId}/reactivate`);
    expect(response, `Could not reactivate user ${publicId}`).toBeOK();
  }

  /** For asserting that a route no longer exists. */
  async tryRequest(method: 'get' | 'put' | 'delete', path: string): Promise<APIResponse> {
    return this.context[method](path);
  }

  /**
   * Anonymous — the same minimal list the pre-login user-select screen shows. Usable before
   * any user (even the admin) exists, unlike getUsers(), which requires an admin token.
   */
  async getUserProfiles(): Promise<UserProfileDTO[]> {
    const response = await this.context.get('/api/Auth/profiles');
    expect(response, 'Could not load user profiles').toBeOK();
    return response.json() as Promise<UserProfileDTO[]>;
  }

  /**
   * Creates a user. Administrator-only: use a client from `authenticateAs` with the admin account.
   * (The very first administrator is created with `createFirstAdmin`.)
   */
  async createUser(user: UserNewDTO): Promise<User> {
    const response = await this.tryCreateUser(user);
    expect(response, `Could not create user "${user.userName}"`).toBeOK();
    return response.json() as Promise<User>;
  }

  /** Like `createUser`, but returns the raw response so a test can assert on a refusal (401/403/400). */
  async tryCreateUser(user: UserNewDTO): Promise<APIResponse> {
    return this.context.post('/api/Users/new', { data: user });
  }

  //SETUP //////////////////////////////////////////////////////////////////////

  /** Anonymous. `setupRequired` is true until the first administrator exists. */
  async getSetupStatus(): Promise<SetupStatusDTO> {
    const response = await this.context.get('/api/Setup/status');
    expect(response, 'Could not load the setup status').toBeOK();
    return response.json() as Promise<SetupStatusDTO>;
  }

  /** Anonymous. Creates the first administrator; only works while setup is required, with the setup code. */
  async createFirstAdmin(request: FirstAdminRequestDTO): Promise<void> {
    const response = await this.tryCreateFirstAdmin(request);
    expect(response, `Could not create the first administrator "${request.userName}"`).toBeOK();
  }

  /** Like `createFirstAdmin`, but returns the raw response so a test can assert on a refusal (400/409). */
  async tryCreateFirstAdmin(request: FirstAdminRequestDTO): Promise<APIResponse> {
    return this.context.post('/api/Setup/first-admin', { data: request });
  }

  //EXERCISES //////////////////////////////////////////////////////////////////

  async getTargetAreas(): Promise<TargetArea[]> {
    const response = await this.context.get('/api/TargetAreas');
    expect(response, 'Could not load target areas').toBeOK();
    return response.json() as Promise<TargetArea[]>;
  }

  /**
   * Creates an exercise, filling in the fields the API requires so callers only have to say
   * what actually matters to their test. Requires an authenticated client.
   *
   * There is no counterpart delete helper: the API's DELETE api/Exercises/{publicId} throws
   * NotImplementedException, so exercises cannot be removed once created.
   */
  async createExercise(exercise: Partial<Exercise> & Pick<Exercise, 'name'>): Promise<Exercise> {
    const response = await this.context.post('/api/Exercises', {
      data: {
        id: 0,
        name: exercise.name,
        description: exercise.description ?? `${exercise.name} description`,
        setup: exercise.setup ?? 'Set up',
        movement: exercise.movement ?? 'Move',
        pointsToRemember: exercise.pointsToRemember ?? 'Remember',
        resistanceType: exercise.resistanceType ?? ResistanceType.FREE_WEIGHT,
        oneSided: exercise.oneSided ?? false,
        bandsEndToEnd: exercise.bandsEndToEnd ?? null,
        involvesReps: exercise.involvesReps ?? true,
        usesBilateralResistance: exercise.usesBilateralResistance ?? false,
        exerciseTargetAreaLinks: exercise.exerciseTargetAreaLinks ?? [],
      },
    });

    expect(response, `Could not create exercise "${exercise.name}"`).toBeOK();
    return response.json() as Promise<Exercise>;
  }

  /**
   * Creates an exercise linked to the named (seeded) target areas — the common case, since the
   * form requires at least one and the raw link records are noisy to build by hand.
   */
  async createExerciseWithTargetAreas(name: string, targetAreaNames: string[]): Promise<Exercise> {
    const allAreas = await this.getTargetAreas();

    const exerciseTargetAreaLinks: ExerciseTargetAreaLink[] = targetAreaNames.map(areaName => {
      const area = allAreas.find(a => a.name === areaName);
      if (!area) {
        throw new Error(`No seeded target area named "${areaName}"; got: ${allAreas.map(a => a.name).join(', ')}`);
      }

      return {
        id: 0,
        exerciseId: 0,
        targetAreaId: area.id,
        exercise: null,
        targetArea: null,
        createdByUserId: 0,
        createdDateTime: new Date(),
      };
    });

    return this.createExercise({ name, exerciseTargetAreaLinks });
  }

  async getExerciseByPublicId(publicId: string): Promise<Exercise> {
    const response = await this.context.get(`/api/Exercises/${publicId}`);
    expect(response, `Could not load exercise ${publicId}`).toBeOK();
    return response.json() as Promise<Exercise>;
  }

  /** Name search, matching what the exercise list's filter does. */
  async searchExercises(nameContains: string): Promise<PaginatedResultsOfExerciseDTO> {
    const response = await this.context.get('/api/Exercises', {
      params: { firstRecord: 0, pageSize: 100, nameContains, sortAscending: true },
    });

    expect(response, `Could not search exercises for "${nameContains}"`).toBeOK();
    return response.json() as Promise<PaginatedResultsOfExerciseDTO>;
  }

  //WORKOUTS ///////////////////////////////////////////////////////////////////

  /**
   * Creates a workout containing the given exercises. Note the id asymmetry in this API: the
   * Workout entity's `id` is numeric, but WorkoutDTO (what the list returns, and what the UI
   * puts in its route links) carries the publicId guid in a string `id`.
   */
  async createWorkout(name: string, exercises: WorkoutExerciseSpec[]): Promise<Workout> {
    const response = await this.context.post('/api/Workouts', {
      data: {
        id: 0,
        publicId: EMPTY_GUID,
        name,
        active: true,
        createdByUserId: 0,
        createdDateTime: new Date(),
        exercises: exercises.map((exercise, index) => ({
          id: 0,
          exercise: null,
          exerciseId: exercise.exerciseId,
          numberOfSets: exercise.numberOfSets ?? 1,
          setType: exercise.setType ?? SetType.REPETITION,
          sequence: index,
          createdByUserId: 0,
          createdDateTime: new Date(),
        })),
      },
    });

    expect(response, `Could not create workout "${name}"`).toBeOK();
    return response.json() as Promise<Workout>;
  }

  async getWorkoutByPublicId(publicId: string): Promise<Workout> {
    const response = await this.context.get(`/api/Workouts/${publicId}`);
    expect(response, `Could not load workout ${publicId}`).toBeOK();
    return response.json() as Promise<Workout>;
  }

  async searchWorkouts(nameContains?: string, activeOnly = false): Promise<PaginatedResultsOfWorkoutDTO> {
    const response = await this.context.get('/api/Workouts', {
      params: {
        firstRecord: 0,
        pageSize: 200,
        activeOnly,
        sortAscending: true,
        ...(nameContains ? { nameContains } : {}),
      },
    });

    expect(response, 'Could not search workouts').toBeOK();
    return response.json() as Promise<PaginatedResultsOfWorkoutDTO>;
  }

  /** Completed and in-progress workouts for the authenticated user, newest first. */
  async getExecutedWorkouts(workoutNameContains?: string): Promise<PaginatedResultsOfExecutedWorkoutSummaryDTO> {
    const response = await this.context.get('/api/ExecutedWorkout', {
      params: {
        firstRecord: 0,
        pageSize: 100,
        newestFirst: true,
        ...(workoutNameContains ? { workoutNameContains } : {}),
      },
    });

    expect(response, 'Could not load executed workouts').toBeOK();
    return response.json() as Promise<PaginatedResultsOfExecutedWorkoutSummaryDTO>;
  }

  /**
   * Workouts planned for later but not yet started.
   *
   * These live behind their own endpoint — the main executed-workout list excludes them — and it
   * offers no name filter, so callers filter the results themselves.
   */
  async getPlannedWorkouts(): Promise<PaginatedResultsOfExecutedWorkoutSummaryDTO> {
    const response = await this.context.get('/api/ExecutedWorkout/planned', {
      params: { firstRecord: 0, pageSize: 100, newestFirst: true },
    });

    expect(response, 'Could not load planned workouts').toBeOK();
    return response.json() as Promise<PaginatedResultsOfExecutedWorkoutSummaryDTO>;
  }
}
