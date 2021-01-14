import { Exercise } from './exercise';

export class ExerciseInWorkout {
  public id: number;
  public exerciseId: number;
  public exerciseName: string;
  public numberOfSets: number;
  public setType: number;
  public sequence: number;
  public exercise: Exercise;

  constructor(
    id: number, 
    exerciseId: number, 
    exerciseName: string, 
    numberOfSets: number, 
    setType: number, 
    sequence: number) {
      
    this.id = id;
    this.exerciseId = exerciseId;
    this.numberOfSets = numberOfSets;
    this.setType = setType;
    this.sequence = sequence;
    this.exercise = null;
  }
}
