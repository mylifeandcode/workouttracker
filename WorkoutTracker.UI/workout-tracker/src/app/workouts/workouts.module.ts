import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { WorkoutsRoutingModule } from './workouts-routing.module';
import { WorkoutComponent } from './workout/workout.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutEditComponent } from './workout-edit/workout-edit.component';
import { WorkoutSetDefinitionComponent } from './workout-set-definition/workout-set-definition.component';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseListMiniComponent } from './exercise-list-mini/exercise-list-mini.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';


@NgModule({
  declarations: [
    WorkoutComponent, 
    WorkoutListComponent, 
    WorkoutEditComponent, 
    WorkoutSetDefinitionComponent, 
    WorkoutExerciseComponent, 
    ExerciseEditComponent, 
    ExerciseListComponent, 
    ExerciseListMiniComponent,
    InsertSpaceBeforeCapitalPipe
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ProgressSpinnerModule, 
    MultiSelectModule,     
    WorkoutsRoutingModule
  ]
})
export class WorkoutsModule { }
