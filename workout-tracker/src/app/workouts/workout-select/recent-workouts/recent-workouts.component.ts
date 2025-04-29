import { Component, OnInit, TemplateRef, ViewChild, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutedWorkoutService } from '../../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../../_models/executed-workout-summary-dto';
import { Workout } from '../../_models/workout';
import { WorkoutService } from '../../_services/workout.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { WorkoutInfoComponent } from './workout-info/workout-info.component';
import { DatePipe } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
    selector: 'wt-recent-workouts',
    templateUrl: './recent-workouts.component.html',
    styleUrls: ['./recent-workouts.component.scss'],
    imports: [NzTableModule, NzModalModule, WorkoutInfoComponent, DatePipe]
})
export class RecentWorkoutsComponent implements OnInit {
  private _executedWorkoutService = inject(ExecutedWorkoutService);
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);
  private _modalService = inject(NzModalService);

  public recentWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public showExercises: boolean = false;
  public selectedWorkout: Workout = new Workout();
  public loading: boolean = true;

  @ViewChild('workoutInfo')
  workoutInfo!: TemplateRef<Element>;

  readonly planningForLater = input<boolean>(false);

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
        this.selectedWorkout = result;
        this._modalService.create({
          nzTitle: '<h3>Workout Info</h3>',
          nzContent: this.workoutInfo,
          nzMaskClosable: true,
          nzClosable: true
        });        
      });
  }

  public doWorkout(workoutPublicId: string): void {
    this._router.navigate([`workouts/plan/${workoutPublicId}`]);
  }

  public planWorkout(workoutPublicId: string): void {
    this._router.navigate([`workouts/plan-for-later/${workoutPublicId}`]);
  }
}
