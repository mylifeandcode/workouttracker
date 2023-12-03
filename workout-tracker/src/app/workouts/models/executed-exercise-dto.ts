import { NamedEntity } from "app/shared/models/named-entity";
import { ExerciseSide } from "../enums/exercise-side";

export class ExecutedExerciseDTO extends NamedEntity {
  public exerciseId: number = 0;
  public resistanceType: number = 0;
  public sequence: number = 0;
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
  public side: ExerciseSide | null = null;
  public usesBilateralResistance: boolean = false;
}
