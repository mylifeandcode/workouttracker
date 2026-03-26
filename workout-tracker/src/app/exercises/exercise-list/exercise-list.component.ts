import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ExerciseService } from '../_services/exercise.service';
import { ExerciseDTO, ExerciseDTOPaginatedResults } from '../../api';
import { finalize, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
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

  public totalRecords = signal<number>(0);
  public loading = signal<boolean>(true);
  public exercises = signal<ExerciseDTO[]>([]);
  public targetAreaFilters = signal<NzTableFilterList>([]);
  public tableSetupFinished = signal(false);

  //Less than ideal to have this be public
  public pageIndex = signal<number>(1);

  protected pageSize = signal<number>(10);
  protected nameFilter = signal('');
  protected nameFilterVisible = signal(false);

  private _previousTargetAreaFilter: string[] | null = null;


  public ngOnInit(): void {
    this._exerciseSvc
      .getTargetAreas()
      .pipe(
        map(areas => areas.map(area => ({ text: area.name, value: area.name })))
      )
      .subscribe({
        next: (filters: NzTableFilterList) => {
          this.targetAreaFilters.set(filters);
          this.tableSetupFinished.set(true);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting target areas: " + error.message)
      });
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, filter } = params;
    console.log('pageSize:', pageSize, 'pageIndex:', pageIndex, 'filter:', filter);


    const targetAreaFilter = filter.find(f => f.key === 'targetAreas');
    const selectedTargetAreas: string[] | null =
      targetAreaFilter?.value?.length ? targetAreaFilter.value : null;

    if (JSON.stringify(selectedTargetAreas) !== JSON.stringify(this._previousTargetAreaFilter)) {
      this.pageIndex.set(1);
      this._previousTargetAreaFilter = selectedTargetAreas;
    }

    //this.pageSize.set(pageSize);
    //this.pageIndex.set(pageIndex);

    this.getExercises((pageIndex - 1) * pageSize, this.nameFilter(), selectedTargetAreas);
  }

  public search(): void {
    this.nameFilterVisible.set(false);
    this.pageIndex.set(1);
    this.getExercises(0, this.nameFilter(), this.getActiveTargetAreaFilter());
  }

  public reset(): void {
    this.nameFilter.set('');
    this.search();
  }

  private getExercises(first: number, nameContains: string | null, targetAreaContains: string[] | null): void {
    this.loading.set(true);
    this._exerciseSvc
      .getAll(first, this.pageSize(), nameContains, targetAreaContains)
      .pipe(finalize(() => {
        this.loading.set(false);
      }))
      .subscribe({
        next: (exercises: ExerciseDTOPaginatedResults) => {
          this.exercises.set(exercises.results);
          this.totalRecords.set(exercises.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting exercises: " + error.message)
      });
  }

  private getActiveTargetAreaFilter(): string[] | null {
    const active = this.targetAreaFilters().filter(f => f.byDefault);
    return active.length ? active.map(f => f.value as string) : null;
  }
}
