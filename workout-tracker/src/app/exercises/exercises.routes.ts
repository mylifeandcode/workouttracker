import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from 'app/core/_guards/unsaved-changes/unsaved-changes.guard';
import { UserSelectedGuard } from 'app/core/_guards/user-selected/user-selected.guard';

export const exercisesRoutes: Routes = [
    {
      path: '',
      loadComponent: () => import('../exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent),
      canActivate: [UserSelectedGuard]
    },
    {
      path: 'new',
      loadComponent: () => import('../exercises/exercise-edit/exercise-edit.component').then(m => m.ExerciseEditComponent),
      canActivate: [UserSelectedGuard],
      canDeactivate: [UnsavedChangesGuard]
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('../exercises/exercise-edit/exercise-edit.component').then(m => m.ExerciseEditComponent),
      canActivate: [UserSelectedGuard],
      canDeactivate: [UnsavedChangesGuard]
    },
    {
      path: 'view/:id',
      loadComponent: () => import('../exercises/exercise-edit/exercise-edit.component').then(m => m.ExerciseEditComponent),
      canActivate: [UserSelectedGuard],
      canDeactivate: [UnsavedChangesGuard]
    },
    {
      path: '**',
      loadComponent: () => import('../exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent),
      canActivate: [UserSelectedGuard]
    }
  ];
  