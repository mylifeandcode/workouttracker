import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { Workout } from 'app/workouts/_models/workout';
import { ConfigService } from 'app/core/_services/config/config.service';
import { WorkoutPlan } from '../_models/workout-plan';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { WorkoutDTO } from '../_models/workout-dto';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const TEST_WORKOUT_ID = "some-fake-guid";
const API_ROOT_URL = "http://localhost:5600/api/workouts";

class MockConfigService {
  get = jasmine.createSpy('get').and.returnValue("http://localhost:5600/api/");
}

let service: WorkoutService;
let httpMock: HttpTestingController;

describe('WorkoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
  provideZonelessChangeDetection(),
        {
            provide: ConfigService,
            useClass: MockConfigService
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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

    service.getFilteredSubset(10, 25, false).subscribe({
      next: (response: PaginatedResults<WorkoutDTO>) => {
        expect(response).toEqual(expectedResults);
        done();
      },
      error: fail
    });

    const req = httpMock.expectOne(`${API_ROOT_URL}?firstRecord=10&pageSize=25&activeOnly=false`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
  });

  it('should get workout by public ID', (done: DoneFn) => {
    const expectedResults = new Workout();
    const workoutId: string = TEST_WORKOUT_ID;
    expectedResults.publicId = workoutId;

    service.getById(workoutId).subscribe({
      next: (workout: Workout) => {
        expect(workout).toEqual(expectedResults);
        done();
      },
      error: fail
    });

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
      .subscribe({
        next: (addedWorkout: Workout) => {
          expect(addedWorkout).toEqual(workout); //ASSERT
          done();
        },
        error: fail
      });

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
      .subscribe({
        next: (updatedWorkout: Workout) => {
          expect(updatedWorkout).toEqual(workout); //ASSERT
          done();
        },
        error: fail
      });


    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toBe(workout);

    // Respond with the mock results
    req.flush(workout);

  });

  it('should submit a workout plan', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const expectedNewExecutedWorkoutPublicId: string = "some-guid-456";

    //ACT
    service.submitPlan(workoutPlan)
      .subscribe({
        next: (executedWorkoutPublicId: string) => {
          expect(executedWorkoutPublicId).toEqual(expectedNewExecutedWorkoutPublicId); //ASSERT
          done();
        },
        error: fail
      });

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);

  });

  it('should submit a workout plan for later', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const expectedNewExecutedWorkoutPublicId: string = "some-new-guid";

    workoutPlan.workoutId = "some-guid-30-blah-blah";

    //ACT
    service.submitPlanForLater(workoutPlan)
      .subscribe({
        next: (executedWorkoutPublicId: string) => {
          expect(executedWorkoutPublicId).toEqual(expectedNewExecutedWorkoutPublicId); //ASSERT
          done();
        },
        error: fail
      });

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan-for-later`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);

  });

  it('should submit a workout plan for a past workout', (done: DoneFn) => {

    //ARRANGE
    const workoutPlan = new WorkoutPlan();
    const expectedNewExecutedWorkoutPublicId: string = "someOtherGuid";

    workoutPlan.workoutId = "someGuid";
    const startDateTime = new Date(2022, 3, 22, 13, 30, 0);
    const endDateTime = new Date(2022, 3, 4, 14, 5, 30);

    //ACT
    service.submitPlanForPast(workoutPlan, startDateTime, endDateTime)
      .subscribe({
        next: (executedWorkoutId: string) => {
          expect(executedWorkoutId).toEqual(expectedNewExecutedWorkoutPublicId); //ASSERT
          done();
        },
        error: fail
      });

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan-for-past/${startDateTime.toISOString()}/${endDateTime.toISOString()}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);

  });

});


