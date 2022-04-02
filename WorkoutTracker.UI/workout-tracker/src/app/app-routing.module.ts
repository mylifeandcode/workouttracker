import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { UserSelectedGuard } from './core/guards/user-selected.guard';
import { UserNotSelectedGuard } from './core/guards/user-not-selected.guard';
import { UserIsAdminGuard } from './admin/guards/user-is-admin.guard';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    component: UserSelectComponent,
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'login',
    component: UserSelectComponent,
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'home',
    component: WelcomeComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'oldhome',
    component: HomeComponent,
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'userlogin', 
    component: LoginComponent
  },
  {
    path: 'denied',
    component: AccessDeniedComponent
  },
  {
    path: 'admin', 
    canLoad: [ UserIsAdminGuard ], 
    canActivate: [ UserIsAdminGuard ], //Yes, we need this too, in case an admin user logs out and a non-admin then logs in after the admin module has already been loaded
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'workouts',
    loadChildren: () => import('./workouts/workouts.module').then(m => m.WorkoutsModule)
  },
  {
    path: 'exercises',
    loadChildren: () => import('./exercises/exercises.module').then(m => m.ExercisesModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
