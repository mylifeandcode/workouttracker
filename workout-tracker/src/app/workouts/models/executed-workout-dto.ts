import { NamedEntity } from "app/shared/models/named-entity";
import { ExecutedExerciseDTO } from "./executed-exercise-dto";
import { IPublicEntity } from "app/shared/interfaces/i-public-entity";

export class ExecutedWorkoutDTO extends NamedEntity implements IPublicEntity {
  public publicId: string = ''; //GUID
  public workoutId: number = 0;
  public startDateTime: Date | null = null;
  public endDateTime: Date | null = null;
  public journal: string | null = null;
  public rating: number = 0;
  public exercises: Array<ExecutedExerciseDTO> = [];
}
