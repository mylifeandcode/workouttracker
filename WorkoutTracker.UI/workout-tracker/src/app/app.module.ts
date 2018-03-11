import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { WorkoutComponent } from './workouts/workout/workout.component';
import { WorkoutListComponent } from './workouts/workout-list/workout-list.component';
import { SetComponent } from './sets/set/set.component';
import { ExerciseComponent } from './exercises/exercise/exercise.component';
import { ExerciseListComponent } from './exercises/exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercises/exercise-edit/exercise-edit.component';
import { SetEditComponent } from './sets/set-edit/set-edit.component';
import { ExerciseService } from './exercises/exercise.service';
import { UserSelectComponent } from './users/user-select/user-select.component';

import { UserService } from './users/user.service';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';

import { CookieService } from 'ng2-cookies';
import { UserSelectedGuard } from 'app/route-guards/user-selected.guard';

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
  providers: [ExerciseService, UserService, CookieService, UserSelectedGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
