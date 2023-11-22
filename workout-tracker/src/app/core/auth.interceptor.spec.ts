import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './services/auth.service';

class AuthServiceMock {
  token = "someAccessToken";
}

describe('AuthInterceptor', () => {
  //This is the original boilerplate code from the CLI, which doesn't seem correct for testing an interceptor
  /*
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthInterceptor, 
      {
        provide: AuthService, 
        useClass: AuthServiceMock
      }
    ]
  }));

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });
  */

  //Revised setup code
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => { 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
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
