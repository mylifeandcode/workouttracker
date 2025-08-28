import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './_services/auth/auth.service';

class AuthServiceMock {
  token = "someAccessToken";
}

describe('AuthInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

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

  });

  it('should inject access token into header', () => {

    httpClient.get("api/blah").subscribe();

    const testRequest: TestRequest = httpTestingController.expectOne("api/blah");
    testRequest.flush([]);

    expect(testRequest.request.headers.get("Authorization")).toBeDefined();
    expect(testRequest.request.headers.get("Authorization")).toBe("Bearer someAccessToken");
  });

  it('should not inject access token into header when no token is present', () => {

    const authService = TestBed.inject(AuthService);
    authService.token = null;

    httpClient.get("api/blah").subscribe();

    const testRequest: TestRequest = httpTestingController.expectOne("api/blah");
    testRequest.flush([]);

    expect(testRequest.request.headers.get("Authorization")).toBeNull();
  });

});
