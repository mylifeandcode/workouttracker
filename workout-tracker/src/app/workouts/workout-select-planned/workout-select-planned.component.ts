import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { finalize } from 'rxjs/operators';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

//TODO: This component shares similarities with WorkoutListComponent. Consolidate code.

@Component({
  selector: 'wt-workout-select-planned',
  templateUrl: './workout-select-planned.component.html',
  styleUrls: ['./workout-select-planned.component.scss'],
  imports: [RouterLink, DatePipe, NzTableModule, NzModalModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutSelectPlannedComponent {
  private _executedWorkoutService = inject(ExecutedWorkoutService);
  private _modalService = inject(NzModalService);
  private _messageService = inject(NzMessageService);
  //No ngOnInit() needed -- table will automatically get initial data due to lazy loading (Ajax in NG-ZORRO parlance)

  public plannedWorkouts = signal<ExecutedWorkoutSummaryDTO[]>([]);
  public totalCount = signal<number>(0);
  public loading = signal<boolean>(true);
  public pageSize = signal<number>(10);

  public deletePlannedWorkout(publicId: string): void {
    this._modalService.confirm({
      nzTitle: 'Are You Sure?',
      nzContent: 'Are you sure you want to delete this planned workout?',
      nzOnOk: () => {
        this.loading.set(true);
        this._executedWorkoutService.deletePlanned(publicId)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: () => {
              this._messageService.success('Planned Workout deleted');
              this.getPlannedWorkouts(0);
            },
            error: (error: HttpErrorResponse) => {
              window.alert("Couldn't delete workout! " + error.error.errors.id.map((e: string) => e).join(', '));
            }
          }
          );
      }
    });
  }

  private getPlannedWorkouts(first: number): void {
    //this.totalCount = 0;
    this.loading.set(true);
    //console.log("Getting planned workouts, first: ", first);

    this._executedWorkoutService
      .getPlanned(first, this.pageSize())
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (plannedWorkoutInfo: PaginatedResults<ExecutedWorkoutSummaryDTO>) => {
          this.plannedWorkouts.set(plannedWorkoutInfo.results);
          this.totalCount.set(plannedWorkoutInfo.totalCount);
        }
      });
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.getPlannedWorkouts((pageIndex - 1) * pageSize);
  }
}
