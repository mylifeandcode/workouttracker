import { Component } from '@angular/core';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

//TODO: This component shares similarities with WorkoutListComponent. Consolidate code.

@Component({
  selector: 'wt-workout-select-planned',
  templateUrl: './workout-select-planned.component.html',
  styleUrls: ['./workout-select-planned.component.scss'],
  standalone: true,
  imports: [ConfirmDialogModule, TableModule, PrimeTemplate, RouterLink, DatePipe],
  //providers: [MessageService]
})
export class WorkoutSelectPlannedComponent { //No ngOnInit() needed -- table will automatically get initial data due to lazy loading

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

  public getPlannedWorkoutsLazy(event: any): void {
    this.getPlannedWorkouts(event.first);
  }

  public deletePlannedWorkout(publicId: string): void {
    this._confirmationService.confirm({
      message: 'Are you sure you want to delete this planned workout?',
      accept: () => {
        this.loading = true;
        this._executedWorkoutService.deletePlanned(publicId)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Planned Workout deleted', life: 3000 });
              this.getPlannedWorkouts(0);
            },
            error: (error: HttpErrorResponse) => {
              console.log("ERROR: ", error);
              window.alert("Couldn't delete workout! " + error.error.errors.id.map((e: any) => e).join(', '));
            }
          }
          );
      }
    });
  }

  private getPlannedWorkouts(first: number): void {
    this.totalCount = 0;
    this.loading = true;

    this._executedWorkoutService
      .getPlanned(first, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }))
      /*      
      .subscribe((plannedWorkoutInfo: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
        this.plannedWorkouts = plannedWorkoutInfo.results;
        this.totalCount = plannedWorkoutInfo.totalCount;
      });
      */
      .subscribe({
        next: (plannedWorkoutInfo: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          this.plannedWorkouts = plannedWorkoutInfo.results;
          this.totalCount = plannedWorkoutInfo.totalCount;
        }
      });
  }

}
