import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../exercise.service';
import { ExerciseDTO } from 'app/models/exercise-dto';

@Component({
  selector: 'wt-exercise-list-mini',
  templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
  styleUrls: ['./exercise-list-mini.component.css']
})
export class ExerciseListMiniComponent extends ExerciseListBase {

  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();

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

  private selectExercise(exercise: ExerciseDTO): void {
    this.exerciseSelected.emit(exercise);
  }
}