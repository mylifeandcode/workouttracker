import { ResistanceType } from "../workout/_enums/resistance-type";
import { SetType } from "../workout/_enums/set-type";

export class ExercisePlan {
  public exerciseInWorkoutId: number = 0;
  public exerciseId: number = 0;
  public exerciseName: string = '';

  public numberOfSets: number = 0;
  public setType: SetType = SetType.Repetition;
  public resistanceType: ResistanceType = ResistanceType.BodyWeight;
  public sequence: number = 0;

  public targetRepCountLastTime: number = 0;
  public maxActualRepCountLastTime: number = 0;
  public avgActualRepCountLastTime: number = 0;

  public maxRangeOfMotionLastTime: number = 0;
  public avgRangeOfMotionLastTime: number = 0;

  public maxFormLastTime: number = 0;
  public avgFormLastTime: number = 0;

  public recommendedTargetRepCount: number | null = null;
  public targetRepCount: number | null = null; //Nullable because not all exercises use reps (example: running on a treadmill)

  public resistanceAmountLastTime: number = 0;
  public resistanceMakeupLastTime: string = '';

  public recommendedResistanceAmount: number | null = null;
  public recommendedResistanceMakeup: string | null = null;

  public resistanceAmount: number = 0;
  public resistanceMakeup: string | null = null; //Only applies to resistance band exercises

  public bandsEndToEnd: boolean | null = null;
  public involvesReps: boolean = true;
  public usesBilateralResistance: boolean = false;

  public recommendationReason: string = '';
}
