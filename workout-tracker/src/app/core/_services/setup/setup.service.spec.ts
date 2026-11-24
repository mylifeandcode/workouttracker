import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

import { SetupService } from './setup.service';
import { ConfigService } from '../config/config.service';
import { FirstAdminRequestDTO } from '../../../api';

describe('SetupService', () => {
  let service: SetupService;
  let http: HttpTestingController;

  const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
    get: vi.fn<ConfigService['get']>(() => "http://localhost:5600/api/").mockName('get')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ConfigService, useValue: configServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SetupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.resetAllMocks();
  });

  it('should be creatable', () => {
    expect(service).toBeTruthy();
  });

  it('should report that setup is required', async () => {
    const result = firstValueFrom(service.isSetupRequired());

    const req = http.expectOne("http://localhost:5600/api/setup/status");
    expect(req.request.method).toEqual('GET');
    req.flush({ setupRequired: true });

    expect(await result).toBe(true);
  });

  it('should remember that setup is complete rather than asking again', async () => {
    const first = firstValueFrom(service.isSetupRequired());
    http.expectOne("http://localhost:5600/api/setup/status").flush({ setupRequired: false });
    expect(await first).toBe(false);

    //No request is expected now; http.verify() in afterEach fails the test if there is one.
    expect(await firstValueFrom(service.isSetupRequired())).toBe(false);
  });

  it('should keep asking while setup is still required', async () => {
    const first = firstValueFrom(service.isSetupRequired());
    http.expectOne("http://localhost:5600/api/setup/status").flush({ setupRequired: true });
    expect(await first).toBe(true);

    const second = firstValueFrom(service.isSetupRequired());
    http.expectOne("http://localhost:5600/api/setup/status").flush({ setupRequired: true });
    expect(await second).toBe(true);
  });

  it('should treat a failure to ask as "not required" without remembering it', async () => {
    const first = firstValueFrom(service.isSetupRequired());
    http.expectOne("http://localhost:5600/api/setup/status").flush('Server error', { status: 500, statusText: 'Server Error' });
    expect(await first).toBe(false);

    //The failure must not have been cached as "complete".
    const second = firstValueFrom(service.isSetupRequired());
    http.expectOne("http://localhost:5600/api/setup/status").flush({ setupRequired: true });
    expect(await second).toBe(true);
  });

  it('should create the first administrator and remember that setup is complete', async () => {
    const request: FirstAdminRequestDTO = {
      userName: 'jtkirk',
      emailAddress: 'jtkirk@ufp.org',
      password: 'a-long-enough-password',
      setupCode: 'ABCD-EFGH-JKMN-PQRS'
    };

    const result = firstValueFrom(service.createFirstAdmin(request));

    const req = http.expectOne("http://localhost:5600/api/setup/first-admin");
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(request);
    req.flush(null, { status: 204, statusText: 'No Content' });
    await result;

    //No status request is expected now.
    expect(await firstValueFrom(service.isSetupRequired())).toBe(false);
  });
});
