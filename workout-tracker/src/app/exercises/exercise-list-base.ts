import { ExerciseService } from './_services/exercise.service';
import { PaginatedResults } from '../core/_models/paginated-results';
import { debounceTime, distinctUntilChanged, finalize, map, takeUntil } from 'rxjs/operators';
import { ExerciseDTO } from '../workouts/_models/exercise-dto';
import { Subject } from 'rxjs';
import { effect, signal } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

export abstract class ExerciseListBase {

  //TODO: Clean up this class (specifically the differing access modifiers below)

  public totalRecords = signal<number>(0);
  public loading = signal<boolean>(true);
  public pageSize = signal<number>(10);
  public exercises = signal<ExerciseDTO[]>([]);
  public targetAreas = signal<string[]>([]);
  protected _nameFilter = signal<string>('');
  protected _selectedTargetAreas = signal<string[]>([]); 
  
  //Signals don't have debounce natively, so we need this ugly bit of code :(
  private _nameFilterForDebounce$ = toObservable(this._nameFilter).pipe(debounceTime(500));
  private _nameFilterForDebounce = toSignal(this._nameFilterForDebounce$);

  private _filterChange = effect(() => {
    //Even if the signals weren't referenced here, getWorkouts() references them, 
    //so this effect would run when they change :)
    this.getExercises(0, this._nameFilterForDebounce() ?? null, this._selectedTargetAreas());
  });

  private _nameFilterChanged$ = new Subject<string>();
  private _destroy$ = new Subject<void>();

  constructor(protected _exerciseSvc: ExerciseService) {
    this._nameFilterChanged$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.handleFilterChange();
      });

    //TODO: Move to ngOnInit()
    this._exerciseSvc
      .getTargetAreas()
      .pipe(map(areas => areas.map(targetArea => targetArea.name)))
      .subscribe({
        next: (targetAreaNames: string[]) => {
          /*
          targetAreaNames.forEach(targetArea => {
            this.targetAreas.push(targetArea);
          });
          */
         this.targetAreas.set(targetAreaNames);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting exercises: " + error.message)
      });
  }

  public getExercises(first: number, nameContains: string | null, targetAreaContains: string[] | null): void {
    this.loading.set(true);
    this._exerciseSvc
      .getAll(first, this.pageSize(), nameContains, targetAreaContains)
      .pipe(finalize(() => {
        setTimeout(() => { this.loading.set(false); }, 500); //TODO: Revisit. Why am I using setTimeout() here?
      }))
      .subscribe({
        next: (exercises: PaginatedResults<ExerciseDTO>) => {
          this.exercises.set(exercises.results);
          this.totalRecords.set(exercises.totalCount);
          //console.log("TOTAL: ", exercises.totalCount);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting exercises: " + error.message)
      });
  }
  
  public nameFilterChange(name: string): void {
    this._nameFilterChanged$.next(name);
  }

  public targetAreasFilterChange(selectedTargetAreas: string[]): void {
    console.log("targetAreasFilterChange: ", selectedTargetAreas);
    this.getExercises(0, null, selectedTargetAreas); //TODO: Add code to take name filter into account
  }

  public getExercisesLazy(params: NzTableQueryParams): void {
    let targetAreaContains: string[] | null = null;

    //These are from the table. The filters are declared external to it.
    const { pageSize, pageIndex } = params;

    if (this._selectedTargetAreas.length > 0) {
      targetAreaContains = this._selectedTargetAreas();
    }

    this.getExercises((pageIndex - 1) * pageSize, this._nameFilter(), targetAreaContains);
  }

  private handleFilterChange(): void {
    this.getExercises(0, this._nameFilter(), this._selectedTargetAreas());
  }
}
