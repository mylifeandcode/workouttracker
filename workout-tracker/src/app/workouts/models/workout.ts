import { IPublicEntity } from "app/shared/interfaces/i-public-entity";
import { NamedEntity } from "../../shared/models/named-entity";
import { ExerciseInWorkout } from './exercise-in-workout';

export class Workout extends NamedEntity implements IPublicEntity {
    public userId: number;
    public exercises: Array<ExerciseInWorkout>;
    public active: boolean;
    public publicId: string | null;

    constructor() {
        super();
        this.id = 0;
        this.exercises = [];
        this.active = true;
        this.userId = 0;
        this.publicId = null;
    }
}
