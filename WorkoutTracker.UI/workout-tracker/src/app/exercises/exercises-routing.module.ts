import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'view/:id',
    component: ExerciseEditComponent,
    canActivate: [UserSelectedGuard]
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
