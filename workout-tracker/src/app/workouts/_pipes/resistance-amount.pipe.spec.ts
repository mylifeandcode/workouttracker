import { ConfigService } from 'app/core/_services/config/config.service';
import { ResistanceAmountPipe } from './resistance-amount.pipe';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

class MockConfigService {
  get = jasmine.createSpy('get').and.returnValue('lb');
}

describe('ResistanceAmountPipe', () => {
  let pipe: ResistanceAmountPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResistanceAmountPipe,
        {
          provide: ConfigService,
          useClass: MockConfigService
  },
  provideZonelessChangeDetection()
      ]
    });

    pipe = TestBed.inject(ResistanceAmountPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  
});
