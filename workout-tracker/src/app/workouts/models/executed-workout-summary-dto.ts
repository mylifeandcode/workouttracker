import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutSummaryDTO extends NamedEntityDTO {
  public workoutPublicId: string = ''; //GUID
  public startDateTime: Date = new Date();
  public endDateTime: Date = new Date();
  public journal: string | null = null;
}
