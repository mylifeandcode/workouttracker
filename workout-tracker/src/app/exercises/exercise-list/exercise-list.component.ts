import { Component } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { ExerciseListBase } from '../exercise-list-base';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent extends ExerciseListBase {

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  constructor(protected _exerciseSvc: ExerciseService) {
    super(_exerciseSvc);
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
