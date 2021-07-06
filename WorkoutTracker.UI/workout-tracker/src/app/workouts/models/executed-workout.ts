import { Entity } from "app/shared/models/entity";
import { ExecutedExercise } from "./executed-exercise";
import { Workout } from "./workout";

export class ExecutedWorkout extends Entity {
  public workout: Workout;
  public startDateTime: Date;
  public endDateTime: Date;
  public journal: string;
  public rating: number;
  public exercises: Array<ExecutedExercise>;
}
