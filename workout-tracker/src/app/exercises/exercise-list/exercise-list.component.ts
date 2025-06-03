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

  constructor() {
    const _exerciseSvc = inject(ExerciseService);
    super(_exerciseSvc);
  }

  public targetAreasFilterChange(selectedTargetAreas: string[]): void {
    //console.log("targetAreasFilterChange: ", selectedTargetAreas);
    this.getExercises(0, null, selectedTargetAreas); //TODO: Add code to take name filter into account
  }
}
