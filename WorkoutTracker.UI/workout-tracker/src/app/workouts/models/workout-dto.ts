import { NamedEntity } from "app/shared/models/named-entity";
import { ExerciseInWorkoutDTO } from "./exercise-in-workout-dto";

export class WorkoutDTO extends NamedEntity {
    public exercises: ExerciseInWorkoutDTO[];
    public targetAreas: string;
    public active: boolean;

    constructor() {
      super();
      this.exercises = [];
    }
}
