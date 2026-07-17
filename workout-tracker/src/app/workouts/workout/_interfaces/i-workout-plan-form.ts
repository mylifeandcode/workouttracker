import { IExercisePlanModel } from "../../workout-plan/exercise-plan/interfaces/i-exercise-plan-form-group";

//Root data-shaped model for the workout-plan form, passed to Signal Forms' form().
export interface IWorkoutPlanModel {
  workoutPublicId: string;
  workoutName: string;
  hasBeenExecutedBefore: boolean;
  exercises: IExercisePlanModel[];
}
