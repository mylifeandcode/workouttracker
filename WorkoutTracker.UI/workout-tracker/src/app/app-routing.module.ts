import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ExerciseListComponent } from './exercises/exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercises/exercise-edit/exercise-edit.component';
import { WorkoutComponent } from './workouts/workout/workout.component';
import { WorkoutListComponent } from './workouts/workout-list/workout-list.component';
import { UserSelectComponent } from './users/user-select/user-select.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UserSelectedGuard } from './core/guards/user-selected.guard';
import { WorkoutEditComponent } from './workouts/workout-edit/workout-edit.component';

const routes: Routes = [
  /*
  {
    path: '',
    children: []
  },
  */
  {
    path: '',
    component: UserSelectComponent
  },
  {
    path: 'login',
    component: UserSelectComponent
  },
  {
    path: 'home',
    component: HomeComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'exercises',
    component: ExerciseListComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'exercises/edit/:id',
    component: ExerciseEditComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'workouts',
    component: WorkoutListComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'workouts/edit/:id', 
    component: WorkoutEditComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'workouts/start',
    component: WorkoutComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'users/edit/:id',
    component: UserEditComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'users/first',
    component: UserEditComponent
  },
  {
    path: 'users/add',
    component: UserEditComponent
  }, 
  {
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
