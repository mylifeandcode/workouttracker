import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TargetAreaService } from './target-area.service';
import { TargetAreaDTO } from '../../api';
import { ConfigService } from '../../core/_services/config/config.service';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

const API_ROOT = "http://someUrl/api/";

describe('TargetAreaService', () => {
  let service: TargetAreaService;
  let http: HttpTestingController;

  beforeEach(() => {
    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn<ConfigService['get']>().mockReturnValue(API_ROOT)
    };

    TestBed.configureTestingModule({
      imports: [],
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

    service = TestBed.inject(TargetAreaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all target areas', async () => {

    //ARRANGE
    const targetAreas = new Array<TargetAreaDTO>();
    targetAreas.push(<TargetAreaDTO>{ id: 1, name: "Chest" });

    //ACT
    const result = firstValueFrom(service.getAll());

    //ASSERT
    const req = http.expectOne(`${API_ROOT}TargetAreas`);
    expect(req.request.method).toEqual('GET');

    req.flush(targetAreas);
    expect(await result).toBe(targetAreas);
  });

  it('should cache target areas', async () => {

    //ARRANGE
    const targetAreas = new Array<TargetAreaDTO>();

    //ACT
    const result1 = firstValueFrom(service.getAll()); //Only this one should trigger an HTTP request
    const result2 = firstValueFrom(service.getAll());
    const result3 = firstValueFrom(service.getAll());

    //ASSERT
    const req = http.expectOne(`${API_ROOT}TargetAreas`); //Singular, so a second request would fail this
    expect(req.request.method).toEqual('GET');

    req.flush(targetAreas);

    expect(await result1).toBe(targetAreas);
    expect(await result2).toBe(targetAreas);
    expect(await result3).toBe(targetAreas);
  });

});
