import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnalyticsService } from '../_services/analytics.service';
import { ExecutedWorkoutsSummary } from '../_models/executed-workouts-summary';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { ZeroIsBadPipe } from '../../shared/pipes/zero-is-bad.pipe';

@Component({
    selector: 'wt-analytics-dashboard',
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.scss'],
    imports: [NzSpinModule, DatePipe, KeyValuePipe, ZeroIsBadPipe]
})
export class AnalyticsDashboardComponent implements OnInit {
  private _analyticsService = inject(AnalyticsService);


  public executedWorkoutsSummary: ExecutedWorkoutsSummary | undefined;
  public gettingData: boolean = true; //Default to true -- we'll get data on init
  public errorMessage: string | null = null;

  public ngOnInit(): void {
    this._analyticsService
      .getExecutedWorkoutsSummary()
      .pipe(
        finalize(() => { this.gettingData = false; })
      )
      .subscribe({
        next: (summary: ExecutedWorkoutsSummary) => {
          this.executedWorkoutsSummary = summary;
        },
        error: (error: any) => {
          this.errorMessage = error.error ? error.error : "An error has occurred. Please contact an administrator.";
        }
      });
  }
}
