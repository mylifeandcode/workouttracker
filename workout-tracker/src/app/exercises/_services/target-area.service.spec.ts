import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TargetAreaService } from './target-area.service';
import { TargetArea } from '../../api';
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

    //Note that DateSerializationService is deliberately NOT mocked here, so that the
    //audit date conversion done by ApiBaseService is genuinely covered.
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
    const targetAreas = new Array<TargetArea>();
    targetAreas.push(<TargetArea>{ id: 1, name: "Chest" });

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
    const targetAreas = new Array<TargetArea>();

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

  it('should convert date strings to Date objects when getting all target areas', async () => {

    //ARRANGE
    const mockResults = [
      {
        id: 1,
        name: "Chest",
        createdDateTime: "2024-01-01T12:00:00Z",
        modifiedDateTime: "2024-01-02T12:00:00Z"
      }
    ];

    //ACT
    const result = firstValueFrom(service.getAll());

    //ASSERT
    const req = http.expectOne(`${API_ROOT}TargetAreas`);
    expect(req.request.method).toEqual('GET');

    req.flush(mockResults);

    const targetAreas = await result;
    expect(targetAreas.length).toBe(1);
    expect(targetAreas[0].createdDateTime).toBeInstanceOf(Date);
    expect(targetAreas[0].createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(targetAreas[0].modifiedDateTime).toBeInstanceOf(Date);
    expect(targetAreas[0].modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");
  });

});
