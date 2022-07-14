import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.callFake((configKey: string) => {
    if (configKey == "apiRoot") return "http://localhost:5600/";
    if (configKey == "loginWithUserSelect") return "user-select";

    return "";
  });
}

class LocalStorageServiceMock {
  set = jasmine.createSpy('set');
  remove = jasmine.createSpy('remove');
  get = jasmine.createSpy('get').and.returnValue('someAccessToken');
}

fdescribe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let localStorageService: LocalStorageService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
        },
        {
          provide: LocalStorageService,
          useClass: LocalStorageServiceMock
        }
      ], 
      imports :[
        HttpClientTestingModule, 
        RouterTestingModule
      ]
    });
    service = TestBed.inject(AuthService);
    configService = TestBed.inject(ConfigService);
    localStorageService = TestBed.inject(LocalStorageService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null from currentUserName property when no user is logged in', () => {
    service.currentUserName.subscribe((result: string | null) => {
      expect(result).toBeNull();
    });
  });

  it('should initialize', () => {
    service.init();
    expect(configService.get).toHaveBeenCalledWith("apiRoot");
    expect(configService.get).toHaveBeenCalledWith("loginWithUserSelect");
  });

  it('should log user in', () => {

    let testRequest: TestRequest = httpTestingController.expectOne("http://localhost:5600/auth/login");
    testRequest.flush([]);

  });

});
