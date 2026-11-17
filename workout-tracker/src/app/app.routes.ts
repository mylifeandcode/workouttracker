import { Routes } from '@angular/router';
import { UserNotSelectedGuard } from './core/_guards/user-not-selected/user-not-selected.guard';
import { UserSelectedGuard } from './core/_guards/user-selected/user-selected.guard';
import { SetupRequiredGuard } from './core/_guards/setup-required/setup-required.guard';
import { SetupAvailableGuard } from './core/_guards/setup-available/setup-available.guard';
import { UserIsAdminGuard } from './admin/_guards/user-is-admin/user-is-admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/user-select/user-select.component').then(m => m.UserSelectComponent),
    canActivate: [UserNotSelectedGuard, SetupRequiredGuard]
  },
  {
    path: 'user-select',
    loadComponent: () => import('./core/user-select/user-select.component').then(m => m.UserSelectComponent),
    canActivate: [UserNotSelectedGuard, SetupRequiredGuard]
  },
  {
    //First-run only: creates the first administrator while the system has no users. Redirects away once one exists.
    path: 'setup',
    loadComponent: () => import('./core/setup/setup.component').then(m => m.SetupComponent),
    canActivate: [SetupAvailableGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./core/welcome/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'login', 
    loadComponent: () => import('./core/login/login.component').then(m => m.LoginComponent),
    canActivate: [UserNotSelectedGuard, SetupRequiredGuard]
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
