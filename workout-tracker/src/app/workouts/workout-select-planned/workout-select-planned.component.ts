import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';

//TODO: This component shares similarities with WorkoutListComponent. Consolidate code.

@Component({
  selector: 'wt-workout-select-planned',
  templateUrl: './workout-select-planned.component.html',
  styleUrls: ['./workout-select-planned.component.scss']
})
export class WorkoutSelectPlannedComponent implements OnInit {

  public plannedWorkouts: ExecutedWorkoutSummaryDTO[];
  public totalCount: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public cols: any = [
    { field: 'name', header: 'Workout Name' }, 
    { field: 'createdDateTime', header: 'Created' }
  ]; //TODO: Create specific type

  constructor(private _executedWorkoutService: ExecutedWorkoutService) { }

  public ngOnInit(): void {
    this.getPlannedWorkouts(0);
  }

  private getPlannedWorkouts(first: number): void {
    this.totalCount = 0;
    this.loading = true;

    this._executedWorkoutService
      .getPlanned(first, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }))      
      .subscribe((plannedWorkoutInfo: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
        this.plannedWorkouts = plannedWorkoutInfo.results;
        this.totalCount = plannedWorkoutInfo.totalCount;
      });
  }

  public getPlannedWorkoutsLazy(event: any): void {
    this.getPlannedWorkouts(event.first);
  }

}
