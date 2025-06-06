import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';
import { ResistanceBandColorPipe } from '../../../../shared/pipes/resistance-band-color.pipe';
import { RatingPipe } from '../../../_pipes/rating.pipe';
import { ResistanceAmountPipe } from '../../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-exercise-plan-last-time',
    templateUrl: './exercise-plan-last-time.component.html',
    styleUrls: ['./exercise-plan-last-time.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ResistanceBandColorPipe, RatingPipe, ResistanceAmountPipe]
})
export class ExercisePlanLastTimeComponent {
  readonly formGroup = input.required<FormGroup<IExercisePlanFormGroup>>(); //HACK -- kind of. Initializes, but...not for real.

}
