import { Component, OnInit, inject, input, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { Validators, FormGroup, FormArray, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ResistanceBandService } from 'app/shared/services/resistance-band.service';
import { IBandAllocation, ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { Router, RouterLink } from '@angular/router';
import { IWorkoutFormExercise } from './_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from './_interfaces/i-workout-form-exercise-set';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { DurationComponent } from '../_shared/duration/duration.component';
import { DatePipe } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _executedWorkoutService = inject(ExecutedWorkoutService);
  private _resistanceBandService = inject(ResistanceBandService);
  private _messageService = inject(NzMessageService);
  private _router = inject(Router);


  //PUBLIC FIELDS
  public workoutForm: FormGroup<IWorkoutForm>;
  public formGroupForResistanceSelection: FormGroup<IWorkoutFormExerciseSet> | undefined = undefined;
  public formGroupForCountdownModal: FormGroup<IWorkoutFormExerciseSet> | undefined = undefined;
  public formControlForDurationEdit: FormControl<number | null> | null = null;

  public errorInfo = signal<string | undefined>(undefined);
  public workoutName = signal<string | null>(null);

  public showResistanceBandsSelectModal = signal(false);
  public settingResistanceForBilateralExercise = signal(false);
  public showCountdownModal = signal(false);
  public allResistanceBands = signal<ResistanceBandIndividual[]>([]);
  public countdownModalActivatedDateTime = signal(new Date());
  public saving = signal(false);
  public infoMsg = signal<string | undefined>(undefined);
  public workoutCompleted = signal(false);
  public showDurationModal = signal(false);
  public startDateTime = signal<Date | null>(null);
  public endDateTime = signal<Date | null>(null);
  public workoutLoaded = signal(false);
  public activeAccordionTab = signal(0);
  public exerciseBandAllocation = signal<IBandAllocation>({ selectedBandsDelimited: '', doubleMaxResistanceAmounts: false });
  //END PUBLIC FIELDS

  //INPUTS (SET VIA withComponentInputBinding())
  executedWorkoutPublicId = input<string | undefined>();
  pastWorkout = input<boolean>(false);
  //END INPUTS

  //PRIVATE FIELDS
  private _executedWorkout: ExecutedWorkoutDTO | undefined = undefined;
  private _apiCallsInProgress = signal<number>(0);
  //END PRIVATE FIELDS

  //PRIVATE READ-ONLY FIELDS
  private static readonly DEFAULT_DURATION = 120;
  private static readonly MIN_YEAR_THRESHOLD = 1;
  //END PRIVATE READ-ONLY FIELDS

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */
  /*
  public get loading(): boolean {
    return this._apiCallsInProgress > 0;
  }
  */
  public loading = computed(() => this._apiCallsInProgress() > 0);

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
      this._messageService.error(
        `executedWorkoutPublicId is invalid. Please exit this page and return to it from one of the pages where a workout can be selected.`);
      return;
    }

    this.getResistanceBands();
    this.setupWorkout();
    this.startWorkout();
  }

  public resistanceBandsModalEnabled(exerciseFormGroup: FormGroup<IWorkoutFormExerciseSet>): void {
    this.exerciseBandAllocation.set({
      selectedBandsDelimited: exerciseFormGroup.controls.resistanceMakeup.value ?? '',
      doubleMaxResistanceAmounts: !exerciseFormGroup.controls.bandsEndToEnd.value,
    });
    this.showResistanceBandsSelectModal.set(true);

    this.settingResistanceForBilateralExercise.set(exerciseFormGroup.controls.usesBilateralResistance.value);
    this.formGroupForResistanceSelection = exerciseFormGroup;
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    this.formGroupForResistanceSelection?.patchValue({
      resistanceMakeup: selectedBands.makeup,
      resistance: selectedBands.maxResistanceAmount
    });
    this.formGroupForResistanceSelection?.controls.resistanceMakeup.markAsDirty();
    this.formGroupForResistanceSelection?.controls.resistance.markAsDirty();
    this.showResistanceBandsSelectModal.set(false);
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal.set(false);
  }

  public showTimer(exerciseFormGroup: FormGroup): void {
    this.formGroupForCountdownModal = exerciseFormGroup;
    this.countdownModalActivatedDateTime.set(new Date());
    this.showCountdownModal.set(true);
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
    this.showDurationModal.set(true);
  }

  public durationModalAccepted(duration: number): void {
    this.formControlForDurationEdit?.setValue(duration);
    this.showDurationModal.set(false);
  }

  public durationModalCancelled(): void {
    this.formControlForDurationEdit = null;
    this.showDurationModal.set(false);
  }

  public hasUnsavedData(): boolean {
    return this.workoutForm.dirty;
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private createForm(): FormGroup<IWorkoutForm> {
    return this._formBuilder.group<IWorkoutForm>({
      //id: new FormControl<number | null>(0, Validators.required),
      publicId: new FormControl<string | null>(null, Validators.required),
      exercises: new FormArray<FormGroup<IWorkoutFormExercise>>([]),
      journal: new FormControl<string | null>('')
    });
  }

  private getResistanceBands(): void {
    this._apiCallsInProgress.update(n => n + 1);
    this._resistanceBandService.getAllIndividualBands()
      .pipe(finalize(() => { 
        this._apiCallsInProgress.update(n => n - 1);
      }))
      .subscribe({
        next: (bands: ResistanceBandIndividual[]) => {
          this.allResistanceBands.set(bands);
        },
        error: (error: HttpErrorResponse) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      });
  }

  private setupWorkout(): void {
    const id = this.executedWorkoutPublicId();
    if (!id) return;

    this._apiCallsInProgress.update(n => n + 1);
    this._executedWorkoutService.getById(id)
      .pipe(finalize(() => { 
        this._apiCallsInProgress.update(n => n - 1);
      }))
      .subscribe({
        next: (executedWorkout: ExecutedWorkoutDTO) => {
          this._executedWorkout = executedWorkout;
          this.workoutName.set(executedWorkout.name);

          if (this._executedWorkout.startDateTime == null)
            this._executedWorkout.startDateTime = new Date();

          this.startDateTime.set(this._executedWorkout.startDateTime);

          this.workoutForm?.patchValue({
            publicId: id
          });

          this.setupExercisesFormGroup(executedWorkout.exercises);

          this.workoutCompleted.set(this._executedWorkout.endDateTime != null);

          if (executedWorkout.journal) {
            this.workoutForm?.controls.journal.setValue(executedWorkout.journal);
          }

          this.workoutLoaded.set(true);
          this.activeAccordionTab.set(this.getExerciseInProgress());
        },
        error: (error: HttpErrorResponse) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      });
  }

  private setupExercisesFormGroup(exercises: ExecutedExerciseDTO[]): void {
    this.exercisesArray?.clear();

    const groupedExercises = this._executedWorkoutService.groupExecutedExercises(exercises);

    Object.values(groupedExercises).forEach((exerciseArray: ExecutedExerciseDTO[]) => {

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

        duration: new FormControl<number | null>(WorkoutComponent.DEFAULT_DURATION), //TODO: Get/set value from API

        involvesReps: new FormControl<boolean>(
          exercises[i].involvesReps, { nonNullable: true }), //Kind of a hack, but I need to pass this value along

        side: new FormControl<number | null>(exercises[i].side),
        usesBilateralResistance: new FormControl<boolean>(exercises[i].usesBilateralResistance, { nonNullable: true })
      });

      formArray.push(formGroup);
    }

    return formArray;
  }

  private setErrorInfo(error: HttpErrorResponse, defaultMessage: string): void {
    if (error.message)
      this.errorInfo.set(error.message);
    else
      this.errorInfo.set(defaultMessage);
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
        this._messageService.error('Exercises/FormArray length mismatch');
        //console.error('Exercises/FormArray length mismatch', { exercisesLength: exercises?.length, setsLength: sets.length });
        return;
      }

      for (let x = 0; x < exercises.length; x++) {
        const setGroup = sets.at(x);
        if (!setGroup) continue;
        const setControls = setGroup.controls;
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

    this.saving.set(true);
    this._messageService.info('Saving workout...', { nzDuration: 0 });
    this._executedWorkoutService
      .update(this._executedWorkout)
      .pipe(finalize(() => { this.saving.set(false); }))
      .subscribe({
        next: (workout: ExecutedWorkoutDTO) => {
          this._messageService.remove();
          this._executedWorkout = workout;
          if (completed) {
            if (this.pastWorkout()) {
              this.workoutForm.markAsPristine(); //To allow the guard to let us navigate away
              this._router.navigate(['/workouts/history']);
            }
            else {
              this.infoMsg.set("Completed workout saved at " + new Date().toLocaleTimeString());
              this.workoutCompleted.set(true);
              this.endDateTime.set(this._executedWorkout.endDateTime);
              this._messageService.success('Workout completed!');
              this.workoutForm.markAsPristine();
            }
          }
          else {
            if (!this.startDateTime()) this.startDateTime.set(this._executedWorkout.startDateTime);
            this._messageService.success('Progress updated!');
          }
          this.activeAccordionTab.set(this.getExerciseInProgress());
        },
        error: (error: HttpErrorResponse) => {
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
