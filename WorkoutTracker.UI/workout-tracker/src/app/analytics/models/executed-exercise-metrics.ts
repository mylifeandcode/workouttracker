import { SetType } from "app/core/enums/set-type";

export class ExecutedExerciseMetrics {
  public name: string;
  public sequence: number;
  public setType: SetType;
  public averageRepCount: number;
  public averageResistanceAmount: number; //TODO: Make nullable for body weight: add code to handle
  public averageForm: number;
  public averageRangeOfMotion: number;
}