import { ExercisePlan } from "./exercise-plan";

export class WorkoutPlan {
  public workoutId: number = -1;
  public workoutName: string = '';
  public userId: number = -1;
  public hasBeenExecutedBefore: boolean = false;
  public exercises: ExercisePlan[] = [];
  public submittedDateTime?: Date;
  public pastWorkoutStartDateTime?: Date | null;
  public pastWorkoutEndDateTime?: Date | null;
}