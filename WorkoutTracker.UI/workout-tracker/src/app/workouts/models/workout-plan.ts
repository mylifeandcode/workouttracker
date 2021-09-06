import { ExercisePlan } from "./exercise-plan";

export class WorkoutPlan {
  public workoutId: number;
  public workoutName: string;
  public userId: number;
  public hasBeenExecutedBefore: boolean;
  public exercises: ExercisePlan[];
  public submittedDateTime?: Date;
}