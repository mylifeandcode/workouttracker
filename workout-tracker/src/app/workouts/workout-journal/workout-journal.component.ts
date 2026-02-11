import { Component, inject, OnInit, signal } from '@angular/core';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExecutedWorkoutSummaryDTO, ExecutedWorkoutSummaryDTOPaginatedResults } from '../../api';

@Component({
  selector: 'wt-workout-journal',
  imports: [NzTableModule, RouterModule, DatePipe],
  templateUrl: './workout-journal.component.html',
  styleUrl: './workout-journal.component.scss',
})
export class WorkoutJournalComponent implements OnInit {

  public totalRecords = signal(0);
  public loading = signal(false);
  public pageSize = signal(10);
  public executedWorkouts = signal<ExecutedWorkoutSummaryDTO[]>([]);

  private readonly _executedWorkoutService = inject(ExecutedWorkoutService);

  public ngOnInit(): void {
    this.loading.set(true);
    this.getExecutedWorkouts(0);
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.getExecutedWorkouts((pageIndex - 1) * pageSize);
  }

  private getExecutedWorkouts(first: number): void {

    this._executedWorkoutService.getFilteredSubset(first, this.pageSize(), null, true)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (results: ExecutedWorkoutSummaryDTOPaginatedResults) => {
          this.executedWorkouts.set(results.results ?? []);
          this.totalRecords.set(results.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting executed workouts: " + error.message)
      });

  }

  

}