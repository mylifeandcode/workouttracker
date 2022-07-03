import { ResistanceType } from "../enums/resistance-type";
import { SetType } from "../enums/set-type";

export class ExercisePlan {
  public exerciseInWorkoutId: number;
  public exerciseId: number;
  public exerciseName: string;

  public numberOfSets: number;
  public setType: SetType;
  public resistanceType: ResistanceType;
  public sequence: number;

  public targetRepCountLastTime: number;
  public maxActualRepCountLastTime: number;
  public avgActualRepCountLastTime: number;

  public maxRangeOfMotionLastTime: number;
  public avgRangeOfMotionLastTime: number;

  public maxFormLastTime: number;
  public avgFormLastTime: number;

  public recommendedTargetRepCount: number | null;
  public targetRepCount: number | null; //Nullable because not all exercises use reps (example: running on a treadmill)

  public resistanceAmountLastTime: number;
  public resistanceMakeupLastTime: string;

  public recommendedResistanceAmount: number | null;
  public recommendedResistanceMakeup: string | null;

  public resistanceAmount: number;
  public resistanceMakeup: string | null; //Only applies to resistance band exercises

  public bandsEndToEnd: boolean | null;
  public involvesReps: boolean;

  public recommendationReason: string;
}
