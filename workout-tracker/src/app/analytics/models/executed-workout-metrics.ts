import { ExecutedExerciseMetrics } from "./executed-exercise-metrics";

export class ExecutedWorkoutMetrics {
  public name: string = '';
  public startDateTime: Date = new Date();
  public endDateTime: Date = new Date();
  public exerciseMetrics: ExecutedExerciseMetrics[] = [];
}