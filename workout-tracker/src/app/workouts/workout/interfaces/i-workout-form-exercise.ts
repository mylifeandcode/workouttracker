import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { IWorkoutFormExerciseSet } from "./i-workout-form-exercise-set";

export interface IWorkoutFormExercise {
  id: FormControl<number>;
  exerciseId: FormControl<number>;
  exerciseName: FormControl<string>;
  exerciseSets: FormArray<FormGroup<IWorkoutFormExerciseSet>>;
  setType: FormControl<number>;
  resistanceType: FormControl<number>;
}