import { Entity } from 'app/shared/models/entity';
import { Exercise } from './exercise';

export class ExerciseInWorkout extends Entity {

  public exercise: Exercise | null;
  public exerciseId: number;
  public numberOfSets: number;
  public setType: number;
  public sequence: number;

  constructor(
    id: number,
    exerciseId: number,
    exerciseName: string,
    numberOfSets: number,
    setType: number,
    sequence: number) {
    super();
    this.id = id;
    this.exerciseId = exerciseId;
    this.exercise = new Exercise();
    this.exercise.name = exerciseName;
    this.numberOfSets = numberOfSets;
    this.setType = setType;
    this.sequence = sequence;
    this.exercise = null;
  }
}
