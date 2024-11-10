import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutedWorkoutService } from '../../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../../_models/executed-workout-summary-dto';
import { Workout } from '../../_models/workout';
import { WorkoutService } from '../../_services/workout.service';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { WorkoutInfoComponent } from './workout-info/workout-info.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'wt-recent-workouts',
    templateUrl: './recent-workouts.component.html',
    styleUrls: ['./recent-workouts.component.scss'],
    standalone: true,
    imports: [TableModule, PrimeTemplate, DialogModule, WorkoutInfoComponent, DatePipe]
})
export class RecentWorkoutsComponent implements OnInit {

  public recentWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public showExercises: boolean = false;
  public selectedWorkout: Workout = new Workout();
  public loading: boolean = true;

  @Input()
  planningForLater: boolean = false;

  constructor(
    private _executedWorkoutService: ExecutedWorkoutService, 
    private _workoutService: WorkoutService, 
    private _router: Router) 
    { }

  public ngOnInit(): void {
    this._executedWorkoutService
      .getRecent() //TODO: Add code to exclude any workouts which have since been retired!
      .subscribe((workouts: ExecutedWorkoutSummaryDTO[]) => {
        this.recentWorkouts = workouts;
        this.loading = false; //TODO: Use finalize and set this there instead.
      });
  }

  public viewExercises(workoutPublicId: string): void { //TODO: Refactor to use a DTO or summary object
    //this.selectedWorkout = null;
    this._workoutService
      .getById(workoutPublicId)
      .subscribe((result: Workout) => {
        this.showExercises = true;
        this.selectedWorkout = result;
      });
  }

  public doWorkout(workoutPublicId: number): void {
    this._router.navigate([`workouts/plan/${workoutPublicId}`]);
  }

  public planWorkout(workoutPublicId: number): void {
    this._router.navigate([`workouts/plan-for-later/${workoutPublicId}`]);
  }
}
