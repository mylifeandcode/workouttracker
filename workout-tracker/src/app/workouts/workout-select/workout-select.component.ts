import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';
import { RecentWorkoutsComponent } from './recent-workouts/recent-workouts.component';
import { FormsModule } from '@angular/forms';

//TODO: Refactor to take the workouts as an input and emit events, because we need this in more than
//one place

@Component({
  selector: 'wt-workout-select',
  templateUrl: './workout-select.component.html',
  styleUrls: ['./workout-select.component.scss'],
  imports: [FormsModule, RecentWorkoutsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutSelectComponent implements OnInit { //}, OnDestroy {
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);


  //TODO: Consider refactoring into multiple components:
  //One for the select dropdown
  //One for the recent list
  //One as a parent to contain these
  //That way, the dropdown component can be reused without the need for the other things only meant for selecting 
  //a workout to start or plan. Sometimes we'll need to select a workout for other reasons, such as analytics.

  readonly showRecent = signal<boolean>(true);
  readonly showHeading = signal<boolean>(true);

  @Output()
  workoutsLoaded: EventEmitter<void> = new EventEmitter<void>();

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */

  protected loading = signal<boolean>(false);

  //PUBLIC FIELDS
  public workouts = signal<WorkoutDTO[]>([]);
  public planningForLater: boolean = false; //No need for a signal, doesn't change
  public selectedWorkout = signal<WorkoutDTO | null>(null); // This will hold the currently selected workout if any
  //END PUBLIC FIELDS

  public ngOnInit(): void {
    this.subscribeToUser();
    this.planningForLater = this._router.url.includes("for-later");
  }


  public workoutSelectChange(): void {
    if (this.selectedWorkout) {
      if (this.planningForLater)
        this._router.navigate([`workouts/plan-for-later/${this.selectedWorkout()?.id}`]);
      else
        this._router.navigate([`workouts/plan/${this.selectedWorkout()?.id}`]);
    }
  }

  private subscribeToUser(): void {
    this.getUserWorkouts();
  }

  private getUserWorkouts(): void {
    this.loading.set(true);
    this._workoutService.getFilteredSubset(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts.set(result.results.sort((a, b) => a.name.localeCompare(b.name)));
        this.workoutsLoaded.emit();
      });
  }

}
