import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ConfigService } from 'app/core/config.service';
import { WorkoutPlan } from './models/workout-plan';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from './models/workout-dto';

const TEST_WORKOUT_ID = "5";
const API_ROOT_URL = "http://localhost:5600/api/workouts";

class MockConfigService {
  get = jasmine.createSpy('get').and.returnValue("http://localhost:5600/api/");
}

let service: WorkoutService;
let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a filtered subset for workouts', (done: DoneFn) => {
    const expectedResults = new PaginatedResults<WorkoutDTO>();
    expectedResults.results = new Array<WorkoutDTO>(2);
    expectedResults.results.push(new WorkoutDTO());
    expectedResults.results.push(new WorkoutDTO());
    expectedResults.totalCount = 2;

    service.getFilteredSubset(10, 25, false).subscribe(
      (response: PaginatedResults<WorkoutDTO>) => {
        expect(response).toEqual(expectedResults);
        done();
      },
      fail
    );

    const req = httpMock.expectOne(`${API_ROOT_URL}?firstRecord=10&pageSize=25&activeOnly=false`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
  });

  it('should get workout by ID', (done: DoneFn) => {
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
    const workout = new Workout();

    //ACT
    service.add(workout)
      .subscribe(
        (addedWorkout: Workout) => {
          expect(addedWorkout).toEqual(workout); //ASSERT
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
    const workout = new Workout();
    workout.id = 100;

    //ACT
    service.update(workout)
      .subscribe(
        (updatedWorkout: Workout) => {
          expect(updatedWorkout).toEqual(workout); //ASSERT
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

  it('should submit a workout plan for a past workout', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const expectedNewExecutedWorkoutId: number = 909;

    workoutPlan.workoutId = 50;
    const startDateTime = new Date(2022, 3, 22, 13, 30, 0);
    const endDateTime = new Date(2022, 3, 4, 14, 5, 30);

    //ACT
    service.submitPlanForPast(workoutPlan, startDateTime, endDateTime)
      .subscribe(
        (executedWorkoutId: number) => {
          expect(executedWorkoutId).toEqual(expectedNewExecutedWorkoutId); //ASSERT
          done();
        },
        fail
      );

    const req = httpMock.expectOne(`${API_ROOT_URL}/${workoutPlan.workoutId}/plan-for-past/${startDateTime.toISOString()}/${endDateTime.toISOString()}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutId);

  });

});


