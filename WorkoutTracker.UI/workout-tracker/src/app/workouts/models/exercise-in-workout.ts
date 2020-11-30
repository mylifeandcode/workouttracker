import { Exercise } from './exercise';

export class ExerciseInWorkout {
  public id: number;
  public exerciseId: number;
  public exerciseName: string;
  public numberOfSets: number;
  public setType: number;
  public exercise: Exercise;
  public resistanceType: number;

  constructor(
    id: number, 
    exerciseId: number, 
    exerciseName: string, 
    numberOfSets: number, 
    setType: number, 
    resistanceType: number) {
      
    this.id = id;
    this.exerciseId = exerciseId;
    //this.exerciseName = exerciseName;
    this.numberOfSets = numberOfSets;
    this.setType = setType;
    this.resistanceType = resistanceType;
    this.exercise = null;
    console.log("ExerciseInWorkout: ", this);
  }
}
