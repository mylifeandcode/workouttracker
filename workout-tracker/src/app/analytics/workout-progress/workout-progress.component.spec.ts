import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutedExerciseMetrics, ExecutedWorkoutMetrics, WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { WorkoutService } from '../../workouts/_services/workout.service';
import { of } from 'rxjs';
import { AnalyticsService, METRICS_TYPE } from '../_services/analytics.service';
import { AnalyticsChartData } from '../_models/analytics-chart-data';

import { WorkoutProgressComponent } from './workout-progress.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { type Mocked } from 'vitest';

describe('WorkoutProgressComponent', () => {
  let component: WorkoutProgressComponent;
  let fixture: ComponentFixture<WorkoutProgressComponent>;

  const analyticsServiceMock: Mocked<Pick<AnalyticsService, 'getExerciseChartData' | 'getExecutedWorkoutMetrics'>> = {
    getExerciseChartData: vi.fn<AnalyticsService['getExerciseChartData']>(() => new AnalyticsChartData()).mockName('getExerciseChartData'),
    getExecutedWorkoutMetrics: vi.fn<AnalyticsService['getExecutedWorkoutMetrics']>(() => {
      const metrics = new Array<ExecutedWorkoutMetrics>();
      const exercise1Metrics = <ExecutedExerciseMetrics>{};
      exercise1Metrics.name = "Exercise 1";
      exercise1Metrics.exerciseId = '1';
      const exercise2Metrics = <ExecutedExerciseMetrics>{};
      exercise2Metrics.name = "Exercise 2";
      exercise2Metrics.exerciseId = '2';
      const exercise3Metrics = <ExecutedExerciseMetrics>{};
      exercise3Metrics.name = "Exercise 3";
      exercise3Metrics.exerciseId = '3';
      const metric1 = <ExecutedWorkoutMetrics>{};
      metric1.exerciseMetrics = [];
      metric1.exerciseMetrics.push(exercise1Metrics, exercise2Metrics, exercise3Metrics);
      metrics.push(metric1);
      return of(metrics);
    }).mockName('getExecutedWorkoutMetrics')
  };
  const workoutServiceMock: Mocked<Pick<WorkoutService, 'getFilteredSubset'>> = {
    getFilteredSubset: vi.fn<WorkoutService['getFilteredSubset']>(() => {
      const result = <PaginatedResultsOfWorkoutDTO>{};
      result.results = [];

      const workout1 = <WorkoutDTO>{};
      workout1.name = "Workout B";
      workout1.id = '20';

      const workout2 = <WorkoutDTO>{};
      workout2.name = "Workout C";
      workout2.id = '30';

      const workout3 = <WorkoutDTO>{};
      workout3.name = "Workout A";
      workout3.id = '10';

      result.results.push(workout1, workout2, workout3);

      result.totalCount = 0;
      return of(result);
    }).mockName('getFilteredSubset')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsServiceMock
        },
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        WorkoutProgressComponent
      ]
    })
      .overrideComponent(WorkoutProgressComponent, {
        remove: { imports: [NzTabsModule, NzSpinModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      }).compileComponents();

    fixture = TestBed.createComponent(WorkoutProgressComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    expect(workoutServiceMock.getFilteredSubset).toHaveBeenCalledTimes(1);
    expect(workoutServiceMock.getFilteredSubset).toHaveBeenCalledWith(0, 500, true);
    expect(component.workouts().length).toBe(3);
    expect(component.workouts()[0].name).toBe("Workout A");
    expect(component.workouts()[1].name).toBe("Workout B");
    expect(component.workouts()[2].name).toBe("Workout C");
  });

  it('should get workout metrics when workout selected', async () => {
    //ARRANGE

    //ACT
    component.form.workoutId().value.set('some-id');
    await fixture.whenStable(); //the effect reacting to workoutId runs asynchronously

    //ASSERT
    expect(analyticsServiceMock.getExecutedWorkoutMetrics).toHaveBeenCalledWith('some-id', component.DEFAULT_WORKOUT_COUNT);
  });

  //TODO: Fix. Not sure why this one is failing.
  it.skip('should select exercise from workout', async () => {
    //ARRANGE
    component.form.workoutId().value.set('some-workout-id');

    //ACT
    component.form.exerciseId().value.set('some-exercise-id');
    await fixture.whenStable();

    //ASSERT
    expect(analyticsServiceMock.getExerciseChartData).toHaveBeenCalledTimes(3);
    expect(analyticsServiceMock.getExerciseChartData).toHaveBeenCalledWith(component.metrics(), 'some-exercise-id', METRICS_TYPE.FormAndRangeOfMotion);
  });

  it('should keep the selected exercise when one is chosen (no effect stomp)', async () => {
    //ARRANGE - select a workout first so metrics load
    component.form.workoutId().value.set('some-workout-id');
    await fixture.whenStable();

    //ACT - select an exercise
    component.form.exerciseId().value.set('some-exercise-id');
    await fixture.whenStable();

    //ASSERT - the reaction effects must not reset it back to ''
    expect(component.form.exerciseId().value()).toBe('some-exercise-id');
  });

  it('should clear analytics data when selected workout changes', async () => {
    //ARRANGE
    component.formAndRangeOfMotionChartData.set(new AnalyticsChartData());
    component.repsChartData.set(new AnalyticsChartData());
    component.resistanceChartData.set(new AnalyticsChartData());
    fixture.detectChanges();

    //Let's just be sure that those analytics values aren't null
    expect(component.formAndRangeOfMotionChartData()).not.toBeNull();
    expect(component.repsChartData()).not.toBeNull();
    expect(component.resistanceChartData()).not.toBeNull();

    //ACT
    component.form.workoutId().value.set('new value');
    await fixture.whenStable();

    //ASSERT
    expect(component.formAndRangeOfMotionChartData()).toBeNull();
    expect(component.repsChartData()).toBeNull();
    expect(component.resistanceChartData()).toBeNull();
  });

});
