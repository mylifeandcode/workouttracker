import { Component, resource, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsService } from '../_services/analytics.service';
import { ExecutedWorkoutsSummary } from '../_models/executed-workouts-summary';

@Component({
  selector: 'wt-analytics-dashboard',
  template: `
    @if (analyticsResource.isLoading()) {
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 text-center pt-4">
            <nz-spin nzTip="Getting data..." nzSize="large"></nz-spin>
          </div>
        </div>
      </div>
    }

    @if (analyticsResource.hasValue()) {
      <h3>Analytics</h3>
      <div class="container-fluid">
        <p>
          You have logged {{analyticsResource.value()!.totalLoggedWorkouts}} workouts since
          {{analyticsResource.value()!.firstLoggedWorkoutDateTime | date:'M/d/yyyy'}}.
        </p>
        <!-- Rest of template -->
      </div>
    }

    @if (analyticsResource.error()) {
      <div class="container-fluid">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error Loading Analytics</h4>
          <p>{{analyticsResource.error()?.message || 'An error occurred'}}</p>
          <button type="button" class="btn btn-outline-danger" (click)="analyticsResource.reload()">
            Try Again
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsDashboardComponent {
  private analyticsService = inject(AnalyticsService);

  // Resource API automatically handles loading, error, and success states
  protected readonly analyticsResource = resource({
    loader: () => this.analyticsService.getExecutedWorkoutsSummary(),
    // Optional: add caching and refresh intervals
    // equal: (a, b) => a?.totalLoggedWorkouts === b?.totalLoggedWorkouts,
    // refreshInterval: 300000 // 5 minutes
  });

  // No need for manual loading states, error handling, or ngOnInit!
}
