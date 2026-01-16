import { TestBed } from '@angular/core/testing';
import { ApplicationRef, provideZonelessChangeDetection, signal } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExerciseService } from './exercise.service';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { Exercise } from '../../workouts/_models/exercise';
import { ExerciseDTO } from '../../workouts/_models/exercise-dto';
import { ConfigService } from '../../core/_services/config/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';

class MockConfigService {
  get = vi.fn().mockReturnValue("http://localhost:5600/api/");
}

class MockDateSerializationService {
  convertAuditDateStringsToDates = vi.fn().mockImplementation((obj: Exercise) => {
    if (obj.createdDateTime && typeof obj.createdDateTime === 'string') {
      obj.createdDateTime = new Date(obj.createdDateTime);
    }

    if (obj.modifiedDateTime && typeof obj.modifiedDateTime === 'string') {
      obj.modifiedDateTime = new Date(obj.modifiedDateTime);
    }

    return obj;
  });
}


describe.only('ExerciseService', () => {
  let service: ExerciseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
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

    //service = TestBed.inject(ExerciseService);
    //http = TestBed.inject(HttpTestingController);
  });

  /*
  afterEach(() => {
    http.verify();
  });

  it('should be creatable', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve exercises', async () => {
    const expectedResults = new PaginatedResults<ExerciseDTO>();

    service.getAll(0, 10).subscribe({
      next: exercises => {
        expect(exercises).toEqual(expectedResults);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
  });

  it('should convert date strings to Date objects when getting all exercises', async () => {
    const mockResults = [
      {
        createdDateTime: "2024-01-01T12:00:00Z",
        modifiedDateTime: "2024-01-02T12:00:00Z"
      }
    ];

    service.getAll(0, 10).subscribe({
      next: exercises => {
        expect(exercises.results.length).toBe(1);
        expect(exercises.results[0].createdDateTime).toBeInstanceOf(Date);
        expect(exercises.results[0].createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
        expect(exercises.results[0].modifiedDateTime).toBeInstanceOf(Date);
        expect(exercises.results[0].modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10");
    expect(req.request.method).toEqual('GET');

    req.flush({ results: mockResults, totalRecords: 1 });
  });

  it('should retrieve exercises with the nameContains param', async () => {
    const expectedResults = new PaginatedResults<ExerciseDTO>();

    service.getAll(0, 10, 'Press').subscribe({
      next: exercises => {
        expect(exercises).toEqual(expectedResults);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&nameContains=Press");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
  });

  it('should retrieve exercises with the targetAreaContains param', async () => {
    const expectedResults = new PaginatedResults<ExerciseDTO>();

    service.getAll(0, 10, null, ['Chest']).subscribe({
      next: exercises => {
        expect(exercises).toEqual(expectedResults);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&hasTargetAreas=Chest");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
  });

  it('should retrieve exercise by ID', async () => {

    const expectedExercise = new Exercise();

    service.getById('5').subscribe({
      next: exercise => {
        expect(exercise).toEqual(expectedExercise);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises/5"); //TODO: Refactor
    expect(req.request.method).toEqual('GET');

    req.flush(expectedExercise);
  });

  it('should convert date strings to Date objects when getting exercise by ID', async () => {
    const mockExercise = {
      createdDateTime: "2024-01-01T12:00:00Z",
      modifiedDateTime: "2024-01-02T12:00:00Z"
    };

    service.getById('5').subscribe({
      next: exercise => {
        expect(exercise.createdDateTime).toBeInstanceOf(Date);
        expect(exercise.createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
        expect(exercise.modifiedDateTime).toBeInstanceOf(Date);
        expect(exercise.modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises/5");
    expect(req.request.method).toEqual('GET');

    req.flush(mockExercise);
  });

  it('should create new exercise', async () => {
    const exercise = new Exercise();

    service.add(exercise).subscribe({
      next: (result: Exercise) => {
        expect(result).toEqual(exercise);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises"); //TODO: Refactor
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(exercise);

    req.flush(exercise);
  });
*/
  it('should get exercises via httpResource', async () => {
    //ARRANGE
    const firstRecOffset = signal(0);
    const pageSize = signal(10);
    const nameContains = signal('Bench');
    const targetAreaContains = signal(['Chest']);
    const results = new PaginatedResults<ExerciseDTO>();

    //ACT
    TestBed.runInInjectionContext(() => { 
      const svc = TestBed.inject(ExerciseService);
      const http = TestBed.inject(HttpTestingController);
      const response = svc.get(firstRecOffset, pageSize, nameContains, targetAreaContains);
      TestBed.inject(ApplicationRef).tick(); //Triggers the httpResource. Not to be confused with fakeAsync's tick().

      http
        .expectOne(`http://localhost:5600/api/exercises?firstRecord=${firstRecOffset()}&pageSize=${pageSize()}&nameContains=${nameContains()}&hasTargetAreas=${targetAreaContains()!.join(',')}`)
        .flush(results);

      //ASSERT
      expect(response.value()).toEqual(results);
      http.verify();
    });
  });

  /*
  it.skip('should convert date strings to Date objects when creating new exercise', () => {
    const mockExercise = {
      createdDateTime: "2024-01-01T12:00:00Z",
      modifiedDateTime: "2024-01-02T12:00:00Z"
    };

    let result: Exercise = new Exercise();

    service.add(new Exercise()).subscribe({
      next: exercise => {
        result = exercise;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne("http://localhost:5600/api/exercises");
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(mockExercise);

    req.flush(mockExercise);

    expect(result.createdDateTime).toBeInstanceOf(Date);
    expect(result.createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(result.modifiedDateTime).toBeInstanceOf(Date);
    expect(result.modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");

  });

  it('should update existing exercise', async () => {
    const exercise = new Exercise();
    exercise.id = 6;

    service.update(exercise).subscribe({
      next: (result: Exercise) => {
        expect(result).toEqual(exercise);
        ;
      },
      error: () => { throw new Error('Test failed'); }
    });

    const req = http.expectOne(`http://localhost:5600/api/exercises`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(exercise);

    req.flush(exercise);
  });
  */
});
