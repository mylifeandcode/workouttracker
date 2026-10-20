import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './_services/auth/auth.service';
import { type Mocked } from 'vitest';

describe('AuthInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;
  let userLoggedIn: boolean;

  beforeEach(() => {
    userLoggedIn = true;

    // isUserLoggedIn is a getter on AuthService; back it with a closure so each test can flip it.
    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      get isUserLoggedIn() { return userLoggedIn; },
      handleSessionExpired: vi.fn<AuthService['handleSessionExpired']>()
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useValue: AuthServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  describe('CSRF header', () => {

    it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('should be added to a same-origin %s request', (method: string) => {

      httpClient.request(method, '/api/blah', { body: {} }).subscribe();

      const testRequest: TestRequest = httpTestingController.expectOne('/api/blah');
      testRequest.flush({});

      expect(testRequest.request.headers.get('X-CSRF')).toBe('1');
    });

    it('should be added to the BFF login request, which is also a state-changing POST', () => {

      httpClient.post('/bff/login', {}).subscribe();

      const testRequest: TestRequest = httpTestingController.expectOne('/bff/login');
      testRequest.flush({});

      expect(testRequest.request.headers.get('X-CSRF')).toBe('1');
    });

    it.each(['GET', 'HEAD', 'OPTIONS'])('should not be added to a safe %s request', (method: string) => {

      httpClient.request(method, '/api/blah').subscribe();

      const testRequest: TestRequest = httpTestingController.expectOne('/api/blah');
      testRequest.flush({});

      expect(testRequest.request.headers.has('X-CSRF')).toBe(false);
    });

    it('should not be sent to a third-party absolute URL', () => {

      httpClient.post('https://example.com/collect', {}).subscribe();

      const testRequest: TestRequest = httpTestingController.expectOne('https://example.com/collect');
      testRequest.flush({});

      expect(testRequest.request.headers.has('X-CSRF')).toBe(false);
    });
  });

  it('should never add an Authorization header: the BFF attaches the token server-side', () => {

    httpClient.get('/api/blah').subscribe();

    const testRequest: TestRequest = httpTestingController.expectOne('/api/blah');
    testRequest.flush([]);

    expect(testRequest.request.headers.has('Authorization')).toBe(false);
  });

  describe('401 handling', () => {

    function respondWith401(url: string): HttpErrorResponse | undefined {
      let caught: HttpErrorResponse | undefined;
      httpClient.get(url).subscribe({ error: (error: HttpErrorResponse) => { caught = error; } });

      httpTestingController.expectOne(url).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      return caught;
    }

    it('should end the local session, and still rethrow the 401, when a data call is rejected', () => {

      const caught = respondWith401('/api/blah');

      expect(authService.handleSessionExpired).toHaveBeenCalledTimes(1);
      expect(caught?.status).toBe(401);
    });

    it('should not retry the request: the BFF already did the refreshing', () => {

      respondWith401('/api/blah');

      httpTestingController.expectNone('/api/blah');
    });

    it('should leave the session alone when /bff/login returns 401, since that is just a failed login', () => {

      const caught = respondWith401('/bff/login');

      expect(authService.handleSessionExpired).not.toHaveBeenCalled();
      expect(caught?.status).toBe(401);
    });

    it('should leave the session alone when /bff/user returns 401, since that is the normal signed-out answer at startup', () => {

      respondWith401('/bff/user');

      expect(authService.handleSessionExpired).not.toHaveBeenCalled();
    });

    it('should not react to a 401 when nobody is signed in', () => {
      userLoggedIn = false;

      respondWith401('/api/blah');

      expect(authService.handleSessionExpired).not.toHaveBeenCalled();
    });

    it('should not end the session for errors other than 401', () => {

      let caught: HttpErrorResponse | undefined;
      httpClient.get('/api/blah').subscribe({ error: (error: HttpErrorResponse) => { caught = error; } });

      httpTestingController.expectOne('/api/blah').flush('boom', { status: 500, statusText: 'Server Error' });

      expect(authService.handleSessionExpired).not.toHaveBeenCalled();
      expect(caught?.status).toBe(500);
    });
  });
});
