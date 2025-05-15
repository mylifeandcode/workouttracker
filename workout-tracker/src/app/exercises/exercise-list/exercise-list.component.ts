import { Component, inject } from '@angular/core';
import { ExerciseService } from 'app/exercises/_services/exercise.service';
import { ExerciseListBase } from '../exercise-list-base';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RouterLink } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'wt-exercise-list',
    templateUrl: './exercise-list.component.html',
    styleUrls: ['./exercise-list.component.scss'],
    imports: [FormsModule, NzSelectModule, NzTableModule, RouterLink]
})
export class ExerciseListComponent extends ExerciseListBase {
  protected _exerciseSvc: ExerciseService;

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  constructor() {
    const _exerciseSvc = inject(ExerciseService);

    super(_exerciseSvc);
    this._exerciseSvc = _exerciseSvc;

  }

  public getExercisesLazy(params: NzTableQueryParams): void {
    let targetAreaContains: string[] | null = null;

    //These are from the table. The filters are declared external to it.
    const { pageSize, pageIndex } = params;

    if (this._selectedTargetAreas.length > 0) {
      targetAreaContains = this._selectedTargetAreas;
    }

    this.getExercises((pageIndex - 1) * pageSize, this.nameFilter, targetAreaContains);
  }

  public targetAreasFilterChange(selectedTargetAreas: string[]): void {
    console.log("targetAreasFilterChange: ", selectedTargetAreas);
    this.getExercises(0, null, selectedTargetAreas); //TODO: Add code to take name filter into account
  }
}
