import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExerciseService } from './exercise.service';
import { PaginatedResults } from '../core/models/paginated-results';
import { Exercise } from 'app/workouts/models/exercise';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { ConfigService } from 'app/core/config.service';

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue("http://localhost:5600/api/");
}

//TODO: Refactor this spec to use service vars initialized before each test

describe('ExerciseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExerciseService, 
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
        }
      ],
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

    const expectedResults = new PaginatedResults<ExerciseDTO>();

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

  it('should retrieve exercises with the nameContains param', () => {

    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(ExerciseService);

    const expectedResults = new PaginatedResults<ExerciseDTO>();

    service.getAll(0, 10, 'Press').subscribe(
      exercises => expect(exercises).toEqual(expectedResults, 'should return expected results'),
      fail
    );

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&nameContains=Press");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should retrieve exercises with the targetAreaContains param', () => {

    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(ExerciseService);

    const expectedResults = new PaginatedResults<ExerciseDTO>();

    service.getAll(0, 10, null, ['Chest']).subscribe(
      exercises => expect(exercises).toEqual(expectedResults, 'should return expected results'),
      fail
    );

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&hasTargetAreas=Chest");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });  

  it('should retrieve exercise by ID', inject([HttpTestingController, ExerciseService], (httpMock: HttpTestingController, service: ExerciseService) => {

    const expectedExercise = new Exercise();

    service.getById(5).subscribe(
      exercise => expect(exercise).toEqual(expectedExercise, 'should return expected results'),
      fail
    );

    // ExerciseService should have made one request to GET exercise from expected URL
    const req = httpMock.expectOne("http://localhost:5600/api/exercises/5"); //TODO: Refactor
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedExercise);

  }));

  it('should create new exercise', inject([HttpTestingController, ExerciseService], (httpMock: HttpTestingController, service: ExerciseService) => {

    const exercise = new Exercise();

    service.add(exercise).subscribe(
      (result: Exercise) => expect(result).toEqual(exercise, 'should return newly created exercise'),
      fail
    );

    // ExerciseService should have made one request to POST exercise to expected URL
    const req = httpMock.expectOne("http://localhost:5600/api/exercises"); //TODO: Refactor
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(exercise);

    // Respond with the mock results
    req.flush(exercise);

  }));

  it('should update existing exercise', inject([HttpTestingController, ExerciseService], (httpMock: HttpTestingController, service: ExerciseService) => {

    const exercise = new Exercise();
    exercise.id = 6;

    service.update(exercise).subscribe(
      (result: Exercise) => expect(result).toEqual(exercise, 'should return udpated exercise'),
      fail
    );

    // ExerciseService should have made one request to PUT exercises to expected URL
    const req = httpMock.expectOne(`http://localhost:5600/api/exercises/${exercise.id}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(exercise);

    // Respond with the mock results
    req.flush(exercise);

  }));

});
