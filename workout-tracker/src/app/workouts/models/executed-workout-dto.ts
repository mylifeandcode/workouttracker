import { NamedEntity } from "app/shared/models/named-entity";
import { ExecutedExerciseDTO } from "./executed-exercise-dto";

export class ExecutedWorkoutDTO extends NamedEntity { //Note this extends NamedEntity, not NamedEntityDTO
  public workoutId: number = 0;
  public startDateTime: Date | null = null;
  public endDateTime: Date | null = null;
  public journal: string | null = null;
  public rating: number = 0;
  public exercises: Array<ExecutedExerciseDTO> = [];
}
