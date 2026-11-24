import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User, UserNewDTO, UserOverview, UserRole, UserSettingsUpdateDTO, UserUpdateDTO } from '../../../api';
import { ConfigService } from '../config/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

const TEST_USER_ID: string = "1";

//TODO: Refactor this spec to use service values initialized before each test rather than injection everywhere

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
    get: vi.fn<ConfigService['get']>(() => "http://localhost:5600/api/").mockName('get')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        UserService,
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
    service.init();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be creatable', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', async () => {
    const expectedResults = new Array<User>();

    const result = firstValueFrom(service.all$);

    const req = http.expectOne("http://localhost:5600/api/users");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    expect(await result).toEqual(expectedResults);
  });

  it('should get user info by user ID', async () => {
    const expectedResults = <User>{};
    const userId: string = TEST_USER_ID;
    expectedResults.publicId = userId;

    const result = firstValueFrom(service.getById(userId));

    const req = http.expectOne(`http://localhost:5600/api/users/${TEST_USER_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    expect(await result).toEqual(expectedResults);
  });

  it('should add user', async () => {
    const userNew = <UserNewDTO>{};
    const userSaved = <User>{};

    const result = firstValueFrom(service.addNew(userNew));

    const request = http.expectOne('http://localhost:5600/api/users/new');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual(userNew);

    // Respond with the mock results
    request.flush(userSaved);
    expect(await result).toEqual(userSaved);
  });

  it('should update a user by public ID, sending only name, email address and role', async () => {
    const publicId = '4b0f0c1e-3c1a-4f57-9d3a-0c6a7d2a9a11';
    const update: UserUpdateDTO = { userName: 'Fred', emailAddress: 'fred@here.com', role: UserRole.ADMINISTRATOR };

    const result = firstValueFrom(service.updateUser(publicId, update));

    const request = http.expectOne(`http://localhost:5600/api/users/${publicId}`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(update);

    request.flush(null, { status: 204, statusText: 'No Content' });
    await result;
  });

  it("should update the signed-in user's own settings without naming a user", async () => {
    const settings: UserSettingsUpdateDTO = { recommendationsEnabled: true, lowestAcceptableRating: 3, repSettings: [] };

    const result = firstValueFrom(service.updateMySettings(settings));

    const request = http.expectOne(`http://localhost:5600/api/users/me/settings`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(settings);

    request.flush(null, { status: 204, statusText: 'No Content' });
    await result;
  });

  it('should deactivate and reactivate a user by public ID', async () => {
    const publicId = '4b0f0c1e-3c1a-4f57-9d3a-0c6a7d2a9a11';

    const deactivated = firstValueFrom(service.deactivate(publicId));
    const deactivateRequest = http.expectOne(`http://localhost:5600/api/users/${publicId}/deactivate`);
    expect(deactivateRequest.request.method).toEqual('PUT');
    deactivateRequest.flush(null, { status: 204, statusText: 'No Content' });
    await deactivated;

    const reactivated = firstValueFrom(service.reactivate(publicId));
    const reactivateRequest = http.expectOne(`http://localhost:5600/api/users/${publicId}/reactivate`);
    expect(reactivateRequest.request.method).toEqual('PUT');
    reactivateRequest.flush(null, { status: 204, statusText: 'No Content' });
    await reactivated;
  });

  it('should create a password reset for a user by public ID', async () => {
    const publicId = '4b0f0c1e-3c1a-4f57-9d3a-0c6a7d2a9a11';

    const result = firstValueFrom(service.createPasswordReset(publicId));

    const request = http.expectOne(`http://localhost:5600/api/users/${publicId}/password-reset`);
    expect(request.request.method).toEqual('POST');

    request.flush({ token: 'theToken', expiresAt: '2026-11-17T13:00:00Z' });
    expect((await result).token).toEqual('theToken');
  });

  it('should refuse the inherited update and delete calls, whose API routes no longer exist', async () => {
    await expect(firstValueFrom(service.update(<User>{ id: 1 }))).rejects.toThrow();
    await expect(firstValueFrom(service.delete(1))).rejects.toThrow();
    await expect(firstValueFrom(service.deleteById('7'))).rejects.toThrow();

    http.expectNone(() => true);
  });

  it('should get user overview', async () => {

    const userOverview = <UserOverview>{};

    const result = firstValueFrom(service.getOverview());

    const request = http.expectOne(`http://localhost:5600/api/users/overview`);
    expect(request.request.method).toEqual('GET');

    request.flush(userOverview);
    expect(await result).toEqual(userOverview);
  });

  it('should convert lastWorkoutDateTime to Date object when getting user overview', async () => {

    const userOverview = { lastWorkoutDateTime: "2024-01-01T12:00:00Z" };

    const result = firstValueFrom(service.getOverview());
    const request = http.expectOne(`http://localhost:5600/api/users/overview`);
    expect(request.request.method).toEqual('GET');

    // Respond with the mock results
    request.flush(userOverview);
    const overview = await result;
    expect(overview).toBeTruthy();
    expect(overview.lastWorkoutDateTime).toBeInstanceOf(Date);
    expect(overview.lastWorkoutDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
  });

});
