import { Exercise } from './exercise';

export class ExerciseInWorkout {

  //TODO: Refactor! These class differs from the server-side version for client-side 
  //needs, which seems like a bad idea.

  public id: number;
  public exerciseId: number;
  public exerciseName: string; //Not on the server-side model -- maybe we should add it there?
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
    this.exerciseName = exerciseName;
    this.numberOfSets = numberOfSets;
    this.setType = setType;
    this.sequence = sequence;
    this.exercise = null;
  }
}
