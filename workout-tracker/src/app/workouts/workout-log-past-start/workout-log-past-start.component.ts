import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { CustomValidators } from 'app/core/_validators/custom-validators';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';
import { sortBy } from 'lodash-es';
import { SharedModule } from 'primeng/api';
import { formatDate, NgClass } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DurationComponent } from '../_shared/duration/duration.component';

interface ILogPastWorkoutForm {
  workoutPublicId: FormControl<string | null>; 
  startDateTime: FormControl<string | null>; //The datetime-local format of the input element requires the value in a specific STRING format, so I can't use a Date here.
  endDateTime: FormControl<string | null>; //Ditto (comment above).
}

@Component({
    selector: 'wt-workout-log-past-start',
    templateUrl: './workout-log-past-start.component.html',
    styleUrls: ['./workout-log-past-start.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, SharedModule, NgClass, NzModalModule, DurationComponent]
})
export class WorkoutLogPastStartComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);

  
  /*
  Properties to make accessing form controls easier, per the example at the official docs 
  at https://angular.io/guide/form-validation#validating-input-in-reactive-forms (except with 
  some strong-typing). This surprises me, as properties are essentially functions, and we should 
  avoid embedding function calls within templates.
  */
  get startDateTime(): FormControl<string | null> {
    return this.formGroup.controls.startDateTime;
  } 

  get endDateTime(): FormControl<string | null> {
    return this.formGroup.controls.endDateTime;
  } 

  public formGroup: FormGroup<ILogPastWorkoutForm>;
  public workouts: WorkoutDTO[] = [];
  public gettingData: boolean = true;
  public showDurationModal: boolean = false;

  constructor() { 
      this.formGroup = this.buildForm();
  }

  public ngOnInit(): void {
    this.getUserWorkouts();
  }

  public proceedToWorkoutEntry(): void {
    if (this.formGroup.controls.startDateTime.value && this.formGroup.controls.endDateTime.value) {
      this._router.navigate(
        [`/workouts/plan-for-past/${this.formGroup.controls.workoutPublicId.value}/${this.formGroup.controls.startDateTime.value}/${this.formGroup.controls.endDateTime.value}`] 
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

    this.formGroup.patchValue({ endDateTime: formatDate(endDate, "yyyy-MM-ddTHH:mm", "en-US") });
  }

  public durationModalCancelled(): void {
    this.showDurationModal = false;
  }

  private buildForm(): FormGroup<ILogPastWorkoutForm> {
    return this._formBuilder.group<ILogPastWorkoutForm>({
      workoutPublicId: new FormControl<string | null>(null, { validators: Validators.required}), 
      startDateTime: new FormControl<string | null>(null, { validators: Validators.required}), 
      endDateTime: new FormControl<string | null>(null, { validators: Validators.required})
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
