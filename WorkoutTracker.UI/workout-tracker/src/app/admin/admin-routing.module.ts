import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ResistanceBandsComponent } from './resistance-bands/resistance-bands.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserListComponent } from './user-list/user-list.component';


const routes: Routes = [
  {
    path: 'resistancebands',
    component: ResistanceBandsComponent
  }, 
  {
    path: 'users', 
    component: UserListComponent
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
    path: '**', 
    component: AdminHomeComponent
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
