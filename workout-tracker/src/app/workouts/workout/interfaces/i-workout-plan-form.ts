import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { IExercisePlanFormGroup } from "../../workout-plan/exercise-plan/interfaces/i-exercise-plan-form-group";

export interface IWorkoutPlanForm {
  //workoutId: FormControl<number>;
  workoutPublicId: FormControl<string>;
  workoutName: FormControl<string>; 
  hasBeenExecutedBefore: FormControl<boolean>;
  exercises: FormArray<FormGroup<IExercisePlanFormGroup>>;  
}
