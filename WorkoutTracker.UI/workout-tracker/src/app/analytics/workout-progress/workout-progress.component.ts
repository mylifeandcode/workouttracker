import { Component, OnInit } from '@angular/core';
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

  constructor(private _analyticsService: AnalyticsService) { }

  ngOnInit(): void {
  }

  public workoutsLoaded(): void {
    this.loadingData = false;
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
        this.setupChartData();
      });
  }

  private setupChartData(): void {
    this.chartData = this._analyticsService.getChartData(this.metrics);
  }
}
