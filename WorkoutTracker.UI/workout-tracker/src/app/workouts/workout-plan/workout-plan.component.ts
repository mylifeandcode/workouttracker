import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { WorkoutPlan } from '../models/workout-plan';
import { WorkoutService } from '../workout.service';
import { ExercisePlan } from '../models/exercise-plan';

import * as _ from 'lodash';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ResistanceBandSelection } from '../models/resistance-band-selection';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'wt-workout-plan',
  templateUrl: './workout-plan.component.html',
  styleUrls: ['./workout-plan.component.css']
})
export class WorkoutPlanComponent implements OnInit {

  //PUBLIC FIELDS
  public workoutPlan: WorkoutPlan | null; //Null before retrieved
  public workoutPlanForm: FormGroup;
  public showResistanceBandsSelectModal: boolean;
  public allResistanceBands: ResistanceBandIndividual[] = [];
  public formGroupForResistanceSelection: FormGroup;
  public errorInfo: string;
  public isProcessing: boolean = false;
  public planningForLater: boolean = false;
  //END PUBLIC FIELDS

  //PUBLIC PROPERTIES
  public get isForPastWorkout(): boolean { return this._pastWorkoutStartDateTime != null; }
  //END PUBLIC PROPERTIES

  //VIEWCHILD
  @ViewChild(ResistanceBandSelectComponent) bandSelect: ResistanceBandSelectComponent;

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
   get exercisesArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutPlanForm.get('exercises') as FormArray;
  }

  /**
   * A property indicating whether or not the component is still loading information
   */
  public get loading(): boolean {
    return this._apiCallsInProgress > 0; 
  }
  //END PUBLIC PROPERTIES

  constructor(
    private _workoutService: WorkoutService, 
    private _resistanceBandService: ResistanceBandService, 
    private _activatedRoute: ActivatedRoute, 
    private _router: Router, 
    private _formBuilder: FormBuilder) { 
  }

  //PUBLIC METHODS
  public ngOnInit(): void {
    this.getResistanceBandInventory();
    this.createForm();
    this.subscribeToRoute();
    this.planningForLater = this._router.url.includes("for-later");
  }

  public startWorkout(): void {
    if (this.workoutPlan) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlan(this.workoutPlan)
        .pipe(finalize(() => { this.isProcessing = false; }))
        .subscribe((executedWorkoutId: number) => {
          this._router.navigate([`workouts/start/${executedWorkoutId}`]);
        });
    }
  }

  public submitPlanForLater(): void {
    if (this.workoutPlan) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForLater(this.workoutPlan)
        .pipe(finalize(() => { this.isProcessing = false; }))
        .subscribe((executedWorkoutId: number) => {
          this._router.navigate([`workouts/select-planned`]);
        });
    }
  }

  public submitPlanForPast(): void {
    if (this.workoutPlan && this._pastWorkoutStartDateTime && this._pastWorkoutEndDateTime) {
      this.setupDataForPlanSubmission();
      this._workoutService.submitPlanForPast(this.workoutPlan, this._pastWorkoutStartDateTime, this._pastWorkoutEndDateTime)
        .pipe(finalize(() => { this.isProcessing = false; }))
        .subscribe((executedWorkoutId: number) => {
          this._router.navigate([`workouts/start/${executedWorkoutId}`], { queryParams: { pastWorkout: true }});
        });
    }
  }

  public resistanceBandsModalEnabled(exerciseFormGroup: FormGroup): void {
    this.showResistanceBandsSelectModal = true;
    this.formGroupForResistanceSelection = exerciseFormGroup;
    this.bandSelect.setBandAllocation(
      exerciseFormGroup.controls.resistanceMakeup.value, 
      !exerciseFormGroup.controls.bandsEndToEnd.value);
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    this.formGroupForResistanceSelection.patchValue({ 
      resistanceMakeup: selectedBands.makeup, 
      resistanceAmount: selectedBands.maxResistanceAmount 
    });
    this.showResistanceBandsSelectModal = false;
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal = false;
  }
  
  //END PUBLIC METHODS

  //PRIVATE METHODS
  private subscribeToRoute(): void {
    this._activatedRoute.params.subscribe((params: Params) => {
      this.workoutPlan = null;
      const workoutId = params["id"];

      if (params["start"])
        this._pastWorkoutStartDateTime = new Date(params["start"]);

      if (params["end"])
        this._pastWorkoutEndDateTime = new Date(params["end"]);

      this._apiCallsInProgress++;
      this._workoutService.getPlan(workoutId)
        .pipe(finalize(() => { this._apiCallsInProgress--; }))
        .subscribe((result: WorkoutPlan) => {
          this.workoutPlan = result;
          this.workoutPlanForm.patchValue({
            workoutId: workoutId, 
            workoutName: result.workoutName, 
            hasBeenExecutedBefore: result.hasBeenExecutedBefore
          });
          this.setupExercisesFormGroup(result.exercises);
        });
    });
  }

  private createForm(): void {
    this.workoutPlanForm = this._formBuilder.group({
        workoutId: [0, Validators.required ], 
        workoutName: '', 
        hasBeenExecutedBefore: false, 
        exercises: this._formBuilder.array([])
    });
  }
  
  private setupExercisesFormGroup(exercises: ExercisePlan[]): void {
    this.exercisesArray.clear();
    _.forEach(exercises, (exercise: ExercisePlan) => {

      this.exercisesArray.push(
        this._formBuilder.group({
          exerciseInWorkoutId: exercise.exerciseInWorkoutId, 
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          numberOfSets: exercise.numberOfSets, 
          setType: exercise.setType, 
          resistanceType: exercise.resistanceType, 
          sequence: exercise.sequence, 
          targetRepCountLastTime: exercise.targetRepCountLastTime, 
          avgActualRepCountLastTime: exercise.avgActualRepCountLastTime,
          avgRangeOfMotionLastTime: exercise.avgRangeOfMotionLastTime, 
          avgFormLastTime: exercise.avgFormLastTime, 
          recommendedTargetRepCount: exercise.recommendedTargetRepCount, 
          targetRepCount: [exercise.targetRepCount, Validators.min(exercise.involvesReps ? 1 : 0)],
          resistanceAmountLastTime: exercise.resistanceAmountLastTime, 
          resistanceMakeupLastTime: exercise.resistanceMakeupLastTime, 
          recommendedResistanceAmount: exercise.recommendedResistanceAmount,
          recommendedResistanceMakeup: exercise.recommendedResistanceMakeup, 
          resistanceAmount: [exercise.resistanceAmount, (exercise.resistanceType != 3 ? Validators.min(0.1) : null)], 
          resistanceMakeup: exercise.resistanceMakeup, 
          bandsEndToEnd: exercise.bandsEndToEnd, 
          involvesReps: exercise.involvesReps,
          recommendationReason: exercise.recommendationReason,
        })
      );

    });  

  }

  private updateWorkoutPlanFromForm(): void {
    if (this.workoutPlan) {
      this.exercisesArray.controls.forEach((control: AbstractControl, index: number, array: AbstractControl[]) => {
        
        const exerciseFormGroup = control as FormGroup;
        const exercisePlan = this.workoutPlan?.exercises[index];
        if (exercisePlan) {
          console.log(control);
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
      .subscribe(
        (bands: ResistanceBandIndividual[]) => {
          this.allResistanceBands = bands;
        }, 
        (error: any) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      );
  }

  private setErrorInfo(error: any, defaultMessage: string): void {
    if (error.message)
      this.errorInfo = error.message;
    else
      this.errorInfo = defaultMessage;
  }
  
  private setupDataForPlanSubmission(): void {
    if (this.workoutPlan) {
      this.updateWorkoutPlanFromForm();
      this.workoutPlan.submittedDateTime = new Date();
      this.workoutPlan.pastWorkoutStartDateTime = this._pastWorkoutStartDateTime;
      this.workoutPlan.pastWorkoutEndDateTime = this._pastWorkoutEndDateTime;
      this.isProcessing = true;
    }
  }

  //END PRIVATE METHODS

}
