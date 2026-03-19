import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WorkoutService } from './workout.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Workout, WorkoutPlan, WorkoutDTO, WorkoutDTOPaginatedResults } from '../../api';
import { firstValueFrom } from 'rxjs';

const TEST_WORKOUT_ID = "some-fake-guid";
const API_ROOT_URL = "http://localhost:5600/api/workouts";

class MockConfigService {
  get = vi.fn().mockReturnValue("http://localhost:5600/api/");
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

  it('should get a filtered subset for workouts', async () => {
    const expectedResults = <WorkoutDTOPaginatedResults>{};
    expectedResults.results = new Array<WorkoutDTO>(2);
    expectedResults.results.push(<WorkoutDTO>{});
    expectedResults.results.push(<WorkoutDTO>{});
    expectedResults.totalCount = 2;

    const response = firstValueFrom(service.getFilteredSubset(10, 25, false));

    const req = httpMock.expectOne(`${API_ROOT_URL}?firstRecord=10&pageSize=25&activeOnly=false&sortAscending=true`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    await expect(response).resolves.toEqual(expectedResults);
  });

  it('should encode nameContains when getting filtered subset', async () => {
    const expectedResults = <WorkoutDTOPaginatedResults>{};
    expectedResults.results = [];
    expectedResults.totalCount = 0;

    const nameContains = "Chest & Shoulders + Core";
    const encodedNameContains = encodeURIComponent(nameContains);
    const response = firstValueFrom(service.getFilteredSubset(0, 10, true, true, nameContains));

    const req = httpMock.expectOne(`${API_ROOT_URL}?firstRecord=0&pageSize=10&activeOnly=true&sortAscending=true&nameContains=${encodedNameContains}`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
    await expect(response).resolves.toEqual(expectedResults);
  });

  it('should get workout by public ID', async () => {
    const expectedResults = <Workout>{};
    const workoutId: string = TEST_WORKOUT_ID;
    expectedResults.publicId = workoutId;

    const response = firstValueFrom(service.getById(workoutId));

    const req = httpMock.expectOne(`${API_ROOT_URL}/${TEST_WORKOUT_ID}`);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);
    await expect(response).resolves.toEqual(expectedResults);
  });

  it('should add new workout', async () => {

    //ARRANGE
    const workout = <Workout>{};

    //ACT
    const response = firstValueFrom(service.add(workout));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workout);

    // Respond with the mock results
    req.flush(workout);
    await expect(response).resolves.toEqual(workout);
  });

  it('should update existing workout', async () => {

    //ARRANGE
    const workout = <Workout>{};
    workout.id = 100;

    //ACT
    const response = firstValueFrom(service.update(workout));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toBe(workout);

    // Respond with the mock results
    req.flush(workout);
    await expect(response).resolves.toEqual(workout);
  });

  it('should submit a workout plan', async () => {

    //ARRANGE
    const workoutPlan = <WorkoutPlan>{};
    const expectedNewExecutedWorkoutPublicId: string = "some-guid-456";

    //ACT
    const response = firstValueFrom(service.submitPlan(workoutPlan));

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);
    expect(await response).toEqual(expectedNewExecutedWorkoutPublicId);
  });

  it('should submit a workout plan for later', async () => {

    //ARRANGE
    const workoutPlan = <WorkoutPlan>{};
    const expectedNewExecutedWorkoutPublicId: string = "some-new-guid";

    workoutPlan.workoutId = "some-guid-30-blah-blah";

    //ACT
    const response = firstValueFrom(service.submitPlanForLater(workoutPlan));

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan-for-later`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);
    await expect(response).resolves.toEqual(expectedNewExecutedWorkoutPublicId);
  });

  it('should submit a workout plan for a past workout', async () => {

    //ARRANGE
    const workoutPlan = <WorkoutPlan>{};
    const expectedNewExecutedWorkoutPublicId: string = "someOtherGuid";

    workoutPlan.workoutId = "someGuid";
    const startDateTime = new Date(2022, 3, 22, 13, 30, 0);
    const endDateTime = new Date(2022, 3, 4, 14, 5, 30);

    //ACT
    const response = firstValueFrom(service.submitPlanForPast(workoutPlan, startDateTime, endDateTime));

    const req = httpMock.expectOne(`${API_ROOT_URL}/plan-for-past/${startDateTime.toISOString()}/${endDateTime.toISOString()}`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toBe(workoutPlan);

    // Respond with the mock results
    req.flush(expectedNewExecutedWorkoutPublicId);
    await expect(response).resolves.toEqual(expectedNewExecutedWorkoutPublicId);
  });

  it('should get new workout plan', async () => {
    const workoutPublicId: string = "some-guid-123";
    const expectedPlan = <WorkoutPlan>{};
    expectedPlan.workoutId = workoutPublicId;
    expectedPlan.submittedDateTime = new Date();

    const response = firstValueFrom(service.getNewPlan(workoutPublicId));

    const req = httpMock.expectOne(`${API_ROOT_URL}/${workoutPublicId}/plan`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedPlan);
    await expect(response).resolves.toEqual(expectedPlan);
  });

  it('should convert date string to date object when getting new workout plan', async () => {
    const workoutPublicId: string = "some-guid-123";
    const expectedResults = {
      submittedDateTime: "2024-01-22T14:30:00.000Z"
    };

    const response = firstValueFrom(service.getNewPlan(workoutPublicId));

    const req = httpMock.expectOne(`${API_ROOT_URL}/${workoutPublicId}/plan`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
    await expect(response).resolves.toEqual({
      submittedDateTime: new Date(expectedResults.submittedDateTime)
    });
  });
});


