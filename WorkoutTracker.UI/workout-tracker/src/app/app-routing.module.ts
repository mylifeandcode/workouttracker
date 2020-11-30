import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { UserSelectedGuard } from './core/guards/user-selected.guard';

const routes: Routes = [
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
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'workouts', 
    loadChildren: () => import('./workouts/workouts.module').then(m => m.WorkoutsModule)
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
