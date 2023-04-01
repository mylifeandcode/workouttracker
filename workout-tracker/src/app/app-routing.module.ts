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
import { UserSelectNewComponent } from './user-select-new/user-select-new.component';

const routes: Routes = [
  {
    path: '',
    component: UserSelectComponent,
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'user-select',
    component: UserSelectComponent,
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'new-user',
    component: UserSelectNewComponent,
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
    path: 'login', 
    component: LoginComponent,
    canActivate: [UserNotSelectedGuard]
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
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }