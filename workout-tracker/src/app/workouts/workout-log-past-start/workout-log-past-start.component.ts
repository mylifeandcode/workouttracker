import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, validate, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { WorkoutService } from '../_services/workout.service';
import { formatDate, NgClass } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DurationComponent } from '../_shared/duration/duration.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'wt-workout-log-past-start',
  templateUrl: './workout-log-past-start.component.html',
  styleUrls: ['./workout-log-past-start.component.scss'],
  imports: [FormField, NgClass, NzModalModule, DurationComponent, NzSpinModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutLogPastStartComponent implements OnInit {
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);

  //The datetime-local input requires a specific STRING format, so these are strings, not Dates.
  //'' means "none" (Signal Forms fields bound to inputs can't be null).
  protected readonly model = signal({ workoutPublicId: '', startDateTime: '', endDateTime: '' });
  public readonly formGroup = form(this.model, (p) => {
    required(p.workoutPublicId, { message: 'Required' });
    required(p.startDateTime, { message: 'Start Date/Time is required.' });
    required(p.endDateTime, { message: 'End Date/Time is required.' });
    //Cross-field: start must be on/before end (seconds zeroed, equal allowed) — replaces compareDatesValidator.
    validate(p, ({ valueOf }) => {
      const start = valueOf(p.startDateTime);
      const end = valueOf(p.endDateTime);
      if (!start || !end) return undefined;
      return new Date(start).setSeconds(0) <= new Date(end).setSeconds(0)
        ? undefined
        : { kind: 'compareDates', message: 'Start Date/Time must be earlier than End Date/Time' };
    });
  });

  public workouts = signal<WorkoutDTO[]>([]);
  public gettingData = signal<boolean>(true);
  public showDurationModal = signal<boolean>(false);

  public ngOnInit(): void {
    this.getUserWorkouts();
  }

  public proceedToWorkoutEntry(): void {
    submit(this.formGroup, async () => {
      const m = this.model();
      this._router.navigate(
        [`/workouts/plan-for-past/${m.workoutPublicId}/${m.startDateTime}/${m.endDateTime}`]
      );
    });
  }

  public enterDuration(): void {
    this.showDurationModal.set(true);
  }

  public durationModalAccepted(duration: number): void {
    this.showDurationModal.set(false);

    if (!this.model().startDateTime) return;

    const endDate = new Date(this.model().startDateTime);
    endDate.setSeconds(duration);

    this.model.update(m => ({ ...m, endDateTime: formatDate(endDate, "yyyy-MM-ddTHH:mm", "en-US") }));
  }

  public durationModalCancelled(): void {
    this.showDurationModal.set(false);
  }

  private getUserWorkouts(): void {
    this._workoutService.getFilteredSubset(0, 500, true)
      .pipe(finalize(() => { this.gettingData.set(false); }))
      .subscribe((result: PaginatedResultsOfWorkoutDTO) => {
        this.workouts.set(result.results.sort((a, b) => a.name.localeCompare(b.name)));
      });
  }

}
