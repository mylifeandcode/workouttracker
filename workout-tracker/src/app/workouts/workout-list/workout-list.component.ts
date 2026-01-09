import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutDTO } from '../../workouts/_models/workout-dto';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { debounceTime, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'wt-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
  imports: [FormsModule, NzTableModule, NzIconModule, NzDropdownModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutListComponent {
  private readonly _workoutSvc = inject(WorkoutService);

  public totalRecords = signal<number>(0);
  public loading = signal<boolean>(true);
  public workouts = signal<WorkoutDTO[]>([]);

  protected nameFilter = signal('');
  protected filterByActiveOnly = signal(true);
  protected pageIndex = signal<number>(1);
  protected pageSize = signal<number>(10);

  //Signals don't have debounce natively, so we need this ugly bit of code :(
  private _nameFilterForDebounce$ = toObservable(this.nameFilter).pipe(debounceTime(500));
  private _nameFilterForDebounce = toSignal(this._nameFilterForDebounce$);

  /*
  private _filterChange = effect(() => {
    //Even if the signals weren't referenced here, getWorkouts() references them, 
    //so this effect would run when they change :)
    this.pageIndex.set(1);
    this.getWorkouts(0, this.pageSize(), this.filterByActiveOnly(), this._nameFilterForDebounce());
  });
  */

  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log("Table parameters have changed: ", params);

    const { pageSize, pageIndex, sort } = params;
    this.pageSize.set(pageSize);
    this.pageIndex.set(pageIndex); 

    //We're currently only sorting on name, so we can use the first sort index's value directly
    this.getWorkouts(((pageIndex - 1) * pageSize), pageSize, this.filterByActiveOnly(), sort[0]?.value !== 'descend', this.nameFilter());
  }

  public retireWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to retire workout "${workoutName}"?`)) {
      this.loading.set(true);
      this._workoutSvc.retire(workoutPublicId)
        .pipe(finalize(() => { this.loading.set(false); }))
        .subscribe({
          next: () => {
            this.pageIndex.set(1);
            this.getWorkouts(0);
          },
          error: (error: HttpErrorResponse) => window.alert("An error occurred while retiring workout: " + error.message)
        });
    }
  }

  public reactivateWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to reactivate workout "${workoutName}"?`)) {
      this.loading.set(true);
      this._workoutSvc.reactivate(workoutPublicId)
        .pipe(finalize(() => { this.loading.set(false); }))
        .subscribe({
          next: () => {
            this.pageIndex.set(1);
            this.getWorkouts(0);
          },
          error: (error: HttpErrorResponse) => window.alert("An error occurred while reactivating workout: " + error.message)
        });
    }
  }

  private getWorkouts(first: number, pageSize: number = 10, filterByActiveOnly: boolean = true, sortAscending: boolean = true, nameFilter: string = ''): void {
    console.log("GETTING WORKOUTS: ", first, pageSize);
    //this.totalRecords = 0; DO NOT SET THIS -- IT WILL TRIGGER THE PARAMS CHANGE HANDLER AND CALL IT ALL AGAIN WITH THE DEFAULT PARAMS!
    this.loading.set(true);
    this._workoutSvc.getFilteredSubset(first, pageSize, filterByActiveOnly, sortAscending, nameFilter)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (results: PaginatedResults<WorkoutDTO>) => {
          this.workouts.set(results.results);
          this.totalRecords.set(results.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting workouts: " + error.message)
      });
  }
}
