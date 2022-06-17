import { ExecutedExerciseMetrics } from "./executed-exercise-metrics";

export class ExecutedWorkoutMetrics {
  public name: string;
  public startDateTime: Date;
  public endDateTime: Date;
  public exerciseMetrics: ExecutedExerciseMetrics[];
}