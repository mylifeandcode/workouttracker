import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
    imports: [NzSpinModule, DatePipe, KeyValuePipe, ZeroIsBadPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsDashboardComponent implements OnInit {
  // Constants
  private static readonly DEFAULT_ERROR_MESSAGE = "An error has occurred. Please contact an administrator.";

  // Services
  private readonly _analyticsService = inject(AnalyticsService);

  // Signals for reactive state management
  public readonly executedWorkoutsSummary = signal<ExecutedWorkoutsSummary | undefined>(undefined);
  public readonly gettingData = signal<boolean>(true);
  public readonly errorMessage = signal<string | null>(null);

  // Computed signals for derived state
  public readonly hasData = computed(() => 
    !this.gettingData() && this.executedWorkoutsSummary() !== undefined
  );
  public readonly hasError = computed(() => 
    !this.gettingData() && this.errorMessage() !== null
  );
  public readonly isLoading = computed(() => this.gettingData());

  // Computed signals for display data
  public readonly totalWorkouts = computed(() => 
    this.executedWorkoutsSummary()?.totalLoggedWorkouts ?? 0
  );
  public readonly firstWorkoutDate = computed(() => 
    this.executedWorkoutsSummary()?.firstLoggedWorkoutDateTime
  );

  public ngOnInit(): void {
    this.loadAnalyticsData();
  }

  /**
   * Retry loading analytics data
   */
  public retryLoadData(): void {
    this.gettingData.set(true);
    this.errorMessage.set(null);
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    this._analyticsService
      .getExecutedWorkoutsSummary()
      .pipe(
        finalize(() => { 
          this.gettingData.set(false); 
        })
      )
      .subscribe({
        next: (summary: ExecutedWorkoutsSummary) => {
          this.executedWorkoutsSummary.set(summary);
          this.errorMessage.set(null); // Clear any previous errors
        },
        error: (error: any) => {
          const errorMsg = error.error || AnalyticsDashboardComponent.DEFAULT_ERROR_MESSAGE;
          this.errorMessage.set(errorMsg);
          this.executedWorkoutsSummary.set(undefined); // Clear any stale data
        }
      });
  }
}
