import { Entity } from "app/shared/models/entity";
import { Exercise } from "./exercise";

export class ExecutedExercise extends Entity {
  public sequence: number;
  public exercise: Exercise;
  public targetRepCount: number;
  public actualRepCount: number;
  public notes: string;
  public resistanceAmount: number;
  public resistanceMakeup: string;
  public setType: number;
  public duration: number;
  public formRating: number;
  public rangeOfMotionRating: number;
}