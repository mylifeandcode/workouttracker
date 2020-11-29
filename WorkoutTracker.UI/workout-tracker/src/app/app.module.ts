import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';

import { ModalModule } from 'ngx-bootstrap/modal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { WorkoutComponent } from './workouts/workout/workout.component';
import { WorkoutListComponent } from './workouts/workout-list/workout-list.component';
import { ExerciseListComponent } from './exercises/exercise-list/exercise-list.component';
import { ExerciseEditComponent } from './exercises/exercise-edit/exercise-edit.component';
import { ExerciseService } from './exercises/exercise.service';
import { UserSelectComponent } from './users/user-select/user-select.component';

import { UserService } from './core/user.service';
import { UserEditComponent } from './users/user-edit/user-edit.component';

import { CookieService } from 'ng2-cookies';
import { WorkoutEditComponent } from './workouts/workout-edit/workout-edit.component';
import { ExerciseListMiniComponent } from './exercises/exercise-list-mini/exercise-list-mini.component';
import { WorkoutSetDefinitionComponent } from './workouts/workout-set-definition/workout-set-definition.component';
import { WorkoutExerciseComponent } from './workouts/workout-exercise/workout-exercise.component';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    WorkoutComponent, 
    WorkoutListComponent, 
    ExerciseListComponent,
    ExerciseEditComponent,
    UserSelectComponent,
    UserEditComponent,
    WorkoutEditComponent,
    ExerciseListMiniComponent,
    WorkoutSetDefinitionComponent,
    WorkoutExerciseComponent,
    InsertSpaceBeforeCapitalPipe
  ],
  imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule, 
        AppRoutingModule,
        BrowserAnimationsModule,
        TableModule, 
        ProgressSpinnerModule, 
        MultiSelectModule, 
        CommonModule, 
        ModalModule.forRoot(), 
        CoreModule
  ],
  providers: [ExerciseService, UserService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
