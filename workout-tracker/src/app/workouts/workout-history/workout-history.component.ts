import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-dto';

//TODO: This is similar to WorkoutsListComponent. Find a way to consolidate/reuse code.

@Component({
  selector: 'wt-workout-history',
  templateUrl: './workout-history.component.html',
  styleUrls: ['./workout-history.component.scss']
})
export class WorkoutHistoryComponent implements OnInit {

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public executedWorkouts: ExecutedWorkoutSummaryDTO[];
  public showNotesModal: boolean = false;
  public notes: string = '';
  public cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type


  constructor(
    private _executedWorkoutService: ExecutedWorkoutService) {

  }

  public ngOnInit(): void {
  }

  public getExecutedWorkouts(first: number, nameContains: string | null): void {

    //this.totalRecords = 0;
    //TODO: Refactor. Get user ID in API from token.
    this._executedWorkoutService.getFilteredSubset(first, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe(
          (results: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
              this.executedWorkouts = results.results;
              console.log('executedWorkouts: ', this.executedWorkouts);
              this.totalRecords = results.totalCount;
          },
          (error: any) => window.alert("An error occurred getting executed workouts: " + error)
      );
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
