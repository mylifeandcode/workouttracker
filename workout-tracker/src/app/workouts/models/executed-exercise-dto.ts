import { NamedEntity } from "app/shared/models/named-entity";

export class ExecutedExerciseDTO extends NamedEntity {
  public exerciseId: number;
  public resistanceType: number;
  public sequence: number;
  public targetRepCount: number;
  public actualRepCount: number;
  public notes: string;
  public resistanceAmount: number;
  public resistanceMakeup: string | null;
  public setType: number;
  public duration: number | null;
  public formRating: number;
  public rangeOfMotionRating: number;
  public bandsEndToEnd: boolean | null;
  public involvesReps: boolean;
}
