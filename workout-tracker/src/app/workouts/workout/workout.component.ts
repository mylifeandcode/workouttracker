import { Component, OnInit, inject, input, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { form, FormField, FieldTree, required, applyEach } from '@angular/forms/signals';
import { finalize } from 'rxjs/operators';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { IBandAllocation, ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from '../../shared/models/resistance-band-individual';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO, ExecutedWorkoutDTO } from '../../api';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { Router, RouterLink } from '@angular/router';
import { IWorkoutFormExercise } from './_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from './_interfaces/i-workout-form-exercise-set';
import { IWorkoutFormModel } from './_interfaces/i-workout-form';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { DurationComponent } from '../_shared/duration/duration.component';
import { DatePipe } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.scss'],
  imports: [
    NzSpinModule,
    FormField,
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
  private _executedWorkoutService = inject(ExecutedWorkoutService);
  private _resistanceBandService = inject(ResistanceBandService);
  private _messageService = inject(NzMessageService);
  private _router = inject(Router);


  //PUBLIC FIELDS
  protected readonly model = signal<IWorkoutFormModel>({ publicId: '', journal: '', exercises: [] });
  public readonly workoutForm = form(this.model, (p) => {
    required(p.publicId);
    applyEach(p.exercises, (exercise) => {
      applyEach(exercise.exerciseSets, (set) => {
        required(set.resistance);
        required(set.targetReps);
        required(set.actualReps);
        //'' (not yet rated) fails required, which gates workout completion; '0' (N/A) is a valid choice
        required(set.formRating);
        required(set.rangeOfMotionRating);
      });
    });
  });

  public fieldForResistanceSelection: FieldTree<IWorkoutFormExerciseSet> | undefined = undefined;
  public fieldForCountdownModal: FieldTree<IWorkoutFormExerciseSet> | undefined = undefined;
  public fieldForDurationEdit: FieldTree<number> | undefined = undefined;

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
   * Specifies whether or not the workout has been started
   */
  get workoutStarted(): boolean {
    return this._executedWorkout?.startDateTime != null
      && new Date(this._executedWorkout?.startDateTime).getFullYear() > 1;
  }
  //END PUBLIC PROPERTIES

  constructor() {
    super();
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
  }

  public resistanceBandsModalEnabled(setField: FieldTree<IWorkoutFormExerciseSet>): void {
    const set = setField().value();
    this.exerciseBandAllocation.set({
      selectedBandsDelimited: set.resistanceMakeup ?? '',
      doubleMaxResistanceAmounts: !set.bandsEndToEnd,
    });
    this.showResistanceBandsSelectModal.set(true);

    this.settingResistanceForBilateralExercise.set(set.usesBilateralResistance);
    this.fieldForResistanceSelection = setField;
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    //Write through the field's value signal; this updates the model and immediately re-renders
    //the exercise display (the previous reactive-forms version was a change-detection cycle behind).
    this.fieldForResistanceSelection?.resistanceMakeup().value.set(selectedBands.makeup);
    this.fieldForResistanceSelection?.resistance().value.set(selectedBands.maxResistanceAmount);
    //Programmatic value writes don't flip dirty, so mark them so the unsaved-changes guard trips.
    this.fieldForResistanceSelection?.resistanceMakeup().markAsDirty();
    this.fieldForResistanceSelection?.resistance().markAsDirty();
    this.showResistanceBandsSelectModal.set(false);
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal.set(false);
  }

  public showTimer(setField: FieldTree<IWorkoutFormExerciseSet>): void {
    this.fieldForCountdownModal = setField;
    this.countdownModalActivatedDateTime.set(new Date());
    this.showCountdownModal.set(true);
  }

  public completeWorkout(): void {
    this.setWorkoutValuesFromModel();

    if (!this._executedWorkout) return;

    if (this._executedWorkout.endDateTime == null) //Because we could be entering information for a past workout
      this._executedWorkout.endDateTime = new Date();

    this.save(true);
  }

  public saveWorkoutInProgress(): void {
    this.setWorkoutValuesFromModel();
    this.save(false);
  }

  public openDurationModal(durationField: FieldTree<number>): void {
    this.fieldForDurationEdit = durationField;
    this.showDurationModal.set(true);
  }

  public durationModalAccepted(duration: number): void {
    this.fieldForDurationEdit?.().value.set(duration);
    this.showDurationModal.set(false);
  }

  public durationModalCancelled(): void {
    this.fieldForDurationEdit = undefined;
    this.showDurationModal.set(false);
  }

  public hasUnsavedData(): boolean {
    return this.workoutForm().dirty();
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

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

          this.model.set(this.buildModel(id, executedWorkout));

          this.workoutCompleted.set(this._executedWorkout.endDateTime != null);

          this.workoutLoaded.set(true);
          this.activeAccordionTab.set(this.getExerciseInProgress());
        },
        error: (error: HttpErrorResponse) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      });
  }

  private buildModel(id: string, executedWorkout: ExecutedWorkoutDTO): IWorkoutFormModel {
    const groupedExercises = this._executedWorkoutService.groupExecutedExercises(executedWorkout.exercises);

    const exercises: IWorkoutFormExercise[] = Object.values(groupedExercises).map((exerciseArray: ExecutedExerciseDTO[]) => ({
      id: exerciseArray[0].id,
      exerciseId: exerciseArray[0].exerciseId,
      exerciseName: exerciseArray[0].name,
      setType: exerciseArray[0].setType,
      resistanceType: exerciseArray[0].resistanceType,
      exerciseSets: exerciseArray.map((exercise: ExecutedExerciseDTO): IWorkoutFormExerciseSet => ({
        sequence: exercise.sequence,
        resistance: exercise.resistanceAmount,
        targetReps: exercise.targetRepCount,
        actualReps: exercise.actualRepCount ? exercise.actualRepCount : 0,
        //'' when not yet rated; native <select> values are strings, converted to numbers on save
        formRating: exercise.formRating ? String(exercise.formRating) : '',
        rangeOfMotionRating: exercise.rangeOfMotionRating ? String(exercise.rangeOfMotionRating) : '',
        resistanceMakeup: exercise.resistanceMakeup ?? '',
        //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        bandsEndToEnd: exercise.bandsEndToEnd ?? false,
        duration: WorkoutComponent.DEFAULT_DURATION, //TODO: Get/set value from API
        involvesReps: exercise.involvesReps, //Kind of a hack, but I need to pass this value along
        side: exercise.side ?? -1, //-1 = no side (ExerciseSide.LEFT is 0)
        usesBilateralResistance: exercise.usesBilateralResistance
      }))
    }));

    return {
      publicId: id,
      journal: executedWorkout.journal ?? '',
      exercises
    };
  }

  private setErrorInfo(error: HttpErrorResponse, defaultMessage: string): void {
    if (error.message)
      this.errorInfo.set(error.message);
    else
      this.errorInfo.set(defaultMessage);
  }

  private setWorkoutValuesFromModel(): void {
    if (!this._executedWorkout) return;
    const model = this.model();
    this._executedWorkout.journal = model.journal;

    model.exercises.forEach((exercise: IWorkoutFormExercise) => {
      const sets = exercise.exerciseSets;
      const exerciseId = exercise.exerciseId;
      let exercises = this._executedWorkout?.exercises.filter((executedExercise: ExecutedExerciseDTO) =>
        executedExercise.exerciseId == exerciseId
      );

      exercises = exercises?.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

      if (exercises?.length != sets.length) {
        this._messageService.error('Exercises/FormArray length mismatch');
        //console.error('Exercises/FormArray length mismatch', { exercisesLength: exercises?.length, setsLength: sets.length });
        return;
      }

      for (let x = 0; x < exercises.length; x++) {
        const set = sets[x];
        exercises[x].actualRepCount = Number(set.actualReps);
        exercises[x].duration = set.duration;
        exercises[x].resistanceAmount = set.resistance;
        exercises[x].resistanceMakeup = set.resistanceMakeup;
        exercises[x].targetRepCount = Number(set.targetReps);
        exercises[x].formRating = Number(set.formRating);
        exercises[x].rangeOfMotionRating = Number(set.rangeOfMotionRating);
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
              this.workoutForm().reset(); //Clears dirty/touched so the guard will let us navigate away
              this._router.navigate(['/workouts/history']);
            }
            else {
              this.infoMsg.set("Completed workout saved at " + new Date().toLocaleTimeString());
              this.workoutCompleted.set(true);
              this.endDateTime.set(this._executedWorkout.endDateTime ?? null);
              this._messageService.success('Workout completed!');
              this.workoutForm().reset();
            }
          }
          else {
            if (!this.startDateTime()) this.startDateTime.set(this._executedWorkout.startDateTime ?? null);
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
    const exercises = this.workoutForm.exercises;
    for (let i = 0; i < exercises.length; i++) {
      if (exercises[i]().invalid()) return i;
    }
    return -1;
  }
}
