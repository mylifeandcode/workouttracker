import { FormControl } from "@angular/forms"

export interface IExercisePlanFormGroup {
  exerciseInWorkoutId: FormControl<number>; 
  exerciseId: FormControl<number>; 
  exerciseName: FormControl<string>; 
  numberOfSets: FormControl<number>;  
  setType: FormControl<number>; 
  resistanceType: FormControl<number>;  
  sequence: FormControl<number>;  
  targetRepCountLastTime: FormControl<number | null>; 
  avgActualRepCountLastTime: FormControl<number | null>; 
  avgRangeOfMotionLastTime: FormControl<number | null>; 
  avgFormLastTime: FormControl<number | null>; 
  recommendedTargetRepCount: FormControl<number | null>;  
  targetRepCount: FormControl<number | null>;  
  resistanceAmountLastTime: FormControl<number | null>; 
  resistanceMakeupLastTime: FormControl<string | null>; 
  recommendedResistanceAmount: FormControl<number | null>; 
  recommendedResistanceMakeup: FormControl<string | null>; 
  resistanceAmount: FormControl<number>; 
  resistanceMakeup: FormControl<string | null>; 
  bandsEndToEnd: FormControl<boolean | null>; 
  involvesReps: FormControl<boolean>; 
  recommendationReason: FormControl<string | null>; 
}