import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './_services/auth/auth.service';
import { type Mocked } from 'vitest';

describe('AuthInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;

  beforeEach(() => {
    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      token: "someAccessToken",
      isRefreshing: false,
      refreshTokenSubject: new BehaviorSubject<string | null>(null),
      refreshFailed$: new Subject<void>(),
      refreshAccessToken: vi.fn<AuthService['refreshAccessToken']>().mockReturnValue(of(true)),
      logOut: vi.fn<AuthService['logOut']>()
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

  it('should inject access token into header', () => {

    httpClient.get("api/blah").subscribe();

    const testRequest: TestRequest = httpTestingController.expectOne("api/blah");
    testRequest.flush([]);

    expect(testRequest.request.headers.get("Authorization")).toBeDefined();
    expect(testRequest.request.headers.get("Authorization")).toBe("Bearer someAccessToken");
  });

  it('should not inject access token into header when no token is present', () => {

    authService.token = null;

    httpClient.get("api/blah").subscribe();

    const testRequest: TestRequest = httpTestingController.expectOne("api/blah");
    testRequest.flush([]);

    expect(testRequest.request.headers.get("Authorization")).toBeNull();
  });

  it('should attempt refresh on 401 and retry original request', () => {

    vi.mocked(authService.refreshAccessToken).mockReturnValue(of(true));

    httpClient.get("api/data").subscribe();

    const originalRequest = httpTestingController.expectOne("api/data");
    originalRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // After refresh, the interceptor retries the request
    const retryRequest = httpTestingController.expectOne("api/data");
    retryRequest.flush({ data: 'success' });

    expect(authService.refreshAccessToken).toHaveBeenCalled();
  });

  it('should not attempt refresh on 401 for auth/refresh URL', () => {

    let errorCaught = false;
    httpClient.get("http://localhost:5600/auth/refresh").subscribe({
      error: () => { errorCaught = true; }
    });

    const request = httpTestingController.expectOne("http://localhost:5600/auth/refresh");
    request.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    expect(errorCaught).toBe(true);
  });

  /*
  logOut() fires POST /auth/revoke precisely when the token may already be dead.
  Without this exclusion its 401 triggers a refresh, which fails, which calls
  logOut() again.
  */
  it('should not attempt refresh on 401 for auth/revoke URL', () => {

    let errorCaught = false;
    httpClient.post("http://localhost:5600/auth/revoke", {}).subscribe({
      error: () => { errorCaught = true; }
    });

    const request = httpTestingController.expectOne("http://localhost:5600/auth/revoke");
    request.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    expect(errorCaught).toBe(true);
  });

  describe('requests queued behind an in-flight refresh', () => {

    beforeEach(() => {
      //Simulate another request having already started a refresh.
      authService.isRefreshing = true;
    });

    it('should be replayed once the refresh succeeds', () => {

      let received: unknown;
      httpClient.get("api/data").subscribe((value: unknown) => { received = value; });

      httpTestingController.expectOne("api/data")
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      //The in-flight refresh completes and publishes the new token.
      authService.refreshTokenSubject.next("aFreshAccessToken");

      const retryRequest: TestRequest = httpTestingController.expectOne("api/data");
      expect(retryRequest.request.headers.get("Authorization")).toBe("Bearer someAccessToken");
      retryRequest.flush({ data: 'success' });

      expect(received).toEqual({ data: 'success' });
    });

    /*
    Nothing is ever pushed to refreshTokenSubject when a refresh fails, so waiting
    only on it meant the request never emitted, errored, or completed: finalize()
    never ran and the caller's spinner stuck permanently.
    */
    it('should error rather than hang when the refresh fails', () => {

      let caught: HttpErrorResponse | undefined;
      let completed = false;
      httpClient.get("api/data").subscribe({
        error: (error: HttpErrorResponse) => { caught = error; },
        complete: () => { completed = true; }
      });

      httpTestingController.expectOne("api/data")
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(caught).toBeUndefined(); //Still waiting on the in-flight refresh

      authService.refreshFailed$.next();

      expect(caught).toBeInstanceOf(HttpErrorResponse);
      expect(caught?.status).toBe(401);
      expect(completed).toBe(false);
      httpTestingController.expectNone("api/data"); //Never replayed
    });
  });

});
