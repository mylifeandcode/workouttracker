import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutHistoryComponent } from './workout-history/workout-history.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutLogPastStartComponent } from './workout-log-past-start/workout-log-past-start.component';
import { WorkoutPlanComponent } from './workout-plan/workout-plan.component';
import { WorkoutSelectPlannedComponent } from './workout-select-planned/workout-select-planned.component';
import { WorkoutSelectComponent } from './workout-select/workout-select.component';
import { WorkoutViewComponent } from './workout-view/workout-view.component';
import { WorkoutComponent } from './workout/workout.component';


const routes: Routes = [
  {
    path: 'edit/:id',
    component: WorkoutEditComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'select', 
    component: WorkoutSelectComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'select-for-later', 
    component: WorkoutSelectComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'select-planned', 
    component: WorkoutSelectPlannedComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'start/:executedWorkoutId',
    component: WorkoutComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'view/:id',
    component: WorkoutViewComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'history',
    component: WorkoutHistoryComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'plan/:id',
    component: WorkoutPlanComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'plan-for-later/:id',
    component: WorkoutPlanComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'plan-for-past/:id/:start/:end',
    component: WorkoutPlanComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'log-past-start',
    component: WorkoutLogPastStartComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: '**',
    component: WorkoutListComponent,
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutsRoutingModule { }
