import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnsavedChangesGuard } from 'app/core/guards/unsaved-changes.guard';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?












const routes: Routes = [
  {
    path: 'edit/:id',
    loadComponent: () => import('./workout-edit/workout-edit.component').then(m => m.WorkoutEditComponent),
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./workout-edit/workout-edit.component').then(m => m.WorkoutEditComponent),
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'select', 
    loadComponent: () => import('./workout-select/workout-select.component').then(m => m.WorkoutSelectComponent), 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'select-for-later', 
    loadComponent: () => import('./workout-select/workout-select.component').then(m => m.WorkoutSelectComponent), 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'select-planned', 
    loadComponent: () => import('./workout-select-planned/workout-select-planned.component').then(m => m.WorkoutSelectPlannedComponent), 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'start/:executedWorkoutId',
    loadComponent: () => import('./workout/workout.component').then(m => m.WorkoutComponent), 
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'history/view/:id',
    loadComponent: () => import('./workout-view/workout-view.component').then(m => m.WorkoutViewComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./workout-history/workout-history.component').then(m => m.WorkoutHistoryComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'plan/:id',
    loadComponent: () => import('./workout-plan/workout-plan.component').then(m => m.WorkoutPlanComponent), 
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'plan-for-later/:id',
    loadComponent: () => import('./workout-plan/workout-plan.component').then(m => m.WorkoutPlanComponent), 
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'plan-for-past/:id/:start/:end',
    loadComponent: () => import('./workout-plan/workout-plan.component').then(m => m.WorkoutPlanComponent), 
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'log-past-start',
    loadComponent: () => import('./workout-log-past-start/workout-log-past-start.component').then(m => m.WorkoutLogPastStartComponent), 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'in-progress',
    loadComponent: () => import('./in-progress-workouts/in-progress-workouts.component').then(m => m.InProgressWorkoutsComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./workout-list/workout-list.component').then(m => m.WorkoutListComponent),
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutsRoutingModule { }
