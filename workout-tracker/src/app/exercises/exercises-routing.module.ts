import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnsavedChangesGuard } from 'app/core/guards/unsaved-changes.guard';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?




const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent),
    canActivate: [UserSelectedGuard]
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExercisesRoutingModule { }
