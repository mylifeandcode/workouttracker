import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ExerciseListBase } from '../exercise-list-base';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  imports: [FormsModule, NzSelectModule, NzTableModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseListComponent extends ExerciseListBase implements OnDestroy {

  constructor() {
    super();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

}
