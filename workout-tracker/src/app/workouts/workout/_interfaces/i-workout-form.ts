import { IWorkoutFormExercise } from "./i-workout-form-exercise";

//Root data-shaped model for the workout form, passed to Signal Forms' form().
export interface IWorkoutFormModel {
  publicId: string;
  journal: string;
  exercises: IWorkoutFormExercise[];
}
