import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutService } from 'app/workouts/workout.service';
import { of } from 'rxjs';
import { AnalyticsService, METRICS_TYPE } from '../analytics.service';
import { AnalyticsChartData } from '../models/analytics-chart-data';
import { ExecutedExerciseMetrics } from '../models/executed-exercise-metrics';
import { ExecutedWorkoutMetrics } from '../models/executed-workout-metrics';

import { WorkoutProgressComponent } from './workout-progress.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

class AnalyticsServiceMock {
  getExerciseChartData = jasmine.createSpy('getExerciseChartData')
    .and.returnValue(of(new AnalyticsChartData()));

  getExecutedWorkoutMetrics = jasmine.createSpy('getExecutedWorkoutMetrics')
    .and.callFake(() => {
      const metrics = new Array<ExecutedWorkoutMetrics>();
      const exercise1Metrics = new ExecutedExerciseMetrics();
      exercise1Metrics.name = "Exercise 1";
      exercise1Metrics.exerciseId = '1';
      const exercise2Metrics = new ExecutedExerciseMetrics();
      exercise2Metrics.name = "Exercise 2";
      exercise2Metrics.exerciseId = '2';
      const exercise3Metrics = new ExecutedExerciseMetrics();
      exercise3Metrics.name = "Exercise 3";
      exercise3Metrics.exerciseId = '3';
      const metric1 = new ExecutedWorkoutMetrics();
      metric1.exerciseMetrics = [];
      metric1.exerciseMetrics.push(exercise1Metrics, exercise2Metrics, exercise3Metrics);
      metrics.push(metric1);
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
      workout1.id = '20';

      const workout2 = new WorkoutDTO();
      workout2.name = "Workout C";
      workout2.id = '30';

      const workout3 = new WorkoutDTO();
      workout3.name = "Workout A";
      workout3.id = '10';

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
    providers: [
        FormBuilder,
        {
            provide: AnalyticsService,
            useClass: AnalyticsServiceMock
        },
        {
            provide: WorkoutService,
            useClass: WorkoutServiceMock
        }
    ],
    imports: [
        ReactiveFormsModule,
        DropdownModule //CUSTOM_ELEMENTS_SCHEMA doesn't compensate for this because my ReactiveForm is using them
        ,
        WorkoutProgressComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA //Needed for p-chart element (ChartJS)
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

  it('should get workout metrics when workout selected', () => {
    //ARRANGE

    //ACT
    component.form.controls.workoutId.setValue('some-id');
    fixture.detectChanges(); //Not really needed for this test, but a good practice

    //ASSERT
    expect(analyticsService.getExecutedWorkoutMetrics).toHaveBeenCalledWith('some-id', component.DEFAULT_WORKOUT_COUNT);
  });

  it('should select exercise from workout', () => {
    //ARRANGE
    component.form.controls.workoutId.setValue('some-workout-id');

    //ACT
    component.form.controls.exerciseId.setValue('some-exercise-id');
    fixture.detectChanges();

    //ASSERT
    expect(analyticsService.getExerciseChartData).toHaveBeenCalledTimes(3);
    expect(analyticsService.getExerciseChartData).toHaveBeenCalledWith(component.metrics, 'some-exercise-id', METRICS_TYPE.FormAndRangeOfMotion);
  });

  it('should clear analytics data when selected workout changes', () => {
    //ARRANGE
    component.formAndRangeOfMotionChartData = new AnalyticsChartData();
    component.repsChartData = new AnalyticsChartData();
    component.resistanceChartData = new AnalyticsChartData();
    fixture.detectChanges();

    //Let's just be sure that those analytics values aren't null
    expect(component.formAndRangeOfMotionChartData).not.toBeNull();
    expect(component.repsChartData).not.toBeNull();
    expect(component.resistanceChartData).not.toBeNull();

    //ACT
    component.form.controls.workoutId.setValue('new value');
    fixture.detectChanges();

    //ASSERT
    expect(component.formAndRangeOfMotionChartData).toBeNull();
    expect(component.repsChartData).toBeNull();
    expect(component.resistanceChartData).toBeNull();
  });

});
