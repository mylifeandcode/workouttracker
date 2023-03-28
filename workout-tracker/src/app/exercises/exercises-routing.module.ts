import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnsavedChangesGuard } from 'app/core/guards/unsaved-changes.guard';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?
import { ExerciseEditComponent } from '../exercises/exercise-edit/exercise-edit.component';
import { ExerciseListComponent } from '../exercises/exercise-list/exercise-list.component';


const routes: Routes = [
  {
    path: '',
    component: ExerciseListComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'edit/:id',
    component: ExerciseEditComponent,
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'view/:id',
    component: ExerciseEditComponent,
    canActivate: [UserSelectedGuard],
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: '**',
    component: ExerciseListComponent,
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExercisesRoutingModule { }
