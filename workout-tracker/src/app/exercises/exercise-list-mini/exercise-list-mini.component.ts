import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseService } from '../_services/exercise.service';
import { ExerciseDTO } from 'app/workouts/_models/exercise-dto';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wt-exercise-list-mini',
  templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
  styleUrls: ['./exercise-list-mini.component.scss'],
  imports: [FormsModule, NzTableModule, NzSelectModule]
})
export class ExerciseListMiniComponent extends ExerciseListBase {
  protected _exerciseSvc: ExerciseService;

  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();

  constructor() {
    const _exerciseSvc = inject(ExerciseService);

    super(_exerciseSvc);
    this._exerciseSvc = _exerciseSvc;
  }

  public selectExercise(exercise: ExerciseDTO): void {
    this.exerciseSelected.emit(exercise);
  }

}