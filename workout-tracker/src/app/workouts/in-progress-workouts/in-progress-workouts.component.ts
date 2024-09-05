import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'wt-in-progress-workouts',
    templateUrl: './in-progress-workouts.component.html',
    styleUrls: ['./in-progress-workouts.component.scss'],
    standalone: true,
    imports: [TableModule, PrimeTemplate, RouterLink, DatePipe]
})
export class InProgressWorkoutsComponent implements OnInit {

  public inProgressWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public loading: boolean = true;
  public errorMessage: string | null = null;

  constructor(private _executedWorkoutService: ExecutedWorkoutService) {}

  ngOnInit(): void {
    this._executedWorkoutService.getInProgress()
      .pipe(
        finalize(() => { this.loading = false; }),
        catchError((err: any, caught: Observable<ExecutedWorkoutSummaryDTO[]>) => {
          this.errorMessage = (err.error ? err.error : "An error has occurred. Please contact an administrator.");
          return of(new Array<ExecutedWorkoutSummaryDTO>());
        })
      )
      .subscribe((workouts: ExecutedWorkoutSummaryDTO[]) => {
        this.inProgressWorkouts = workouts;
      });
  }
}
