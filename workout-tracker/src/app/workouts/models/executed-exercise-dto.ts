import { NamedEntity } from "app/shared/models/named-entity";

export class ExecutedExerciseDTO extends NamedEntity {
  public exerciseId: number = -1;
  public resistanceType: number = 0;
  public sequence: number = -1;
  public targetRepCount: number = 0;
  public actualRepCount: number = 0;
  public notes: string = '';
  public resistanceAmount: number = 0;
  public resistanceMakeup: string | null = null;
  public setType: number = 0;
  public duration: number | null = null;
  public formRating: number = 0;
  public rangeOfMotionRating: number = 0;
  public bandsEndToEnd: boolean | null = null;
  public involvesReps: boolean = false;
}
