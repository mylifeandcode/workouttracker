import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExercisesRoutingModule } from './exercises-routing.module';
import { ExerciseListComponent } from './exercise-list/exercise-list.component';
import { ExerciseListMiniComponent } from './exercise-list-mini/exercise-list-mini.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ExerciseListComponent, 
    ExerciseListMiniComponent, 
    ExerciseEditComponent
  ],
  imports: [
    CommonModule, 
    TableModule, 
    ExercisesRoutingModule, 
    SharedModule,
    ReactiveFormsModule
  ], 
  exports: [
    ExerciseListMiniComponent
  ]
})
export class ExercisesModule { }
