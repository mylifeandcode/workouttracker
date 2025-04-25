import { TestBed } from '@angular/core/testing';

import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //TODO: Find a way to unit test the playSound method. My attempts all failed!
});
