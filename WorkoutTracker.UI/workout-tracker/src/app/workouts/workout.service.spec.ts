import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { Workout } from 'app/workouts/models/workout';

const TEST_WORKOUT_ID = "5";
const API_ROOT_URL = "http://localhost:5600/api/workouts";

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

  it('should get workout by ID', (done: DoneFn) => {
    const service: WorkoutService = TestBed.get(WorkoutService);
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    
    const expectedResults = new Workout();
    const workoutId: number = parseInt(TEST_WORKOUT_ID);
    expectedResults.id = workoutId;

    service.getById(workoutId).subscribe(
      (workout: Workout) => {
        expect(workout).toEqual(expectedResults);
        done();
      }, 
      fail
    );

    const req = httpMock.expectOne(`${API_ROOT_URL}/${TEST_WORKOUT_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should add new workout', (done: DoneFn) => {
    
    //ARRANGE
    const service: WorkoutService = TestBed.get(WorkoutService);
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const workout = new Workout();

    //ACT
    service.add(workout)
      .subscribe(
        (workout: Workout) => {
          expect(workout).toEqual(workout); //ASSERT
          done();
        }, 
        fail
    );


    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workout);

    // Respond with the mock results
    req.flush(workout);

  });

  it('should update existing workout', (done: DoneFn) => {
    
    //ARRANGE
    const service: WorkoutService = TestBed.get(WorkoutService);
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const workout = new Workout();
    workout.id = 100;

    //ACT
    service.update(workout)
      .subscribe(
        (workout: Workout) => {
          expect(workout).toEqual(workout); //ASSERT
          done();
        }, 
        fail
    );


    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}/${workout.id}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toBe(workout);

    // Respond with the mock results
    req.flush(workout);

  });  

});


