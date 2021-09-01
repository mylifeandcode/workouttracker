import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'wt-exercise-plan',
  templateUrl: './exercise-plan.component.html',
  styleUrls: ['./exercise-plan.component.css']
})
export class ExercisePlanComponent {

  @Input()
  formGroup: FormGroup; //TODO: Use a strong-typed structure

  @Output()
  resistanceBandsModalRequested: EventEmitter<FormGroup>;

  constructor() { 
    this.resistanceBandsModalRequested = new EventEmitter<FormGroup>();
  }

  public selectResistanceBands(formGroup: FormGroup): void {
    this.resistanceBandsModalRequested.emit(formGroup);
  }

}
