import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../_services/exercise.service';
import { ExerciseDTO } from 'app/workouts/_models/exercise-dto';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'wt-exercise-list-mini',
    templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
    styleUrls: ['./exercise-list-mini.component.scss'],
    imports: [TableModule, SharedModule, MultiSelectModule]
})
export class ExerciseListMiniComponent extends ExerciseListBase {
  protected _exerciseSvc: ExerciseService;


  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();

  constructor() {
      const _exerciseSvc = inject(ExerciseService);
 
      super(_exerciseSvc);
      this._exerciseSvc = _exerciseSvc;

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