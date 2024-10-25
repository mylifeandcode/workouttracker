import { NamedEntityDTO } from "./named-entity-dto";
import { ExecutedExerciseDTO } from "./executed-exercise-dto";

export class ExecutedWorkoutDTO extends NamedEntityDTO {
  public workoutId: string = '';
  public startDateTime: Date | null = null;
  public endDateTime: Date | null = null;
  public journal: string | null = null;
  public rating: number = 0;
  public exercises: Array<ExecutedExerciseDTO> = [];
}
