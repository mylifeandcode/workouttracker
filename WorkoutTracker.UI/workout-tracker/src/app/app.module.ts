import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { ExerciseService } from './workouts/exercise.service';
import { UserService } from './core/user.service';
import { CookieService } from 'ng2-cookies';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    UserSelectComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule, 
    ModalModule.forRoot(), 
    CoreModule
  ],
  providers: [ExerciseService, UserService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
