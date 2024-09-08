import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from 'app/core/guards/unsaved-changes.guard';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard';

export const userRoutes: Routes = [
    {
      path: 'user-settings',
      loadComponent: () => import('./user-settings/user-settings.component').then(m => m.UserSettingsComponent),
      canActivate: [UserSelectedGuard],
      canDeactivate: [UnsavedChangesGuard]
    },
    {
      path: 'change-password',
      loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
      canActivate: [UserSelectedGuard]
    },
    {
      path: 'forgot-password',
      loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
      path: 'reset-password/:resetCode',
      loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
      path: 'register',
      loadComponent: () => import('app/admin/user-add/user-add.component').then(m => m.UserAddComponent)
    },
  ];
  