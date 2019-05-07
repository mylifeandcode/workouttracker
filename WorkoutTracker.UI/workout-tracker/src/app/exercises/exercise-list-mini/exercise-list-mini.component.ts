import { Component, OnInit } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../exercise.service';

@Component({
  selector: 'wt-exercise-list-mini',
  templateUrl: './exercise-list-mini.component.html',
  styleUrls: ['./exercise-list-mini.component.css']
})
export class ExerciseListMiniComponent extends ExerciseListBase {

  constructor(protected _exerciseSvc: ExerciseService) { 
      super(_exerciseSvc);
  }

  public getExercisesLazy(event: any): void {
      let nameContains: string;
      let targetAreaContains: string;

      if (event.filters["name"])
          nameContains = event.filters["name"].value;

      if (event.filters["targetAreas"])
          targetAreaContains = event.filters["targetAreas"].value;

      this.getExercises(event.first, nameContains, targetAreaContains);
  }

  private selectExercise(exerciseId: number): void {
    //TODO: Emit event
    console.log("Selected Exercise: ", exerciseId);
  }
}