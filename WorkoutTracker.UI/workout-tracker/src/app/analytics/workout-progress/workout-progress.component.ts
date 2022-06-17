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
    //TODO: Configure
    this.chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
          {
              label: 'First Dataset',
              data: [65, 59, 80, 81, 56, 55, 40],
              borderColor: '#42A5F5'
          },
          {
              label: 'Second Dataset',
              data: [28, 48, 40, 19, 86, 27, 90],
              borderColor: '#FFA726'
          }
      ]
    };    
  }
}
