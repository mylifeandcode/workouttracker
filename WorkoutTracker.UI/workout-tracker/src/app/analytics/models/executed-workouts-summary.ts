export class ExecutedWorkoutsSummary {
  public totalLoggedWorkouts: number = 0;
  public firstLoggedWorkoutDateTime: Date | null = null;
  public targetAreasWithWorkoutCounts: Map<string, number> = new Map<string, number>();
}