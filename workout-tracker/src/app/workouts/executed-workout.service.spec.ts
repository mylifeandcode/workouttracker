import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from 'app/core/config.service';
import { PaginatedResults } from 'app/core/models/paginated-results';

import { ExecutedWorkoutService } from './executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from './models/executed-workout-summary-dto';

const API_ROOT_URL: string = "http://localhost:5600/api/";

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue(API_ROOT_URL);
}

describe('ExecutedWorkoutService', () => {
  let service: ExecutedWorkoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExecutedWorkoutService, 
        {
          provide: ConfigService, 
          useClass: ConfigServiceMock
        }
      ],
      imports :[
        HttpClientTestingModule
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
      .subscribe((response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
        //ASSERT
        expect(response).toEqual(expectedResults);
        done();
      }, 
      fail
    );

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=10&pageSize=50`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
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
      .subscribe((response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
        //ASSERT
        expect(response).toEqual(expectedResults);
        done();
      }, 
      fail
    );

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/planned?firstRecord=20&pageSize=10`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should get recent executed workouts', (done: DoneFn) => {
    //ARRANGE
    const expectedResults = new PaginatedResults<ExecutedWorkoutSummaryDTO>();
    expectedResults.results = new Array<ExecutedWorkoutSummaryDTO>(1);
    expectedResults.results.push(new ExecutedWorkoutSummaryDTO());
    expectedResults.totalCount = 1;

    //ACT
    service.getRecent().subscribe(
      (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts).toEqual(expectedResults.results);
        done();
      },
      fail
    );

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout?firstRecord=0&pageSize=5`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

  it('should get in-progress workouts', (done: DoneFn) => {
    //ARRANGE
    const expectedResults: ExecutedWorkoutSummaryDTO[] = [];
    expectedResults.push(...[new ExecutedWorkoutSummaryDTO(), new ExecutedWorkoutSummaryDTO()]);

    //ACT
    service.getInProgress().subscribe(
      (recentWorkouts: ExecutedWorkoutSummaryDTO[]) => {
        //ASSERT
        expect(recentWorkouts).toEqual(expectedResults);
        done();
      },
      fail
    );

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT_URL}executedworkout/in-progress`);
    expect(req.request.method).toEqual('GET');

    //Respond with the mock results
    req.flush(expectedResults);
  });

});
