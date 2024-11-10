import { Component, Output, EventEmitter } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../exercise.service';
import { ExerciseDTO } from 'app/workouts/_models/exercise-dto';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'wt-exercise-list-mini',
    templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
    styleUrls: ['./exercise-list-mini.component.scss'],
    standalone: true,
    imports: [TableModule, PrimeTemplate, MultiSelectModule]
})
export class ExerciseListMiniComponent extends ExerciseListBase {

  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();

  constructor(protected _exerciseSvc: ExerciseService) { 
      super(_exerciseSvc);
  }

  public getExercisesLazy(event: any): void {

    //TODO: Revisit. Similar code exists in ExerciseListComponent.

    let nameContains: string | null = null;
    let targetAreaContains: string[] | null = null;

    if (event.filters["name"])
        nameContains = event.filters["name"].value;

    if (event.filters["targetAreas"])
        targetAreaContains = event.filters["targetAreas"].value;

    this.getExercises(event.first, nameContains, targetAreaContains);
  }

  public selectExercise(exercise: ExerciseDTO): void {
    this.exerciseSelected.emit(exercise);
  }
}