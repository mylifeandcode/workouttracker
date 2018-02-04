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

const routes: Routes = [
  /*
  {
    path: '',
    children: []
  },
  */
  {
    path: '', component: UserSelectComponent
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'exercises', component: ExerciseListComponent
  }, 
  {
    path: 'exercises/edit/:id', component: ExerciseEditComponent
  }, 
  {
    path: 'workouts', component: WorkoutListComponent
  }, 
  {
    path: 'workouts/start', component: WorkoutComponent
  }, 
  {
    path: 'users', component: UserListComponent
  },
  {
    path: 'users/edit/:id', component: UserEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
