import { ChangeDetectionStrategy, Component, computed, debounced, inject, linkedSignal, signal } from '@angular/core';
import { WorkoutService } from '../_services/workout.service';
import { RouterLink } from '@angular/router';
import { NzTableFilterList, NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'wt-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
  imports: [FormsModule, NzTableModule, NzIconModule, NzDropdownModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutListComponent {
  private readonly _workoutSvc = inject(WorkoutService);

  public statusFilter: NzTableFilterList = [
    { text: 'Active Only', value: 'ActiveOnly', byDefault: true }  
  ];

  public postInProgress = signal(false);
  protected nameFilter = signal('');
  protected nameFilterVisible = signal(false);
  protected filterByActiveOnly = signal(true);
  protected sortAscending = signal(true);
  protected pageSize = signal<number>(10);

  // Must be declared BEFORE `pageIndex` — field initializers run in order.
  private _debouncedNameFilter = debounced(() => this.nameFilter(), 300);

  //Writable so the table can page it, but reset to page 1 whenever a filter changes.
  //Sourced from the *debounced* name so the reset and the refetch land in the same tick.
  protected pageIndex = linkedSignal<{ name: string, activeOnly: boolean }, number>({
    source: () => ({
      name: this._debouncedNameFilter.value(),
      activeOnly: this.filterByActiveOnly()
    }),
    computation: () => 1
  });

  protected firstRecord = computed(() => (this.pageIndex() - 1) * this.pageSize());
  protected resource =
    this._workoutSvc.getSelection(
      this.firstRecord,
      this.pageSize,
      this.filterByActiveOnly,
      this.sortAscending,
      this._debouncedNameFilter.value
    );  

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
  }

  public reset(): void {
    this.nameFilter.set('');
    this.nameFilterVisible.set(false);
  }

  public retireWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to retire workout "${workoutName}"?`)) {
      this.postInProgress.set(true);
      this._workoutSvc.retire(workoutPublicId)
        .pipe(
          finalize(() => { this.postInProgress.set(false); })
        )
        .subscribe({
          next: () => {
            if (this.pageIndex() != 1)
              this.pageIndex.set(1);
            else
              this.resource.reload();
          }
        });
    }
  }

  public reactivateWorkout(workoutPublicId: string, workoutName: string): void {
    if (window.confirm(`Are you sure you want to reactivate workout "${workoutName}"?`)) {
      this.postInProgress.set(true);
      this._workoutSvc.reactivate(workoutPublicId)
        .pipe(
          finalize(() => { this.postInProgress.set(false); })
        )
        .subscribe({
          next: () => {
            if (this.pageIndex() != 1)
              this.pageIndex.set(1);
            else
              this.resource.reload();
          }
        });
    }
  }

}
