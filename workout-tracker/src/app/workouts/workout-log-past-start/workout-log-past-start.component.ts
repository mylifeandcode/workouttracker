import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { CustomValidators } from 'app/core/_validators/custom-validators';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';
import { sortBy } from 'lodash-es';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SharedModule } from 'primeng/api';
import { NgClass } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DurationComponent } from '../_shared/duration/duration.component';

interface ILogPastWorkoutForm {
  workoutPublicId: FormControl<string | null>; 
  startDateTime: FormControl<Date | null>; 
  endDateTime: FormControl<Date | null>; 
}

@Component({
    selector: 'wt-workout-log-past-start',
    templateUrl: './workout-log-past-start.component.html',
    styleUrls: ['./workout-log-past-start.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, DropdownModule, CalendarModule, SharedModule, NgClass, DialogModule, DurationComponent]
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
  public workouts: WorkoutDTO[] = [];
  public gettingData: boolean = true;
  public showDurationModal: boolean = false;

  constructor(
    private _formBuilder: FormBuilder, 
    private _workoutService: WorkoutService, 
    private _router: Router) { 
      this.formGroup = this.buildForm();
  }

  public ngOnInit(): void {
    this.getUserWorkouts();
  }

  public proceedToWorkoutEntry(): void {
    if (this.formGroup.controls.startDateTime.value && this.formGroup.controls.endDateTime.value) {
      this._router.navigate(
        [`/workouts/plan-for-past/${this.formGroup.controls.workoutPublicId.value}/${this.formGroup.controls.startDateTime.value.toISOString()}/${this.formGroup.controls.endDateTime.value.toISOString()}`] 
      );
    }
  }

  public enterDuration(): void {
    this.showDurationModal = true;
  }

  public durationModalAccepted(duration: number): void {
    this.showDurationModal = false;

    if (!this.formGroup.controls.startDateTime.value) return;

    const endDate = new Date(this.formGroup.controls.startDateTime.value);
    endDate.setSeconds(duration);

    this.formGroup.patchValue({ endDateTime: endDate });
  }

  public durationModalCancelled(): void {
    this.showDurationModal = false;
  }

  private buildForm(): FormGroup<ILogPastWorkoutForm> {
    return this._formBuilder.group<ILogPastWorkoutForm>({
      workoutPublicId: new FormControl<string | null>(null, { validators: Validators.required}), 
      startDateTime: new FormControl<Date | null>(null, { validators: Validators.required}), 
      endDateTime: new FormControl<Date | null>(null, { validators: Validators.required})
    }, { validators: CustomValidators.compareDatesValidator('startDateTime', 'endDateTime', true) });
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true)
      .pipe(finalize(() => { this.gettingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = sortBy(result.results, 'name');
      });
  }

}
