import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { WorkoutPlan } from '../_models/workout-plan';
import { WorkoutService } from '../_services/workout.service';
import { ExercisePlan } from '../_models/exercise-plan';
import { forEach } from 'lodash-es';
import { IBandAllocation, ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ResistanceBandService } from 'app/shared/services/resistance-band.service';
import { finalize } from 'rxjs/operators';
import { IWorkoutPlanForm } from '../workout/_interfaces/i-workout-plan-form';
import { IExercisePlanFormGroup } from './exercise-plan/interfaces/i-exercise-plan-form-group';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ExercisePlanComponent } from './exercise-plan/exercise-plan.component';
import { EMPTY_GUID } from 'app/shared/shared-constants';
import { NzModalModule } from 'ng-zorro-antd/modal';


@Component({
  selector: 'wt-workout-plan',
  templateUrl: './workout-plan.component.html',
  styleUrls: ['./workout-plan.component.scss'],
  imports: [
    NzSpinModule, FormsModule, ReactiveFormsModule, NzModalModule,
    ExercisePlanComponent, ResistanceBandSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutPlanComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _workoutService = inject(WorkoutService);
  private _resistanceBandService = inject(ResistanceBandService);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _formBuilder = inject(FormBuilder);


  //PUBLIC FIELDS
  public workoutPlan = signal<WorkoutPlan | undefined>(undefined);
  public workoutPlanForm: FormGroup<IWorkoutPlanForm>;
  public formGroupForResistanceSelection: FormGroup | undefined;

  public showResistanceBandsSelectModal = signal(false);
  public settingResistanceForBilateralExercise = signal(false);
  public allResistanceBands = signal<ResistanceBandIndividual[]>([]);
  public errorInfo = signal<string | undefined>(undefined);
  public isProcessing = signal(false);
  public planningForLater = signal(false);
  public exerciseBandAllocation = signal<IBandAllocation>({ selectedBandsDelimited: '', doubleMaxResistanceAmounts: false });
  //END PUBLIC FIELDS

  //PUBLIC PROPERTIES
  public get isForPastWorkout(): boolean { return this._pastWorkoutStartDateTime != null; }
  //END PUBLIC PROPERTIES

  //PRIVATE FIELDS
  private _apiCallsInProgress: number = 0;
  private _pastWorkoutStartDateTime: Date | null = null;
  private _pastWorkoutEndDateTime: Date | null = null;
  //END PRIVATE FIELDS

  //TODO: Component needs to show target reps and allow for setting target resistance
  //TODO: Consolidate code duplicated between this component and WorkoutComponent
  //TODO: Ask for duration for timed sets
  //TODO: Ask for targets for each set

  //PUBLIC PROPERTIES
  /**
   * A property representing all of the Exercises which are part of the Workout
   */
  get exercisesArray(): FormArray<FormGroup<IExercisePlanFormGroup>> {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutPlanForm.controls.exercises;
  }

  /**
   * A property indicating whether or not the component is still loading information
   */
  public get loading(): boolean {
    return this._apiCallsInProgress > 0;
  }
  //END PUBLIC PROPERTIES

  constructor() {
    super();
    this.workoutPlanForm = this.createForm();
  }

  //PUBLIC METHODS
  public ngOnInit(): void {
    this.getResistanceBandInventory();
    this.subscribeToRoute();
    this.planningForLater.set(this._router.url.includes("for-later"));
  }

  public startWorkout(): void {
    if (!this.workoutPlanForm) return;

    if (this.workoutPlan()) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlan(this.workoutPlan()!)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm.markAsPristine();
        }))
        .subscribe((executedWorkoutPublicId: string) => {
          this._router.navigate([`workouts/start/${executedWorkoutPublicId}`]);
        });
    }
  }

  public submitPlanForLater(): void {
    if (!this.workoutPlanForm) return;

    if (this.workoutPlan()) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForLater(this.workoutPlan()!)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm.markAsPristine();
        }))
        .subscribe((executedWorkoutPublicId: string) => {
          this._router.navigate([`workouts/select-planned`]);
        });
    }
  }

  public submitPlanForPast(): void {
    if (this.workoutPlan() && this.workoutPlanForm && this._pastWorkoutStartDateTime && this._pastWorkoutEndDateTime) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForPast(this.workoutPlan()!, this._pastWorkoutStartDateTime, this._pastWorkoutEndDateTime)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm.markAsPristine();
        }))
        .subscribe((executedWorkoutPublicId: string) => {
          this._router.navigate([`workouts/start/${executedWorkoutPublicId}`], { queryParams: { pastWorkout: true } });
        });
    }
  }

  public resistanceBandsModalEnabled(exerciseFormGroup: FormGroup<IExercisePlanFormGroup>): void {
    console.log('form group: ', exerciseFormGroup);

    this.settingResistanceForBilateralExercise.set(exerciseFormGroup.controls.usesBilateralResistance.value);
    this.showResistanceBandsSelectModal.set(true);
    this.formGroupForResistanceSelection = exerciseFormGroup;
    this.exerciseBandAllocation.set({ 
      selectedBandsDelimited: exerciseFormGroup.controls.resistanceMakeup.value ?? '',
      doubleMaxResistanceAmounts: !exerciseFormGroup.controls.bandsEndToEnd.value
    });
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    if (!this.formGroupForResistanceSelection) return;

    this.formGroupForResistanceSelection.patchValue({
      resistanceMakeup: selectedBands.makeup,
      resistanceAmount: selectedBands.maxResistanceAmount
    });
    this.showResistanceBandsSelectModal.set(false);
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal.set(false);
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS
  private subscribeToRoute(): void { //TODO: Refactor. Use snapshot instead.
    this._activatedRoute.params.subscribe((params: Params) => {
      this.workoutPlan.set(undefined);
      const workoutId = params["id"];

      if (params["start"])
        this._pastWorkoutStartDateTime = new Date(params["start"]);

      if (params["end"])
        this._pastWorkoutEndDateTime = new Date(params["end"]);

      this._apiCallsInProgress++;
      this._workoutService.getNewPlan(workoutId)
        .pipe(finalize(() => { this._apiCallsInProgress--; }))
        .subscribe((result: WorkoutPlan) => {
          this.workoutPlan.set(result);
          this.workoutPlanForm.patchValue({
            workoutPublicId: result.workoutId,
            workoutName: result.workoutName,
            hasBeenExecutedBefore: result.hasBeenExecutedBefore
          });
          this.setupExercisesFormGroup(result.exercises);
        });
    });
  }

  private createForm(): FormGroup<IWorkoutPlanForm> {
    return this._formBuilder.group<IWorkoutPlanForm>({
      workoutPublicId: new FormControl<string>(EMPTY_GUID, { nonNullable: true, validators: Validators.required }),
      workoutName: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      hasBeenExecutedBefore: new FormControl<boolean>(false, { nonNullable: true }),
      exercises: new FormArray<FormGroup<IExercisePlanFormGroup>>([])
    });
  }

  private setupExercisesFormGroup(exercises: ExercisePlan[]): void {
    if (!this.exercisesArray) return;

    this.exercisesArray.clear();
    forEach(exercises, (exercise: ExercisePlan) => {

      this.exercisesArray.push(
        this._formBuilder.group<IExercisePlanFormGroup>({
          exerciseInWorkoutId: new FormControl<number>(exercise.exerciseInWorkoutId, { nonNullable: true, validators: Validators.required }),
          exerciseId: new FormControl<number>(exercise.exerciseId, { nonNullable: true, validators: Validators.required }),
          exerciseName: new FormControl<string>(exercise.exerciseName, { nonNullable: true, validators: Validators.required }),
          numberOfSets: new FormControl<number>(exercise.numberOfSets, { nonNullable: true, validators: Validators.required }),
          setType: new FormControl<number>(exercise.setType, { nonNullable: true, validators: Validators.required }),
          resistanceType: new FormControl<number>(exercise.resistanceType, { nonNullable: true, validators: Validators.required }),
          sequence: new FormControl<number>(exercise.sequence, { nonNullable: true, validators: Validators.required }),
          targetRepCountLastTime: new FormControl<number | null>(exercise.targetRepCountLastTime),
          avgActualRepCountLastTime: new FormControl<number | null>(exercise.avgActualRepCountLastTime),
          avgRangeOfMotionLastTime: new FormControl<number | null>(exercise.avgRangeOfMotionLastTime),
          avgFormLastTime: new FormControl<number | null>(exercise.avgFormLastTime),
          recommendedTargetRepCount: new FormControl<number | null>(exercise.recommendedTargetRepCount),
          targetRepCount: new FormControl<number | null>(exercise.targetRepCount, { validators: Validators.min(exercise.involvesReps ? 1 : 0) }),
          resistanceAmountLastTime: new FormControl<number | null>(exercise.resistanceAmountLastTime),
          resistanceMakeupLastTime: new FormControl<string | null>(exercise.resistanceMakeupLastTime),
          recommendedResistanceAmount: new FormControl<number | null>(exercise.recommendedResistanceAmount),
          recommendedResistanceMakeup: new FormControl<string | null>(exercise.recommendedResistanceMakeup),
          resistanceAmount: new FormControl<number>(exercise.resistanceAmount, { nonNullable: true, validators: (exercise.resistanceType != 3 ? Validators.min(0.1) : null) }),
          resistanceMakeup: new FormControl<string | null>(exercise.resistanceMakeup),
          bandsEndToEnd: new FormControl<boolean | null>(exercise.bandsEndToEnd),
          involvesReps: new FormControl<boolean>(exercise.involvesReps, { nonNullable: true }),
          usesBilateralResistance: new FormControl<boolean>(exercise.usesBilateralResistance, { nonNullable: true }),
          recommendationReason: new FormControl<string | null>(exercise.recommendationReason)
        })
      );

    });

  }

  private updateWorkoutPlanFromForm(): void {
    if (this.workoutPlan() && this.exercisesArray) {
      this.exercisesArray.controls.forEach((exerciseFormGroup: FormGroup<IExercisePlanFormGroup>, index: number) => {

        //TODO: Revisit. Maybe can be made simpler now that we have Typed Forms. :)
        const exercisePlan = this.workoutPlan()?.exercises[index];
        if (exercisePlan) {
          exercisePlan.targetRepCount = exerciseFormGroup.controls.targetRepCount.value;
          exercisePlan.resistanceAmount = exerciseFormGroup.controls.resistanceAmount.value;
          exercisePlan.resistanceMakeup = exerciseFormGroup.controls.resistanceMakeup.value;
        }
      });
    }
  }

  private getResistanceBandInventory(): void {
    this._apiCallsInProgress++;
    this._resistanceBandService.getAllIndividualBands()
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe({
        next: (bands: ResistanceBandIndividual[]) => {
          this.allResistanceBands.set(bands);
        },
        error: (error: any) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      });
  }

  private setErrorInfo(error: any, defaultMessage: string): void {
    if (error.message)
      this.errorInfo.set(error.message);
    else
      this.errorInfo.set(defaultMessage);
  }

  private setupDataForPlanSubmission(): void {
    if (this.workoutPlan()) {
      this.updateWorkoutPlanFromForm();
      this.workoutPlan()!.submittedDateTime = new Date();
      this.isProcessing.set(true);
    }
  }

  public hasUnsavedData(): boolean {
    if (!this.workoutPlanForm) return false;
    return this.workoutPlanForm.dirty;
  }

  //END PRIVATE METHODS

}
