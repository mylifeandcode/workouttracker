import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';

@Component({
  selector: 'wt-exercise-plan',
  templateUrl: './exercise-plan.component.html',
  styleUrls: ['./exercise-plan.component.css']
})
export class ExercisePlanComponent {

  @Input()
  formGroup: FormGroup<IExercisePlanFormGroup>;

  @Input()
  workoutHasBeenExecutedBefore: boolean;

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

}
