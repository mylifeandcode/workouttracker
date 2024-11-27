import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { Workout } from '../../../_models/workout';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ResistanceTypePipe } from '../../../_pipes/resistance-type.pipe';
import { TargetAreasPipe } from '../../../_pipes/target-areas.pipe';

@Component({
    selector: 'wt-workout-info',
    templateUrl: './workout-info.component.html',
    styleUrls: ['./workout-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ProgressSpinnerModule, ResistanceTypePipe, TargetAreasPipe]
})
export class WorkoutInfoComponent implements OnInit {

  readonly workout = input<Workout>();

  constructor() { }

  public ngOnInit(): void {
  }

}
