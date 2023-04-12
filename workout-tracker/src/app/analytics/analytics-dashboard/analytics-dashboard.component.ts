import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnalyticsService } from '../analytics.service';
import { ExecutedWorkoutsSummary } from '../models/executed-workouts-summary';

@Component({
  selector: 'wt-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {

  public executedWorkoutsSummary: ExecutedWorkoutsSummary | undefined;
  public gettingData: boolean = true; //Default to true -- we'll get data on init
  public errorMessage: string | null = null;

  constructor(private _analyticsService: AnalyticsService) { }

  public ngOnInit(): void {
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
