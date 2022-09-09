import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAddComponent } from 'app/admin/user-add/user-add.component';
import { UserSelectedGuard } from 'app/core/guards/user-selected.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

const routes: Routes = [
  {
    path: 'user-settings',
    component: UserSettingsComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:resetCode',
    component: ResetPasswordComponent
  },
  {
    path: 'register',
    component: UserAddComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
