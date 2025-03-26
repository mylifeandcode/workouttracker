import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { Workout } from '../../../_models/workout';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ResistanceTypePipe } from '../../../_pipes/resistance-type.pipe';
import { TargetAreasPipe } from '../../../_pipes/target-areas.pipe';

@Component({
    selector: 'wt-workout-info',
    templateUrl: './workout-info.component.html',
    styleUrls: ['./workout-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NzSpinModule, ResistanceTypePipe, TargetAreasPipe]
})
export class WorkoutInfoComponent implements OnInit {

  readonly workout = input<Workout>();

  constructor() { }

  public ngOnInit(): void {
  }

}
