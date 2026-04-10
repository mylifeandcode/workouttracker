import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../../core/_services/config/config.service';

import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';
import { ExecutedWorkoutSummaryDTO, ExecutedWorkoutSummaryDTOPaginatedResults } from '../../api';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

const API_ROOT_URL: string = "http://localhost:5600/api/";

describe('ExecutedWorkoutService', () => {
  let service: ExecutedWorkoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const MockConfigService: Partial<Mocked<ConfigService>> = {
      get: vi.fn().mockReturnValue(API_ROOT_URL)
    };

    const MockDateSerializationService: Partial<Mocked<DateSerializationService>> = {
      convertDateRangeStringsToDates: vi.fn().mockImplementation((obj: ExecutedWorkoutSummaryDTO) => {
        if (obj.startDateTime && typeof obj.startDateTime === 'string') {
          obj.startDateTime = new Date(obj.startDateTime);
        }

        if (obj.endDateTime && typeof obj.endDateTime === 'string') {
          obj.endDateTime = new Date(obj.endDateTime);
        }

        return obj;
      })
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useValue: MockConfigService
        },
        {
          provide: DateSerializationService,
          useValue: MockDateSerializationService
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ExecutedWorkoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get filtered subset', async () => {
    //ARRANGE
    const expectedResults = <ExecutedWorkoutSummaryDTOPaginatedResults>{};
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(1);
    expectedResults.results.push(<ExecutedWorkoutSummaryDTO>{});
    expectedResults.totalCount = 1;

    //ACT
    const result = firstValueFrom(service.getFilteredSubset(10, 50));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=10&pageSize=50&onlyWithJournalNotes=false`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
    await expect(result).resolves.toEqual(expectedResults);
  });

  it('should convert date strings to dates when getting filtered subset', async () => {
    //ARRANGE
    const mockResults = {
      results: [
        {
          startDateTime: "2024-06-01T10:00:00.000Z",
          endDateTime: "2024-06-01T11:00:00.000Z"
        }
      ]
    };

    //ACT
    const result = firstValueFrom(service.getFilteredSubset(0, 5));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5&onlyWithJournalNotes=false`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
    const response = await result;
    expect(response.results[0].startDateTime instanceof Date).toBe(true);
    expect(response.results[0].startDateTime!.toISOString()).toBe("2024-06-01T10:00:00.000Z");
    expect(response.results[0].endDateTime instanceof Date).toBe(true);
    expect(response.results[0].endDateTime!.toISOString()).toBe("2024-06-01T11:00:00.000Z");
  });

  it('should get planned workouts', async () => {
    //ARRANGE
    const expectedResults = <ExecutedWorkoutSummaryDTOPaginatedResults>{};
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(3);
    expectedResults.results.push(<ExecutedWorkoutSummaryDTO>{});
    expectedResults.results.push(<ExecutedWorkoutSummaryDTO>{});
    expectedResults.results.push(<ExecutedWorkoutSummaryDTO>{});
    expectedResults.totalCount = 3;

    //ACT
    const result = firstValueFrom(service.getPlanned(20, 10));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/planned?firstRecord=20&pageSize=10`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
    expect(await result).toEqual(expectedResults);
  });

  it('should convert date strings to dates when getting planned workouts', async () => {
    //ARRANGE
    const mockResults = {
      results: [
        {
          startDateTime: "2024-06-01T10:00:00.000Z",
          endDateTime: "2024-06-01T11:00:00.000Z"
        }
      ]
    };

    //ACT
    const result = firstValueFrom(service.getPlanned(0, 5));

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/planned?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
    const response = await result;
    expect(response.results[0].startDateTime instanceof Date).toBe(true);
    expect(response.results[0].startDateTime!.toISOString()).toBe("2024-06-01T10:00:00.000Z");
    expect(response.results[0].endDateTime instanceof Date).toBe(true);
    expect(response.results[0].endDateTime!.toISOString()).toBe("2024-06-01T11:00:00.000Z");
  });

  it('should get recent executed workouts', async () => {
    //ARRANGE
    const expectedResults = <ExecutedWorkoutSummaryDTOPaginatedResults>{};
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(1);
    expectedResults.results.push(<ExecutedWorkoutSummaryDTO>{});
    expectedResults.totalCount = 1;

    //ACT
    const response = firstValueFrom(service.getRecent());

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5&onlyWithJournalNotes=false`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
    const result = await response;
    expect(result).toEqual(expectedResults.results);
  });

  it('should convert date strings to dates when getting recent executed workouts', async () => {
    //ARRANGE
    const mockResults = {
      results: [
        {
          startDateTime: "2024-06-01T10:00:00.000Z",
          endDateTime: "2024-06-01T11:00:00.000Z"
        }
      ]
    };

    //ACT
    const response = firstValueFrom(service.getRecent());

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5&onlyWithJournalNotes=false`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
    const recentWorkouts = await response;
    expect(recentWorkouts[0].startDateTime instanceof Date).toBe(true);
    expect(recentWorkouts[0].startDateTime!.toISOString()).toBe("2024-06-01T10:00:00.000Z");
    expect(recentWorkouts[0].endDateTime instanceof Date).toBe(true);
    expect(recentWorkouts[0].endDateTime!.toISOString()).toBe("2024-06-01T11:00:00.000Z");
  });

  it('should get in-progress workouts', async () => {
    //ARRANGE
    const expectedResults: ExecutedWorkoutSummaryDTO[] = [];
    expectedResults.push(...[<ExecutedWorkoutSummaryDTO>{}, <ExecutedWorkoutSummaryDTO>{}]);

    //ACT
    const response = firstValueFrom(service.getInProgress());

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/in-progress`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
    const inProgressWorkouts = await response;
    expect(inProgressWorkouts).toEqual(expectedResults);
  });

  it('should convert date strings to dates when getting in-progress workouts', async () => {
    //ARRANGE
    const mockResults = [
      {
        startDateTime: "2024-06-01T10:00:00.000Z",
        endDateTime: "2024-06-01T11:00:00.000Z"
      }
    ];

    //ACT
    const response = firstValueFrom(service.getInProgress());

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/in-progress`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
    const recentWorkouts = await response;
    expect(recentWorkouts[0].startDateTime instanceof Date).toBe(true);
    expect(recentWorkouts[0].startDateTime!.toISOString()).toBe("2024-06-01T10:00:00.000Z");
    expect(recentWorkouts[0].endDateTime instanceof Date).toBe(true);
    expect(recentWorkouts[0].endDateTime!.toISOString()).toBe("2024-06-01T11:00:00.000Z");
  });

});
