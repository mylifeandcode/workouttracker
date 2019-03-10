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
    //ARRANGE
    const exercises = new PaginatedResults<Exercise>();
    const req = httpMock.expectOne(this.API_ROOT);
    req.flush(exercises);

    //ACT
    let result = service.getAll(0, 1);

    //ASSERT
    expect(result).toBe(exercises);
  }));

});
