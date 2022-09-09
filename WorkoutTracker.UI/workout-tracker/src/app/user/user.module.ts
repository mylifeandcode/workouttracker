import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@NgModule({
  declarations: [
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserSettingsComponent
  ],
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    UserRoutingModule
  ]
})
export class UserModule { }
