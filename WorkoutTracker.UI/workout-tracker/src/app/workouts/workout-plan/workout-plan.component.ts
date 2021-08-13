import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { WorkoutPlan } from '../models/workout-plan';
import { WorkoutService } from '../workout.service';
import { ExercisePlan } from '../models/exercise-plan';

import * as _ from 'lodash';


@Component({
  selector: 'wt-workout-plan',
  templateUrl: './workout-plan.component.html',
  styleUrls: ['./workout-plan.component.css']
})
export class WorkoutPlanComponent implements OnInit {

  public workoutPlan: WorkoutPlan;
  public workoutPlanForm: FormGroup;

  //TODO: Component needs to show target reps and allow for setting target resistance


  /**
   * A property representing all of the Exercises which are part of the Workout
   */
   get exercisesArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutPlanForm.get('exercises') as FormArray;
  }

  constructor(
    private _workoutService: WorkoutService, 
    private _activatedRoute: ActivatedRoute, 
    private _formBuilder: FormBuilder) { 
  }

  public ngOnInit(): void {
    this.createForm();
    this.subscribeToRoute();
  }

  public startWorkout(): void {
    //TODO: Post the new ExecutedWorkout model to the API to create it, then redirect
    //to WorkoutComponent
  }

  private subscribeToRoute(): void {
    this._activatedRoute.params.subscribe((params: Params) => {
      this.workoutPlan = null;
      const workoutId = params["id"];
      this._workoutService.getPlan(workoutId)
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
          sequence: exercise.sequence, 
          targetRepCountLastTime: exercise.targetRepCountLastTime, 
          maxActualRepCountLastTime: exercise.maxActualRepCountLastTime,
          recommendedTargetRepCount: exercise.recommendedTargetRepCount, 
          targetRepCount: exercise.targetRepCount,
          resistanceAmountLastTime: exercise.resistanceAmountLastTime, 
          resistanceMakeupLastTime: exercise.resistanceMakeupLastTime, 
          recommendedResistanceAmount: exercise.recommendedResistanceAmount,
          recommendedResistanceMakeup: exercise.recommendedResistanceMakeup, 
          resistanceAmount: exercise.resistanceAmount, 
          resistanceMakeup: exercise.resistanceMakeup, 
          recommendationReason: exercise.recommendationReason
        })
      );

    });  

  }

  /*
  private getExerciseSetsFormArray(exercises: ExecutedExercise[]): FormArray {

    let formArray = this._formBuilder.array([]);

    //Each member of the array is a FormGroup
    for(let i = 0; i < exercises.length; i++) {
      let formGroup = this._formBuilder.group({
        sequence: [exercises[i].sequence], 
        resistance: [exercises[i].resistanceAmount, Validators.required], 
        targetReps: [exercises[i].targetRepCount, Validators.required], //TODO: Populate with data from API once refactored to provide it!
        actualReps: [0, Validators.required], 
        formRating: [null, Validators.required], 
        rangeOfMotionRating: [null, Validators.required], 
        resistanceMakeup: [exercises[i].resistanceMakeup], 
        bandsEndToEnd: [exercises[i].exercise.bandsEndToEnd], //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        duration: [120] //TODO: Get/set value from API
      });

      formGroup.controls.actualReps.disable();
      formGroup.controls.formRating.disable();
      formGroup.controls.rangeOfMotionRating.disable();

      formArray.push(formGroup);
    }

    return formArray;
  }  
  */

}
