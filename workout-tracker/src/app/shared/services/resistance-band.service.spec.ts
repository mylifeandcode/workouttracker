import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResistanceBandService } from '../services/resistance-band.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { ResistanceBand } from '../../api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

describe('ResistanceBandServiceService', () => {
  let service: ResistanceBandService;

  beforeEach(() => {
    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn().mockReturnValue('http://someUrl/api/')
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
    service = TestBed.inject(ResistanceBandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get configuration when constructing', () => {
    const configService = TestBed.inject(ConfigService);
    expect(configService.get).toHaveBeenCalledWith('apiRoot');
  });

  it('should get all individual bands', async () => {

    //ARRANGE
    const httpMock = TestBed.inject(HttpTestingController);
    const resistanceBands = new Array<ResistanceBand>();
    const blackBand = <ResistanceBand>{};
    blackBand.color = "Black";
    blackBand.numberAvailable = 1;
    blackBand.maxResistanceAmount = 19;

    const orangeBand = <ResistanceBand>{};
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
