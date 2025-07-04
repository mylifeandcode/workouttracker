import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { NzTableModule } from 'ng-zorro-antd/table';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'wt-in-progress-workouts',
    templateUrl: './in-progress-workouts.component.html',
    styleUrls: ['./in-progress-workouts.component.scss'],
    imports: [NzTableModule, RouterLink, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InProgressWorkoutsComponent implements OnInit {
  private _executedWorkoutService = inject(ExecutedWorkoutService);

  public inProgressWorkouts = signal<ExecutedWorkoutSummaryDTO[]>([]);
  public loading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this._executedWorkoutService.getInProgress()
      .pipe(
        finalize(() => { this.loading.set(false); }),
        catchError((err: any, caught: Observable<ExecutedWorkoutSummaryDTO[]>) => {
          this.errorMessage = (err.error ? err.error : "An error has occurred. Please contact an administrator.");
          return of(new Array<ExecutedWorkoutSummaryDTO>());
        })
      )
      .subscribe((workouts: ExecutedWorkoutSummaryDTO[]) => {
        this.inProgressWorkouts.set(workouts);
      });
  }
}
