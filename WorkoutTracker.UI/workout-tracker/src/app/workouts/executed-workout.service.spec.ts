import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ExecutedWorkoutService } from './executed-workout.service';

describe('ExecutedWorkoutService', () => {
  let service: ExecutedWorkoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutedWorkoutService], 
      imports :[
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ExecutedWorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
