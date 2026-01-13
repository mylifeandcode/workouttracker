import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { ExerciseDTO } from '../../workouts/_models/exercise-dto';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wt-exercise-list-mini',
  templateUrl: './exercise-list-mini.component.html', //TODO: Fix alternating row colors not working
  styleUrls: ['./exercise-list-mini.component.scss'],
  imports: [FormsModule, NzTableModule, NzSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseListMiniComponent extends ExerciseListBase implements OnDestroy {

  //TODO: Replace with output
  @Output() exerciseSelected = new EventEmitter<ExerciseDTO>();

  constructor() {
    super();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public selectExercise(exercise: ExerciseDTO): void {
    this.exerciseSelected.emit(exercise);
  }
}