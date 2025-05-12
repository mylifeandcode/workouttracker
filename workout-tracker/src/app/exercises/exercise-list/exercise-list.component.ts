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
  protected _selectedTargetAreas: string[] = [];

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  constructor() {
    const _exerciseSvc = inject(ExerciseService);

    super(_exerciseSvc);
    this._exerciseSvc = _exerciseSvc;

  }

  public getExercisesLazy(params: NzTableQueryParams): void {
    //console.log("EVENT: ", event);
    let nameContains: string | null = null;
    let targetAreaContains: string[] | null = null;

    const { pageSize, pageIndex, sort, filter } = params;

    /*
    if (event.filters["name"])
      nameContains = event.filters["name"].value;
    */

    if (this._selectedTargetAreas.length > 0) {
      targetAreaContains = this._selectedTargetAreas;
    }

    this.getExercises((pageIndex - 1) * pageSize, nameContains, targetAreaContains);
  }

  public targetAreasFilterChange(selectedTargetAreas: string[]): void {
    console.log("targetAreasFilterChange: ", selectedTargetAreas);
    this.getExercises(0, null, selectedTargetAreas); //TODO: Add code to take name filter into account
  }

  /*
  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    //this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
    this.getExecutedWorkouts((pageIndex - 1) * pageSize, null);
  }
  */
}
