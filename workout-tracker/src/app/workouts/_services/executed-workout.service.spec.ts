import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from 'app/core/_services/config/config.service';
import { PaginatedResults } from 'app/core/_models/paginated-results';

import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { DateSerializationService } from 'app/core/_services/date-serialization/date-serialization.service';

const API_ROOT_URL: string = "http://localhost:5600/api/";

class MockConfigService {
  get = jasmine.createSpy('get').and.returnValue(API_ROOT_URL);
}

class MockDateSerializationService {
  convertDateRangeStringsToDates =
    jasmine.createSpy('convertDateRangeStringsToDates').and.callFake((obj: ExecutedWorkoutSummaryDTO) => {
      if (obj.startDateTime && typeof obj.startDateTime === 'string') {
        obj.startDateTime = new Date(obj.startDateTime);
      }

      if (obj.endDateTime && typeof obj.endDateTime === 'string') {
        obj.endDateTime = new Date(obj.endDateTime);
      }

      return obj;
    });
}

describe('ExecutedWorkoutService', () => {
  let service: ExecutedWorkoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ConfigService,
          useClass: MockConfigService
        },
        {
          provide: DateSerializationService,
          useClass: MockDateSerializationService
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

  it('should get filtered subset', (done: DoneFn) => {
    //ARRANGE
    const expectedResults = new PaginatedResults<ExecutedWorkoutSummaryDTO>();
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(1);
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.totalCount = 1;

    //ACT
    service.getFilteredSubset(10, 50)
      .subscribe({
        next: (response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          //ASSERT
          expect(response).toEqual(expectedResults);
          done();
        },
        error: fail
      });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=10&pageSize=50`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should convert date strings to dates when getting filtered subset', (done: DoneFn) => {
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
    service.getFilteredSubset(0, 5)
      .subscribe({
        next: (response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          //ASSERT
          expect(response.results[0].startDateTime instanceof Date).toBeTrue();
          expect(response.results[0].startDateTime.toISOString()).toBe("2024-06-01T10:00:00.000Z");
          expect(response.results[0].endDateTime instanceof Date).toBeTrue();
          expect(response.results[0].endDateTime.toISOString()).toBe("2024-06-01T11:00:00.000Z");
          done();
        },
        error: fail
      });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
  });

  it('should get planned workouts', (done: DoneFn) => {
    //ARRANGE
    const expectedResults = new PaginatedResults<ExecutedWorkoutSummaryDTO>();
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(3);
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.totalCount = 3;

    //ACT
    service.getPlanned(20, 10)
      .subscribe({
        next: (response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          //ASSERT
          expect(response).toEqual(expectedResults);
          done();
        },
        error: fail
      });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/planned?firstRecord=20&pageSize=10`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should convert date strings to dates when getting planned workouts', (done: DoneFn) => {
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
    service.getPlanned(0, 5)
      .subscribe({
        next: (response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          //ASSERT
          expect(response.results[0].startDateTime instanceof Date).toBeTrue();
          expect(response.results[0].startDateTime.toISOString()).toBe("2024-06-01T10:00:00.000Z");
          expect(response.results[0].endDateTime instanceof Date).toBeTrue();
          expect(response.results[0].endDateTime.toISOString()).toBe("2024-06-01T11:00:00.000Z");
          done();
        },
        error: fail
      });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/planned?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
  });

  it('should get recent executed workouts', (done: DoneFn) => {
    //ARRANGE
    const expectedResults = new PaginatedResults<ExecutedWorkoutSummaryDTO>();
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(1);
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.totalCount = 1;

    //ACT
    service.getRecent().subscribe({
      next: (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts).toEqual(expectedResults.results);
        done();
      },
      error: fail
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should convert date strings to dates when getting recent executed workouts', (done: DoneFn) => {
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
    service.getRecent().subscribe({
      next: (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts[0].startDateTime instanceof Date).toBeTrue();
        expect(recentWorkouts[0].startDateTime.toISOString()).toBe("2024-06-01T10:00:00.000Z");
        expect(recentWorkouts[0].endDateTime instanceof Date).toBeTrue();
        expect(recentWorkouts[0].endDateTime.toISOString()).toBe("2024-06-01T11:00:00.000Z");
        done();
      },
      error: fail
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
  });

  it('should get in-progress workouts', (done: DoneFn) => {
    //ARRANGE
    const expectedResults: ExecutedWorkoutSummaryDTO[] = [];
    expectedResults.push(...[new ExecutedWorkoutSummaryDTO(), new ExecutedWorkoutSummaryDTO()]);

    //ACT
    service.getInProgress().subscribe({
      next: (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts).toEqual(expectedResults);
        done();
      },
      error: fail
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/in-progress`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should convert date strings to dates when getting in-progress workouts', (done: DoneFn) => {
    //ARRANGE
    const mockResults = [
      {
        startDateTime: "2024-06-01T10:00:00.000Z",
        endDateTime: "2024-06-01T11:00:00.000Z"
      }
    ];

    //ACT
    service.getInProgress().subscribe({
      next: (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts[0].startDateTime instanceof Date).toBeTrue();
        expect(recentWorkouts[0].startDateTime.toISOString()).toBe("2024-06-01T10:00:00.000Z");
        expect(recentWorkouts[0].endDateTime instanceof Date).toBeTrue();
        expect(recentWorkouts[0].endDateTime.toISOString()).toBe("2024-06-01T11:00:00.000Z");
        done();
      },
      error: fail
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/in-progress`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(mockResults);
  });

});
