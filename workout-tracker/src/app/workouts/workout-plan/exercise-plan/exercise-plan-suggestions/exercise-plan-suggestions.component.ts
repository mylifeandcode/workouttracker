import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { IExercisePlanModel } from '../interfaces/i-exercise-plan-form-group';
import { ResistanceBandColorPipe } from '../../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceAmountPipe } from '../../../_pipes/resistance-amount.pipe';
import { SentencesToTagsPipe } from '../../../../shared/pipes/sentences-to-tags.pipe';

@Component({
    selector: 'wt-exercise-plan-suggestions',
    templateUrl: './exercise-plan-suggestions.component.html',
    styleUrls: ['./exercise-plan-suggestions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ResistanceBandColorPipe, ResistanceAmountPipe, SentencesToTagsPipe]
})
export class ExercisePlanSuggestionsComponent {

  readonly field = input.required<FieldTree<IExercisePlanModel>>();

  public useSuggestions(): void {
    const f = this.field();
    f.resistanceAmount().value.set(f.recommendedResistanceAmount().value() ?? 0);
    f.resistanceMakeup().value.set(f.recommendedResistanceMakeup().value());
    f.targetRepCount().value.set(f.recommendedTargetRepCount().value() ?? 0);
  }

}
