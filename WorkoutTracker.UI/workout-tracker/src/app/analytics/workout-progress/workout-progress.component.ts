import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
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

  public workoutSelected(workoutId: number): void {
    this.loadingData = true;
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

  public metricChange(metricType: number): void {
    this.setupChartData(Number(metricType));
  }

  private setupChartData(chartDataType: number): void {
    this.chartData = this._analyticsService.getChartData(this.metrics, chartDataType);
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this.loadingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = _.sortBy(result.results, 'name');
      });
  }  
}
