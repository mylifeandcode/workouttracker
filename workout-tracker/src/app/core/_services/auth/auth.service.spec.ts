import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ConfigService } from '../config/config.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class ConfigServiceMock {
  get = vi.fn().mockImplementation((configKey: string) => {
    if (configKey == "apiRoot")
      return "http://localhost:5600/";
    if (configKey == "loginWithUserSelect")
      return true;

    return "";
  });
}

class LocalStorageServiceMock {
  set = vi.fn();
  remove = vi.fn();
  get = vi.fn().mockImplementation((key: string) => {
    if (key === 'WorkoutTrackerToken') return TEST_ACCESS_TOKEN;
    if (key === 'WorkoutTrackerRefreshToken') return 'testRefreshToken';
    return null;
  });
}

@Component({
  template: ''
})
class FakeComponent {
}

//This has to be a real token because the service decodes it
const TEST_ACCESS_TOKEN: string = 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWxhbiIsImh0dHA6Ly9z' +
  'Y2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluaXN0cmF0b3IiLCJVc2VySUQi' +
  'OiIyIiwiZXhwIjoxNjU4MDE2NTY0LCJpc3MiOiJ3d3cud29ya291dHRyYWNrZXIubmV0IiwiYXVkIjoid3d3LndvcmtvdXR0cmFja2Vy' +
  'Lm5ldCJ9.gNYFG9fAcwSfDCntFdxNpPTO5zq-zp9Rw_BrRy3Qus4';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let localStorageService: LocalStorageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'user-select', component: FakeComponent }])],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
        },
        {
          provide: LocalStorageService,
          useClass: LocalStorageServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    configService = TestBed.inject(ConfigService);
    localStorageService = TestBed.inject(LocalStorageService);
    httpTestingController = TestBed.inject(HttpTestingController);
    service.init(); //Required because APP_INITIALIZER does this due to a race condition
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize', () => {
    service.init();
    expect(configService.get).toHaveBeenCalledWith("apiRoot");
    expect(configService.get).toHaveBeenCalledWith("loginWithUserSelect");
  });

  it('should log user in', async () => {

    //ARRANGE
    const username = "unittestuser";
    const password = "thispasswordaintreal123%^&";

    //ACT
    const result = firstValueFrom(service.logIn(username, password));

    //ASSERT
    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/login");
    expect(testRequest.request.method).toEqual('POST');

    testRequest.flush({ accessToken: TEST_ACCESS_TOKEN, refreshToken: 'testRefreshToken' });
    expect(service.token).toBe(TEST_ACCESS_TOKEN);
    expect(localStorageService.set).toHaveBeenCalledWith('WorkoutTrackerRefreshToken', 'testRefreshToken');
    
    expect(await result).toBe(true);
  });

  it('should return value of false from login when error occurs logging user in', async () => {

    const result = firstValueFrom(service.logIn("username", "aintarealpassword123$#@!"));

    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/login");
    expect(testRequest.request.method).toEqual('POST');

    testRequest.flush(throwError(() => "Something bad happened!"));
    expect(await result).toBe(false);
  });

  it('should log user out', async () => {

    //ARRANGE
    //We need to log in first
    const username = "unittestuser";
    const password = "thispasswordaintreal123%^&";

    const result = firstValueFrom(service.logIn(username, password));

    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/login");
    expect(testRequest.request.method).toEqual('POST');

    testRequest.flush({ accessToken: TEST_ACCESS_TOKEN, refreshToken: 'testRefreshToken' });

    //Sanity Check
    expect(await result).toBe(true);
    expect(service.currentUserName()).toBe(username);
    expect(service.token).toBe(TEST_ACCESS_TOKEN);
    //End login

    //ACT
    service.logOut();

    //Flush the revoke request (fire-and-forget)
    const revokeRequest = httpTestingController.expectOne("http://localhost:5600/auth/revoke");
    revokeRequest.flush(null);

    //ASSERT
    expect(service.currentUserName()).toBe(null);
    expect(service.token).toBeNull();
    expect(localStorageService.remove).toHaveBeenCalledWith('WorkoutTrackerToken');
    expect(localStorageService.remove).toHaveBeenCalledWith('WorkoutTrackerRefreshToken');
  });

  it('should refresh access token successfully', async () => {
    //ARRANGE
    service.token = TEST_ACCESS_TOKEN;

    //ACT
    const result = firstValueFrom(service.refreshAccessToken());

    //ASSERT
    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/refresh");
    expect(testRequest.request.method).toEqual('POST');
    expect(testRequest.request.body.accessToken).toBe(TEST_ACCESS_TOKEN);
    expect(testRequest.request.body.refreshToken).toBe('testRefreshToken');

    testRequest.flush({ accessToken: TEST_ACCESS_TOKEN, refreshToken: 'newRefreshToken' });
    expect(await result).toBe(true);
    expect(service.token).toBe(TEST_ACCESS_TOKEN);
    expect(localStorageService.set).toHaveBeenCalledWith('WorkoutTrackerRefreshToken', 'newRefreshToken');
  });

  it('should return false from refreshAccessToken when error occurs', async () => {
    //ARRANGE
    service.token = TEST_ACCESS_TOKEN;

    //ACT
    const result = firstValueFrom(service.refreshAccessToken());

    //ASSERT
    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/refresh");
    testRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBe(false);
  });

  //Having a unit test for restoreUserSessionIfApplicable() is problematic because it does an 
  //expiration check on the token.
  //TODO: Manipulate .NET code temporarily and create an access token that expires 100 years 
  //from now so we can setup a unit test for this method.

  //TODO: Create unit test for "should return false from isUserAdmin when user is not an admin".
  //Issue is similar to the one above: need a real, non-admin token value.

  it('should return true from isUserAdmin when user is an admin', async () => {

    //ARRANGE
    //We need to log in first
    const username = "unittestuser";
    const password = "thispasswordaintreal123%^&";

    const loginResult = firstValueFrom(service.logIn(username, password));

    //ASSERT
    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/login");
    expect(testRequest.request.method).toEqual('POST');

    //Respond with the mock results
    testRequest.flush({ accessToken: TEST_ACCESS_TOKEN, refreshToken: 'testRefreshToken' });
    expect(await loginResult).toBe(true);
    expect(service.isUserAdmin).toBe(true);
  });

  it('should return user-select route from loginRoute property when applicable', () => {
    expect(service.loginRoute).toBe('user-select');
  });

  it('should return login route from loginRoute property when applicable', () => {

    //Override default mock behavior and re-init
    configService.get = vi.fn().mockImplementation((configKey: string) => {
      if (configKey == "apiRoot")
        return "http://localhost:5600/";
      if (configKey == "loginWithUserSelect")
        return false;

      return "";
    });

    service.init();

    expect(service.loginRoute).toBe('login');
  });

});
