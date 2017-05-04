import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { WorkoutComponent } from './workout/workout.component';
import { SetComponent } from './set/set.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { SetEditComponent } from './set-edit/set-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    WorkoutComponent,
    SetComponent,
    ExerciseComponent,
    ExerciseListComponent,
    ExerciseEditComponent,
    SetEditComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule, 
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
