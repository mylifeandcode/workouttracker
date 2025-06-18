import { Component, OnInit, ViewChild, inject, input } from '@angular/core';
import { Validators, FormGroup, FormArray, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ResistanceBandService } from 'app/shared/services/resistance-band.service';
import { IBandAllocation, ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IWorkoutFormExercise } from './_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from './_interfaces/i-workout-form-exercise-set';
import { forEach } from 'lodash-es';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { DurationComponent } from '../_shared/duration/duration.component';
import { DatePipe } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule } from 'ng-zorro-antd/modal';

interface IWorkoutForm {
  //id: FormControl<number | null>;
  publicId: FormControl<string | null>;
  exercises: FormArray<FormGroup<IWorkoutFormExercise>>;
  journal: FormControl<string | null>;
}

@Component({
    selector: 'wt-workout',
    templateUrl: './workout.component.html',
    styleUrls: ['./workout.component.scss'],
    imports: [
        NzSpinModule,
        FormsModule,
        ReactiveFormsModule,
        WorkoutExerciseComponent,
        RouterLink,
        NzModalModule,
        ResistanceBandSelectComponent,
        CountdownTimerComponent,
        DurationComponent,
        DatePipe,
        NzCollapseModule
    ]
})
export class WorkoutComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _formBuilder = inject(FormBuilder);
  private _executedWorkoutService = inject(ExecutedWorkoutService);
  private _resistanceBandService = inject(ResistanceBandService);
  private _messageService = inject(NzMessageService);
  private _router = inject(Router);


  //PUBLIC FIELDS
  public errorInfo: string | undefined = undefined;
  public workoutForm: FormGroup<IWorkoutForm>;
  public workoutName: string | null = null;

  public showResistanceBandsSelectModal: boolean = false;
  public settingResistanceForBilateralExercise: boolean = false;
  public showCountdownModal: boolean = false;
  public allResistanceBands: ResistanceBandIndividual[] = [];
  public formGroupForResistanceSelection: FormGroup<IWorkoutFormExerciseSet> | undefined = undefined;
  public formGroupForCountdownModal: FormGroup<IWorkoutFormExerciseSet> | undefined = undefined;
  public countdownModalActivatedDateTime: Date = new Date();
  public saving: boolean = false;
  public infoMsg: string | undefined = undefined;
  public workoutCompleted: boolean = false;
  public isLoggingPastWorkout: boolean = false;
  public showDurationModal: boolean = false;
  public formControlForDurationEdit: FormControl<number | null> | null = null;
  public startDateTime: Date | null = null;
  public endDateTime: Date | null = null;
  public workoutLoaded: boolean = false;
  public activeAccordionTab: number = 0;
  public exerciseBandAllocation: IBandAllocation = { selectedBandsDelimited: '', doubleMaxResistanceAmounts: false };
  //END PUBLIC FIELDS

  //INPUTS (SET VIA withComponentInputBinding())
  executedWorkoutPublicId = input<string | undefined>();
  //END INPUTS

  //PRIVATE FIELDS
  private _executedWorkout: ExecutedWorkoutDTO | undefined = undefined;
  private _apiCallsInProgress: number = 0;
  //END PRIVATE FIELDS

  //VIEWCHILD
  @ViewChild(ResistanceBandSelectComponent) bandSelect: ResistanceBandSelectComponent | undefined = undefined;

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */
  public get loading(): boolean {
    return this._apiCallsInProgress > 0;
  }

  /**
   * A property representing all of the Exercises which are part of the Workout
   */
  get exercisesArray(): FormArray<FormGroup<IWorkoutFormExercise>> {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    //return this.workoutForm.get('exercises') as FormArray;
    return this.workoutForm.controls.exercises;
  }

  /**
   * Specifies whether or not the workout has been started
   */
  get workoutStarted(): boolean {
    return this._executedWorkout?.startDateTime != null
      && new Date(this._executedWorkout?.startDateTime).getFullYear() > 1;
  }
  //END PUBLIC PROPERTIES

  constructor() {
    super();
    this.workoutForm = this.createForm();
  }


  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public ngOnInit(): void {
    if (this.executedWorkoutPublicId() === undefined) {
      this._messageService.error('executedWorkoutPublicId is invalid. Please exit this page and return to it from one of the pages where a workout can be selected.');
      return;
    }

    this.getResistanceBands();
    this.setupWorkout();
    this.getOptionalQueryParams(); //For optional parameters, such as pastWorkout
    this.startWorkout();
  }

  public resistanceBandsModalEnabled(exerciseFormGroup: FormGroup<IWorkoutFormExerciseSet>): void {
    this.exerciseBandAllocation = 
      { 
        selectedBandsDelimited: exerciseFormGroup.controls.resistanceMakeup.value ?? '',
        doubleMaxResistanceAmounts: !exerciseFormGroup.controls.bandsEndToEnd.value,
      };
    this.showResistanceBandsSelectModal = true;

    this.settingResistanceForBilateralExercise = exerciseFormGroup.controls.usesBilateralResistance.value;
    this.formGroupForResistanceSelection = exerciseFormGroup;
    /*
    console.log('bandSelect: ', this.bandSelect);
    this.bandSelect?.setBandAllocation(
      exerciseFormGroup.controls.resistanceMakeup.value ?? '', //TODO: Revisit. This is a hack. Type is nullable but we know we'll have a value here.
      !exerciseFormGroup.controls.bandsEndToEnd.value);
    */
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    this.formGroupForResistanceSelection?.patchValue({
      resistanceMakeup: selectedBands.makeup,
      resistance: selectedBands.maxResistanceAmount
    });
    this.formGroupForResistanceSelection?.controls.resistanceMakeup.markAsDirty();
    this.formGroupForResistanceSelection?.controls.resistance.markAsDirty();
    this.showResistanceBandsSelectModal = false;
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal = false;
  }

  public showTimer(exerciseFormGroup: FormGroup): void {
    this.formGroupForCountdownModal = exerciseFormGroup;
    this.countdownModalActivatedDateTime = new Date();
    this.showCountdownModal = true;
  }

  public startWorkout(): void {
    this.workoutForm?.controls.journal.enable();
    this.workoutForm?.controls.exercises.enable();
  }

  public completeWorkout(): void {
    this.setWorkoutValuesFromFormGroup();

    if (!this._executedWorkout) return;

    if (this._executedWorkout.endDateTime == null) //Because we could be entering information for a past workout
      this._executedWorkout.endDateTime = new Date();

    this.save(true);
  }

  public saveWorkoutInProgress(): void {
    this.setWorkoutValuesFromFormGroup();
    this.save(false);
  }

  public openDurationModal(formControl: FormControl<number | null>): void {
    this.formControlForDurationEdit = formControl;
    this.showDurationModal = true;
  }

  public durationModalAccepted(duration: number): void {
    this.formControlForDurationEdit?.setValue(duration);
    this.showDurationModal = false;
  }

  public durationModalCancelled(): void {
    this.formControlForDurationEdit = null;
    this.showDurationModal = false;
  }

  public hasUnsavedData(): boolean {
    return this.workoutForm.dirty;
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private getOptionalQueryParams(): void {
    if (this._route.snapshot.queryParams['pastWorkout']) //TODO: Clean up
      this.isLoggingPastWorkout = this._route.snapshot.queryParams['pastWorkout'];
  }

  private createForm(): FormGroup<IWorkoutForm> {
    return this._formBuilder.group<IWorkoutForm>({
      //id: new FormControl<number | null>(0, Validators.required),
      publicId: new FormControl<string | null>(null, Validators.required),
      exercises: new FormArray<FormGroup<IWorkoutFormExercise>>([]),
      journal: new FormControl<string | null>('')
    });
  }

  private getResistanceBands(): void {
    this._apiCallsInProgress++;
    this._resistanceBandService.getAllIndividualBands()
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe({
        next: (bands: ResistanceBandIndividual[]) => {
          this.allResistanceBands = bands;
        },
        error: (error: any) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      });
  }

  private setupWorkout(): void {
    const id = this.executedWorkoutPublicId();
    if (!id) return;

    this._apiCallsInProgress++;
    this._executedWorkoutService.getById(id)
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe({
        next: (executedWorkout: ExecutedWorkoutDTO) => {
          this._executedWorkout = executedWorkout;
          this.workoutName = executedWorkout.name;

          if (this._executedWorkout.startDateTime == null)
            this._executedWorkout.startDateTime = new Date();

          this.startDateTime = this._executedWorkout.startDateTime;

          this.workoutForm?.patchValue({
            publicId: id
          });

          this.setupExercisesFormGroup(executedWorkout.exercises);

          this.workoutCompleted = (this._executedWorkout.endDateTime != null);

          if (executedWorkout.journal) {
            this.workoutForm?.controls.journal.setValue(executedWorkout.journal);
          }

          this.workoutLoaded = true;
          this.activeAccordionTab = this.getExerciseInProgress();
        },
        error: (error: any) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      });
  }

  private setupExercisesFormGroup(exercises: ExecutedExerciseDTO[]): void {
    this.exercisesArray?.clear();

    const groupedExercises = this._executedWorkoutService.groupExecutedExercises(exercises);

    //TODO: Use the non-lodash version of forEach
    forEach(groupedExercises, (exerciseArray: ExecutedExerciseDTO[]) => {

      this.exercisesArray?.push(
        this._formBuilder.group<IWorkoutFormExercise>({
          id: new FormControl<number>(exerciseArray[0].id, { nonNullable: true }),
          exerciseId: new FormControl<number>(exerciseArray[0].exerciseId, { nonNullable: true }),
          exerciseName: new FormControl<string>(exerciseArray[0].name, { nonNullable: true }),
          exerciseSets: this.getExerciseSetsFormArray(exerciseArray),
          setType: new FormControl<number>(exerciseArray[0].setType, { nonNullable: true }),
          resistanceType: new FormControl<number>(exerciseArray[0].resistanceType, { nonNullable: true })
        })
      );

    });

  }

  private getExerciseSetsFormArray(exercises: ExecutedExerciseDTO[]): FormArray<FormGroup<IWorkoutFormExerciseSet>> {

    const formArray = new FormArray<FormGroup<IWorkoutFormExerciseSet>>([]);

    //Each member of the array is a FormGroup
    for (let i = 0; i < exercises.length; i++) {
      const formGroup = this._formBuilder.group<IWorkoutFormExerciseSet>({
        sequence: new FormControl<number>(exercises[i].sequence, { nonNullable: true }),
        resistance: new FormControl<number>(exercises[i].resistanceAmount, { nonNullable: true, validators: Validators.required }),
        targetReps: new FormControl<number>(exercises[i].targetRepCount, { nonNullable: true, validators: Validators.required }),
        
        actualReps: new FormControl<number>(
          exercises[i].actualRepCount ? exercises[i].actualRepCount : 0, { nonNullable: true, validators: Validators.required }),
        
        formRating: new FormControl<number | null>(
          exercises[i].formRating ? exercises[i].formRating : null, { validators: Validators.required }),
        
        rangeOfMotionRating: new FormControl<number | null>(
          exercises[i].rangeOfMotionRating ? exercises[i].rangeOfMotionRating : null, { validators: Validators.required }),

        resistanceMakeup: new FormControl<string | null>(exercises[i].resistanceMakeup),

        //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        bandsEndToEnd: new FormControl<boolean | null>(
          exercises[i].bandsEndToEnd), 
        
        duration: new FormControl<number | null>(120), //TODO: Get/set value from API
        
        involvesReps: new FormControl<boolean>(
          exercises[i].involvesReps, { nonNullable: true }), //Kind of a hack, but I need to pass this value along
        
        side: new FormControl<number | null>(exercises[i].side),
        usesBilateralResistance: new FormControl<boolean>(exercises[i].usesBilateralResistance, { nonNullable: true })
      });

      formArray.push(formGroup);
    }

    return formArray;
  }

  private setErrorInfo(error: any, defaultMessage: string): void {
    if (error.message)
      this.errorInfo = error.message;
    else
      this.errorInfo = defaultMessage;
  }

  private setWorkoutValuesFromFormGroup(): void {
    if (!this.workoutForm || !this._executedWorkout || !this.exercisesArray) return;
    this._executedWorkout.journal = this.workoutForm.controls.journal.value;

    this.exercisesArray.controls.forEach((exerciseFormGroup: FormGroup<IWorkoutFormExercise>) => {
      const sets = exerciseFormGroup.controls.exerciseSets;
      const exerciseId = exerciseFormGroup.controls.exerciseId.value;
      let exercises = this._executedWorkout?.exercises.filter((exercise: ExecutedExerciseDTO) =>
        exercise.exerciseId == exerciseId
      );

      exercises = exercises?.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

      if (exercises?.length != sets.length) {
        window.alert("Exercises/FormArray length mismatch."); //TODO: Handle this a better way
        return;
      }

      for (let x = 0; x < exercises.length; x++) {
        const setControls = (sets.at(x) as FormGroup<IWorkoutFormExerciseSet>).controls; //TODO: Revisit. Can probably simplify this.
        exercises[x].actualRepCount = Number(setControls.actualReps.value);
        exercises[x].duration = setControls.duration.value;
        exercises[x].resistanceAmount = setControls.resistance.value;
        exercises[x].resistanceMakeup = setControls.resistanceMakeup.value;
        exercises[x].targetRepCount = Number(setControls.targetReps.value);
        exercises[x].formRating = Number(setControls.formRating.value);
        exercises[x].rangeOfMotionRating = Number(setControls.rangeOfMotionRating.value);
      }

    });

  }

  private save(completed: boolean): void {
    if (!this._executedWorkout) return;

    this.saving = true;
    this._messageService.info('Saving workout...', { nzDuration: 0 });
    this._executedWorkoutService
      .update(this._executedWorkout)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe({
        next: (workout: ExecutedWorkoutDTO) => {
          this._messageService.remove();
          this._executedWorkout = workout;
          if (completed) {
            if (this.isLoggingPastWorkout) {
              this.workoutForm.markAsPristine(); //To allow the guard to let us navigate away
              this._router.navigate(['/workouts/history']);
            }
            else {
              this.infoMsg = "Completed workout saved at " + new Date().toLocaleTimeString();
              this.workoutCompleted = true;
              this.endDateTime = this._executedWorkout.endDateTime;
              this._messageService.success('Workout completed!');
              this.workoutForm.markAsPristine();
            }
          }
          else {
            if (!this.startDateTime) this.startDateTime = this._executedWorkout.startDateTime;
            this._messageService.success('Progress updated!');
          }
          this.activeAccordionTab = this.getExerciseInProgress();
        },
        error: (error: any) => {
          this.setErrorInfo(error, "An error occurred saving workout information. See console for details.");
          //TODO: Fix the styling for this!
          this._messageService.error(error.message);
        }
      });
  }

  private getExerciseInProgress(): number {
    return this.exercisesArray.controls.findIndex((group: FormGroup<IWorkoutFormExercise>) => group.invalid);
  }

}
