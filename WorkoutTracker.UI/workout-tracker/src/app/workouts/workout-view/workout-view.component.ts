import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedExercise } from '../models/executed-exercise';
import { ExecutedWorkout } from '../models/executed-workout';
import * as _ from 'lodash';

@Component({
  selector: 'wt-workout-view',
  templateUrl: './workout-view.component.html',
  styleUrls: ['./workout-view.component.css']
})
export class WorkoutViewComponent implements OnInit {

  public loading: boolean;
  public executedWorkout: ExecutedWorkout;
  public groupedExercises: Map<string, ExecutedExercise[]>;

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

  private getExecutedWorkout(id: number): void {
    this.loading = true;
    this._executedWorkoutService.getById(id)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((executedWorkout: ExecutedWorkout) => {
        this.executedWorkout = executedWorkout;
        this.groupedExercises = 
          _.groupBy(executedWorkout.exercises, (exercise: ExecutedExercise) => { 
            return exercise.exercise.id.toString() + '-' + exercise.setType.toString(); 
          });
      });
  }

  //END PRIVATE METHODS ///////////////////////////////////////////////////////

}
