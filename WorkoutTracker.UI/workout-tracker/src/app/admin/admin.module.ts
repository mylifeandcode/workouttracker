import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { ResistanceBandsComponent } from './resistance-bands/resistance-bands.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { UserListComponent } from './user-list/user-list.component';


@NgModule({
  declarations: [
    ResistanceBandsComponent, 
    AdminHomeComponent, 
    UserListComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
