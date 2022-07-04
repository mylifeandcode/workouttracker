import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutService } from 'app/workouts/workout.service';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { AnalyticsService } from '../analytics.service';
import { ExecutedWorkoutMetrics } from '../models/executed-workout-metrics';

@Component({
  selector: 'wt-workout-progress',
  templateUrl: './workout-progress.component.html',
  styleUrls: ['./workout-progress.component.css']
})
export class WorkoutProgressComponent implements OnInit {

  public loadingData: boolean = true;
  public metrics: ExecutedWorkoutMetrics[];
  public chartData: any;
  public workouts: WorkoutDTO[];

  constructor(
    private _analyticsService: AnalyticsService, 
    private _workoutService: WorkoutService) { }

  public ngOnInit(): void {
    this.getUserWorkouts();
  }

  public workoutSelected(event: Event): void {
    this.loadingData = true;

    let workoutId = Number((event.target as HTMLSelectElement).value);
    if(workoutId == NaN)
      return

    this._analyticsService.getExecutedWorkoutMetrics(workoutId)
      .pipe(
        finalize(() => {
          this.loadingData = false;
        })
      )
      .subscribe((results: ExecutedWorkoutMetrics[]) => {
        this.metrics = results;
        this.setupChartData(1);
      });
  }

  public exerciseChange(event: Event): void {
    let exerciseId: number = Number((event.target as HTMLSelectElement).value);
    if (exerciseId == NaN) return;
    this.setupChartData(exerciseId);
  }

  private setupChartData(exerciseId: number): void {
    //this.chartData = this._analyticsService.getWorkoutChartData(this.metrics, chartDataType);
    this.chartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId);
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this.loadingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = _.sortBy(result.results, 'name');
      });
  }  
}
