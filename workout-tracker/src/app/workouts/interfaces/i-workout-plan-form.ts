import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { IExercisePlanFormGroup } from "./i-exercise-plan-form-group";

export interface IWorkoutPlanForm {
  workoutId: FormControl<number>;
  workoutName: FormControl<string>; 
  hasBeenExecutedBefore: FormControl<boolean>;
  exercises: FormArray<FormGroup<IExercisePlanFormGroup>>;  
}
