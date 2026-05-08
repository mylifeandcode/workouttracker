import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NzTableFilterList, NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';

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

  public statusFilter: NzTableFilterList = [
    { text: 'Active Only', value: 'ActiveOnly', byDefault: true }  
  ];

  protected nameFilter = signal('');
  protected nameFilterVisible = signal(false);
  protected filterByActiveOnly = signal(true);
  protected sortAscending = signal(true);
  protected pageIndex = signal<number>(1);
  protected pageSize = signal<number>(10);

  public onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;

    //With nzFilterMultiple=true, value is always an array
    const activeFilter = filter.find(f => f.key === 'active');
    const activeOnly = activeFilter?.value?.includes('ActiveOnly') ?? false;    
    const currentSort = sort.find(item => item.value !== null);
    const sortAscending = currentSort?.value !== 'descend';

    this.filterByActiveOnly.set(activeOnly);
    this.sortAscending.set(sortAscending);
    this.pageSize.set(pageSize);
    this.pageIndex.set(pageIndex); 

    this.getWorkouts(((pageIndex - 1) * pageSize), pageSize, activeOnly, sortAscending, this.nameFilter());
  }

  public reset(): void {
    this.nameFilter.set('');
    this.search();
  }

  public search(): void {
    this.nameFilterVisible.set(false);
    this.pageIndex.set(1);
    this.getWorkouts(0, this.pageSize(), this.filterByActiveOnly(), this.sortAscending(), this.nameFilter());
  }

  public retireWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to retire workout "${workoutName}"?`)) {
      this.loading.set(true);
      this._workoutSvc.retire(workoutPublicId)
        .pipe(finalize(() => { this.loading.set(false); }))
        .subscribe({
          next: () => {
            this.pageIndex.set(1);
            this.getWorkouts(0, this.pageSize(), this.filterByActiveOnly(), this.sortAscending(), this.nameFilter());
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
            this.getWorkouts(0, this.pageSize(), this.filterByActiveOnly(), this.sortAscending(), this.nameFilter());
          },
          error: (error: HttpErrorResponse) => window.alert("An error occurred while reactivating workout: " + error.message)
        });
    }
  }

  private getWorkouts(first: number, pageSize: number = 10, filterByActiveOnly: boolean = true, sortAscending: boolean = true, nameFilter: string = ''): void {
    //this.totalRecords = 0; DO NOT SET THIS -- IT WILL TRIGGER THE PARAMS CHANGE HANDLER AND CALL IT ALL AGAIN WITH THE DEFAULT PARAMS!
    this.loading.set(true);
    this._workoutSvc.getFilteredSubset(first, pageSize, filterByActiveOnly, sortAscending, nameFilter)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (results: PaginatedResultsOfWorkoutDTO) => {
          this.workouts.set(results.results);
          this.totalRecords.set(results.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting workouts: " + error.message)
      });
  }
}
