import { ExerciseInWorkoutDTO } from "./exercise-in-workout-dto";

export class WorkoutDTO {
    public id: number;
    public workoutName: string;
    public exercises: ExerciseInWorkoutDTO[];
    public targetAreas: string;

    constructor() {
        this.exercises = [];
    }
}
