import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { WorkoutComponent } from './workout/workout.component';
import { SetComponent } from './set/set.component';
import { UserSelectComponent } from './user-select/user-select.component';


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
    path: 'exercises/edit', component: ExerciseEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
