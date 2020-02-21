import { ExerciseDTO } from "./exercise-dto";

export class ExerciseInWorkout {
  public id: number;
  public exerciseId: number;
  public exerciseName: string;
  public numberOfSets: number;
  public setType: number;

  /*
  constructor(exercise: ExerciseDTO) {
    this.exerciseId = exercise.id;
    this.exerciseName = exercise.name;
    this.setType = 1;
  }
  */

  constructor(exerciseId: number, exerciseName: string, setType: number) {
    this.exerciseId = exerciseId;
    this.exerciseName = exerciseName;
    this.setType = setType;
  }
}
