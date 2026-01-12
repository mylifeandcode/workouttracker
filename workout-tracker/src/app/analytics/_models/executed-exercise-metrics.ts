import { SetType } from "../../workouts/workout/_enums/set-type";

export class ExecutedExerciseMetrics {
  public exerciseId: string = ''; //GUID
  public name: string = '';
  public sequence: number = 0;
  public setType: SetType = SetType.Repetition;
  public averageRepCount: number = 0;
  public averageResistanceAmount: number = 0; //TODO: Make nullable for body weight: add code to handle
  public averageForm: number = 0;
  public averageRangeOfMotion: number = 0;
}