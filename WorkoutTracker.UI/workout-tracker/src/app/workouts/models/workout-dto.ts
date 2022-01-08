import { ExerciseInWorkoutDTO } from "./exercise-in-workout-dto";

export class WorkoutDTO {
    public id: number;
    public workoutName: string;
    public exercises: ExerciseInWorkoutDTO[];
    public targetAreas: string;
    public active: boolean;

    constructor() {
        this.exercises = [];
    }
}
