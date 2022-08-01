import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutService } from 'app/workouts/workout.service';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { AnalyticsService, METRICS_TYPE } from '../analytics.service';
import { AnalyticsChartData } from '../models/analytics-chart-data';
import { ExecutedWorkoutMetrics } from '../models/executed-workout-metrics';

@Component({
  selector: 'wt-workout-progress',
  templateUrl: './workout-progress.component.html',
  styleUrls: ['./workout-progress.component.css']
})
export class WorkoutProgressComponent implements OnInit {

  public loadingData: boolean = true;
  public metrics: ExecutedWorkoutMetrics[];
  public formAndRangeOfMotionChartData: AnalyticsChartData;
  public repsChartData: AnalyticsChartData;
  public resistanceChartData: AnalyticsChartData;
  public workouts: WorkoutDTO[];
  public formAndRangeOfMotionChartOptions = { //Type "any" because of ChartJS
    scales: {
        y: {
            ticks: {
                callback: (value: number, index: number, ticks: number) => {
                  //TODO: Leverage RatingPipe for this
                  switch(value) {
                    case 0:
                      return 'N/A';
                    case 1:
                      return 'Bad';
                    case 2:
                      return 'Poor';
                    case 3:
                      return 'OK';
                    case 4:
                      return 'Good';
                    case 5:
                      return 'Excellent';
                    default:
                      return '';
                  }
                }
            }
        }
    }
}

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
        console.log("METRICS: ", this.metrics);
        //this.setupChartData(1);
      });
  }

  public exerciseChange(event: Event): void {
    let exerciseId: number = Number((event.target as HTMLSelectElement).value);
    if (exerciseId == NaN) return;
    this.setupChartData(exerciseId);
  }

  private setupChartData(exerciseId: number): void {
    this.formAndRangeOfMotionChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.FormAndRangeOfMotion);
    this.repsChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.Reps);
    this.resistanceChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.Resistance);
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this.loadingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = _.sortBy(result.results, 'name');
      });
  }  
}
