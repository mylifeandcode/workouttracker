import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutHistoryComponent } from './workout-history/workout-history.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
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
    component: WorkoutComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'view/:id', 
    component: WorkoutViewComponent, 
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
    path: 'history', 
    component: WorkoutHistoryComponent, 
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
