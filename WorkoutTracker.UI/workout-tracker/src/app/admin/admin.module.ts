import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { AdminRoutingModule } from './admin-routing.module';
import { ResistanceBandsComponent } from './resistance-bands/resistance-bands.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';


@NgModule({
  declarations: [
    ResistanceBandsComponent, 
    AdminHomeComponent, 
    UserEditComponent, 
    UserListComponent
  ],
  imports: [
    CommonModule, 
    ButtonModule, 
    TableModule, 
    AdminRoutingModule, 
    ReactiveFormsModule
  ]
})
export class AdminModule {}
