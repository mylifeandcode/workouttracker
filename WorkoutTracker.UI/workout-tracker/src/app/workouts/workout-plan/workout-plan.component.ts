import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedExercise } from '../models/executed-exercise';
import { ExecutedWorkout } from '../models/executed-workout';
import * as _ from 'lodash';

@Component({
  selector: 'wt-workout-plan',
  templateUrl: './workout-plan.component.html',
  styleUrls: ['./workout-plan.component.css']
})
export class WorkoutPlanComponent implements OnInit {

  public executedWorkout: ExecutedWorkout;
  public workoutForm: FormGroup;

  //TODO: Component needs to show target reps and allow for setting target resistance


  /**
   * A property representing all of the Exercises which are part of the Workout
   */
   get exercisesArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutForm.get('exercises') as FormArray;
  }

  constructor(
    private _executedWorkoutService: ExecutedWorkoutService, 
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
      this.executedWorkout = null;
      const workoutId = params["id"];
      this._executedWorkoutService.getNew(workoutId)
        .subscribe((result: ExecutedWorkout) => {
          this.executedWorkout = result;
          this.workoutForm.patchValue({
            id: workoutId
          });
          this.setupExercisesFormGroup(result.exercises);

        });
    });
  }

  //TODO: These are here temporarily -- copied from WorkoutComponent. Consolidate!
  private createForm(): void {
    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        exercises: this._formBuilder.array([]), 
        journal: ['']
    });
  }
  
  private setupExercisesFormGroup(exercises: ExecutedExercise[]): void {
    this.exercisesArray.clear();

    //Group ExecutedExercise by Exercise and Set Type
    let groupedExercises = _.groupBy(exercises, (exercise: ExecutedExercise) => { 
        return exercise.exercise.id.toString() + '-' + exercise.setType.toString(); 
      });

    _.forEach(groupedExercises, (exerciseArray: ExecutedExercise[]) => {

      this.exercisesArray.push(
        this._formBuilder.group({
          id: exerciseArray[0].id, //WARN: Pretty sure this will still just be 0 at this point
          exerciseId: exerciseArray[0].exercise.id, 
          exerciseName: [exerciseArray[0].exercise.name, Validators.compose([Validators.required])],
          exerciseSets: this.getExerciseSetsFormArray(exerciseArray), 
          setType: [exerciseArray[0].setType, Validators.compose([Validators.required])], 
          resistanceType: [exerciseArray[0].exercise.resistanceType, Validators.compose([Validators.required])]
        })
      );

    });  

  }

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
    
}
