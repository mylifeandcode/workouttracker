import { IHasDateRange } from "../../shared/interfaces/i-has-date-range";
import { ExecutedExerciseMetrics } from "./executed-exercise-metrics";

export class ExecutedWorkoutMetrics implements IHasDateRange {
  public name: string = '';
  public startDateTime: Date = new Date();
  public endDateTime: Date = new Date();
  public exerciseMetrics: ExecutedExerciseMetrics[] = [];
}