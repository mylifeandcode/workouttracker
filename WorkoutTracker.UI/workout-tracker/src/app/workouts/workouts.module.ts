//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

//PrimeNG
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';

//Other 3rd Party
import { CountdownModule } from 'ngx-countdown';

//WorkoutTracker
import { WorkoutsRoutingModule } from './workouts-routing.module';
import { WorkoutComponent } from './workout/workout.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { ResistanceBandSelectComponent } from './resistance-band-select/resistance-band-select.component';
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
import { DurationComponent } from '../workouts/duration/duration.component';
import { ResistanceBandAmountPipe } from './pipes/resistance-band-amount.pipe';

@NgModule({
  declarations: [
    WorkoutComponent,
    WorkoutListComponent,
    WorkoutEditComponent,
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
    DurationPipe,
    DurationComponent,
    ResistanceBandAmountPipe
  ],
  imports: [
    CommonModule,
    CalendarModule,
    CountdownModule,
    DialogModule,
    ReactiveFormsModule,
    InputSwitchModule,
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
  ],
  exports: [
    WorkoutSelectComponent
  ]
})
export class WorkoutsModule { }
