import { ExercisePlan } from "./exercise-plan";

export class WorkoutPlan {
  //public workoutId: number = 0;
  public workoutId: string = ''; //GUID
  public workoutName: string = '';
  public hasBeenExecutedBefore: boolean = false;
  public exercises: ExercisePlan[] = [];
  public submittedDateTime?: Date;
  //public pastWorkoutStartDateTime?: Date | null;
  //public pastWorkoutEndDateTime?: Date | null;
}