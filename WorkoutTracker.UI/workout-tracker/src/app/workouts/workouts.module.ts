import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { CountdownModule } from 'ngx-countdown';
import { WorkoutsRoutingModule } from './workouts-routing.module';
import { WorkoutComponent } from './workout/workout.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutSetDefinitionComponent } from './workout-set-definition/workout-set-definition.component';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ResistanceBandSelectComponent } from './resistance-band-select/resistance-band-select.component';
import { PickListModule } from 'primeng/picklist';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { WorkoutHistoryComponent } from './workout-history/workout-history.component';
import { WorkoutSelectComponent } from './workout-select/workout-select.component';
import { WorkoutViewComponent } from './workout-view/workout-view.component';
import { ExecutedExercisesComponent } from './executed-exercises/executed-exercises.component';
import { RatingPipe } from './pipes/rating.pipe';
import { RecentWorkoutsComponent } from './recent-workouts/recent-workouts.component';
import { WorkoutInfoComponent } from './workout-info/workout-info.component';
import { ResistanceTypePipe } from './pipes/resistance-type.pipe';
import { TargetAreasPipe } from './pipes/target-areas.pipe';
import { WorkoutPlanComponent } from './workout-plan/workout-plan.component';
import { ExercisePlanComponent } from './exercise-plan/exercise-plan.component';
import { ExercisesModule } from 'app/exercises/exercises.module';
import { WorkoutSelectPlannedComponent } from './workout-select-planned/workout-select-planned.component';
import { SharedModule } from 'app/shared/shared.module';
import { WorkoutLogPastStartComponent } from '../workouts/workout-log-past-start/workout-log-past-start.component';
import { DurationPipe } from './pipes/duration.pipe';


@NgModule({
  declarations: [
    WorkoutComponent,
    WorkoutListComponent,
    WorkoutEditComponent,
    WorkoutSetDefinitionComponent,
    WorkoutExerciseComponent,
    ResistanceBandSelectComponent,
    CountdownTimerComponent,
    WorkoutHistoryComponent,
    WorkoutSelectComponent,
    WorkoutViewComponent,
    ExecutedExercisesComponent,
    RatingPipe,
    RecentWorkoutsComponent,
    WorkoutInfoComponent,
    ResistanceTypePipe,
    TargetAreasPipe,
    WorkoutPlanComponent,
    ExercisePlanComponent,
    WorkoutSelectPlannedComponent,
    WorkoutLogPastStartComponent,
    DurationPipe
  ],
  imports: [
    CommonModule,
    CalendarModule,
    CountdownModule,
    DialogModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    PickListModule,
    ProgressSpinnerModule,
    MultiSelectModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    WorkoutsRoutingModule, 
    ExercisesModule,
    SharedModule
  ], 
  providers: [
    MessageService
  ]
})
export class WorkoutsModule { }
