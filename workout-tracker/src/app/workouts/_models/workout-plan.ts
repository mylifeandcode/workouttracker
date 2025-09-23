import { ExercisePlan } from "./exercise-plan";

export class WorkoutPlan {
  public workoutId: string = ''; //GUID
  public workoutName: string = '';
  public hasBeenExecutedBefore: boolean = false;
  public exercises: ExercisePlan[] = [];
  public submittedDateTime?: Date;
}