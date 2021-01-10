import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutDTO extends NamedEntityDTO {
  public startDateTime: Date;
  public endDateTime: Date;
}