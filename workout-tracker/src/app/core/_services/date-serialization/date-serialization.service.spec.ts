import { TestBed } from '@angular/core/testing';

import { DateSerializationService } from './date-serialization.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('DateSerializationService', () => {
  let service: DateSerializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(DateSerializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
