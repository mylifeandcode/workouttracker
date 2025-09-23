import { IHasDateRange } from "app/shared/interfaces/i-has-date-range";
import { NamedEntityDTO } from "./named-entity-dto";

export class ExecutedWorkoutSummaryDTO extends NamedEntityDTO implements IHasDateRange {
  public workoutPublicId: string = ''; //GUID
  public startDateTime: Date = new Date();
  public endDateTime: Date = new Date();
  public journal: string | null = null;
}
