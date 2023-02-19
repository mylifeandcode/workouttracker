import { NamedEntity } from "app/shared/models/named-entity";
import { ExecutedExerciseDTO } from "./executed-exercise-dto";

export class ExecutedWorkoutDTO extends NamedEntity { //Note this extends NamedEntity, not NamedEntityDTO
  public workoutId: number;
  public startDateTime: Date | null;
  public endDateTime: Date | null;
  public journal: string | null;
  public rating: number;
  public exercises: Array<ExecutedExerciseDTO>;
}
