import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './_services/auth/auth.service';

class AuthServiceMock {
  token: string | null = "someAccessToken";
  isRefreshing = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);

  refreshAccessToken = vi.fn().mockReturnValue(of(true));

  logOut = vi.fn();
}

describe('AuthInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthServiceMock;

  beforeEach(() => {
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
          useClass: AuthServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as AuthServiceMock;

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

    authService.refreshAccessToken.mockReturnValue(of(true));

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

});
