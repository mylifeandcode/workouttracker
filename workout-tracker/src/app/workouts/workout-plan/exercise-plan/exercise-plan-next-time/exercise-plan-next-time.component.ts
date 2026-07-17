import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IExercisePlanModel } from '../interfaces/i-exercise-plan-form-group';
import { ResistanceType } from '../../../../api';
import { SelectOnFocusDirective } from '../../../../shared/directives/select-on-focus.directive';
import { ResistanceBandColorPipe } from '../../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceAmountPipe } from '../../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-exercise-plan-next-time',
    templateUrl: './exercise-plan-next-time.component.html',
    styleUrls: ['./exercise-plan-next-time.component.scss'],
    //Signal-backed values keep the resistance-band modal edits in sync, so OnPush is safe here now
    //(the reactive-forms version had to avoid it — the same stale-value issue fixed elsewhere).
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, SelectOnFocusDirective, ResistanceBandColorPipe, ResistanceAmountPipe]
})
export class ExercisePlanNextTimeComponent {

  readonly field = input.required<FieldTree<IExercisePlanModel>>();

  readonly workoutHasBeenExecutedBefore = input<boolean>(false);

  readonly planningAhead = input<boolean>(false);

  readonly resistanceBandsModalRequested = output<FieldTree<IExercisePlanModel>>();

  readonly resistanceTypeEnum = ResistanceType; //Needed for template to reference enum

  //The exercise row's FieldState, as a memoized signal — lets the template read row-level validity
  //without a getter/method call each change-detection cycle.
  protected readonly exerciseState = computed(() => this.field()());

  public selectResistanceBands(): void {
    this.resistanceBandsModalRequested.emit(this.field());
  }

  public useSameResistanceAsLastTime(): void {
    const f = this.field();
    f.resistanceAmount().value.set(f.resistanceAmountLastTime().value() ?? 0);
    f.resistanceMakeup().value.set(f.resistanceMakeupLastTime().value());
  }

  public useSuggestions(): void {
    const f = this.field();
    f.resistanceAmount().value.set(f.recommendedResistanceAmount().value() ?? 0);
    f.resistanceMakeup().value.set(f.recommendedResistanceMakeup().value());
    f.targetRepCount().value.set(f.recommendedTargetRepCount().value() ?? 0);
  }

}
