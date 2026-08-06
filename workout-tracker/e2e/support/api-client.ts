import { APIRequestContext, expect, request } from '@playwright/test';
import { API_URL } from './env';
import type {
  AuthTokenResultDTO,
  Exercise,
  TargetArea,
  User,
  UserNewDTO,
} from '../../src/app/api/types.gen';
import { ResistanceType } from '../../src/app/api/types.gen';

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
    const response = await this.context.post('/api/auth/login', {
      data: { username, password },
    });

    expect(response, `Login failed for "${username}"`).toBeOK();
    return response.json() as Promise<AuthTokenResultDTO>;
  }

  //USERS //////////////////////////////////////////////////////////////////////

  /** Note: the API filters the seeded SYSTEM user out of this list. */
  async getUsers(): Promise<User[]> {
    const response = await this.context.get('/api/Users');
    expect(response, 'Could not load users').toBeOK();
    return response.json() as Promise<User[]>;
  }

  /**
   * Registers a user. This endpoint is anonymous (anyone can register), but note that the
   * backend overrides the requested role to Administrator when no non-SYSTEM user exists yet.
   */
  async createUser(user: UserNewDTO): Promise<User> {
    const response = await this.context.post('/api/Users/new', { data: user });
    expect(response, `Could not create user "${user.userName}"`).toBeOK();
    return response.json() as Promise<User>;
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
}
