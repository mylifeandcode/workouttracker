import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard'; //TODO: Correct path/method of import?
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutComponent } from './workout/workout.component';


const routes: Routes = [
  {
    path: '**',
    component: WorkoutListComponent, 
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'edit/:id', 
    component: WorkoutEditComponent, 
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'start',
    component: WorkoutComponent, 
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutsRoutingModule { }
