import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { UserService } from 'app/core/user.service';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';

//TODO: This is similar to WorkoutsListComponent. Find a way to consolidate/reuse code.

@Component({
  selector: 'wt-workout-history',
  templateUrl: './workout-history.component.html',
  styleUrls: ['./workout-history.component.css']
})
export class WorkoutHistoryComponent implements OnInit {

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public executedWorkouts: ExecutedWorkoutDTO[];
  public cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type


  constructor(
    private _executedWorkoutService: ExecutedWorkoutService,
    private _userService: UserService) {

  }

  public ngOnInit(): void {
  }

  public getExecutedWorkouts(first: number, nameContains: string): void {

    //this.totalRecords = 0;

    if(this._userService.currentUserId != null) {

      this._executedWorkoutService.getFilteredSubset(this._userService.currentUserId, first, this.pageSize)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe(
            (results: PaginatedResults<ExecutedWorkoutDTO>) => {
                this.executedWorkouts = results.results;
                console.log('executedWorkouts: ', this.executedWorkouts);
                this.totalRecords = results.totalCount;
            },
            (error: any) => window.alert("An error occurred getting executed workouts: " + error)
        );

    }
  }

  public getExecutedWorkoutsLazy(event: any): void {
    this.getExecutedWorkouts(event.first, null);
  }

}
