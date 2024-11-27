import { Component, OnInit, inject } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'primeng/api';

@Component({
    selector: 'wt-workout-list',
    templateUrl: './workout-list.component.html',
    styleUrls: ['./workout-list.component.scss'],
    imports: [TableModule, SharedModule, RouterLink]
})
export class WorkoutListComponent {
  private _workoutSvc = inject(WorkoutService);


  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public workouts: WorkoutDTO[] = [];
  public cols: any = [
    { field: 'name', header: 'Name' },
    { field: 'targetAreas', header: 'Target Areas' },
    { field: 'active', header: 'Status' }
  ]; //TODO: Create specific type

  private _filterByNameContains: string | null = null;
  private _filterByActiveOnly: boolean = true;

  public getWorkouts(first: number): void {
    this.totalRecords = 0;
    this.loading = true;
    this._workoutSvc.getFilteredSubset(first, 10, this._filterByActiveOnly, this._filterByNameContains)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (results: PaginatedResults<WorkoutDTO>) => {
          this.workouts = results.results;
          this.totalRecords = results.totalCount;
        },
        error: (error: any) => window.alert("An error occurred getting workouts: " + error)
      });
  }

  public getWorkoutsLazy(event: any): void {
    //console.log("GETTING WORKOUTS: ", event);
    if (event?.filters["name"])
      this._filterByNameContains = event.filters["name"].value;
    else
      this._filterByNameContains = null;

    if (event?.filters["activeOnly"])
      this._filterByActiveOnly = event.filters["activeOnly"].value;
    else
      this._filterByActiveOnly = true;

    this.getWorkouts(event.first);
  }

  public retireWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to retire workout "${workoutName}"?`)) {
      this.loading = true;
      this._workoutSvc.retire(workoutPublicId)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe({
          next: (response: HttpResponse<any>) => {
            this.getWorkouts(0);
          },
          error: (error: any) => window.alert("An error occurred while retiring workout: " + error)
        });
    }
  }

  public reactivateWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to reactivate workout "${workoutName}"?`)) {
      this.loading = true;
      this._workoutSvc.reactivate(workoutPublicId)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe({
          next: (response: HttpResponse<any>) => {
            this.getWorkouts(0);
          },
          error: (error: any) => window.alert("An error occurred while reactivating workout: " + error)
        });
    }
  }

  //TODO: Find out if I can consolidate these 2 methods into a generic one and call it from HTML (those brackets may cause problems)
  //TODO: Consolidate these into a service. These are copied from another component. :(
  public filterTableByInput(table: Table, event: Event, filterOn: string, filterType: string = 'in'): void {
    //console.log("EVENT: ", event);
    table.filter((event.target as HTMLInputElement).value, filterOn, filterType);
  }

  public filterTableByActive(table: Table, event: Event): void {
    //console.log("CHECKBOX EVENT: ", event);
    table.filter((event.target as HTMLInputElement).checked, 'activeOnly', 'equals');
  }

}
