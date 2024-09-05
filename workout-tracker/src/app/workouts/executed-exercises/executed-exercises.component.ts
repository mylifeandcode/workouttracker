import { Component, Input, OnInit } from '@angular/core';
import { ExecutedExerciseDTO } from '../models/executed-exercise-dto';
import { NgStyle } from '@angular/common';
import { ResistanceBandColorPipe } from '../../shared/pipes/resistance-band-color.pipe';
import { RatingPipe } from '../pipes/rating.pipe';
import { ResistanceTypePipe } from '../pipes/resistance-type.pipe';
import { DurationPipe } from '../pipes/duration.pipe';
import { ExerciseSidePipe } from '../pipes/exercise-side.pipe';
import { ResistanceAmountPipe } from '../pipes/resistance-amount.pipe';

@Component({
    selector: 'wt-executed-exercises',
    templateUrl: './executed-exercises.component.html',
    styleUrls: ['./executed-exercises.component.scss'],
    standalone: true,
    imports: [NgStyle, ResistanceBandColorPipe, RatingPipe, ResistanceTypePipe, DurationPipe, ExerciseSidePipe, ResistanceAmountPipe]
})
export class ExecutedExercisesComponent implements OnInit {

  @Input()
  executedExercises: ExecutedExerciseDTO[] | undefined;

  @Input()
  showResults: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
