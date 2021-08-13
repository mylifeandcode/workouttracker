import { ExercisePlan } from "./exercise-plan";

export class WorkoutPlan {
  public workoutId: number;
  public workoutName: string;
  public hasBeenExecutedBefore: boolean;
  public exercises: ExercisePlan[];
}