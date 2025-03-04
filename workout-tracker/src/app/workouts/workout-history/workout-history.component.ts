import { Component, OnInit, inject } from '@angular/core';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { SharedModule } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';

//TODO: This is similar to WorkoutsListComponent. Find a way to consolidate/reuse code.

@Component({
    selector: 'wt-workout-history',
    templateUrl: './workout-history.component.html',
    styleUrls: ['./workout-history.component.scss'],
    imports: [NzTableModule, SharedModule, RouterLink, TooltipModule, DialogModule, ButtonDirective, DatePipe]
})
export class WorkoutHistoryComponent implements OnInit {
  private _executedWorkoutService = inject(ExecutedWorkoutService);

  public totalRecords: number = 0;
  public loading: boolean = false;
  public pageSize: number = 10;
  public executedWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public showNotesModal: boolean = false;
  public notes: string = '';
  public cols: any = [
    { field: 'name', header: 'Name' }
  ];

  public ngOnInit(): void {
    this.loading = true;
    this.getExecutedWorkouts(0, null);
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

  public getExecutedWorkoutsLazy(event: any): void {
    this.getExecutedWorkouts(event.first, null);
  }

  public openNotesModal(notes: string): void {
    this.notes = notes;
    this.showNotesModal = true;
  }

  public closeNotesModal(): void {
    this.showNotesModal = false;
  }

}
