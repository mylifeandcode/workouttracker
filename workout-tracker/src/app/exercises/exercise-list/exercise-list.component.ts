import { Component, inject } from '@angular/core';
import { ExerciseService } from 'app/exercises/_services/exercise.service';
import { ExerciseListBase } from '../exercise-list-base';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'primeng/api';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'wt-exercise-list',
    templateUrl: './exercise-list.component.html',
    styleUrls: ['./exercise-list.component.scss'],
    imports: [MultiSelectModule, TableModule, SharedModule, RouterLink]
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

  public getExercisesLazy(event: any): void {
    //console.log("EVENT: ", event);
    let nameContains: string | null = null;
    let targetAreaContains: string[] | null = null;

    if (event.filters["name"])
      nameContains = event.filters["name"].value;

    if (event.filters["targetAreas"])
      targetAreaContains = event.filters["targetAreas"].value;

    this.getExercises(event.first, nameContains, targetAreaContains);
  }
}
