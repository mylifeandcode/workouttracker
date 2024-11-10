import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { forEach } from 'lodash-es';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ExecutedExercisesComponent } from './executed-exercises/executed-exercises.component';
import { DatePipe, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'wt-workout-view',
    templateUrl: './workout-view.component.html',
    styleUrls: ['./workout-view.component.scss'],
    standalone: true,
    imports: [ProgressSpinnerModule, ExecutedExercisesComponent, DatePipe, KeyValuePipe]
})
export class WorkoutViewComponent implements OnInit {

  public loading: boolean = true;
  public executedWorkout: ExecutedWorkoutDTO = new ExecutedWorkoutDTO();
  
  /*
  Before setting TypeScript compiler to strict, the below variable was of type Map<string, ExecutedExercise[]>.
  But the compiler complained and I had to install @types/lodash, which defined the return type of 
  the _.groupBy() function as _.Dictionary. And this caused other problems, particularly with the unit test.
  */
  //public groupedExercises: _.Dictionary<ExecutedExercise[]>;
  public groupedExercises: Map<string, ExecutedExerciseDTO[]> | undefined;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _executedWorkoutService: ExecutedWorkoutService) { }

  ngOnInit(): void {
    this.subscribeToRoute();
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////
  private subscribeToRoute(): void {
    this._activatedRoute.params.subscribe((params: Params) => {
      this.getExecutedWorkout(params["id"]);
    });
  }

  private getExecutedWorkout(publicId: string): void {
    this.loading = true;
    this._executedWorkoutService.getById(publicId)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((executedWorkout: ExecutedWorkoutDTO) => {
        
        this.executedWorkout = executedWorkout;
        
        //Make sure the exercises are in sequence order
        //const sortedExercises: ExecutedExercise[] = 
          //this.executedWorkout.exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);

        //Group the exercises
        //console.log("EXERCISES: ", this.executedWorkout.exercises);
        const groups = this._executedWorkoutService.groupExecutedExercises(this.executedWorkout.exercises);
        
        const groupsMap = new Map<string, ExecutedExerciseDTO[]>();

        let x: number = 0;
        forEach(groups, (exerciseArray: ExecutedExerciseDTO[]) => {
          groupsMap.set(
            x.toString(), exerciseArray);
          //console.log("Added ", exerciseArray[0].exerciseId.toString() + "-" + exerciseArray[0].setType.toString());
          x++;
        });

        this.groupedExercises = groupsMap;

        //console.log("BLAH: ", Object.values(groupsMap));

        //console.log("GROUPED EXERCISES: ", this.groupedExercises);

      });
  }
  //END PRIVATE METHODS ///////////////////////////////////////////////////////

}
