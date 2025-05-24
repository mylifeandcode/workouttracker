import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { debounceTime, finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'wt-workout-list',
    templateUrl: './workout-list.component.html',
    styleUrls: ['./workout-list.component.scss'],
    imports: [FormsModule, NzTableModule, NzIconModule, NzDropDownModule, RouterLink]
})
export class WorkoutListComponent {
  private readonly _workoutSvc = inject(WorkoutService);

  public totalRecords: number = 0;
  public loading: boolean = true;
  public pageIndex: number = 1;
  public workouts: WorkoutDTO[] = [];

  protected _nameFilter = signal('');
  protected _filterByActiveOnly = signal(true);
  protected _pageSize: number = 10;

  //Signals don't have debounce natively, so we need this ugly bit of code :(
  private _nameFilterForDebounce$ = toObservable(this._nameFilter).pipe(debounceTime(500));
  private _nameFilterForDebounce = toSignal(this._nameFilterForDebounce$);

  private _filterChange = effect(() => {
    //Even if the signals weren't referenced here, getWorkouts() references them, 
    //so this effect would run when they change :)
    this.getWorkouts(0, this._pageSize, this._filterByActiveOnly(), this._nameFilterForDebounce());
  });

  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log("Table parameters have changed: ", params);
    const { pageSize, pageIndex, sort, filter } = params;
    this._pageSize = pageSize;
    //const currentSort = sort.find(item => item.value !== null);
    //const sortField = (currentSort && currentSort.key) || null;
    //const sortOrder = (currentSort && currentSort.value) || null;
    this.getWorkouts(((pageIndex - 1) * pageSize), pageSize);
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

  private getWorkouts(first: number, pageSize: number = 10, filterByActiveOnly: boolean = false, nameFilter: string = ''): void {
    console.log("GETTING WORKOUTS: ", first, pageSize);
    //this.totalRecords = 0; DO NOT SET THIS -- IT WILL TRIGGER THE PARAMS CHANGE HANDLER AND CALL IT ALL AGAIN WITH THE DEFAULT PARAMS!
    this.loading = true;
    this._workoutSvc.getFilteredSubset(first, pageSize, filterByActiveOnly, nameFilter)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (results: PaginatedResults<WorkoutDTO>) => {
          this.workouts = results.results;
          this.totalRecords = results.totalCount;
        },
        error: (error: any) => window.alert("An error occurred getting workouts: " + error)
      });
  }
}
