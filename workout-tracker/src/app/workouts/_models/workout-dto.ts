import { NamedEntityDTO } from "./named-entity-dto";
import { ExerciseInWorkoutDTO } from "./exercise-in-workout-dto";

export class WorkoutDTO extends NamedEntityDTO {
    public exercises: ExerciseInWorkoutDTO[];
    public targetAreas: string;
    public active: boolean;

    constructor() {
      super();
      this.exercises = [];
      this.targetAreas = '';
      this.active = false;
    }
}
