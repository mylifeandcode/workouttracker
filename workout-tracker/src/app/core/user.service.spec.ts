import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from 'app/core/models/user';
import { ConfigService } from './config.service';
import { UserOverview } from './models/user-overview';
import { UserNewDTO } from './models/user-new-dto';

const TEST_USER_ID: string = "1";

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue("http://localhost:5600/api/");
}

//TODO: Refactor this spec to use service values initialized before each test rather than injection everywhere

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        {
          provide: ConfigService, 
          useClass: ConfigServiceMock
        }
      ],
      imports :[
        HttpClientTestingModule
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

    service.all$.subscribe(
      (users: Array<User>) => expect(users).toEqual(expectedResults),
      fail
    );

    const req = http.expectOne("http://localhost:5600/api/Users");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should get user info by user ID',  () => {
    const expectedResults = new User();
    const userId: number = parseInt(TEST_USER_ID);
    expectedResults.id = userId;

    service.getById(userId).subscribe(
      (user: User) => expect(user).toEqual(expectedResults),
      fail
    );

    const req = http.expectOne(`http://localhost:5600/api/Users/${TEST_USER_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should add user', () => {
    const userNew = new UserNewDTO();
    const userSaved = new User();

    service.addNew(userNew)
      .subscribe(
        (result: User) => expect(result).toEqual(userSaved),
        fail
      );

    const request = http.expectOne('http://localhost:5600/api/Users/new');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual(userNew);

    // Respond with the mock results
    request.flush(userSaved);

  });

  it('should update user', () => {
    const user = new User();
    user.id = parseInt(TEST_USER_ID);

    service.update(user)
      .subscribe(
        (result: User) => expect(result).toEqual(user),
        fail
      );

    const request = http.expectOne(`http://localhost:5600/api/Users/${user.id}`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(user);

    // Respond with the mock results
    request.flush(user);

  });

  it('should delete user', () => {
    const userId = 7;

    service.delete(7)
      .subscribe(
        (result: any) => expect(result).toBeNull(),
        fail
      );

    const request = http.expectOne(`http://localhost:5600/api/Users/${userId}`);
    expect(request.request.method).toEqual('DELETE');

    // Respond with the mock results
    //TODO: Revisit/complete
    request.flush(null)

  });

  it('should get user overview', () => {

    const userOverview = new UserOverview();
    
    service.getOverview().subscribe((overview: UserOverview) => {
      expect(overview).toBe(userOverview);
    });

    const request = http.expectOne(`http://localhost:5600/api/Users/overview`);
    expect(request.request.method).toEqual('GET');

    // Respond with the mock results
    //TODO: Revisit/complete
    request.flush(userOverview);

  });

});
