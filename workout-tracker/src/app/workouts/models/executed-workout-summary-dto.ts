import { IPublicEntity } from "app/shared/interfaces/i-public-entity";
import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutSummaryDTO extends NamedEntityDTO implements IPublicEntity {
  public workoutId: number = 0;
  public publicId: string | null = null;
  public startDateTime: Date = new Date();
  public endDateTime: Date = new Date();
  public journal: string | null = null;
}
