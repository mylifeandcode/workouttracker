// Example migration for workout-progress component

import { Component, resource, input } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { AnalyticsService } from '../_services/analytics.service';

@Component({
  selector: 'wt-workout-progress',
  // ... template
})
export class WorkoutProgressComponent {
  private workoutService = inject(WorkoutService);
  private analyticsService = inject(AnalyticsService);

  // Input signals for reactive parameters
  public readonly workoutId = input<string>();
  public readonly workoutCount = input<number>(5);
  public readonly exerciseId = input<string>();

  // Resource for workouts list - loaded once and cached
  protected readonly workoutsResource = resource({
    loader: () => this.workoutService.getFilteredSubset(0, 500, true),
    // Cache workouts for 10 minutes
    equal: (a, b) => a?.results?.length === b?.results?.length
  });

  // Resource for workout metrics - depends on workoutId and workoutCount
  protected readonly metricsResource = resource({
    request: () => ({ 
      workoutId: this.workoutId(), 
      count: this.workoutCount() 
    }),
    loader: ({ request }) => {
      if (!request.workoutId) return Promise.resolve([]);
      return this.analyticsService.getExecutedWorkoutMetrics(
        request.workoutId, 
        request.count
      );
    }
  });

  // Resource for chart data - depends on exerciseId and metrics
  protected readonly chartDataResource = resource({
    request: () => ({ 
      exerciseId: this.exerciseId(),
      metrics: this.metricsResource.value() 
    }),
    loader: ({ request }) => {
      if (!request.exerciseId || !request.metrics?.length) {
        return Promise.resolve(null);
      }
      
      // Generate all chart data at once
      return Promise.resolve({
        formAndRangeOfMotion: this.analyticsService.getExerciseChartData(
          request.metrics, request.exerciseId, METRICS_TYPE.FormAndRangeOfMotion
        ),
        reps: this.analyticsService.getExerciseChartData(
          request.metrics, request.exerciseId, METRICS_TYPE.Reps
        ),
        resistance: this.analyticsService.getExerciseChartData(
          request.metrics, request.exerciseId, METRICS_TYPE.Resistance
        )
      });
    }
  });
}
