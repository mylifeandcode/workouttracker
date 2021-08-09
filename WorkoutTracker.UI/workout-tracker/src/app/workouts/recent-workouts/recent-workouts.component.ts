import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user.service';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';
import { Workout } from '../models/workout';
import { WorkoutService } from '../workout.service';

@Component({
  selector: 'wt-recent-workouts',
  templateUrl: './recent-workouts.component.html',
  styleUrls: ['./recent-workouts.component.css']
})
export class RecentWorkoutsComponent implements OnInit {

  public recentWorkouts: ExecutedWorkoutDTO[];
  public showExercises: boolean = false;
  public selectedWorkout: Workout;

  constructor(
    private _userService: UserService, 
    private _executedWorkoutService: ExecutedWorkoutService, 
    private _workoutService: WorkoutService, 
    private _router: Router) 
    { }

  public ngOnInit(): void {
    this._executedWorkoutService
      .getRecent(this._userService.currentUserId)
      .subscribe((workouts: ExecutedWorkoutDTO[]) => this.recentWorkouts = workouts);
  }

  public viewExercises(workoutId: number): void {
    this.selectedWorkout = null;
    this._workoutService
      .getById(workoutId)
      .subscribe((result: Workout) => {
        this.showExercises = true;
        this.selectedWorkout = result;
      });
  }

  public doWorkout(workoutId: number): void {
    this._router.navigate([`workouts/plan/${workoutId}`]);
  }
}
