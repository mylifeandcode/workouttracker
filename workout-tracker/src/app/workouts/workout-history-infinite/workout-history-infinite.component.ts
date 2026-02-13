import { Component, inject, OnInit, signal } from '@angular/core';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { finalize } from 'rxjs';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { HttpErrorResponse } from '@angular/common/http';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'wt-workout-history-infinite',
  imports: [InfiniteScrollDirective],
  templateUrl: './workout-history-infinite.component.html',
  styleUrl: './workout-history-infinite.component.scss',
})
export class WorkoutHistoryInfiniteComponent implements OnInit {
  public totalRecords = signal(0);
  public loading = signal(false);
  public pageSize = signal(10);
  public currentPage = signal(0);
  public executedWorkouts = signal<ExecutedWorkoutSummaryDTO[]>([]);

  private _executedWorkoutService = inject(ExecutedWorkoutService);

  public ngOnInit(): void {
    this.getExecutedWorkouts();
  }

  public infiniteScroll(): void {
    this.getExecutedWorkouts();
  }

  private getExecutedWorkouts(): void {
    if (!this.doRecordsRemain() || this.loading()) {
      return;
    }

    this.loading.set(true);
    this._executedWorkoutService.getFilteredSubset(this.currentPage(), this.pageSize(), null)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (results: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          this.executedWorkouts.set([...this.executedWorkouts(), ...results.results]);
          this.totalRecords.set(results.totalCount);
          this.currentPage.set(this.currentPage() + 1);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting executed workouts: " + error.message)
      });
  }

  private doRecordsRemain(): boolean {
    return this.currentPage() == 0 || this.executedWorkouts().length < this.totalRecords();
  }

}