import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'wt-workout-list',
    templateUrl: './workout-list.component.html',
    styleUrls: ['./workout-list.component.scss'],
    imports: [FormsModule, NzTableModule, NzIconModule, NzDropDownModule, RouterLink]
})
export class WorkoutListComponent implements OnInit {
  private _workoutSvc = inject(WorkoutService);


  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public workouts: WorkoutDTO[] = [];


  public workoutNameFilterVisible: boolean = false;

  protected _nameFilter = signal('');
  protected _filterByActiveOnly = signal(true);
  protected _filterChange = effect(() => {
    this.getWorkouts(0);
  });

  public filterStatus = [
    { text: 'Active Only', value: [true], byDefault: true }
  ];

  public ngOnInit(): void {
    //this.loading = true;
    //this.getWorkouts(0);
  }

  public getWorkouts(first: number): void {
    this.totalRecords = 0;
    this.loading = true;
    this._workoutSvc.getFilteredSubset(first, 10, this._filterByActiveOnly(), this._nameFilter())
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
    /*
    if (event?.filters["name"])
      this._nameFilter = event.filters["name"].value;
    else
      this._nameFilter = null;

    if (event?.filters["activeOnly"])
      this._filterByActiveOnly = event.filters["activeOnly"].value;
    else
      this._filterByActiveOnly = true;
    */
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

  /*
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
  */

  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log("Table parameters have changed: ", params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    //this._filterByActiveOnly = filter.indexOf((filterItem) => filterItem.key == 'active') > -1 ? true : false;
    //this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
    this.getWorkouts((pageIndex - 1) * pageSize);
  }  

  public reset(): void {
    this._nameFilter.set('');
    this.search();
  }

  public search(): void {
    this.workoutNameFilterVisible = false;
    this.getWorkouts(0);
  }

  public filterTableByWorkoutName(): void {

  }

  public filterTableByWorkoutStatus(): void {

  }

}
