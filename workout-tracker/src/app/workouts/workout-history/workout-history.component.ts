import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { RouterLink } from '@angular/router';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HttpErrorResponse } from '@angular/common/http';

//TODO: This is similar to WorkoutsListComponent. Find a way to consolidate/reuse code.

@Component({
    selector: 'wt-workout-history',
    templateUrl: './workout-history.component.html',
    styleUrls: ['./workout-history.component.scss'],
    imports: [
      RouterLink, DatePipe, FormsModule,
      NzTableModule, NzDropDownModule, NzToolTipModule, NzIconModule, NzModalModule 
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutHistoryComponent implements OnInit {
  private _executedWorkoutService = inject(ExecutedWorkoutService);

  public totalRecords = signal(0);
  public loading = signal(false);
  public pageSize = signal(10);
  public executedWorkouts = signal<ExecutedWorkoutSummaryDTO[]>([]);
  public showNotesModal = signal(false);
  public notes = signal('');
  public workoutNameFilter = signal('');
  public workoutNameFilterVisible = signal(false);

  public ngOnInit(): void {
    this.loading.set(true);
    this.getExecutedWorkouts(0, null);
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    //const { pageSize, pageIndex, sort, filter } = params;
    const { pageSize, pageIndex } = params;
    //const currentSort = sort.find(item => item.value !== null);
    //const sortField = (currentSort && currentSort.key) || null;
    //const sortOrder = (currentSort && currentSort.value) || null;
    //this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
    this.getExecutedWorkouts((pageIndex - 1) * pageSize, this.workoutNameFilter());
  }

  public openNotesModal(notes: string): void {
    this.notes.set(notes);
    this.showNotesModal.set(true);
  }

  public closeNotesModal(): void {
    this.showNotesModal.set(false);
  }

  public reset(): void {
    this.workoutNameFilter.set('');
    this.search();
  }

  public search(): void {
    this.workoutNameFilterVisible.set(false);
    this.getExecutedWorkouts(0, this.workoutNameFilter());
  }

  private getExecutedWorkouts(first: number, nameContains: string | null): void {

    this._executedWorkoutService.getFilteredSubset(first, this.pageSize(), nameContains)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (results: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          this.executedWorkouts.set(results.results);
          this.totalRecords.set(results.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting executed workouts: " + error.message)
      });
  }

}
