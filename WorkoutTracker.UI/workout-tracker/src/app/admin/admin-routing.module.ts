import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ResistanceBandsComponent } from './resistance-bands/resistance-bands.component';
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
    path: '**', 
    component: AdminHomeComponent
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
