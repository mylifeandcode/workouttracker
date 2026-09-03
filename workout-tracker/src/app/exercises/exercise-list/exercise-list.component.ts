import { ChangeDetectionStrategy, Component, computed, debounced, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ExerciseService } from '../_services/exercise.service';
import { TargetAreaService } from '../_services/target-area.service';
import { ExerciseDTO  } from '../../api';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { NzTableFilterList, NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  imports: [FormsModule, NzTableModule, NzIconModule, NzDropdownModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseListComponent implements OnInit {
  private readonly _exerciseSvc = inject(ExerciseService);
  private readonly _targetAreaSvc = inject(TargetAreaService);

  //public totalRecords = signal<number>(0);
  public loading = signal<boolean>(true);
  public exercises = signal<ExerciseDTO[]>([]);
  public targetAreaFilters = signal<NzTableFilterList>([]);
  public tableSetupFinished = signal(false);

  protected pageSize = signal<number>(10);
  protected nameFilter = signal('');
  protected nameFilterVisible = signal(false);

  private _tableQuery = signal<NzTableQueryParams | null>(null);

  // Must be declared BEFORE `pageIndex` — field initializers run in order.
  private _debouncedNameFilter = debounced(() => this.nameFilter(), 300);

  protected tableSortAscending = computed(() =>
    this._tableQuery()?.sort.find(s => s.value !== null)?.value !== 'descend');

  protected selectedTargetAreas = computed<string[] | null>(
    () => {
      const filter = this._tableQuery()?.filter.find(f => f.key === 'targetAreas');
      return filter?.value?.length ? filter.value as string[] : null;
    },
    // nzQueryParams emits a fresh params object on *every* change, page changes
    // included, so compare by value or this reads as a new filter each time —
    // which would reset `pageIndex` below on every page click.
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
  );

  //Writable so the table can page it, but reset to page 1 whenever a filter changes.
  //Sourced from the *debounced* name so the reset and the refetch land in the same tick.
  protected pageIndex = linkedSignal<{ name: string; areas: string[] | null }, number>({
    source: () => ({
      name: this._debouncedNameFilter.value(),
      areas: this.selectedTargetAreas()
    }),
    computation: () => 1
  });

  protected firstRecord = computed(() => (this.pageIndex() - 1) * this.pageSize());

  protected resource =
    this._exerciseSvc.getSelection(
      this.firstRecord,
      this.pageSize,
      this._debouncedNameFilter.value,
      this.selectedTargetAreas,
      this.tableSortAscending
    );
  
  public ngOnInit(): void {
    this._targetAreaSvc
      .getAll()
      .pipe(
        map(areas => areas.map(area => ({ text: area.name, value: area.name })))
      )
      .subscribe({
        next: (filters: NzTableFilterList) => {
          this.targetAreaFilters.set(filters);
          this.tableSetupFinished.set(true);
        }
      });
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    this._tableQuery.set(params);
  }

  public reset(): void {
    this.nameFilter.set('');
    //this.search();
  }

  /*
  private getExercises(first: number, nameContains: string | null, targetAreaContains: string[] | null, sortAscending: boolean): void {
    this.loading.set(true);
    this._exerciseSvc
      .getAll(first, this.pageSize(), nameContains, targetAreaContains, sortAscending)
      .pipe(finalize(() => {
        this.loading.set(false);
      }))
      .subscribe({
        next: (exercises: PaginatedResultsOfExerciseDTO) => {
          this.exercises.set(exercises.results);
          this.totalRecords.set(exercises.totalCount);
        }
      });
  }
 
  private getActiveTargetAreaFilter(): string[] | null {
    const active = this.targetAreaFilters().filter(f => f.byDefault);
    return active.length ? active.map(f => f.value as string) : null;
  }
  */
 
}
