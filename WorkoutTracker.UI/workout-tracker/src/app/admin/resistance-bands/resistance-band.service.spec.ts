import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResistanceBandService } from './resistance-band.service';

describe('ResistanceBandServiceService', () => {
  let service: ResistanceBandService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(ResistanceBandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
