import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExerciseService } from './exercise.service';
import { PaginatedResults } from 'app/models/paginated-results';
import { Exercise } from 'app/models/exercise';

describe('ExerciseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExerciseService], 
      imports :[
        HttpClientTestingModule
      ]
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be creatable', inject([ExerciseService], (service: ExerciseService) => {
    expect(service).toBeTruthy();
  }));

  it('should retrieve exercises', inject([HttpTestingController, ExerciseService], (httpMock: HttpTestingController, service: ExerciseService) => {

    const expectedResults = new PaginatedResults<Exercise>();

    service.getAll(0, 10).subscribe(
      exercises => expect(exercises).toEqual(expectedResults, 'should return expected results'),
      fail
    );

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = httpMock.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10"); //TODO: Refactor
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);    

  }));

  it('should create new exercise', inject([HttpTestingController, ExerciseService], (httpMock: HttpTestingController, service: ExerciseService) => {

    let exercise = new Exercise();

    service.add(exercise).subscribe(
      result => expect(result).toEqual(exercise, 'should return newly created exercise'),
      fail
    );

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = httpMock.expectOne("http://localhost:5600/api/exercises"); //TODO: Refactor
    expect(req.request.method).toEqual('POST');

    // Respond with the mock results
    req.flush(exercise);    

  }));

});
