//Data-shaped model for a single exercise set, used as the Signal Forms model type.
//Native <select> values are strings, so the two rating fields are strings ('' = not yet rated,
//which is distinct from '0' = N/A); they're converted to numbers when persisting to the DTO.
export interface IWorkoutFormExerciseSet {
  sequence: number;
  resistance: number;
  targetReps: number;
  actualReps: number;
  formRating: string;          // '' = not yet rated; '0'..'5' map to the rating options
  rangeOfMotionRating: string; // '' = not yet rated; '0'..'5' map to the rating options
  resistanceMakeup: string;    // '' = none selected
  bandsEndToEnd: boolean;
  duration: number;
  involvesReps: boolean;
  side: number;                // -1 = no side (ExerciseSide.LEFT is 0, so 0 can't mean "none")
  usesBilateralResistance: boolean;
}
