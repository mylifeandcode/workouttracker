import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ConfigService } from 'app/core/config.service';
import { WorkoutPlan } from './models/workout-plan';

const TEST_WORKOUT_ID = "5";
const API_ROOT_URL = "http://localhost:5600/api/workouts";

class MockConfigService {
  get = jasmine.createSpy('get').and.returnValue("http://localhost:5600/api/");
}

let service: WorkoutService;

describe('WorkoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports :[
        HttpClientTestingModule
      ], 
      providers: [
        {
          provide: ConfigService, 
          useClass: MockConfigService
        }
      ]
    });
    service = TestBed.inject(WorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get workout by ID', (done: DoneFn) => {
    const httpMock: HttpTestingController = TestBed.inject(HttpTestingController);

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
    const httpMock: HttpTestingController = TestBed.inject(HttpTestingController);
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
    const httpMock: HttpTestingController = TestBed.inject(HttpTestingController);
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

  it('should submit a workout plan', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const httpMock: HttpTestingController = TestBed.inject(HttpTestingController);
    const expectedNewExecutedWorkoutId: number = 456;

    workoutPlan.workoutId = 25;

    //ACT
    service.submitPlan(workoutPlan)
      .subscribe(
        (executedWorkoutId: number) => {
          expect(executedWorkoutId).toEqual(expectedNewExecutedWorkoutId); //ASSERT
          done();
        },
        fail
      );

    const req = httpMock.expectOne(`${API_ROOT_URL}/${workoutPlan.workoutId}/plan`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutId);

  });

  it('should submit a workout plan for later', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const httpMock: HttpTestingController = TestBed.inject(HttpTestingController);
    const expectedNewExecutedWorkoutId: number = 789;

    workoutPlan.workoutId = 30;

    //ACT
    service.submitPlanForLater(workoutPlan)
      .subscribe(
        (executedWorkoutId: number) => {
          expect(executedWorkoutId).toEqual(expectedNewExecutedWorkoutId); //ASSERT
          done();
        },
        fail
      );

    const req = httpMock.expectOne(`${API_ROOT_URL}/${workoutPlan.workoutId}/plan-for-later`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutId);

  });

});


