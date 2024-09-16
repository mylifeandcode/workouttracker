import { NamedEntity } from "app/shared/models/named-entity";
import { ExerciseInWorkoutDTO } from "./exercise-in-workout-dto";
import { IPublicEntity } from "app/shared/interfaces/i-public-entity";

export class WorkoutDTO extends NamedEntity implements IPublicEntity {
    public exercises: ExerciseInWorkoutDTO[];
    public targetAreas: string;
    public active: boolean;
    public publicId: string | null;

    constructor() {
      super();
      this.exercises = [];
      this.targetAreas = '';
      this.active = false;
      this.publicId = null;
    }
}
