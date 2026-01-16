import { ExerciseService } from './_services/exercise.service';
import { debounceTime, map } from 'rxjs/operators';
import { ExerciseDTO } from '../workouts/_models/exercise-dto';
import { Subject } from 'rxjs';
import { inject, signal } from '@angular/core';
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
  public firstRecordOffset = signal<number>(1);

  protected _exerciseSvc: ExerciseService = inject(ExerciseService);
  protected _nameFilter = signal<string>('');
  protected _selectedTargetAreas = signal<string[]>([]); 
  protected _destroy$ = new Subject<void>();

  //Signals don't have debounce natively, so we need this ugly bit of code :(
  private _nameFilterForDebounce$ = toObservable(this._nameFilter).pipe(debounceTime(500));
  private _nameFilterForDebounce = toSignal(this._nameFilterForDebounce$);

  protected _exerciseResource = 
    this._exerciseSvc.get(this.firstRecordOffset, this.pageSize, this._nameFilterForDebounce, this._selectedTargetAreas)

  constructor() {
    //TODO: Move to ngOnInit()
    this._exerciseSvc
      .getTargetAreas()
      .pipe(map(areas => areas.map(targetArea => targetArea.name)))
      .subscribe({
        next: (targetAreaNames: string[]) => {
         this.targetAreas.set(targetAreaNames);
        },
        error: (error: HttpErrorResponse) => window.alert("An error occurred getting exercises: " + error.message)
      });
  }

  public targetAreasFilterChange(selectedTargetAreas: string[]): void {
    console.log("targetAreasFilterChange: ", selectedTargetAreas);
    this._selectedTargetAreas.set(selectedTargetAreas);
  }

  public updateQueryParams(params: NzTableQueryParams): void {
    //These are from the table. The filters are declared external to it.
    const { pageSize, pageIndex } = params;
    this.firstRecordOffset.set((pageIndex - 1) * pageSize);
    this.pageSize.set(pageSize);
  }

}
