import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { forEach } from 'lodash-es';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ExecutedExercisesComponent } from './executed-exercises/executed-exercises.component';
import { DatePipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'wt-workout-view',
  templateUrl: './workout-view.component.html',
  styleUrls: ['./workout-view.component.scss'],
  imports: [NzSpinModule, ExecutedExercisesComponent, DatePipe, KeyValuePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutViewComponent {
  private _executedWorkoutService = inject(ExecutedWorkoutService);


  public loading = signal<boolean>(true);
  public executedWorkout = signal<ExecutedWorkoutDTO>(new ExecutedWorkoutDTO());

  id = input<string>("id");

  /*
  Before setting TypeScript compiler to strict, the below variable was of type Map<string, ExecutedExercise[]>.
  But the compiler complained and I had to install @types/lodash, which defined the return type of 
  the _.groupBy() function as _.Dictionary. And this caused other problems, particularly with the unit test.
  */
  //public groupedExercises: _.Dictionary<ExecutedExercise[]>;
  public groupedExercises: Map<string, ExecutedExerciseDTO[]> | undefined;

  constructor() {
    effect(() => {
      this.getExecutedWorkout(this.id());
    });
  }

  private getExecutedWorkout(publicId: string): void {
    this.loading.set(true);
    this._executedWorkoutService.getById(publicId)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe((executedWorkout: ExecutedWorkoutDTO) => {

        this.executedWorkout.set(executedWorkout);

        //Make sure the exercises are in sequence order
        //const sortedExercises: ExecutedExercise[] = 
        //this.executedWorkout.exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);

        //Group the exercises
        //console.log("EXERCISES: ", this.executedWorkout.exercises);
        const groups = this._executedWorkoutService.groupExecutedExercises(this.executedWorkout().exercises);

        const groupsMap = new Map<string, ExecutedExerciseDTO[]>();

        let x: number = 0;
        forEach(groups, (exerciseArray: ExecutedExerciseDTO[]) => {
          groupsMap.set(
            x.toString(), exerciseArray);
          x++;
        });

        this.groupedExercises = groupsMap;
      });
  }
}
