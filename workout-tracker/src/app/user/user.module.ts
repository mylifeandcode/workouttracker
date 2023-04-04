import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputSwitchModule } from 'primeng/inputswitch';
import { UserRepSettingsComponent } from './user-rep-settings/user-rep-settings.component';
import { SharedModule } from 'app/shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


@NgModule({
  declarations: [
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserSettingsComponent,
    UserRepSettingsComponent
  ],
  imports: [
    CommonModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    UserRoutingModule,
    SharedModule,
    ToastModule
  ],
  providers: [
    MessageService /* From PrimeNG -- maybe I should just expose this in SharedModule */
  ]
})
export class UserModule { }
