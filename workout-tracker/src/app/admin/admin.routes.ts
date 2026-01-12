import { Routes } from '@angular/router';
import { UserSelectedGuard } from '../core/_guards/user-selected/user-selected.guard';

export const adminRoutes: Routes = [
  {
    path: 'resistancebands',
    loadComponent: () => import('./resistance-bands/resistance-bands.component').then(m => m.ResistanceBandsComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'users/edit/:id',
    loadComponent: () => import('./user-edit/user-edit.component').then(m => m.UserEditComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'users/first',
    loadComponent: () => import('./user-edit/user-edit.component').then(m => m.UserEditComponent)
  },
  {
    path: 'users/add',
    loadComponent: () => import('./user-add/user-add.component').then(m => m.UserAddComponent)
  },
  {
    path: 'system',
    loadComponent: () => import('./system/system.component').then(m => m.SystemComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  }
];