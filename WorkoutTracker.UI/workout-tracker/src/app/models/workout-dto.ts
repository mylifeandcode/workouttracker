import { SetDTO } from "./set-dto";
import { ExerciseInWorkout } from "./exercise-in-workout";

export class WorkoutDTO {
    public id: number;
    public workoutName: string;
    public exercises: ExerciseInWorkout[];

    constructor() {
        this.exercises = [];
    }
}
