import { ExerciseDTO } from "./exercise-dto";

export class ExerciseInWorkout {
  public id: number;
  public exerciseId: number;
  public exerciseName: string;
  public numberOfSets: number;
  public setType: number;

  constructor(id: number, exerciseId: number, exerciseName: string, numberOfSets: number, setType: number) {
    this.id = id;
    this.exerciseId = exerciseId;
    this.exerciseName = exerciseName;
    this.numberOfSets = numberOfSets;
    this.setType = setType;
    console.log("ExerciseInWorkout: ", this);
  }
}
