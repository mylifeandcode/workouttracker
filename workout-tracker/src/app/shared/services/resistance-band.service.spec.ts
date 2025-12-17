import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResistanceBandService } from '../services/resistance-band.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { ResistanceBand } from '../../shared/models/resistance-band';
import { ResistanceBandIndividual } from '../../shared/models/resistance-band-individual';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class ConfigServiceMock {
    get = vi.fn().mockReturnValue('http://someUrl/api/');
}

describe('ResistanceBandServiceService', () => {
    let service: ResistanceBandService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: ConfigService,
                    useClass: ConfigServiceMock
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

    it('should get all individual bands', () => {

        //ARRANGE
        const httpMock = TestBed.inject(HttpTestingController);
        const resistanceBands = new Array<ResistanceBand>();
        const blackBand = new ResistanceBand();
        blackBand.color = "Black";
        blackBand.numberAvailable = 1;
        blackBand.maxResistanceAmount = 19;

        const orangeBand = new ResistanceBand();
        orangeBand.color = "Orange";
        orangeBand.numberAvailable = 4;
        orangeBand.maxResistanceAmount = 30;

        resistanceBands.push(blackBand);
        resistanceBands.push(orangeBand);

        //ACT
        const result = service.getAllIndividualBands();
        result.subscribe((bands: ResistanceBandIndividual[]) => {
            expect(bands.length).toBe(5);
        });

        //ASSERT
        const req = httpMock.expectOne("http://someUrl/api/resistancebands");
        expect(req.request.method).toEqual('GET');
        //Respond with the mock results
        req.flush(resistanceBands);

    });
});
