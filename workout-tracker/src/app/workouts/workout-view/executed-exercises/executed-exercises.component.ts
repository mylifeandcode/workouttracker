import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { ExecutedExerciseDTO } from '../../_models/executed-exercise-dto';
import { NgStyle } from '@angular/common';
import { ResistanceBandColorPipe } from '../../../shared/pipes/resistance-band-color.pipe';
import { RatingPipe } from '../../_pipes/rating.pipe';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';
import { DurationPipe } from '../../_pipes/duration.pipe';
import { ExerciseSidePipe } from '../../_pipes/exercise-side.pipe';
import { ResistanceAmountPipe } from '../../_pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-executed-exercises',
    templateUrl: './executed-exercises.component.html',
    styleUrls: ['./executed-exercises.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle, ResistanceBandColorPipe, RatingPipe, ResistanceTypePipe, DurationPipe, ExerciseSidePipe, ResistanceAmountPipe]
})
export class ExecutedExercisesComponent implements OnInit {

  readonly executedExercises = input<ExecutedExerciseDTO[]>();

  readonly showResults = input<boolean>(false);

  constructor() { }

  ngOnInit(): void {
  }

}
