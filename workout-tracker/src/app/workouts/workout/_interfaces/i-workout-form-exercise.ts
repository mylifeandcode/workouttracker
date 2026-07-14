import { IWorkoutFormExerciseSet } from "./i-workout-form-exercise-set";

//Data-shaped model for an exercise (a group of sets), used as part of the Signal Forms model.
export interface IWorkoutFormExercise {
  id: number;
  exerciseId: string;
  exerciseName: string;
  exerciseSets: IWorkoutFormExerciseSet[];
  setType: number;
  resistanceType: number;
}
