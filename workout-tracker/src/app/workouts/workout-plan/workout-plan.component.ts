import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { form, FieldTree, required, min, applyEach, applyWhen } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { WorkoutPlan, ExercisePlan, ResistanceType } from '../../api';
import { WorkoutService } from '../_services/workout.service';
import { IBandAllocation, ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from '../../shared/models/resistance-band-individual';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { finalize } from 'rxjs/operators';
import { IWorkoutPlanModel } from '../workout/_interfaces/i-workout-plan-form';
import { IExercisePlanModel } from './exercise-plan/interfaces/i-exercise-plan-form-group';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ExercisePlanComponent } from './exercise-plan/exercise-plan.component';
import { EMPTY_GUID } from '../../shared/constants/feature-agnostic-constants';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'wt-workout-plan',
  templateUrl: './workout-plan.component.html',
  styleUrls: ['./workout-plan.component.scss'],
  imports: [
    NzSpinModule, NzModalModule,
    ExercisePlanComponent, ResistanceBandSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutPlanComponent extends CheckForUnsavedDataComponent implements OnInit {
  //INPUTS
  id = input.required<string>();
  start = input<string | null>(null);
  end = input<string | null>(null);

  private _workoutService = inject(WorkoutService);
  private _resistanceBandService = inject(ResistanceBandService);
  private _router = inject(Router);


  //PUBLIC FIELDS
  public workoutPlan = signal<WorkoutPlan | undefined>(undefined);

  protected readonly model = signal<IWorkoutPlanModel>({
    workoutPublicId: EMPTY_GUID,
    workoutName: '',
    hasBeenExecutedBefore: false,
    exercises: []
  });
  public readonly workoutPlanForm = form(this.model, (p) => {
    required(p.workoutPublicId);
    required(p.workoutName);
    applyEach(p.exercises, (ex) => {
      required(ex.exerciseInWorkoutId);
      required(ex.exerciseId);
      required(ex.exerciseName);
      required(ex.numberOfSets);
      required(ex.setType);
      required(ex.resistanceType);
      required(ex.sequence);
      //Target reps must be >= 1, but only for exercises that involve reps
      applyWhen(ex.targetRepCount, ({ valueOf }) => valueOf(ex.involvesReps), (targetRepCount) => {
        min(targetRepCount, 1);
      });
      //Resistance amount must be > 0, except for body-weight exercises
      applyWhen(ex.resistanceAmount, ({ valueOf }) => valueOf(ex.resistanceType) !== ResistanceType.BODY_WEIGHT, (resistanceAmount) => {
        min(resistanceAmount, 0.1);
      });
    });
  });

  public fieldForResistanceSelection: FieldTree<IExercisePlanModel> | undefined;

  public showResistanceBandsSelectModal = signal(false);
  public settingResistanceForBilateralExercise = signal(false);
  public allResistanceBands = signal<ResistanceBandIndividual[]>([]);
  public errorInfo = signal<string | undefined>(undefined);
  public isProcessing = signal(false);
  public planningForLater = signal(false);
  public exerciseBandAllocation = signal<IBandAllocation>({ selectedBandsDelimited: '', doubleMaxResistanceAmounts: false });
  public loading = computed(() => this._apiCallsInProgress() > 0);
  //END PUBLIC FIELDS

  //PUBLIC PROPERTIES
  public get isForPastWorkout(): boolean { return this._pastWorkoutStartDateTime != null; }
  //END PUBLIC PROPERTIES

  //PRIVATE FIELDS
  private _apiCallsInProgress = signal<number>(0);
  private _pastWorkoutStartDateTime: Date | null = null;
  private _pastWorkoutEndDateTime: Date | null = null;
  //END PRIVATE FIELDS

  //TODO: Component needs to show target reps and allow for setting target resistance
  //TODO: Consolidate code duplicated between this component and WorkoutComponent
  //TODO: Ask for duration for timed sets
  //TODO: Ask for targets for each set

  constructor() {
    super();
  }

  //PUBLIC METHODS
  public ngOnInit(): void {
    this.getResistanceBandInventory();
    this.processInputs();
    this.planningForLater.set(this._router.url.includes("for-later"));
  }

  public startWorkout(): void {
    if (this.workoutPlan()) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlan(this.workoutPlan()!)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm().reset();
        }))
        .subscribe((executedWorkoutPublicId: string) => {
          this._router.navigate([`workouts/start/${executedWorkoutPublicId}`]);
        });
    }
  }

  public submitPlanForLater(): void {
    if (this.workoutPlan()) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForLater(this.workoutPlan()!)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm().reset();
        }))
        .subscribe(() => {
          this._router.navigate([`workouts/select-planned`]);
        });
    }
  }

  public submitPlanForPast(): void {
    if (this.workoutPlan() && this._pastWorkoutStartDateTime && this._pastWorkoutEndDateTime) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForPast(this.workoutPlan()!, this._pastWorkoutStartDateTime, this._pastWorkoutEndDateTime)
        .pipe(finalize(() => {
          this.isProcessing.set(false);
          this.workoutPlanForm().reset();
        }))
        .subscribe((executedWorkoutPublicId: string) => {
          this._router.navigate([`workouts/start/${executedWorkoutPublicId}`], { queryParams: { pastWorkout: true } });
        });
    }
  }

  public resistanceBandsModalEnabled(exerciseField: FieldTree<IExercisePlanModel>): void {
    console.log('form group: ', exerciseField);

    const exercise = exerciseField().value();
    this.settingResistanceForBilateralExercise.set(exercise.usesBilateralResistance);
    this.showResistanceBandsSelectModal.set(true);
    this.fieldForResistanceSelection = exerciseField;
    this.exerciseBandAllocation.set({
      selectedBandsDelimited: exercise.resistanceMakeup ?? '',
      doubleMaxResistanceAmounts: !exercise.bandsEndToEnd
    });
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    if (!this.fieldForResistanceSelection) return;

    this.fieldForResistanceSelection.resistanceMakeup().value.set(selectedBands.makeup);
    this.fieldForResistanceSelection.resistanceAmount().value.set(selectedBands.maxResistanceAmount);
    this.showResistanceBandsSelectModal.set(false);
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal.set(false);
  }

  public hasUnsavedData(): boolean {
    return this.workoutPlanForm().dirty();
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS
  private processInputs(): void {
    this.workoutPlan.set(undefined);
    const workoutId = this.id();

    if (this.start()) {
      this._pastWorkoutStartDateTime = new Date(this.start()!);
    }

    if (this.end()) {
      this._pastWorkoutEndDateTime = new Date(this.end()!);
    }

    this._apiCallsInProgress.update(n => n + 1);
    this._workoutService.getNewPlan(workoutId)
      .pipe(finalize(() => { this._apiCallsInProgress.update(n => n - 1); }))
      .subscribe((result: WorkoutPlan) => {
        this.workoutPlan.set(result);
        this.model.set(this.buildModel(result));
      });

  }

  private buildModel(plan: WorkoutPlan): IWorkoutPlanModel {
    return {
      //Defaults guard against a partial DTO (Signal Forms needs concrete values, no undefined)
      workoutPublicId: plan.workoutId ?? EMPTY_GUID,
      workoutName: plan.workoutName ?? '',
      hasBeenExecutedBefore: plan.hasBeenExecutedBefore ?? false,
      exercises: (plan.exercises ?? []).map((exercise: ExercisePlan): IExercisePlanModel => ({
        exerciseInWorkoutId: exercise.exerciseInWorkoutId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        numberOfSets: exercise.numberOfSets,
        setType: exercise.setType,
        resistanceType: exercise.resistanceType,
        sequence: exercise.sequence,
        targetRepCountLastTime: exercise.targetRepCountLastTime ?? null,
        avgActualRepCountLastTime: exercise.avgActualRepCountLastTime ?? null,
        avgRangeOfMotionLastTime: exercise.avgRangeOfMotionLastTime ?? null,
        avgFormLastTime: exercise.avgFormLastTime ?? null,
        recommendedTargetRepCount: exercise.recommendedTargetRepCount ?? null,
        targetRepCount: exercise.targetRepCount ?? null,
        resistanceAmountLastTime: exercise.resistanceAmountLastTime ?? null,
        resistanceMakeupLastTime: exercise.resistanceMakeupLastTime ?? null,
        recommendedResistanceAmount: exercise.recommendedResistanceAmount ?? null,
        recommendedResistanceMakeup: exercise.recommendedResistanceMakeup ?? null,
        resistanceAmount: exercise.resistanceAmount,
        resistanceMakeup: exercise.resistanceMakeup ?? null,
        bandsEndToEnd: exercise.bandsEndToEnd ?? null,
        involvesReps: exercise.involvesReps,
        usesBilateralResistance: exercise.usesBilateralResistance,
        recommendationReason: exercise.recommendationReason ?? null
      }))
    };
  }

  private updateWorkoutPlanFromForm(): void {
    const plan = this.workoutPlan();
    if (!plan) return;

    this.model().exercises.forEach((exercise: IExercisePlanModel, index: number) => {
      //TODO: Revisit. Maybe can be made simpler now that we have Signal Forms. :)
      const exercisePlan = plan.exercises[index];
      if (exercisePlan) {
        exercisePlan.targetRepCount = exercise.targetRepCount ?? 0; //TODO: Need to revisit ExercisePlan for exercises without reps
        exercisePlan.resistanceAmount = exercise.resistanceAmount;
        exercisePlan.resistanceMakeup = exercise.resistanceMakeup;
      }
    });
  }

  private getResistanceBandInventory(): void {
    this._apiCallsInProgress.update(n => n + 1);
    this._resistanceBandService.getAllIndividualBands()
      .pipe(finalize(() => { this._apiCallsInProgress.update(n => n - 1); }))
      .subscribe({
        next: (bands: ResistanceBandIndividual[]) => {
          this.allResistanceBands.set(bands);
        },
        error: (error: HttpErrorResponse) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      });
  }

  private setErrorInfo(error: HttpErrorResponse, defaultMessage: string): void {
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

  //END PRIVATE METHODS

}
