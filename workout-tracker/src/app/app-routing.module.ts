import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { UserSelectComponent } from './core/user-select/user-select.component';
import { UserSelectedGuard } from './core/guards/user-selected.guard';
import { UserNotSelectedGuard } from './core/guards/user-not-selected.guard';
import { UserIsAdminGuard } from './admin/guards/user-is-admin.guard';
import { AccessDeniedComponent } from './core/access-denied/access-denied.component';
import { WelcomeComponent } from './core/welcome/welcome.component';
import { LoginComponent } from './core/login/login.component';
import { UserSelectNewComponent } from './core/user-select-new/user-select-new.component';
import { AdminModule } from './admin/admin.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';

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
