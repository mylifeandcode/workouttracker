import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { WorkoutComponent } from './workout/workout.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { SetComponent } from './set/set.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserSelectedGuard } from './user-selected.guard';

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
    path: 'workouts/start',
    component: WorkoutComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'users',
    component: UserListComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'users/edit/:id',
    component: UserEditComponent, 
    canActivate: [UserSelectedGuard]
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
