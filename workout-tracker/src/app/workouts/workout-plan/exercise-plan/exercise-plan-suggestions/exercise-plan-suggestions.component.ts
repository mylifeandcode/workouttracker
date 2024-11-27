import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';
import { FormGroup } from '@angular/forms';
import { ResistanceBandColorPipe } from '../../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceAmountPipe } from '../../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-exercise-plan-suggestions',
    templateUrl: './exercise-plan-suggestions.component.html',
    styleUrls: ['./exercise-plan-suggestions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ResistanceBandColorPipe, ResistanceAmountPipe]
})
export class ExercisePlanSuggestionsComponent {

  readonly formGroup = input.required<FormGroup<IExercisePlanFormGroup>>();

  public useSuggestions(): void {
    this.formGroup().patchValue({
      resistanceAmount: this.formGroup().controls.recommendedResistanceAmount.value ?? 0, 
      resistanceMakeup: this.formGroup().controls.recommendedResistanceMakeup.value, 
      targetRepCount: this.formGroup().controls.recommendedTargetRepCount.value ?? 0
    }); 
  }

}
