import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { User } from 'app/core/models/user';
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

  public totalRecords: number;
  public loading: boolean = true;
  public pageSize: number = 10;
  public executedWorkouts: ExecutedWorkoutDTO[];
  public cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type

  private _userId: number = null;

  constructor(
    private _executedWorkoutService: ExecutedWorkoutService, 
    private _userService: UserService) {}

  public ngOnInit(): void {

    this._userService.currentUserInfo.subscribe((user: User) => { 
      this._userId = user?.id; 
      this.getExecutedWorkouts(0, null);
    });
  
  }

  public getExecutedWorkouts(first: number, nameContains: string): void {

    this.totalRecords = 0;

    this._executedWorkoutService.getFilteredSubset(this._userId, first, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe(
          (results: PaginatedResults<ExecutedWorkoutDTO>) => {
              this.executedWorkouts = results.results;
              this.totalRecords = results.totalCount;
          }, 
          (error: any) => window.alert("An error occurred getting exercises: " + error)
      );
  }

  public getExecutedWorkoutsLazy(event: any): void {
    if (this._userId != null) {

      /*
      let nameContains: string;

      if (event.filters["name"])
        nameContains = event.filters["name"].value;
      */

      this.getExecutedWorkouts(event.first, null);
    }
  }  

}
