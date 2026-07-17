import { ResistanceType, SetType } from "../../../../api";

//Data-shaped model for a single exercise's plan row, used as part of the Signal Forms model.
//setType/resistanceType are read-only here (display/branching only), so they carry the concrete
//DTO enum types. The many "last time"/"recommended" fields are display-only.
export interface IExercisePlanModel {
  exerciseInWorkoutId: number;
  exerciseId: number;
  exerciseName: string;
  numberOfSets: number;
  setType: SetType;
  resistanceType: ResistanceType;
  sequence: number;
  targetRepCountLastTime: number | null;
  avgActualRepCountLastTime: number | null;
  avgRangeOfMotionLastTime: number | null;
  avgFormLastTime: number | null;
  recommendedTargetRepCount: number | null;
  targetRepCount: number | null;
  resistanceAmountLastTime: number | null;
  resistanceMakeupLastTime: string | null;
  recommendedResistanceAmount: number | null;
  recommendedResistanceMakeup: string | null;
  resistanceAmount: number;
  resistanceMakeup: string | null;
  bandsEndToEnd: boolean | null;
  involvesReps: boolean;
  usesBilateralResistance: boolean;
  recommendationReason: string | null;
}
