import { NamedEntity } from "../../shared/models/named-entity";
import { ExerciseInWorkout } from './exercise-in-workout';

export class Workout extends NamedEntity {
    public userId: number;
    public exercises: Array<ExerciseInWorkout>;

    constructor() {
        super();
        this.id = 0;
        this.exercises = [];
    }
}
