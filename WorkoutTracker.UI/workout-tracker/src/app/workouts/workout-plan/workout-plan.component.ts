import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
    private _router: Router, 
    private _formBuilder: FormBuilder) { 
  }

  public ngOnInit(): void {
    this.createForm();
    this.subscribeToRoute();
  }

  public startWorkout(): void {
    this.updateWorkoutPlanFromForm();
    this._workoutService.submitPlan(this.workoutPlan)
      .subscribe((executedWorkoutId: number) => {
        //this._router.navigate([`workouts/plan/${event.target.value}`]);
        this._router.navigate([`workouts/start/${executedWorkoutId}`]);
        //this._router.navigate(['workouts/start', id]);
      });
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
          resistanceType: exercise.resistanceType, 
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

  private updateWorkoutPlanFromForm(): void {
    this.exercisesArray.controls.forEach((control: AbstractControl, index: number, array: AbstractControl[]) => {
      
      const exerciseFormGroup = control as FormGroup;
      const exercisePlan = this.workoutPlan.exercises[index];
      console.log(control);
      exercisePlan.targetRepCount = exerciseFormGroup.controls.targetRepCount.value;
      exercisePlan.resistanceAmount = exerciseFormGroup.controls.resistanceAmount.value;
      exercisePlan.resistanceMakeup = exerciseFormGroup.controls.resistanceMakeup.value;
    });
  }
}
