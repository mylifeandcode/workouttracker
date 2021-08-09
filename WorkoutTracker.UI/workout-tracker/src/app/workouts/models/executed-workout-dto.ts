import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutDTO extends NamedEntityDTO {
  public workoutId: number;
  public startDateTime: Date;
  public endDateTime: Date;
}
