import { Component, OnInit } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

//TODO: This component shares similarities with WorkoutListComponent. Consolidate code.

@Component({
    selector: 'wt-workout-select-planned',
    templateUrl: './workout-select-planned.component.html',
    styleUrls: ['./workout-select-planned.component.scss'],
    standalone: true,
    imports: [ConfirmDialogModule, TableModule, PrimeTemplate, RouterLink, DatePipe]
})
export class WorkoutSelectPlannedComponent implements OnInit {

  public plannedWorkouts: ExecutedWorkoutSummaryDTO[] = [];
  public totalCount: number = 0;
  public loading: boolean = true;
  public pageSize: number = 10;
  public cols: any = [
    { field: 'name', header: 'Workout Name' }, 
    { field: 'createdDateTime', header: 'Created' }
  ]; //TODO: Create specific type

  constructor(
    private _executedWorkoutService: ExecutedWorkoutService,
    private _confirmationService: ConfirmationService,
    private _messageService: MessageService) { }

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

  public deletePlannedWorkout(id: number): void {
    this._confirmationService.confirm({
      message: 'Are you sure you want to delete this planned workout?',
      accept: () => {
        this.loading = true;
        this._executedWorkoutService.deletePlanned(id).subscribe(() => {
          this._messageService.add({severity:'success', summary: 'Successful', detail: 'Planned Workout deleted', life: 3000});
          this.getPlannedWorkouts(0);
        });
      }
    });
  }

}
