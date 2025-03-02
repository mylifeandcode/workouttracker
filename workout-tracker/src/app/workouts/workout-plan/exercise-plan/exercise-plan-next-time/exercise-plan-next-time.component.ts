import { Component, EventEmitter, Output, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';
import { ResistanceType } from '../../../workout/_enums/resistance-type';
import { SelectOnFocusDirective } from '../../../../shared/directives/select-on-focus.directive';
import { ResistanceBandColorPipe } from '../../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceAmountPipe } from '../../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-exercise-plan-next-time',
    templateUrl: './exercise-plan-next-time.component.html',
    styleUrls: ['./exercise-plan-next-time.component.scss'],
    //changeDetection: ChangeDetectionStrategy.OnPush, //Can't use this here due to resistance bands modal
    imports: [FormsModule, ReactiveFormsModule, SelectOnFocusDirective, ResistanceBandColorPipe, ResistanceAmountPipe]
})
export class ExercisePlanNextTimeComponent {

  readonly formGroup = input.required<FormGroup<IExercisePlanFormGroup>>(); //HACK -- kind of. Initializes, but...not for real.

  readonly workoutHasBeenExecutedBefore = input<boolean>(false);

  readonly planningAhead = input<boolean>(false);

  @Output()
  resistanceBandsModalRequested: EventEmitter<FormGroup<IExercisePlanFormGroup>>;

  public resistanceTypeEnum: typeof ResistanceType = ResistanceType; //Needed for template to reference enum

  constructor() { 
    this.resistanceBandsModalRequested = new EventEmitter<FormGroup<IExercisePlanFormGroup>>();
  }

  public selectResistanceBands(formGroup: FormGroup<IExercisePlanFormGroup>): void {
    this.resistanceBandsModalRequested.emit(formGroup);
  }

  public useSameResistanceAsLastTime(): void {
    
    this.formGroup().patchValue({
      resistanceAmount: this.formGroup().controls.resistanceAmountLastTime.value ?? 0, 
      resistanceMakeup: this.formGroup().controls.resistanceMakeupLastTime.value
    }); 

  }

  public useSuggestions(): void {
    this.formGroup().patchValue({
      resistanceAmount: this.formGroup().controls.recommendedResistanceAmount.value ?? 0, 
      resistanceMakeup: this.formGroup().controls.recommendedResistanceMakeup.value, 
      targetRepCount: this.formGroup().controls.recommendedTargetRepCount.value ?? 0
    }); 
  }

}
