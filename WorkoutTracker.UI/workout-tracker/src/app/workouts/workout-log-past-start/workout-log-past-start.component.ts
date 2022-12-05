import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { CustomValidators } from 'app/validators/custom-validators';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../models/workout-dto';
import { WorkoutService } from '../workout.service';
import { sortBy } from 'lodash-es';

interface ILogPastWorkoutForm {
  workoutId: FormControl<number | null>; 
  startDateTime: FormControl<Date | null>; 
  endDateTime: FormControl<Date | null>; 
}

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
  get startDateTime(): FormControl<Date | null> {
    return this.formGroup.controls.startDateTime;
  } 

  get endDateTime(): FormControl<Date | null> {
    return this.formGroup.controls.endDateTime;
  } 

  public formGroup: FormGroup<ILogPastWorkoutForm>;
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
      [`/workouts/plan-for-past/${this.formGroup.controls.workoutId.value}/${this.formGroup.controls.startDateTime.value!.toISOString()}/${this.formGroup.controls.endDateTime.value!.toISOString()}`] 
    );
  }

  private buildForm(): void {
    this.formGroup = this._formBuilder.group<ILogPastWorkoutForm>({
      workoutId: new FormControl<number | null>(null, { validators: Validators.required}), 
      startDateTime: new FormControl<Date | null>(null, { validators: Validators.required}), 
      endDateTime: new FormControl<Date | null>(null, { validators: Validators.required})
    }, { validators: CustomValidators.startDateTimeVsEndDateTime });
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true)
      .pipe(finalize(() => { this.gettingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = sortBy(result.results, 'name');
      });
  }

}
