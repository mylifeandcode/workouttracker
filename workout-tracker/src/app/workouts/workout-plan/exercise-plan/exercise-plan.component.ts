import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { IExercisePlanModel } from './interfaces/i-exercise-plan-form-group';
import { ExercisePlanLastTimeComponent } from './exercise-plan-last-time/exercise-plan-last-time.component';
import { ExercisePlanSuggestionsComponent } from './exercise-plan-suggestions/exercise-plan-suggestions.component';
import { ExercisePlanNextTimeComponent } from './exercise-plan-next-time/exercise-plan-next-time.component';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';

@Component({
    selector: 'wt-exercise-plan',
    templateUrl: './exercise-plan.component.html',
    styleUrls: ['./exercise-plan.component.scss'],
    imports: [ExercisePlanLastTimeComponent, ExercisePlanSuggestionsComponent, ExercisePlanNextTimeComponent, ResistanceTypePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePlanComponent {

  readonly field = input.required<FieldTree<IExercisePlanModel>>();
  readonly workoutHasBeenExecutedBefore = input<boolean>(false);
  readonly resistanceBandsModalRequested = output<FieldTree<IExercisePlanModel>>();

  public selectResistanceBands(field: FieldTree<IExercisePlanModel>): void {
    this.resistanceBandsModalRequested.emit(field);
  }

}
