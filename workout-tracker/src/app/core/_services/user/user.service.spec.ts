import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from '../../../core/_models/user';
import { ConfigService } from '../config/config.service';
import { UserOverview } from '../../_models/user-overview';
import { UserNewDTO } from '../../_models/user-new-dto';
import { HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const TEST_USER_ID: string = "1";

class ConfigServiceMock {
  get = vi.fn().mockReturnValue("http://localhost:5600/api/");
}

//TODO: Refactor this spec to use service values initialized before each test rather than injection everywhere

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        UserService,
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
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

  it('should get all users', () => {
    const expectedResults = new Array<User>();

    service.all$.subscribe({
      next: (users: Array<User>) => expect(users).toEqual(expectedResults),
      error: () => assert.fail()
    });

    const req = http.expectOne("http://localhost:5600/api/users");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should get user info by user ID', () => {
    const expectedResults = new User();
    const userId: string = TEST_USER_ID;
    expectedResults.publicId = userId;

    service.getById(userId).subscribe({
      next: (user: User) => expect(user).toEqual(expectedResults),
      error: () => assert.fail()
    });

    const req = http.expectOne(`http://localhost:5600/api/users/${TEST_USER_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should add user', () => {
    const userNew = new UserNewDTO();
    const userSaved = new User();

    service.addNew(userNew)
      .subscribe({
        next: (result: User) => expect(result).toEqual(userSaved),
        error: () => assert.fail()
      });

    const request = http.expectOne('http://localhost:5600/api/users/new');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual(userNew);

    // Respond with the mock results
    request.flush(userSaved);

  });

  it('should update user', () => {
    const user = new User();
    user.id = parseInt(TEST_USER_ID, 10);

    service.update(user)
      .subscribe({
        next: (result: User) => expect(result).toEqual(user),
        error: () => assert.fail()
      });

    const request = http.expectOne(`http://localhost:5600/api/users/${user.id}`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(user);

    // Respond with the mock results
    request.flush(user);

  });

  it('should delete user', () => {
    const userId = '7';

    service.deleteById('7')
      .subscribe({
        next: (result: HttpResponse<void>) => expect(result).toBeNull(),
        error: () => assert.fail()
      });

    const request = http.expectOne(`http://localhost:5600/api/users/${userId}`);
    expect(request.request.method).toEqual('DELETE');

    // Respond with the mock results
    //TODO: Revisit/complete
    request.flush(null);

  });

  it('should get user overview', () => {

    const userOverview = new UserOverview();

    service.getOverview().subscribe((overview: UserOverview) => {
      expect(overview).toBe(userOverview);
    });

    const request = http.expectOne(`http://localhost:5600/api/users/overview`);
    expect(request.request.method).toEqual('GET');

    // Respond with the mock results
    //TODO: Revisit/complete
    request.flush(userOverview);

  });

  it('should convert lastWorkoutDateTime to Date object when getting user overview', async () => {

    const userOverview = { lastWorkoutDateTime: "2024-01-01T12:00:00Z" };

    service.getOverview().subscribe((overview: UserOverview) => {
      expect(overview).toBeTruthy();
      expect(overview.lastWorkoutDateTime).toBeInstanceOf(Date);
      expect(overview.lastWorkoutDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
      ;
    });
    const request = http.expectOne(`http://localhost:5600/api/users/overview`);
    expect(request.request.method).toEqual('GET');

    // Respond with the mock results
    request.flush(userOverview);
  });

});
