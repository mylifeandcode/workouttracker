import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExerciseService } from './exercise.service';
import { Exercise, ExerciseDTOPaginatedResults } from '../../api';
import { ConfigService } from '../../core/_services/config/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';
import { firstValueFrom } from 'rxjs';
import { type Mocked } from 'vitest';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let http: HttpTestingController;

  beforeEach(() => {
    const MockConfigService: Partial<Mocked<ConfigService>> = {
      get: vi.fn().mockReturnValue("http://localhost:5600/api/")
    };

    const MockDateSerializationService: Partial<Mocked<DateSerializationService>> = {
      convertAuditDateStringsToDates: vi.fn().mockImplementation((obj: Exercise) => {
        console.log('MockDateSerializationService called with object:', obj);
        if (obj.createdDateTime && typeof obj.createdDateTime === 'string') {
          obj.createdDateTime = new Date(obj.createdDateTime);
        }

        if (obj.modifiedDateTime && typeof obj.modifiedDateTime === 'string') {
          obj.modifiedDateTime = new Date(obj.modifiedDateTime);
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

    service = TestBed.inject(ExerciseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be creatable', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve exercises', async () => {
    //Testing with ViTest is a bit different than it had been with Jasmine/Karma.
    //Revised approach from the official Angular docs here: https://angular.dev/guide/http/testing#expecting-and-answering-requests
    const expectedResults = <ExerciseDTOPaginatedResults>{ results: [], totalCount: 0 };
    const exercisesPromise = firstValueFrom(service.getAll(0, 10));

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
    expect(await exercisesPromise).toEqual(expectedResults);
  });

  it('should convert date strings to Date objects when getting all exercises', async () => {
    const mockResults = [
      {
        createdDateTime: "2024-01-01T12:00:00Z",
        modifiedDateTime: "2024-01-02T12:00:00Z"
      }
    ];
    const exercisesPromise = firstValueFrom(service.getAll(0, 10));

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10");
    expect(req.request.method).toEqual('GET');

    req.flush({ results: mockResults, totalRecords: 1 });
    const exercises = await exercisesPromise;
    expect(exercises.results.length).toBe(1);
    expect(exercises.results[0].createdDateTime).toBeInstanceOf(Date);
    expect(exercises.results[0].createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(exercises.results[0].modifiedDateTime).toBeInstanceOf(Date);
    expect(exercises.results[0].modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");
  });

  it('should retrieve exercises with the nameContains param', async () => {
    const expectedResults = <ExerciseDTOPaginatedResults>{ results: [], totalCount: 0 };
    const exercisesPromise = firstValueFrom(service.getAll(0, 10, 'Press'));

    // ExerciseService should have made one request to GET exercises from expected URL
    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&nameContains=Press");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
    expect(await exercisesPromise).toEqual(expectedResults);
  });

  it('should retrieve exercises with the targetAreaContains param', async () => {
    const expectedResults = <ExerciseDTOPaginatedResults>{ totalCount: 0, results: [] };
    const exercisesPromise = firstValueFrom(service.getAll(0, 10, null, ['Chest']));

    const req = http.expectOne("http://localhost:5600/api/exercises?firstRecord=0&pageSize=10&hasTargetAreas=Chest");
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResults);
    expect(await exercisesPromise).toEqual(expectedResults);
  });

  it('should retrieve exercise by ID', async () => {

    const expectedExercise = <Exercise>{};
    const exercisePromise = firstValueFrom(service.getById('5'));

    const req = http.expectOne("http://localhost:5600/api/exercises/5"); //TODO: Refactor
    expect(req.request.method).toEqual('GET');

    req.flush(expectedExercise);
    expect(await exercisePromise).toEqual(expectedExercise);
  });

  it('should convert date strings to Date objects when getting exercise by ID', async () => {
    const mockExercise = {
      createdDateTime: "2024-01-01T12:00:00Z",
      modifiedDateTime: "2024-01-02T12:00:00Z"
    };
    const exercisePromise = firstValueFrom(service.getById('5'));

    const req = http.expectOne("http://localhost:5600/api/exercises/5");
    expect(req.request.method).toEqual('GET');

    req.flush(mockExercise);
    const exercise = await exercisePromise;
    console.log(exercise);
    expect(exercise.createdDateTime).toBeInstanceOf(Date);
    expect(exercise.createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(exercise.modifiedDateTime).toBeInstanceOf(Date);
    expect(exercise.modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");
  });

  it('should create new exercise', async () => {
    const exercise = <Exercise>{};
    const exercisePromise = firstValueFrom(service.add(exercise));

    const req = http.expectOne("http://localhost:5600/api/exercises"); //TODO: Refactor
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(exercise);

    req.flush(exercise);
    expect(await exercisePromise).toEqual(exercise);
  });

  it('should convert date strings to Date objects when creating new exercise', async () => {
    const mockExercise = {
      createdDateTime: "2024-01-01T12:00:00Z",
      modifiedDateTime: "2024-01-02T12:00:00Z"
    };

    let result: Exercise = <Exercise>{};
    const exercisePromise = firstValueFrom(service.add(<Exercise>{}));

    const req = http.expectOne("http://localhost:5600/api/exercises");
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(<Exercise>{});

    req.flush(mockExercise);

    const exercise = await exercisePromise;
    result = exercise;
    expect(result.createdDateTime).toBeInstanceOf(Date);
    expect(result.createdDateTime?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(result.modifiedDateTime).toBeInstanceOf(Date);
    expect(result.modifiedDateTime?.toISOString()).toBe("2024-01-02T12:00:00.000Z");

  });

  it('should update existing exercise', async () => {
    const exercise = <Exercise>{};
    exercise.id = 6;

    const exercisePromise = firstValueFrom(service.update(exercise));

    const req = http.expectOne(`http://localhost:5600/api/exercises`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(exercise);

    req.flush(exercise);
    expect(await exercisePromise).toEqual(exercise);
  });
});
