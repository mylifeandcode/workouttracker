import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';
import { sortBy } from 'lodash-es';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { RecentWorkoutsComponent } from './recent-workouts/recent-workouts.component';

@Component({
  selector: 'wt-workout-select',
  templateUrl: './workout-select.component.html',
  styleUrls: ['./workout-select.component.scss'],
  standalone: true,
  imports: [DropdownModule, RecentWorkoutsComponent]
})
export class WorkoutSelectComponent implements OnInit, OnDestroy {

  //TODO: Consider refactoring into multiple components:
  //One for the select dropdown
  //One for the recent list
  //One as a parent to contain these
  //That way, the dropdown component can be reused without the need for the other things only meant for selecting 
  //a workout to start or plan. Sometimes we'll need to select a workout for other reasons, such as analytics.

  @Input()
  showRecent: boolean = true;

  @Input()
  showHeading: boolean = true;

  @Input()
  navigateOnSelect: boolean = true;

  @Output()
  workoutSelected: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  workoutsLoaded: EventEmitter<void> = new EventEmitter<void>();

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */
  public get loading(): boolean {
    if (this._apiCallsInProgress > 0)
      return true;
    else
      return false;
    //return this._apiCallsInProgress > 0; 
  }

  //PUBLIC FIELDS
  public workouts: WorkoutDTO[] = [];
  public planningForLater: boolean = true;
  //END PUBLIC FIELDS

  //PRIVATE FIELDS
  private _apiCallsInProgress: number = 0;
  private _userSusbscription: Subscription = new Subscription();
  //END PRIVATE FIELDS

  constructor(
    private _workoutService: WorkoutService,
    private _router: Router) { }

  public ngOnInit(): void {
    this.subscribeToUser();
    this.planningForLater = this._router.url.includes("for-later");
  }

  public ngOnDestroy(): void {
    this._userSusbscription.unsubscribe();
  }

  public workoutSelectChange(event: DropdownChangeEvent): void { //TODO: Get concrete type instead of using any
    if (this.navigateOnSelect) {
      if (this.planningForLater)
        this._router.navigate([`workouts/plan-for-later/${event.value}`]);
      else
        this._router.navigate([`workouts/plan/${event.value.publicId}`]);
    }
    this.workoutSelected.emit(event.value.publicId);
  }

  private subscribeToUser(): void {
    this.getUserWorkouts();
  }

  private getUserWorkouts(): void {
    this._userSusbscription = this._workoutService.getFilteredSubset(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = sortBy(result.results, 'name');
        this.workoutsLoaded.emit();
      });
  }

}
