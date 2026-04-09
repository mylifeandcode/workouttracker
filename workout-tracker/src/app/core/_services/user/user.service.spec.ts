import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User, UserNewDTO, UserOverview } from '../../../api';
import { ConfigService } from '../config/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

const TEST_USER_ID: string = "1";

//TODO: Refactor this spec to use service values initialized before each test rather than injection everywhere

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn().mockReturnValue("http://localhost:5600/api/")
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        UserService,
        {
          provide: ConfigService,
          useValue: ConfigServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
    service.init();
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

  it('should update user', async () => {
    const user = <User>{};
    user.id = parseInt(TEST_USER_ID, 10);

    const result = firstValueFrom(service.update(user));

    const request = http.expectOne(`http://localhost:5600/api/users/${user.id}`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(user);

    // Respond with the mock results
    request.flush(user);
    expect(await result).toEqual(user);
  });

  it('should delete user', async () => {
    const userId = '7';
    const result = firstValueFrom(service.deleteById('7'));

    const request = http.expectOne(`http://localhost:5600/api/users/${userId}`);
    expect(request.request.method).toEqual('DELETE');

    request.flush(null);
    expect(await result).toBeNull();
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
