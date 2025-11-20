import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
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
        Object.values(groups).forEach((exerciseArray: ExecutedExerciseDTO[]) => {
          groupsMap.set(
            x.toString(), exerciseArray);
          x++;
        });

        this.groupedExercises = groupsMap;
      });
  }
}
