import { Component, OnInit } from '@angular/core';
import { WorkoutService } from '../workout.service';
import { WorkoutDTO } from 'app/models/workout-dto';
import { PaginatedResults } from '../../core/models/paginated-results';
import { finalize } from 'rxjs/operators';
import { UserService } from 'app/core/user.service';
import { User } from 'app/core/models/user';

@Component({
  selector: 'wt-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css']
})
export class WorkoutListComponent implements OnInit {

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number;
  public loading: boolean = true;
  public pageSize: number = 10;
  public workouts: WorkoutDTO[];
  public cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type

  private _userId: number;

  constructor(private _workoutSvc: WorkoutService, private _userService: UserService) { 
  }

  ngOnInit(): void {
      this._userService.getCurrentUserInfo().subscribe((user: User) => {
        this._userId = user.id;
        this.getWorkouts(0, null);
      });
  }

  public getWorkouts(first: number, nameContains: string): void {
      //this.loading = true;
      this.totalRecords = 0;

      this._workoutSvc.getAll(first, 20, this._userId)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe(
            (results: PaginatedResults<WorkoutDTO>) => {
                this.workouts = results.results;
                this.totalRecords = results.totalCount;
            }, 
            (error: any) => window.alert("An error occurred getting exercises: " + error)
        );
  }

  public getWorkoutsLazy(event: any): void {
      let nameContains: string;

      if (event.filters["name"])
          nameContains = event.filters["name"].value;

      this.getWorkouts(event.first, nameContains);
  }

}
