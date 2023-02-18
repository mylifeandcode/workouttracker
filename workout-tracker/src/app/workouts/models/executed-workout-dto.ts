import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutSummaryDTO extends NamedEntityDTO {
  public workoutId: number;
  public startDateTime: Date;
  public endDateTime: Date;
  public journal: string;
}
