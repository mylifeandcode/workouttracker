import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { CustomValidators } from 'app/validators/custom-validators';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../models/workout-dto';
import { WorkoutService } from '../workout.service';

@Component({
  selector: 'wt-workout-log-past-start',
  templateUrl: './workout-log-past-start.component.html',
  styleUrls: ['./workout-log-past-start.component.css']
})
export class WorkoutLogPastStartComponent implements OnInit {
  
  /*
  Properties to make accessing form controls easier, per the example at the official docs 
  at https://angular.io/guide/form-validation#validating-input-in-reactive-forms (except with 
  some strong-typing). This surprises me, as properties are essentially functions, and we should 
  avoid embedding function calls within templates.
  */
  get startDateTime(): AbstractControl | null {
    return this.formGroup.get('startDateTime');
  } 

  get endDateTime(): AbstractControl | null {
    return this.formGroup.get('endDateTime');
  } 

  public formGroup: FormGroup;
  public workouts: WorkoutDTO[];
  public gettingData: boolean = true;

  constructor(
    private _formBuilder: FormBuilder, 
    private _workoutService: WorkoutService, 
    private _router: Router) { 

  }

  public ngOnInit(): void {
    this.buildForm();
    this.getUserWorkouts();
  }

  public proceedToWorkoutEntry(): void {
    this._router.navigate(
      ['/workouts/plan/' + this.formGroup.get('workoutId')?.value.toString()], 
      { 
        queryParams: { 
          startDateTime: this.formGroup.get('startDateTime')?.value.toISOString(), 
          endDateTime: this.formGroup.get('endDateTime')?.value.toISOString() 
        } 
      });
  }

  private buildForm(): void {
    this.formGroup = this._formBuilder.group({
      workoutId: [null, Validators.required], 
      startDateTime: [null, Validators.required], 
      endDateTime: [null, Validators.required]
    }, { validators: CustomValidators.startDateTimeVsEndDateTime });
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true)
      .pipe(finalize(() => { this.gettingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = _.sortBy(result.results, 'name');
      });
  }

}
