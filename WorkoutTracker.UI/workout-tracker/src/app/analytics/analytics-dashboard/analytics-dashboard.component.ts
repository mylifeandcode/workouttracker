import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnalyticsService } from '../analytics.service';
import { ExecutedWorkoutsSummary } from '../models/executed-workouts-summary';

@Component({
  selector: 'wt-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {

  public executedWorkoutsSummary: ExecutedWorkoutsSummary;
  public gettingData: boolean = false;
  public errorMessage: string | null = null;

  constructor(private _analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.gettingData = true;
    this._analyticsService
      .getExecutedWorkoutsSummary()
      .pipe(
        finalize(() => { this.gettingData = false; })
      )
      .subscribe(
        (summary: ExecutedWorkoutsSummary) => {
          this.executedWorkoutsSummary = summary;
        },
        (error: any) => {
          this.errorMessage = error.error ? error.error : "An error has occurred. Please contact an administrator.";
        }
      );
  }

}
