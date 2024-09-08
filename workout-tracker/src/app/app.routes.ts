import { Routes } from '@angular/router';
import { UserNotSelectedGuard } from './core/guards/user-not-selected.guard';
import { UserSelectedGuard } from './core/guards/user-selected.guard';
import { UserIsAdminGuard } from './admin/guards/user-is-admin.guard';

export const routes: Routes = [
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
    loadChildren: (): Promise<Routes> => import('./admin/admin.routes').then(r => r.adminRoutes)
  },
  {
    path: 'workouts',
    loadChildren: (): Promise<Routes> => import('./workouts/workouts.routes').then(r => r.workoutsRoutes)
  },
  {
    path: 'exercises',
    loadChildren: (): Promise<Routes> => import('./exercises/exercises.routes').then(r => r.exercisesRoutes)
  },
  {
    path: 'analytics',
    loadChildren: (): Promise<Routes> => import('./analytics/analytics.routes').then(r => r.analyticsroutes)
  },
  {
    path: 'user',
    loadChildren: (): Promise<Routes> => import('./user/user.routes').then(r => r.userRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
