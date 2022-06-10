import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'wt-exercise-plan',
  templateUrl: './exercise-plan.component.html',
  styleUrls: ['./exercise-plan.component.css']
})
export class ExercisePlanComponent {

  @Input()
  formGroup: UntypedFormGroup; //TODO: Use a strong-typed structure

  @Input()
  workoutHasBeenExecutedBefore: boolean;

  @Output()
  resistanceBandsModalRequested: EventEmitter<UntypedFormGroup>;

  constructor() { 
    this.resistanceBandsModalRequested = new EventEmitter<UntypedFormGroup>();
  }

  public selectResistanceBands(formGroup: UntypedFormGroup): void {
    this.resistanceBandsModalRequested.emit(formGroup);
  }

  public useSameResistanceAsLastTime(): void {
    
    //A strong-typed FormGroup would be great for this
    this.formGroup.patchValue({
      resistanceAmount: this.formGroup.controls['resistanceAmountLastTime'].value, 
      resistanceMakeup: this.formGroup.controls['resistanceMakeupLastTime'].value
    }); 

  }

}
