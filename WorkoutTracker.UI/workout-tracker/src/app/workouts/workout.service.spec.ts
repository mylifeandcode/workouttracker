import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { Workout } from 'app/models/workout';

const TEST_WORKOUT_ID = "5";

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

  it('should get workout by ID', () => {
    const service: WorkoutService = TestBed.get(WorkoutService);
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    
    const expectedResults = new Workout();
    const workoutId: number = parseInt(TEST_WORKOUT_ID);
    expectedResults.id = workoutId;

    service.getById(workoutId).subscribe(
      (workout: Workout) => expect(workout).toEqual(expectedResults), 
      fail
    );

    const req = httpMock.expectOne(`http://localhost:5600/api/workouts/${TEST_WORKOUT_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });
});
