import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../exercise.service';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { Table } from 'primeng/table';

@Component({
  selector: 'wt-exercise-list-mini',
  templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
  styleUrls: ['./exercise-list-mini.component.css']
})
export class ExerciseListMiniComponent extends ExerciseListBase {

  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();
  @ViewChild('dt') exerciseTable: Table;

  constructor(protected _exerciseSvc: ExerciseService) { 
      super(_exerciseSvc);
  }

  public getExercisesLazy(event: any): void {

    //TODO: Revisit. Similar code exists in ExerciseListComponent.

    let nameContains: string | null = null;
    let targetAreaContains: string | null = null;

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