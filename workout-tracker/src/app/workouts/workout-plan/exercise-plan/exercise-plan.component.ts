import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IExercisePlanFormGroup } from './interfaces/i-exercise-plan-form-group';
import { ExercisePlanLastTimeComponent } from './exercise-plan-last-time/exercise-plan-last-time.component';
import { ExercisePlanSuggestionsComponent } from './exercise-plan-suggestions/exercise-plan-suggestions.component';
import { ExercisePlanNextTimeComponent } from './exercise-plan-next-time/exercise-plan-next-time.component';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';

@Component({
    selector: 'wt-exercise-plan',
    templateUrl: './exercise-plan.component.html',
    styleUrls: ['./exercise-plan.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, ExercisePlanLastTimeComponent, ExercisePlanSuggestionsComponent, ExercisePlanNextTimeComponent, ResistanceTypePipe]
})
export class ExercisePlanComponent {

  @Input({ required: true }) //The "required" property has no effect on TypeScript wanting the value to be initialized.
  formGroup: FormGroup<IExercisePlanFormGroup> = new FormGroup(<IExercisePlanFormGroup>{}); //HACK -- kind of. Initializes, but...not for real.

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

}
