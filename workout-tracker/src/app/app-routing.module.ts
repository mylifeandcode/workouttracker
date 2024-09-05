import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { UserSelectedGuard } from './core/guards/user-selected.guard';
import { UserNotSelectedGuard } from './core/guards/user-not-selected.guard';
import { UserIsAdminGuard } from './admin/guards/user-is-admin.guard';




import { AdminModule } from './admin/admin.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/user-select/user-select.component').then(m => m.UserSelectComponent),
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'user-select',
    loadComponent: () => import('./core/user-select/user-select.component').then(m => m.UserSelectComponent),
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'new-user',
    loadComponent: () => import('./core/user-select-new/user-select-new.component').then(m => m.UserSelectNewComponent),
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./core/welcome/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'oldhome',
    loadComponent: () => import('./core/home/home.component').then(m => m.HomeComponent),
    canActivate: [UserSelectedGuard]
  }, 
  {
    path: 'login', 
    loadComponent: () => import('./core/login/login.component').then(m => m.LoginComponent),
    canActivate: [UserNotSelectedGuard]
  },
  {
    path: 'denied',
    loadComponent: () => import('./core/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: 'admin', 
    canLoad: [ UserIsAdminGuard ], 
    canActivate: [ UserIsAdminGuard ], //Yes, we need this too, in case an admin user logs out and a non-admin then logs in after the admin module has already been loaded
    loadChildren: (): Promise<typeof AdminModule> => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'workouts',
    loadChildren: (): Promise<typeof WorkoutsModule> => import('./workouts/workouts.module').then(m => m.WorkoutsModule)
  },
  {
    path: 'exercises',
    loadChildren: (): Promise<typeof ExercisesModule> => import('./exercises/exercises.module').then(m => m.ExercisesModule)
  },
  {
    path: 'analytics',
    loadChildren: (): Promise<typeof AnalyticsModule> => import('./analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: 'user',
    loadChildren: (): Promise<typeof UserModule> => import('./user/user.module').then(m => m.UserModule)
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
