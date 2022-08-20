//Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Third-Party Modules
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

//Third-Party Services
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

//Local Modules
import { AdminRoutingModule } from './admin-routing.module';

//Local Components and Services
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ResistanceBandsComponent } from './resistance-bands/resistance-bands.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserListComponent } from './user-list/user-list.component';
import { SystemComponent } from './system/system.component';
import { UserAddComponent } from './user-add/user-add.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    AdminHomeComponent,
    ResistanceBandsComponent,
    UserEditComponent,
    UserListComponent,
    SystemComponent,
    UserAddComponent,
    ChangePasswordComponent
  ],
  imports: [
    AdminRoutingModule,
    ButtonModule,
    ConfirmDialogModule,
    CommonModule, 
    DialogModule,
    FormsModule,
    MessageModule,
    MessagesModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ]
})
export class AdminModule {}
