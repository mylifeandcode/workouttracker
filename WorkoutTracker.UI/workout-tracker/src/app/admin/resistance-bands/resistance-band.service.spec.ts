import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResistanceBandService } from './resistance-band.service';
import { ConfigService } from 'app/core/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue('http://someUrl/api/');
}

describe('ResistanceBandServiceService', () => {
  let service: ResistanceBandService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ], 
      providers: [
        {
          provide: ConfigService, 
          useClass: ConfigServiceMock
        }
      ]
    });
    service = TestBed.inject(ResistanceBandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all individual bands', () => {

    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    let resistanceBands = new Array<ResistanceBand>();
    let blackBand = new ResistanceBand();
    blackBand.color = "Black";
    blackBand.numberAvailable = 1;
    blackBand.maxResistanceAmount = 19;

    let orangeBand = new ResistanceBand();
    orangeBand.color = "Orange";
    orangeBand.numberAvailable = 4;
    orangeBand.maxResistanceAmount = 30;

    resistanceBands.push(blackBand);
    resistanceBands.push(orangeBand);

    //ACT
    const result = service.getAllIndividualBands();
    result.subscribe((bands: ResistanceBandIndividual[]) => {
      expect(bands.length).toBe(5, fail);
    });

    //ASSERT
    const req = httpMock.expectOne("http://someUrl/api/resistancebands");
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(resistanceBands);    

  });
});
