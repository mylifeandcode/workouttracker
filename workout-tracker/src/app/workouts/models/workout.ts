import { NamedEntity } from "../../shared/models/named-entity";
import { ExerciseInWorkout } from './exercise-in-workout';

export class Workout extends NamedEntity {
    public userId: number;
    public exercises: Array<ExerciseInWorkout>;
    public active: boolean;

    constructor() {
        super();
        this.id = 0;
        this.exercises = [];
        this.active = true;
        this.userId = -1;
    }
}
