import { Component, OnInit, inject } from '@angular/core';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { SharedModule } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { NzTableModule, NzTableQueryParams, NzTableFilterFn } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

//TODO: This is similar to WorkoutsListComponent. Find a way to consolidate/reuse code.

@Component({
    selector: 'wt-workout-history',
    templateUrl: './workout-history.component.html',
    styleUrls: ['./workout-history.component.scss'],
    imports: [
      SharedModule, RouterLink, DatePipe, FormsModule,
      NzTableModule, NzDropDownModule, NzToolTipModule, NzIconModule, NzModalModule 
    ]
})
export class WorkoutHistoryComponent implements OnInit {
  private _executedWorkoutService = inject(ExecutedWorkoutService);

  public totalRecords: number = 0;
  public loading: boolean = false;
  public pageSize: number = 10;
  public executedWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public showNotesModal: boolean = false;
  public notes: string = '';
  public workoutNameFilter: string = '';
  public workoutNameFilterVisible: boolean = false;

  public ngOnInit(): void {
    this.loading = true;
    this.getExecutedWorkouts(0, null);
  }

  public filterByName($event: Event): void {
    console.log('filterByName: ', $event);
  }

  public getExecutedWorkouts(first: number, nameContains: string | null): void {

    //this.totalRecords = 0;
    //TODO: Refactor. Get user ID in API from token.
    this._executedWorkoutService.getFilteredSubset(first, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (results: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          this.executedWorkouts = results.results;
          //console.log('executedWorkouts: ', this.executedWorkouts);
          this.totalRecords = results.totalCount;
        },
        error: (error: any) => window.alert("An error occurred getting executed workouts: " + error)
      });
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    //this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
    this.getExecutedWorkouts((pageIndex - 1) * pageSize, null);
  }

  public openNotesModal(notes: string): void {
    this.notes = notes;
    this.showNotesModal = true;
  }

  public closeNotesModal(): void {
    this.showNotesModal = false;
  }

  reset(): void {
    this.workoutNameFilter = '';
    this.search();
  }

  search(): void {
    this.workoutNameFilterVisible = false;
    this.getExecutedWorkouts(0, this.workoutNameFilter);
  }
}
