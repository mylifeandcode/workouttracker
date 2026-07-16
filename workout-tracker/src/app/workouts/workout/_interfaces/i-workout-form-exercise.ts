import { ResistanceType, SetType } from "../../../api";
import { IWorkoutFormExerciseSet } from "./i-workout-form-exercise-set";

//Data-shaped model for an exercise (a group of sets), used as part of the Signal Forms model.
//setType/resistanceType are read-only in this form (used for display/branching, never edited),
//so they carry the concrete DTO enum types.
export interface IWorkoutFormExercise {
  id: number;
  exerciseId: string;
  exerciseName: string;
  exerciseSets: IWorkoutFormExerciseSet[];
  setType: SetType;
  resistanceType: ResistanceType;
}
