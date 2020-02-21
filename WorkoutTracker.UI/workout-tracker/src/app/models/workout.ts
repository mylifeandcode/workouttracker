import { NamedEntity } from "./named-entity";
import { Set } from "./set";
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
