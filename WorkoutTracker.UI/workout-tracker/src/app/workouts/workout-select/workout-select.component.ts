import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../models/workout-dto';
import { WorkoutService } from '../workout.service';
import { AuthService } from 'app/core/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'wt-workout-select',
  templateUrl: './workout-select.component.html',
  styleUrls: ['./workout-select.component.css']
})
export class WorkoutSelectComponent implements OnInit, OnDestroy {

  @Output()
  workoutSelected: EventEmitter<number> = new EventEmitter<number>();

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */
  public get loading(): boolean {
    return this._apiCallsInProgress > 0; 
  }

  //PUBLIC FIELDS
  public workouts: WorkoutDTO[];
  //END PUBLIC FIELDS

  //PRIVATE FIELDS
  private _apiCallsInProgress: number;
  private _userSusbscription: Subscription;
  //END PRIVATE FIELDS

  constructor(
    private _workoutService: WorkoutService, 
    private _authService: AuthService, 
    private _router: Router) { }

  public ngOnInit(): void {
    this.subscribeToUser();
  }

  public ngOnDestroy(): void {
    this._userSusbscription.unsubscribe();
  }

  public workoutSelectChange(event: any): void { //TODO: Get concrete type instead of using any
    //this.workoutSelected.emit(event.target.value);
    this._router.navigate([`workouts/plan/${event.target.value}`]);
  }

  private subscribeToUser(): void {
    this._authService.currentUserName.subscribe((username: string) => {
      this.getUserWorkouts();
    });
  }

  private getUserWorkouts(): void {
    this._userSusbscription = this._workoutService.getAll(0, 500, true) //TODO: Page size...come up with a better solution
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = _.sortBy(result.results, 'name');
      });
  }

}
