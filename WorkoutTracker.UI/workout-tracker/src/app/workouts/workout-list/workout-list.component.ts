import { Component, OnInit } from '@angular/core';
import { WorkoutService } from '../workout.service';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { PaginatedResults } from '../../core/models/paginated-results';
import { finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

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
    { field: 'name', header: 'Name' }, 
    { field: 'targetAreas', header: 'Target Areas' }, 
    { field: 'active', header: 'Status' }
  ]; //TODO: Create specific type

  private _filterByNameContains: string = null;
  private _filterByActiveOnly: boolean = true;

  constructor(private _workoutSvc: WorkoutService) { 
  }

  ngOnInit(): void {
    this.getWorkouts(0);
  }

  public getWorkouts(first: number): void {
    this.totalRecords = 0;
    this.loading = true;
    this._workoutSvc.getFilteredSubset(first, 20, this._filterByActiveOnly, this._filterByNameContains)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe(
          (results: PaginatedResults<WorkoutDTO>) => {
            this.workouts = results.results;
            this.totalRecords = results.totalCount;
          }, 
          (error: any) => window.alert("An error occurred getting workouts: " + error)
      );
  }

  public getWorkoutsLazy(event: any): void {

    if (event.filters["name"])
      this._filterByNameContains = event.filters["name"].value;
    else
      this._filterByNameContains = null;

    if (event.filters["activeOnly"])
      this._filterByActiveOnly = event.filters["activeOnly"].value;
    else
      this._filterByActiveOnly = true;

    this.getWorkouts(event.first);
  }

  public retireWorkout(workoutId: number, workoutName: string): void {
    if(window.confirm(`Are you sure you want to retire workout "${workoutName}"?`)){
      this.loading = true;
      this._workoutSvc.retire(workoutId)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe(
          (response: HttpResponse<any>) => { 
            this.getWorkouts(0);
          }, 
          (error: any) => window.alert("An error occurred while retiring workout: " + error)
        );
    }
  }

  public reactivateWorkout(workoutId: number, workoutName: string): void {
    if(window.confirm(`Are you sure you want to reactivate workout "${workoutName}"?`)){
      this.loading = true;
      this._workoutSvc.reactivate(workoutId)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe(
          (response: HttpResponse<any>) => { 
            this.getWorkouts(0);
          }, 
          (error: any) => window.alert("An error occurred while reactivating workout: " + error)
        );
    }
  }

}
