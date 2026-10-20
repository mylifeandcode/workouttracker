import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { BffUser } from './bff-user';
import { ConfigService } from '../config/config.service';
import { Router, RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { type Mocked } from 'vitest';

@Component({
  template: ''
})
class FakeComponent {
}

const ADMIN_USER: BffUser = {
  userName: 'unittestuser',
  isAdmin: true,
  userId: 2,
  userPublicId: '6f1c2c5e-8a3e-4c3a-9f4e-0d2b7a1c9e11'
};

const STANDARD_USER: BffUser = { ...ADMIN_USER, isAdmin: false };

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let router: Router;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn<ConfigService['get']>().mockImplementation((configKey: string) => {
        if (configKey == "apiRoot")
          return "http://localhost:5600/";
        if (configKey == "loginWithUserSelect")
          return true;

        return "";
      })
    };

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'user-select', component: FakeComponent }])],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useValue: ConfigServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    configService = TestBed.inject(ConfigService);
    router = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.init(); //Required because APP_INITIALIZER does this due to a race condition
  });

  /** Signs the given user in through the BFF login endpoint, so state is set the way production sets it. */
  async function signIn(user: BffUser): Promise<void> {
    const result = firstValueFrom(service.logIn(user.userName, 'thispasswordaintreal123%^&'));
    httpTestingController.expectOne('/bff/login').flush(user);
    expect(await result).toBe(true);
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize', () => {
    service.init();
    expect(configService.get).toHaveBeenCalledWith("apiRoot");
    expect(configService.get).toHaveBeenCalledWith("bffRoot");
    expect(configService.get).toHaveBeenCalledWith("loginWithUserSelect");
  });

  describe('logIn', () => {

    it('should post the credentials to the BFF and record the user it returns', async () => {

      const result = firstValueFrom(service.logIn('unittestuser', 'thispasswordaintreal123%^&'));

      const testRequest: TestRequest = httpTestingController.expectOne('/bff/login');
      expect(testRequest.request.method).toEqual('POST');
      expect(testRequest.request.body).toEqual({ username: 'unittestuser', password: 'thispasswordaintreal123%^&' });

      testRequest.flush(ADMIN_USER);

      expect(await result).toBe(true);
      expect(service.isUserLoggedIn).toBe(true);
      expect(service.currentUserName()).toBe('unittestuser');
      expect(service.userId).toBe(2);
      expect(service.userPublicId).toBe(ADMIN_USER.userPublicId);
    });

    it('should use the bffRoot from config when one is configured', async () => {
      vi.mocked(configService.get).mockImplementation((key: string) => key === 'bffRoot' ? '/custom-bff/' : '');
      service.init();

      const result = firstValueFrom(service.logIn('unittestuser', 'pw'));
      httpTestingController.expectOne('/custom-bff/login').flush(ADMIN_USER);

      expect(await result).toBe(true);
    });

    it('should return false and stay signed out when the BFF rejects the login', async () => {

      const result = firstValueFrom(service.logIn('username', 'aintarealpassword123$#@!'));

      httpTestingController.expectOne('/bff/login').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(await result).toBe(false);
      expect(service.isUserLoggedIn).toBe(false);
      expect(service.currentUserName()).toBeNull();
    });
  });

  describe('logOut', () => {

    it('should ask the BFF to end the session, clear local state and go to the login route', async () => {

      await signIn(ADMIN_USER);

      service.logOut();

      // Fire-and-forget: the BFF revokes the API tokens and deletes the session.
      const logoutRequest = httpTestingController.expectOne('/bff/logout');
      expect(logoutRequest.request.method).toEqual('POST');
      logoutRequest.flush(null);

      expect(service.isUserLoggedIn).toBe(false);
      expect(service.currentUserName()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['user-select']);
    });

    it('should clear local state even when the BFF call fails', async () => {

      await signIn(ADMIN_USER);

      service.logOut();
      httpTestingController.expectOne('/bff/logout').flush('boom', { status: 500, statusText: 'Server Error' });

      expect(service.isUserLoggedIn).toBe(false);
    });

    it('should not call the BFF when nobody is signed in', () => {

      service.logOut();

      httpTestingController.expectNone('/bff/logout');
      expect(router.navigate).toHaveBeenCalledWith(['user-select']);
    });
  });

  describe('handleSessionExpired', () => {

    it('should clear local state and go to the login route without calling the BFF', async () => {

      await signIn(ADMIN_USER);

      service.handleSessionExpired();

      httpTestingController.expectNone('/bff/logout');
      expect(service.isUserLoggedIn).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['user-select']);
    });
  });

  describe('restoreUserSessionIfApplicable', () => {

    it('should restore the user when the BFF reports a live session', async () => {

      const result = firstValueFrom(service.restoreUserSessionIfApplicable());

      const testRequest = httpTestingController.expectOne('/bff/user');
      expect(testRequest.request.method).toEqual('GET');
      testRequest.flush(ADMIN_USER);
      await result;

      expect(service.isUserLoggedIn).toBe(true);
      expect(service.currentUserName()).toBe('unittestuser');
    });

    it('should leave the user signed out, and complete normally, when there is no session', async () => {

      const result = firstValueFrom(service.restoreUserSessionIfApplicable(), { defaultValue: undefined });

      httpTestingController.expectOne('/bff/user').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      await result;

      expect(service.isUserLoggedIn).toBe(false);
    });

    it('should leave the user signed out, and not block app startup, when the BFF is unreachable', async () => {

      const result = firstValueFrom(service.restoreUserSessionIfApplicable(), { defaultValue: undefined });

      httpTestingController.expectOne('/bff/user').error(new ProgressEvent('error'));
      await result;

      expect(service.isUserLoggedIn).toBe(false);
    });
  });

  describe('isUserAdmin', () => {

    it('should be true when the BFF says the user is an administrator', async () => {
      await signIn(ADMIN_USER);
      expect(service.isUserAdmin).toBe(true);
    });

    it('should be false for a standard user', async () => {
      await signIn(STANDARD_USER);
      expect(service.isUserAdmin).toBe(false);
    });

    it('should be false when nobody is signed in', () => {
      expect(service.isUserAdmin).toBe(false);
      expect(service.userId).toBe(-1);
      expect(service.userPublicId).toBeNull();
    });
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
