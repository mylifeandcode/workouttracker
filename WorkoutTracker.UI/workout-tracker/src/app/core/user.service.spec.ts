import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { CookieService } from 'ng2-cookies';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from 'app/core/models/user';

const TEST_USER_ID: string = "1";

class CookieServiceMock {
  get = jasmine.createSpy('get').and.returnValue(TEST_USER_ID);
  set = jasmine.createSpy('set');
  delete = jasmine.createSpy('delete');
}

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService, 
        {
          provide: CookieService, 
          useClass: CookieServiceMock
        }
      ], 
      imports :[
        HttpClientTestingModule
      ]      
    });
  });

  it('should be creatable', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all users',  inject([HttpTestingController, UserService], (httpMock: HttpTestingController, service: UserService) => {
    const expectedResults = new Array<User>();

    service.getAll().subscribe(
      (users: Array<User>) => expect(users).toEqual(expectedResults), 
      fail
    );

    const req = httpMock.expectOne("http://localhost:5600/api/Users");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);    

  }));

  it('should get current user info',  inject([HttpTestingController, UserService, CookieService], (httpMock: HttpTestingController, service: UserService, cookieSvcMock: CookieServiceMock) => {
    const expectedResults = new User();
    expectedResults.id = parseInt(TEST_USER_ID);

    service.getCurrentUserInfo().subscribe(
      (user: User) => expect(user).toEqual(expectedResults), 
      fail
    );

    const req = httpMock.expectOne(`http://localhost:5600/api/Users/${TEST_USER_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    
    expect(cookieSvcMock.get).toHaveBeenCalledWith("WorkoutTracker");
    expect(cookieSvcMock.set).toHaveBeenCalledWith("WorkoutTracker", TEST_USER_ID);

  }));
  
  it('should get user info by user ID',  inject([HttpTestingController, UserService, CookieService], (httpMock: HttpTestingController, service: UserService, cookieSvcMock: CookieServiceMock) => {
    const expectedResults = new User();
    const userId: number = parseInt(TEST_USER_ID);
    expectedResults.id = userId;

    service.getUserInfo(userId).subscribe(
      (user: User) => expect(user).toEqual(expectedResults), 
      fail
    );

    const req = httpMock.expectOne(`http://localhost:5600/api/Users/${TEST_USER_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    
    expect(cookieSvcMock.get).not.toHaveBeenCalled();
    expect(cookieSvcMock.set).not.toHaveBeenCalled();

  }));  

  it('should add user', inject([HttpTestingController, UserService], (httpMock: HttpTestingController, service: UserService) => {
    const user = new User();

    service.addUser(user)
      .subscribe(
        (result: User) => expect(result).toEqual(user), 
        fail
      );

    const request = httpMock.expectOne('http://localhost:5600/api/Users');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual(user);

    // Respond with the mock results
    request.flush(user);
    
  }));

  it('should update user', inject([HttpTestingController, UserService], (httpMock: HttpTestingController, service: UserService) => {
    const user = new User();
    user.id = parseInt(TEST_USER_ID);

    service.updateUser(user)
      .subscribe(
        (result: User) => expect(result).toEqual(user), 
        fail
      );

    const request = httpMock.expectOne(`http://localhost:5600/api/Users/${user.id}`);
    expect(request.request.method).toEqual('PUT');
    expect(request.request.body).toEqual(user);

    // Respond with the mock results
    request.flush(user);
    
  }));

  it('should delete user', inject([HttpTestingController, UserService], (httpMock: HttpTestingController, service: UserService) => {
    const userId = 7;

    service.deleteUser(7)
      .subscribe(
        (result: any) => expect(result).toBeNull(), 
        fail
      );

    const request = httpMock.expectOne(`http://localhost:5600/api/Users/${userId}`);
    expect(request.request.method).toEqual('DELETE');

    // Respond with the mock results
    //TODO: Revisit/complete
    request.flush(null)
    
  }));

  it('should indicate user is logged in when a user is logged in', () => {

    //ARRANGE
    const service = TestBed.inject(UserService);
    const user = new User();
    user.id = 1;
    service.setCurrentUser(user);

    //ACT/ASSERT
    expect(service.isUserLoggedIn).toBeTruthy();

  });

  it('should NOT indicate user is logged in when a user is not logged in', () => {

    //ARRANGE
    const service = TestBed.inject(UserService);

    //ACT
    service.logOff();
    
    //ASSERT
    expect(service.isUserLoggedIn()).toBeFalsy();

  });

  it('should get the current user ID', () => {
    
    //ARRANGE
    const service = TestBed.inject(UserService);
    const user = new User({id: parseInt(TEST_USER_ID)}); //CookieService mock returns TEST_USER_ID for get() calls
    service.setCurrentUser(user);

    //ACT
    const userId: number = service.currentUserId;

    //ASSERT
    expect(userId).toEqual(user.id);
  });

});
