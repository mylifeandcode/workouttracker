import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';


describe('WorkoutService', () => {
  beforeEach(() => 
    TestBed.configureTestingModule({
      imports :[
        HttpClientTestingModule
      ]
    }));

  it('should be created', () => {
    const service: WorkoutService = TestBed.get(WorkoutService);
    expect(service).toBeTruthy();
  });
});
