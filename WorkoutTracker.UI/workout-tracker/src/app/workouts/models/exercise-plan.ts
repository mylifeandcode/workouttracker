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
  public recommendedTargetRepCount?: number;
  public targetRepCount: number;

  public resistanceAmountLastTime: number;
  public resistanceMakeupLastTime: string;
  public recommendedResistanceAmount?: number;
  public recommendedResistanceMakeup: string;
  public resistanceAmount: number;
  public resistanceMakeup: string;

  public recommendationReason: string;
}