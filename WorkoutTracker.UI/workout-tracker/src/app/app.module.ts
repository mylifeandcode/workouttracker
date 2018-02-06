import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { WorkoutComponent } from './workout/workout.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { SetComponent } from './set/set.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { SetEditComponent } from './set-edit/set-edit.component';
import { ExerciseService } from './exercise.service';
import { UserSelectComponent } from './user-select/user-select.component';

import { UserService } from './user.service';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';

import { CookieService } from 'ng2-cookies';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    WorkoutComponent, 
    WorkoutListComponent, 
    SetComponent,
    ExerciseComponent,
    ExerciseListComponent,
    ExerciseEditComponent,
    SetEditComponent,
    UserSelectComponent,
    UserListComponent,
    UserEditComponent  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule, 
    AppRoutingModule
  ],
  providers: [ExerciseService, UserService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
