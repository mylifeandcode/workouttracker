import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ConfigService } from '../config/config.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { type Mocked } from 'vitest';

//This has to be a real token because the service decodes it
const TEST_ACCESS_TOKEN: string = 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWxhbiIsImh0dHA6Ly9z' +
  'Y2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluaXN0cmF0b3IiLCJVc2VySUQi' +
  'OiIyIiwiZXhwIjoxNjU4MDE2NTY0LCJpc3MiOiJ3d3cud29ya291dHRyYWNrZXIubmV0IiwiYXVkIjoid3d3LndvcmtvdXR0cmFja2Vy' +
  'Lm5ldCJ9.gNYFG9fAcwSfDCntFdxNpPTO5zq-zp9Rw_BrRy3Qus4';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
    get: vi.fn<ConfigService['get']>((configKey: string) => {
      if (configKey == "apiRoot")
        return "http://localhost:5600/";
      if (configKey == "loginWithUserSelect")
        return true;

      return "";
    }).mockName('get')
  };
  const localStorageServiceMock: Mocked<Pick<LocalStorageService, 'set' | 'remove' | 'get'>> = {
    set: vi.fn<LocalStorageService['set']>().mockName('set'),
    remove: vi.fn<LocalStorageService['remove']>().mockName('remove'),
    get: vi.fn<LocalStorageService['get']>((key: string) => {
      if (key === 'WorkoutTrackerToken') return TEST_ACCESS_TOKEN;
      if (key === 'WorkoutTrackerRefreshToken') return 'testRefreshToken';
      return null;
    }).mockName('get')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        {
          provide: LocalStorageService,
          useValue: localStorageServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true); //No routes are registered, so don't let a real navigation run
    service.init(); //Required because APP_INITIALIZER does this due to a race condition
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the router.navigate spy
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize', () => {
    service.init();
    expect(configServiceMock.get).toHaveBeenCalledWith("apiRoot");
    expect(configServiceMock.get).toHaveBeenCalledWith("loginWithUserSelect");
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
    expect(localStorageServiceMock.set).toHaveBeenCalledWith('WorkoutTrackerRefreshToken', 'testRefreshToken');
    
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
    expect(localStorageServiceMock.remove).toHaveBeenCalledWith('WorkoutTrackerToken');
    expect(localStorageServiceMock.remove).toHaveBeenCalledWith('WorkoutTrackerRefreshToken');
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
    expect(localStorageServiceMock.set).toHaveBeenCalledWith('WorkoutTrackerRefreshToken', 'newRefreshToken');
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

  it('should request a password reset and expect nothing back', async () => {
    const result = firstValueFrom(service.requestPasswordReset("jtkirk@ufp.gov"));

    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/request-password-reset");
    expect(testRequest.request.method).toEqual("POST");
    expect(testRequest.request.body).toEqual({ emailAddress: "jtkirk@ufp.gov" });

    testRequest.flush(null, { status: 204, statusText: "No Content" });
    expect(await result).toBeNull();
  });

  it('should validate a reset token with a POST, so the token is never in the URL', async () => {
    const result = firstValueFrom(service.validatePasswordResetToken("someToken"));

    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/validate-reset-token");
    expect(testRequest.request.method).toEqual("POST");
    expect(testRequest.request.body).toEqual({ token: "someToken" });
    expect(testRequest.request.url).not.toContain("someToken");

    testRequest.flush(true);
    expect(await result).toBe(true);
  });

  it('should reset the password with the token and the new password', async () => {
    const result = firstValueFrom(service.resetPassword("someToken", "aNewPassword-123"));

    const testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/reset-password");
    expect(testRequest.request.method).toEqual("POST");
    expect(testRequest.request.body).toEqual({ token: "someToken", newPassword: "aNewPassword-123" });

    testRequest.flush(null, { status: 204, statusText: "No Content" });
    await result;
  });

  it('should return user-select route from loginRoute property when applicable', () => {
    expect(service.loginRoute).toBe('user-select');
  });

  it('should return login route from loginRoute property when applicable', () => {

    //Override default mock behavior and re-init
    configServiceMock.get.mockImplementation((configKey: string) => {
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
