import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';

@Component({
  selector: 'wt-exercise-plan',
  templateUrl: './exercise-plan.component.html',
  styleUrls: ['./exercise-plan.component.scss']
})
export class ExercisePlanComponent {

  @Input()
  formGroup!: FormGroup<IExercisePlanFormGroup>; //TODO: Revisit the use of ! here. This value *should* always be present, but I feel like this is a hack. Look for a better solution.

  @Input()
  workoutHasBeenExecutedBefore: boolean = false;

  @Output()
  resistanceBandsModalRequested: EventEmitter<FormGroup<IExercisePlanFormGroup>>;

  constructor() { 
    this.resistanceBandsModalRequested = new EventEmitter<FormGroup<IExercisePlanFormGroup>>();
  }

  public selectResistanceBands(formGroup: FormGroup<IExercisePlanFormGroup>): void {
    this.resistanceBandsModalRequested.emit(formGroup);
  }

  public useSameResistanceAsLastTime(): void {
    
    this.formGroup.patchValue({
      resistanceAmount: this.formGroup.controls.resistanceAmountLastTime.value ?? 0, 
      resistanceMakeup: this.formGroup.controls.resistanceMakeupLastTime.value
    }); 

  }

  public useSuggestions(): void {
    this.formGroup.patchValue({
      resistanceAmount: this.formGroup.controls.recommendedResistanceAmount.value ?? 0, 
      resistanceMakeup: this.formGroup.controls.recommendedResistanceMakeup.value, 
      targetRepCount: this.formGroup.controls.recommendedTargetRepCount.value ?? 0
    }); 
  }

}
