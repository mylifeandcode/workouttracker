import { FormControl } from "@angular/forms";

export interface IWorkoutFormExerciseSet {
  sequence: FormControl<number>; 
  resistance: FormControl<number>; 
  targetReps: FormControl<number | null>;
  actualReps: FormControl<number | null>;
  formRating: FormControl<number | null>;
  rangeOfMotionRating: FormControl<number | null>;
  resistanceMakeup: FormControl<string | null>;
  bandsEndToEnd: FormControl<boolean | null>;
  duration: FormControl<number | null>;
  involvesReps: FormControl<boolean>;
  side: FormControl<number | null>;
  usesBilateralResistance: FormControl<boolean>;
}