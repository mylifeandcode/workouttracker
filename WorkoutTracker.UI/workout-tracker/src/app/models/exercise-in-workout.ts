import { ExerciseDTO } from "./exercise-dto";

export class ExerciseInWorkout {
    public exercise: ExerciseDTO;
    public numberOfSets: number;

    constructor(exercise: ExerciseDTO) {
        this.exercise = exercise;
    }
}