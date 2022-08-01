import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from 'app/core/config.service';
import { SetType } from 'app/core/enums/set-type';

import { AnalyticsService, METRICS_TYPE } from './analytics.service';
import { AnalyticsChartData } from './models/analytics-chart-data';
import { ExecutedExerciseMetrics } from './models/executed-exercise-metrics';
import { ExecutedWorkoutMetrics } from './models/executed-workout-metrics';
import { ExecutedWorkoutsSummary } from './models/executed-workouts-summary';

class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue('http://localhost:5600/api/');
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
        }
      ]
    });
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get configuration when constructing', () => {
    const configService = TestBed.inject(ConfigService);
    expect(configService.get).toHaveBeenCalledWith('apiRoot');
  });

  it('should get executed workouts summary', () => {
    const expectedResults = new ExecutedWorkoutsSummary();
    const httpMock = TestBed.inject(HttpTestingController);

    service.getExecutedWorkoutsSummary()
      .subscribe((results: ExecutedWorkoutsSummary) => {
        expect(results).toBe(expectedResults);
      });

    const req = httpMock.expectOne("http://localhost:5600/api/analytics/executed-workouts");
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should get executed workout metrics', () => {
    const expectedResults: ExecutedWorkoutMetrics[] = [];
    const httpMock = TestBed.inject(HttpTestingController);

    service.getExecutedWorkoutMetrics(2, 50)
      .subscribe((results: ExecutedWorkoutMetrics[]) => {
        expect(results).toBe(expectedResults);
      });

    const req = httpMock.expectOne("http://localhost:5600/api/analytics/workout-metrics/2/50"); 
    expect(req.request.method).toEqual('GET');

    // Respond with the mock results
    req.flush(expectedResults);

  });

  it('should get exercise chart data', () => {
    
    //ARRANGE
    //TODO: Create builders for these
    const metrics: ExecutedWorkoutMetrics[] = [];

    const workout1 = new ExecutedWorkoutMetrics();
    workout1.name = "Chest and Arms Mini v2";
    workout1.startDateTime = new Date(2022, 3, 4, 12, 0, 0);
    workout1.endDateTime = new Date(2022, 3, 4, 13, 2, 0);
    workout1.exerciseMetrics = [];
    const workout1Exercise1 = new ExecutedExerciseMetrics();
    workout1Exercise1.averageForm = 4;
    workout1Exercise1.averageRangeOfMotion = 3;
    workout1Exercise1.averageRepCount = 8;
    workout1Exercise1.averageResistanceAmount = 150;
    workout1Exercise1.exerciseId = 6;
    workout1Exercise1.name = "Chest Press with Bands";
    workout1Exercise1.sequence = 0;
    workout1Exercise1.setType = SetType.Repetition;
    workout1.exerciseMetrics.push(workout1Exercise1);
    const workout1Exercise2 = new ExecutedExerciseMetrics();
    workout1Exercise2.averageForm = 5;
    workout1Exercise2.averageRangeOfMotion = 5;
    workout1Exercise2.averageRepCount = 8;
    workout1Exercise2.averageResistanceAmount = 120;
    workout1Exercise2.exerciseId = 7;
    workout1Exercise2.name = "Overhead Triceps Ext. with Bands";
    workout1Exercise2.sequence = 1;
    workout1Exercise2.setType = SetType.Repetition;
    workout1.exerciseMetrics.push(workout1Exercise2);

    const workout2 = new ExecutedWorkoutMetrics();
    workout2.name = "Chest and Arms Mini v2";
    workout2.startDateTime = new Date(2022, 3, 11, 14, 0, 0);
    workout2.endDateTime = new Date(2022, 3, 11, 15, 30, 2);
    workout2.exerciseMetrics = [];
    const workout2Exercise1 = new ExecutedExerciseMetrics();
    workout2Exercise1.averageForm = 2;
    workout2Exercise1.averageRangeOfMotion = 2;
    workout2Exercise1.averageRepCount = 8;
    workout2Exercise1.averageResistanceAmount = 180;
    workout2Exercise1.exerciseId = 6;
    workout2Exercise1.name = "Chest Press with Bands";
    workout2Exercise1.sequence = 0;
    workout2Exercise1.setType = SetType.Repetition;
    workout2.exerciseMetrics.push(workout2Exercise1);
    const workout2Exercise2 = new ExecutedExerciseMetrics();
    workout2Exercise2.averageForm = 4;
    workout2Exercise2.averageRangeOfMotion = 3;
    workout2Exercise2.averageRepCount = 6;
    workout2Exercise2.averageResistanceAmount = 140;
    workout2Exercise2.exerciseId = 7;
    workout2Exercise2.name = "Overhead Triceps Ext. with Bands";
    workout2Exercise2.sequence = 1;
    workout2Exercise2.setType = SetType.Repetition;
    workout2.exerciseMetrics.push(workout2Exercise2);

    metrics.push(workout1, workout2);

    const expectedResults = new AnalyticsChartData();
    expectedResults.labels = [];
    expectedResults.labels[0] = "Mon Apr 04 2022";
    expectedResults.labels[1] = "Mon Apr 11 2022";
    expectedResults.datasets = [];
    expectedResults.datasets.push({ label: 'Form', data: [ 5, 4 ], borderColor: '#0000FF' });
    expectedResults.datasets.push({ label: 'Range of Motion', data: [ 5, 3 ], borderColor: '#DAA520' });
    expectedResults.datasets.push({ label: 'Reps', data: [ 8, 6 ], borderColor: '#7CFC00' });
    expectedResults.datasets.push({ label: 'Resistance', data: [ 120, 140 ], borderColor: '#FF0000' });

    //ACT
    const results: AnalyticsChartData = service.getExerciseChartData(metrics, 7, METRICS_TYPE.FormAndRangeOfMotion);

    console.log("RESULTS: ", results);

    //ASSERT
    expect(results).toEqual(expectedResults);

  });

});
