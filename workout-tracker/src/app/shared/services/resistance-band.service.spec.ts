import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResistanceBandService } from '../services/resistance-band.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { ResistanceBandDTO } from '../../api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

describe('ResistanceBandServiceService', () => {
  let service: ResistanceBandService;

  const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
    get: vi.fn<ConfigService['get']>(() => 'http://someUrl/api/').mockName('get')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ResistanceBandService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get configuration when constructing', () => {
    expect(configServiceMock.get).toHaveBeenCalledWith('apiRoot');
  });

  it('should get all individual bands', async () => {

    //ARRANGE
    const httpMock = TestBed.inject(HttpTestingController);
    const resistanceBands = new Array<ResistanceBandDTO>();
    const blackBand = <ResistanceBandDTO>{};
    blackBand.color = "Black";
    blackBand.numberAvailable = 1;
    blackBand.maxResistanceAmount = 19;

    const orangeBand = <ResistanceBandDTO>{};
    orangeBand.color = "Orange";
    orangeBand.numberAvailable = 4;
    orangeBand.maxResistanceAmount = 30;

    resistanceBands.push(blackBand);
    resistanceBands.push(orangeBand);

    //ACT
    const bands = firstValueFrom(service.getAllIndividualBands());

    //ASSERT
    const req = httpMock.expectOne("http://someUrl/api/resistancebands");
    expect(req.request.method).toEqual('GET');
    
    req.flush(resistanceBands);
    expect(await bands).toHaveLength(5);
  });
});
