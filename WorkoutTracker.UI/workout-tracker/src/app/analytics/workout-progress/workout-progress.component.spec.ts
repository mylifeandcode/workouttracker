import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutService } from 'app/workouts/workout.service';
import { of } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsChartData } from '../models/analytics-chart-data';
import { ExecutedExerciseMetrics } from '../models/executed-exercise-metrics';
import { ExecutedWorkoutMetrics } from '../models/executed-workout-metrics';

import { WorkoutProgressComponent } from './workout-progress.component';

class AnalyticsServiceMock {
  getExerciseChartData = jasmine.createSpy('getExerciseChartData')
    .and.returnValue(of(new AnalyticsChartData()));

  getExecutedWorkoutMetrics = jasmine.createSpy('getExecutedWorkoutMetrics')
    .and.callFake(() => {
      const metrics = new ExecutedWorkoutMetrics();
      const exercise1Metrics = new ExecutedExerciseMetrics();
      exercise1Metrics.name = "Exercise 1";
      exercise1Metrics.exerciseId = 1;
      const exercise2Metrics = new ExecutedExerciseMetrics();
      exercise2Metrics.name = "Exercise 2";
      exercise2Metrics.exerciseId = 2;
      const exercise3Metrics = new ExecutedExerciseMetrics();
      exercise3Metrics.name = "Exercise 3";
      exercise3Metrics.exerciseId = 3;
      metrics.exerciseMetrics = [];
      metrics.exerciseMetrics.push(exercise1Metrics, exercise2Metrics, exercise3Metrics);
      return of(metrics);
    });
}

class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset')
    .and.callFake(() => {
      const result = new PaginatedResults<WorkoutDTO>();
      result.results = [];

      const workout1 = new WorkoutDTO();
      workout1.name = "Workout B";
      workout1.id = 20;

      const workout2 = new WorkoutDTO();
      workout2.name = "Workout C";
      workout2.id = 30;

      const workout3 = new WorkoutDTO();
      workout3.name = "Workout A";
      workout3.id = 10;

      result.results.push(workout1, workout2, workout3);

      result.totalCount = 0;
      return of(result);
    });
}

describe('WorkoutProgressComponent', () => {
  let component: WorkoutProgressComponent;
  let fixture: ComponentFixture<WorkoutProgressComponent>;
  let analyticsService: AnalyticsService;
  let workoutService: WorkoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutProgressComponent ],
      providers: [
        {
          provide: AnalyticsService,
          useClass: AnalyticsServiceMock
        },
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutProgressComponent);
    component = fixture.componentInstance;

    analyticsService = TestBed.inject(AnalyticsService);
    workoutService = TestBed.inject(WorkoutService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    expect(workoutService.getFilteredSubset).toHaveBeenCalledOnceWith(0, 500, true);
    expect(component.workouts.length).toBe(3);
    expect(component.workouts[0].name).toBe("Workout A");
    expect(component.workouts[1].name).toBe("Workout B");
    expect(component.workouts[2].name).toBe("Workout C");
  });

  it('should select workout', () => {
    const workoutDefinitionsSelect: HTMLSelectElement = fixture.nativeElement.querySelector('#workoutDefinitions');
    workoutDefinitionsSelect.selectedIndex = 0;
    workoutDefinitionsSelect.dispatchEvent(new Event('change'));

    const exercisesSelect: HTMLSelectElement = fixture.nativeElement.querySelector('#exercises');
    exercisesSelect.selectedIndex = 0;
    exercisesSelect.dispatchEvent(new Event('change'));

  });

});
